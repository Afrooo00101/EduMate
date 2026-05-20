import json
from typing import Optional, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    Student, StudentCourse, StudyPlan, Course, CoursePrerequisite,
    CourseOffering, PlannerState, AcademicRule, Major, AIChatMessage, CourseRequest
)
from app.schemas.planning import (
    GPASummary, PlannerStateRead, PlannerStateUpsert,
    CareerPathTimeline, SemesterSummary, GPACalculation,
    StudentCourseRead
)

GRADE_POINTS = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
}

SEMESTER_ORDER = [
    (1, "Fall", "Foundations"),
    (1, "Spring", "Core Basics"),
    (1, "Summer", "Summer Term 1"),
    (2, "Fall", "Core & Data"),
    (2, "Spring", "Web & Software"),
    (2, "Summer", "Summer Internship"),
    (3, "Fall", "Advanced Topics"),
    (3, "Spring", "Specialization"),
    (3, "Summer", "Summer Term 2"),
    (4, "Fall", "Capstone Prep"),
    (4, "Spring", "Final Project"),
]


class PlanningService:
    """Core planning service for all planning-related operations"""
    
    def __init__(self, db: Session):
        self.db = db

    def _next_student_course_id(self) -> int:
        return (self.db.query(func.max(StudentCourse.id)).scalar() or 0) + 1

    def _persist_student_gpa(self, student_id: int, gpa: float) -> None:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return

        rounded_gpa = round(float(gpa or 0.0), 2)
        current_gpa = round(float(student.gpa or 0.0), 2)
        if current_gpa != rounded_gpa:
            student.gpa = rounded_gpa
            self.db.add(student)
            self.db.commit()
    
    # ==============================
    # PLANNER STATE (ORIGINAL + ENHANCED)
    # ==============================
    
    def get_or_create_state(self, student_id: int) -> PlannerState:
        """Get or create planner state for student"""
        state = self.db.query(PlannerState).filter(
            PlannerState.student_id == student_id
        ).first()
        if not state:
            next_id = (self.db.query(func.max(PlannerState.id)).scalar() or 0) + 1
            state = PlannerState(id=next_id, student_id=student_id)
            self.db.add(state)
            self.db.commit()
            self.db.refresh(state)
        return state
    
    def upsert_state(self, student_id: int, payload: PlannerStateUpsert) -> PlannerState:
        """Save or update planner state"""
        state = self.get_or_create_state(student_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(state, key, value)
        self.db.add(state)
        self.db.commit()
        self.db.refresh(state)
        return state
    
    def remove_enrollment(self, student_id: int, course_id: int) -> bool:
        """Remove a student course record"""
        record = self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.course_id == course_id
        ).first()
        
        if record:
            self.db.delete(record)
            self.db.commit()
            self.calculate_gpa_summary(student_id)
            return True
        return False

    def update_enrollment(self, student_id: int, course_id: int, status: str, grade: str = None) -> bool:
        """Update or create a student course status and grade."""
        record = self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.course_id == course_id
        ).first()

        normalized_grade = grade.strip() if isinstance(grade, str) else grade
        if normalized_grade == "":
            normalized_grade = None

        if not record:
            course = self.db.query(Course).filter(Course.id == course_id).first()
            if not course:
                return False

            study_plan = self.db.query(StudyPlan).filter(StudyPlan.course_id == course_id).first()
            semester = study_plan.semester if study_plan and study_plan.semester else "Completed"
            record = StudentCourse(
                id=self._next_student_course_id(),
                student_id=student_id,
                course_id=course_id,
                semester=semester,
                status=status,
            )

        record.status = status
        if normalized_grade is not None or status != 'completed':
            record.grade = normalized_grade
        self.db.add(record)
        self.db.commit()
        self.calculate_gpa_summary(student_id)
        return True

    def bulk_enroll(self, student_id: int, enrollments: List[dict]) -> bool:
        """Create multiple course enrollments at once"""
        for data in enrollments:
            course_id = data.get('course_id')
            semester = data.get('semester')
            status = data.get('status', 'planned')
            
            # Check if enrollment already exists
            existing = self.db.query(StudentCourse).filter(
                StudentCourse.student_id == student_id,
                StudentCourse.course_id == course_id
            ).first()
            
            if existing:
                existing.semester = semester
                existing.status = status
            else:
                new_enrollment = StudentCourse(
                    id=self._next_student_course_id(),
                    student_id=student_id,
                    course_id=course_id,
                    semester=semester,
                    status=status
                )
                self.db.add(new_enrollment)
        
        self.db.commit()
        self.calculate_gpa_summary(student_id)
        return True
    
    # ==============================
    # GPA CALCULATION (ORIGINAL + ENHANCED)
    # ==============================
    
    def calculate_gpa_summary(self, student_id: int) -> GPASummary:
        """Calculate GPA from completed, graded student_courses only."""
        student_courses = self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.status == 'completed',
            StudentCourse.grade.isnot(None)
        ).all()

        graded_courses = [sc for sc in student_courses if sc.grade in GRADE_POINTS]
        if not graded_courses:
            self._persist_student_gpa(student_id, 0.0)
            return GPASummary(
                term_gpa=0.0,
                cumulative_gpa=0.0,
                total_graded_courses=0,
                distribution={}
            )
        
        distribution = {}
        total_weighted_points = 0.0
        total_credits = 0
        
        all_courses = self._get_all_courses_dict()
        
        for sc in graded_courses:
            distribution[sc.grade] = distribution.get(sc.grade, 0) + 1
            course = all_courses.get(sc.course_id)
            credits = course.credits if course else 3
            total_weighted_points += GRADE_POINTS[sc.grade] * credits
            total_credits += credits
        
        gpa = round(total_weighted_points / total_credits, 2) if total_credits else 0.0
        self._persist_student_gpa(student_id, gpa)
        
        return GPASummary(
            term_gpa=gpa,
            cumulative_gpa=gpa,
            total_graded_courses=len(graded_courses),
            distribution=distribution
        )
    
    def calculate_gpa_from_courses(self, student_id: int) -> GPASummary:
        """Calculate GPA from StudentCourse records (database-based)"""
        student_courses = self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.status == 'completed',
            StudentCourse.grade.isnot(None)
        ).all()
        
        if not student_courses:
            return GPASummary(
                term_gpa=0.0,
                cumulative_gpa=0.0,
                total_graded_courses=0,
                distribution={}
            )
        
        all_courses = self._get_all_courses_dict()
        distribution = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
        total_points = 0.0
        total_credits = 0
        
        for sc in student_courses:
            course = all_courses.get(sc.course_id)
            if not course:
                continue
            
            grade_points = GRADE_POINTS.get(sc.grade, 0.0)
            total_points += grade_points * course.credits
            total_credits += course.credits
            
            grade_letter = sc.grade[0] if sc.grade else 'F'
            if grade_letter in distribution:
                distribution[grade_letter] += 1
        
        gpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0
        
        return GPASummary(
            term_gpa=gpa,
            cumulative_gpa=gpa,
            total_graded_courses=len(student_courses),
            distribution=distribution
        )
    
    def calculate_gpa_detailed(self, student_id: int, semester: Optional[str] = None) -> GPACalculation:
        """Calculate detailed GPA with quality points and full distribution"""
        query = self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id,
            StudentCourse.status == 'completed',
            StudentCourse.grade.isnot(None)
        )
        
        if semester:
            query = query.filter(StudentCourse.semester == semester)
        
        student_courses = query.all()
        all_courses = self._get_all_courses_dict()
        
        distribution = {k: 0 for k in GRADE_POINTS.keys()}
        total_points = 0.0
        total_credits = 0
        
        for sc in student_courses:
            course = all_courses.get(sc.course_id)
            if not course:
                continue
            
            grade_points = GRADE_POINTS.get(sc.grade, 0.0)
            total_points += grade_points * course.credits
            total_credits += course.credits
            
            if sc.grade in distribution:
                distribution[sc.grade] += 1
        
        gpa = round(total_points / total_credits, 2) if total_credits > 0 else 0.0
        
        return GPACalculation(
            term_gpa=gpa,
            cumulative_gpa=gpa,
            total_graded_courses=len(student_courses),
            total_credits=total_credits,
            quality_points=round(total_points, 2),
            distribution={k: v for k, v in distribution.items() if v > 0}
        )
    
    # ==============================
    # STUDENT DATA HELPERS
    # ==============================
    
    def _get_student(self, student_id: int) -> Optional[Student]:
        """Get student by ID"""
        return self.db.query(Student).filter(Student.id == student_id).first()
    
    def _get_major_name(self, major_id: int) -> str:
        """Get major name by ID"""
        major = self.db.query(Major).filter(Major.id == major_id).first()
        return major.name if major else "Undeclared"
    
    def _get_all_courses_dict(self) -> dict:
        """Get all courses as dictionary {id: course}"""
        return {c.id: c for c in self.db.query(Course).all()}
    
    def _get_student_courses(self, student_id: int) -> List[StudentCourse]:
        """Get all student enrolled courses"""
        return self.db.query(StudentCourse).filter(
            StudentCourse.student_id == student_id
        ).all()
    
    def _get_study_plan(self, major_id: int) -> List[StudyPlan]:
        """Get active study plan for a major"""
        return self.db.query(StudyPlan).filter(
            StudyPlan.major_id == major_id,
            StudyPlan.is_active == True
        ).order_by(
            StudyPlan.recommended_level_no,
            StudyPlan.display_order
        ).all()
    
    def _get_prerequisites(self) -> List[CoursePrerequisite]:
        """Get all course prerequisites"""
        return self.db.query(CoursePrerequisite).all()
    
    # ==============================
    # CAREER PATH TIMELINE (NEW)
    # ==============================
    
    def get_career_timeline(self, student_id: int) -> CareerPathTimeline:
        """Generate career path timeline visualization data for preview page"""
        student = self._get_student(student_id)
        if not student:
            raise ValueError(f"Student {student_id} not found")
        
        major_id = student.major_id or 1
        study_plan = self._get_study_plan(major_id)
        student_courses = self._get_student_courses(student_id)
        all_courses = self._get_all_courses_dict()
        
        completed_ids = {
            sc.course_id for sc in student_courses
            if sc.status == 'completed'
        }
        
        enrolled_ids = {
            sc.course_id for sc in student_courses
            if sc.status == 'enrolled'
        }
        
        semesters = []
        current_found = False
        total_plan_credits = 0
        total_completed_credits = 0
        
        for level, sem, name in SEMESTER_ORDER:
            plan_courses = [
                sp for sp in study_plan
                if sp.recommended_level_no == level and sp.semester == sem
            ]
            
            if not plan_courses:
                continue
            
            courses_detail = []
            sem_total_credits = 0
            sem_completed_credits = 0
            gpa_total_points = 0.0
            gpa_total_credits = 0
            
            for sp in plan_courses:
                course = all_courses.get(sp.course_id)
                if not course:
                    continue
                
                sem_total_credits += course.credits
                total_plan_credits += course.credits
                
                sc = next(
                    (s for s in student_courses if s.course_id == sp.course_id),
                    None
                )
                
                if sc:
                    courses_detail.append(sc)
                    if sc.status == 'completed':
                        sem_completed_credits += course.credits
                        if sc.grade and sc.grade in GRADE_POINTS:
                            gpa_total_points += GRADE_POINTS[sc.grade] * course.credits
                            gpa_total_credits += course.credits
                else:
                    virtual_course = StudentCourse(
                        student_id=student_id,
                        course_id=sp.course_id,
                        semester=f"{sem}",
                        status='planned'
                    )
                    virtual_course.course = course
                    courses_detail.append(virtual_course)
            
            total_completed_credits += sem_completed_credits
            
            # Determine semester status
            if sem_total_credits > 0 and sem_completed_credits >= sem_total_credits:
                status = "completed"
            elif sem_completed_credits > 0 and not current_found:
                status = "current"
                current_found = True
            else:
                status = "upcoming"
            
            # Calculate semester GPA
            sem_gpa = round(gpa_total_points / gpa_total_credits, 2) if gpa_total_credits > 0 else None
            
            semesters.append(SemesterSummary(
                semester_name=name,
                level=level,
                total_credits=sem_total_credits,
                completed_credits=sem_completed_credits,
                courses=[StudentCourseRead.model_validate(sc) for sc in courses_detail],
                gpa=sem_gpa,
                status=status
            ))
        
        total_progress = round(
            (total_completed_credits / total_plan_credits * 100), 1
        ) if total_plan_credits > 0 else 0.0
        
        return CareerPathTimeline(
            career_path=self._get_major_name(major_id),
            major_name=self._get_major_name(major_id),
            semesters=semesters,
            total_progress=total_progress,
            estimated_graduation=str(student.graduation_year or "N/A")
        )
    
    # ==============================
    # SUMMER COURSES (NEW)
    # ==============================
    
    def get_recommended_summer_courses(self, student_id: int) -> List[dict]:
        """Get recommended summer courses based on study plan and progress"""
        student = self._get_student(student_id)
        if not student:
            return []
        
        study_plan = self._get_study_plan(student.major_id or 1)
        student_courses = self._get_student_courses(student_id)
        all_courses = self._get_all_courses_dict()
        prerequisites = self._get_prerequisites()
        
        completed_ids = {
            sc.course_id for sc in student_courses
            if sc.status == 'completed'
        }
        
        # Filter summer courses not yet completed
        summer_plans = [
            sp for sp in study_plan
            if sp.semester == 'Summer'
            and sp.course_id not in completed_ids
        ]
        
        recommendations = []
        for sp in summer_plans:
            course = all_courses.get(sp.course_id)
            if not course:
                continue
            
            # Check prerequisites
            prereq = next(
                (p for p in prerequisites if p.course_id == sp.course_id),
                None
            )
            prereq_met = True
            prereq_course = None
            missing_prereq_names = []
            
            if prereq:
                prereq_met = prereq.prerequisite_course_id in completed_ids
                prereq_course = all_courses.get(prereq.prerequisite_course_id)
                if not prereq_met and prereq_course:
                    missing_prereq_names.append(prereq_course.name)
            
            recommendations.append({
                "course_id": course.id,
                "code": course.code,
                "name": course.name,
                "credits": course.credits,
                "level": sp.recommended_level_no,
                "prerequisite_met": prereq_met,
                "prerequisite_code": prereq_course.code if prereq_course else None,
                "prerequisite_name": prereq_course.name if prereq_course else None,
                "missing_prerequisites": missing_prereq_names,
                "offered_in_summer": True
            })
        
        return recommendations
    
    # ==============================
    # ACADEMIC RULES & PREREQUISITES (NEW)
    # ==============================
    
    def get_max_credits_for_student(self, student_id: int, semester_type: str = "Fall") -> int:
        """Get maximum credits allowed based on student GPA and academic rules"""
        student = self._get_student(student_id)
        if not student:
            return 18  # Default fallback
        
        gpa = float(student.gpa) if student.gpa else 0.0
        
        rule = self.db.query(AcademicRule).filter(
            AcademicRule.semester_type == semester_type,
            AcademicRule.min_gpa <= gpa,
            AcademicRule.max_gpa >= gpa
        ).first()
        
        return rule.max_credits if rule else 18
    
    def check_prerequisites_met(self, student_id: int, course_id: int) -> dict:
        """Check if student has met all prerequisites for a specific course"""
        student = self._get_student(student_id)
        if not student:
            return {"met": False, "missing": [], "message": "Student not found"}
        
        prerequisites = self.db.query(CoursePrerequisite).filter(
            CoursePrerequisite.course_id == course_id
        ).all()
        
        if not prerequisites:
            return {"met": True, "missing": [], "message": "No prerequisites required"}
        
        student_courses = self._get_student_courses(student_id)
        completed_ids = {
            sc.course_id for sc in student_courses
            if sc.status == 'completed'
        }
        
        all_courses = self._get_all_courses_dict()
        missing = []
        
        for prereq in prerequisites:
            if prereq.prerequisite_course_id not in completed_ids:
                prereq_course = all_courses.get(prereq.prerequisite_course_id)
                missing.append({
                    "course_id": prereq.prerequisite_course_id,
                    "code": prereq_course.code if prereq_course else "N/A",
                    "name": prereq_course.name if prereq_course else "Unknown",
                    "credits": prereq_course.credits if prereq_course else 0
                })
        
        return {
            "met": len(missing) == 0,
            "missing": missing,
            "message": "All prerequisites met" if len(missing) == 0 else f"{len(missing)} prerequisite(s) missing"
        }
    
    def get_missing_prerequisites_for_student(self, student_id: int) -> List[dict]:
        """Get all missing prerequisites across the entire study plan"""
        student = self._get_student(student_id)
        if not student:
            return []
        
        study_plan = self._get_study_plan(student.major_id or 1)
        student_courses = self._get_student_courses(student_id)
        all_courses = self._get_all_courses_dict()
        prerequisites = self._get_prerequisites()
        
        completed_ids = {
            sc.course_id for sc in student_courses
            if sc.status == 'completed'
        }
        
        # Courses not yet taken
        not_taken = [
            sp for sp in study_plan
            if sp.course_id not in completed_ids
        ]
        
        missing_prereqs = []
        for sp in not_taken:
            prereq = next(
                (p for p in prerequisites if p.course_id == sp.course_id),
                None
            )
            if prereq and prereq.prerequisite_course_id not in completed_ids:
                target_course = all_courses.get(sp.course_id)
                prereq_course = all_courses.get(prereq.prerequisite_course_id)
                
                if target_course and prereq_course:
                    # Avoid duplicates
                    already_listed = any(
                        m.get("prerequisite_id") == prereq.prerequisite_course_id
                        and m.get("for_course_id") == sp.course_id
                        for m in missing_prereqs
                    )
                    if not already_listed:
                        missing_prereqs.append({
                            "for_course_id": sp.course_id,
                            "for_course_code": target_course.code,
                            "for_course_name": target_course.name,
                            "for_semester": sp.semester,
                            "for_level": sp.recommended_level_no,
                            "prerequisite_id": prereq.prerequisite_course_id,
                            "prerequisite_code": prereq_course.code,
                            "prerequisite_name": prereq_course.name,
                            "prerequisite_credits": prereq_course.credits
                        })
        
        return missing_prereqs
    
    # ==============================
    # COURSE REQUESTS (NEW)
    # ==============================
    
    def submit_course_request(self, student_id: int, course_id: int, course_name: str = None) -> dict:
        """Submit a summer course request to the database"""
        student = self._get_student(student_id)
        course = self.db.query(Course).filter(Course.id == course_id).first()
        
        if not course:
            raise ValueError(f"Course {course_id} not found")
        
        request_entry = CourseRequest(
            student=student.student_code if student else str(student_id),
            course=course_name or course.name
        )
        self.db.add(request_entry)
        self.db.commit()
        self.db.refresh(request_entry)
        
        return {
            "success": True,
            "message": f"Course request submitted for '{course.name}'",
            "request_id": request_entry.id,
            "student_code": student.student_code if student else None,
            "course_code": course.code,
            "course_name": course.name
        }
    
    def get_student_requests(self, student_id: int) -> List[dict]:
        """Get all course requests submitted by a student"""
        student = self._get_student(student_id)
        if not student:
            return []
        
        requests = self.db.query(CourseRequest).filter(
            CourseRequest.student == student.student_code
        ).all()
        
        return [
            {
                "id": r.id,
                "course": r.course,
                "student": r.student
            }
            for r in requests
        ]
    
    # ==============================
    # PLANNING OVERVIEW (NEW)
    # ==============================
    
    def get_planning_overview(self, student_id: int) -> dict:
        """Get comprehensive planning overview for dashboard display"""
        student = self._get_student(student_id)
        if not student:
            return {}
        
        study_plan = self._get_study_plan(student.major_id or 1)
        student_courses = self._get_student_courses(student_id)
        all_courses = self._get_all_courses_dict()
        
        total_credits = sum(
            all_courses[sp.course_id].credits
            for sp in study_plan
            if sp.course_id in all_courses
        )
        
        completed = [sc for sc in student_courses if sc.status == 'completed']
        completed_credits = sum(
            all_courses[sc.course_id].credits
            for sc in completed
            if sc.course_id in all_courses
        )
        
        planned = [sc for sc in student_courses if sc.status == 'planned']
        enrolled = [sc for sc in student_courses if sc.status == 'enrolled']
        
        gpa_summary = self.calculate_gpa_summary(student_id)
        
        # Ensure total_credits is at least completed_credits if plan is missing or student took extra
        if total_credits < completed_credits:
            total_credits = completed_credits

        return {
            "total_credits": total_credits,
            "completed_credits": completed_credits,
            "remaining_credits": max(0, total_credits - completed_credits),
            "completed_courses": len(completed),
            "planned_courses": len(planned),
            "enrolled_courses": len(enrolled),
            "total_courses_in_plan": len(study_plan),
            "current_gpa": gpa_summary.cumulative_gpa,
            "progress_percentage": round(
                (completed_credits / total_credits * 100), 1
            ) if total_credits > 0 else 0.0,
            "career_path": self._get_major_name(student.major_id or 1),
            "estimated_graduation": str(student.graduation_year or "N/A"),
            "max_credits_fall": self.get_max_credits_for_student(student_id, "Fall"),
            "max_credits_spring": self.get_max_credits_for_student(student_id, "Spring"),
            "max_credits_summer": self.get_max_credits_for_student(student_id, "Summer"),
            "enrollments": [
                {
                    "course_id": sc.course_id,
                    "status": sc.status,
                    "grade": sc.grade,
                    "semester": sc.semester
                } for sc in student_courses
            ]
        }
    
    # ==============================
    # SEMESTER PROGRESS TRACKING (NEW)
    # ==============================
    
    def get_semester_progress(self, student_id: int, level: int, semester: str) -> dict:
        """Get detailed progress for a specific semester"""
        student = self._get_student(student_id)
        if not student:
            return {}
        
        study_plan = self._get_study_plan(student.major_id or 1)
        student_courses = self._get_student_courses(student_id)
        all_courses = self._get_all_courses_dict()
        
        plan_courses = [
            sp for sp in study_plan
            if sp.recommended_level_no == level and sp.semester == semester
        ]
        
        courses_detail = []
        total_credits = 0
        completed_credits = 0
        
        for sp in plan_courses:
            course = all_courses.get(sp.course_id)
            if not course:
                continue
            
            total_credits += course.credits
            
            sc = next(
                (s for s in student_courses if s.course_id == sp.course_id),
                None
            )
            
            course_info = {
                "course_id": course.id,
                "code": course.code,
                "name": course.name,
                "credits": course.credits,
                "status": sc.status if sc else "not_planned",
                "grade": sc.grade if sc else None
            }
            
            if sc and sc.status == 'completed':
                completed_credits += course.credits
            
            courses_detail.append(course_info)
        
        return {
            "level": level,
            "semester": semester,
            "total_credits": total_credits,
            "completed_credits": completed_credits,
            "progress_percentage": round(
                (completed_credits / total_credits * 100), 1
            ) if total_credits > 0 else 0.0,
            "courses": courses_detail
        }
    
    # ==============================
    # COURSE OFFERING CHECKS (NEW)
    # ==============================
    
    def is_course_offered_in_semester(self, course_id: int, semester: str, academic_year: str = None) -> bool:
        """Check if a course is offered in a specific semester"""
        query = self.db.query(CourseOffering).filter(
            CourseOffering.course_id == course_id,
            CourseOffering.semester == semester,
            CourseOffering.is_open == True
        )
        
        if academic_year:
            query = query.filter(CourseOffering.academic_year == academic_year)
        
        return query.first() is not None
    
    def get_available_courses_for_semester(self, major_id: int, semester: str) -> List[dict]:
        """Get all available courses for a major in a specific semester"""
        study_plan = self._get_study_plan(major_id)
        all_courses = self._get_all_courses_dict()
        
        # Filter by semester
        semester_plan = [
            sp for sp in study_plan
            if sp.semester == semester
        ]
        
        courses = []
        for sp in semester_plan:
            course = all_courses.get(sp.course_id)
            if course:
                courses.append({
                    "course_id": course.id,
                    "code": course.code,
                    "name": course.name,
                    "credits": course.credits,
                    "level": sp.recommended_level_no
                })
        
        return courses
