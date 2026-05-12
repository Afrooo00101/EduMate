from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models import Student, StudentCourse, StudyPlan, Course, CoursePrerequisite, AIChatMessage, Major
from app.services.planning_service import PlanningService


class AdvisorService:
    """AI Career Advisor service for the planning page chat"""
    
    def __init__(self, db: Session):
        self.db = db
        self.planning = PlanningService(db)
    
    def get_student_context(self, student_id: int) -> dict:
        """Get comprehensive student context for advisor responses"""
        student = self.planning.get_student(student_id)
        if not student:
            return {"error": "Student not found"}
        
        student_courses = self.planning.get_student_courses(student_id)
        study_plan = self.planning.get_study_plan(student.major_id or 1)
        all_courses = self.planning.get_all_courses_dict()
        gpa = float(student.gpa) if student.gpa else 0.0
        
        completed = [sc for sc in student_courses if sc.status == 'completed']
        completed_ids = {sc.course_id for sc in completed}
        
        # Courses not yet taken
        not_taken = [
            sp for sp in study_plan
            if sp.course_id not in completed_ids
        ]
        
        # Calculate progress
        total_credits = sum(
            all_courses[sp.course_id].credits
            for sp in study_plan if sp.course_id in all_courses
        )
        completed_credits = sum(
            all_courses[sc.course_id].credits
            for sc in completed if sc.course_id in all_courses
        )
        progress = round((completed_credits / total_credits * 100), 1) if total_credits > 0 else 0
        
        # Summer courses
        summer_courses = self.planning.get_recommended_summer_courses(student_id)
        
        # Missing prerequisites
        prereqs = self.db.query(CoursePrerequisite).all()
        missing_prereqs = []
        for sp in not_taken[:10]:
            prereq = next((p for p in prereqs if p.course_id == sp.course_id), None)
            if prereq and prereq.prerequisite_course_id not in completed_ids:
                target = all_courses.get(sp.course_id)
                prereq_course = all_courses.get(prereq.prerequisite_course_id)
                if target and prereq_course:
                    missing_prereqs.append({
                        "for_course": target.name,
                        "for_code": target.code,
                        "needs": prereq_course.name,
                        "needs_code": prereq_course.code
                    })
        
        return {
            "student_name": student.student_code or f"Student {student_id}",
            "major": self.planning.get_major_name(student.major_id or 1),
            "gpa": gpa,
            "graduation_year": student.graduation_year,
            "completed_count": len(completed),
            "remaining_count": len(not_taken),
            "total_credits": total_credits,
            "completed_credits": completed_credits,
            "remaining_credits": total_credits - completed_credits,
            "progress_percentage": progress,
            "gpa_standing": "Excellent" if gpa >= 3.5 else "Good" if gpa >= 3.0 else "Satisfactory" if gpa >= 2.0 else "Needs Improvement",
            "next_courses": [
                {
                    "code": all_courses[sp.course_id].code if sp.course_id in all_courses else "N/A",
                    "name": all_courses[sp.course_id].name if sp.course_id in all_courses else "Unknown",
                    "credits": all_courses[sp.course_id].credits if sp.course_id in all_courses else 0,
                    "semester": sp.semester,
                    "level": sp.recommended_level_no
                }
                for sp in not_taken[:5]
            ],
            "missing_prerequisites": missing_prereqs[:5],
            "summer_courses": summer_courses[:5],
            "max_credits": self.planning.get_max_credits_for_student(student_id, "Fall")
        }
    
    def generate_response(self, student_id: int, message: str, channel: str = "planning_advisor") -> dict:
        """Generate contextual advisor response based on student data"""
        context = self.get_student_context(student_id)
        msg_lower = message.lower()
        
        # Route to appropriate handler
        if any(w in msg_lower for w in ["next", "recommend", "take", "course", "what should"]):
            response = self._recommend_courses(context)
        elif any(w in msg_lower for w in ["summer", "☀️"]):
            response = self._summer_courses(context)
        elif any(w in msg_lower for w in ["graduat", "timeline", "finish", "when"]):
            response = self._graduation_timeline(context)
        elif any(w in msg_lower for w in ["prereq", "require", "need before"]):
            response = self._check_prerequisites(context)
        elif any(w in msg_lower for w in ["gpa", "grade", "score"]):
            response = self._gpa_analysis(context)
        elif any(w in msg_lower for w in ["progress", "status", "how am i"]):
            response = self._progress_status(context)
        else:
            response = self._general_help(context)
        
        # Save to database
        self._save_message(student_id, channel, message, response["message"])
        
        return response
    
    def _recommend_courses(self, ctx: dict) -> dict:
        courses = ctx.get("next_courses", [])
        if not courses:
            return {
                "message": "🎉 Great news! You've completed all courses in your study plan. Focus on capstone projects and internships now.",
                "suggestions": ["Check summer courses", "Graduation timeline", "What's my GPA?"],
                "summer_courses": [],
                "relevant_courses": []
            }
        
        course_list = "\n".join([
            f"{i+1}. **{c['code']}** - {c['name']} ({c['credits']} credits) → {c['semester']} semester (Level {c['level']})"
            for i, c in enumerate(courses[:5])
        ])
        
        return {
            "message": (
                f"📚 **Recommended Courses for {ctx.get('major', 'your program')}:**\n\n"
                f"{course_list}\n\n"
                f"📊 Your GPA is **{ctx.get('gpa', 0):.2f}** ({ctx.get('gpa_standing', 'N/A')} standing), "
                f"allowing up to **{ctx.get('max_credits', 18)} credits** per semester.\n\n"
                f"✅ You've completed **{ctx.get('completed_count', 0)} courses** so far."
            ),
            "suggestions": ["What about summer courses?", "Check prerequisites", "Graduation timeline"],
            "summer_courses": ctx.get("summer_courses", []),
            "relevant_courses": courses[:5]
        }
    
    def _summer_courses(self, ctx: dict) -> dict:
        summer = ctx.get("summer_courses", [])
        if not summer:
            return {
                "message": (
                    "☀️ There are no summer courses currently recommended for your study plan. "
                    "This means you're on track! Consider using summer for:\n"
                    "• Internships to gain experience\n"
                    "• Personal projects to build your portfolio\n"
                    "• Self-study in areas of interest"
                ),
                "suggestions": ["Next semester courses", "Graduation timeline", "Progress status"],
                "summer_courses": [],
                "relevant_courses": []
            }
        
        course_list = "\n".join([
            f"• **{c['code']}** - {c['name']} ({c['credits']} credits)"
            + (f" ⚠️ Prerequisite needed: {c['prerequisite_code']}" if not c['prerequisite_met'] else " ✅")
            for c in summer
        ])
        
        return {
            "message": (
                f"☀️ **Summer Course Recommendations:**\n\n"
                f"{course_list}\n\n"
                f"💡 Summer courses help you stay ahead or catch up. "
                f"Request any course through the Summer Course Request panel."
            ),
            "suggestions": ["Request a summer course", "Check eligibility", "Next semester courses"],
            "summer_courses": summer[:5],
            "relevant_courses": []
        }
    
    def _graduation_timeline(self, ctx: dict) -> dict:
        return {
            "message": (
                f"🎓 **Your Graduation Timeline:**\n\n"
                f"• **Major:** {ctx.get('major', 'N/A')}\n"
                f"• **Estimated Graduation:** {ctx.get('graduation_year', 'N/A')}\n"
                f"• **Courses Completed:** {ctx.get('completed_count', 0)}\n"
                f"• **Courses Remaining:** {ctx.get('remaining_count', 0)}\n"
                f"• **Credits Earned:** {ctx.get('completed_credits', 0)} / {ctx.get('total_credits', 0)}\n"
                f"• **Overall Progress:** {ctx.get('progress_percentage', 0)}%\n"
                f"• **Current GPA:** {ctx.get('gpa', 0):.2f}\n\n"
                f"Keep up the great work! You're making excellent progress."
            ),
            "suggestions": ["Next semester courses", "Summer courses", "Check prerequisites"],
            "summer_courses": [],
            "relevant_courses": []
        }
    
    def _check_prerequisites(self, ctx: dict) -> dict:
        missing = ctx.get("missing_prerequisites", [])
        if not missing:
            return {
                "message": (
                    "✅ **All prerequisites are met!**\n\n"
                    "You've completed all prerequisite courses for your upcoming courses. "
                    "You're in excellent academic standing."
                ),
                "suggestions": ["Next semester courses", "Summer courses", "Graduation timeline"],
                "summer_courses": [],
                "relevant_courses": []
            }
        
        prereq_list = "\n".join([
            f"• To take **{m['for_code']} - {m['for_course']}**, "
            f"you still need **{m['needs_code']} - {m['needs']}**"
            for m in missing[:5]
        ])
        
        return {
            "message": (
                f"⚠️ **Missing Prerequisites Found:**\n\n"
                f"{prereq_list}\n\n"
                f"Make sure to complete these before enrolling in the associated courses. "
                f"Check if any are available in the upcoming summer session."
            ),
            "suggestions": ["Summer courses", "Check specific prerequisite", "Graduation timeline"],
            "summer_courses": ctx.get("summer_courses", []),
            "relevant_courses": []
        }
    
    def _gpa_analysis(self, ctx: dict) -> dict:
        gpa = ctx.get("gpa", 0)
        standing = ctx.get("gpa_standing", "N/A")
        max_credits = ctx.get("max_credits", 18)
        
        return {
            "message": (
                f"📊 **GPA Analysis:**\n\n"
                f"• **Current GPA:** {gpa:.2f}\n"
                f"• **Academic Standing:** {standing}\n"
                f"• **Max Credits/Semester:** {max_credits}\n\n"
                f"Your GPA determines how many credits you can take. "
                f"{'You qualify for honors programs and advanced electives.' if gpa >= 3.5 else 'Keep working on improving your grades for more flexibility.'}"
            ),
            "suggestions": ["Next semester courses", "Progress status", "Summer courses"],
            "summer_courses": [],
            "relevant_courses": []
        }
    
    def _progress_status(self, ctx: dict) -> dict:
        return {
            "message": (
                f"📈 **Your Progress Status:**\n\n"
                f"• **Overall Progress:** {ctx.get('progress_percentage', 0)}%\n"
                f"• **Courses Completed:** {ctx.get('completed_count', 0)}\n"
                f"• **Courses Remaining:** {ctx.get('remaining_count', 0)}\n"
                f"• **Credits Earned:** {ctx.get('completed_credits', 0)} / {ctx.get('total_credits', 0)}\n"
                f"• **GPA:** {ctx.get('gpa', 0):.2f} ({ctx.get('gpa_standing', 'N/A')})\n\n"
                f"Estimated remaining semesters: ~{max(1, (ctx.get('remaining_count', 0) // 5))}"
            ),
            "suggestions": ["Next semester courses", "Summer courses", "Graduation timeline"],
            "summer_courses": ctx.get("summer_courses", []),
            "relevant_courses": ctx.get("next_courses", [])
        }
    
    def _general_help(self, ctx: dict) -> dict:
        return {
            "message": (
                f"👋 Hello! I'm your **AI Career Advisor** for **{ctx.get('major', 'your program')}**.\n\n"
                f"Here's what I can help with:\n"
                f"📚 **Course recommendations** for upcoming semesters\n"
                f"☀️ **Summer course options** based on your plan\n"
                f"🎓 **Graduation timeline** and progress tracking\n"
                f"📋 **Prerequisite checks** for any course\n"
                f"📊 **GPA analysis** and academic standing\n"
                f"📈 **Progress overview** of your degree\n\n"
                f"Your current GPA is **{ctx.get('gpa', 0):.2f}** and you've completed "
                f"**{ctx.get('completed_count', 0)} courses** with "
                f"**{ctx.get('progress_percentage', 0)}% progress**.\n\n"
                f"What would you like to know?"
            ),
            "suggestions": [
                "What courses should I take next?",
                "Are there summer courses available?",
                "What are my missing prerequisites?",
                "Show my graduation timeline",
                "What's my current progress?"
            ],
            "summer_courses": ctx.get("summer_courses", []),
            "relevant_courses": ctx.get("next_courses", [])
        }
    
    def _save_message(self, student_id: int, channel: str, user_msg: str, assistant_msg: str):
        """Save chat message to database"""
        try:
            msg = AIChatMessage(
                student_id=student_id,
                channel=channel,
                user_message=user_msg,
                assistant_message=assistant_msg
            )
            self.db.add(msg)
            self.db.commit()
        except Exception as e:
            print(f"Failed to save chat: {e}")
            self.db.rollback()
    
    def get_chat_history(self, student_id: int, channel: str = "planning_advisor", limit: int = 50) -> list:
        """Get chat history for a student"""
        return (
            self.db.query(AIChatMessage)
            .filter(
                AIChatMessage.student_id == student_id,
                AIChatMessage.channel == channel
            )
            .order_by(AIChatMessage.created_at.asc())
            .limit(limit)
            .all()
        )
