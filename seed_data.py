from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import app.models  # noqa: F401
from app.core.security import get_password_hash
from sqlalchemy import text as sa_text
from app.database import Base, SessionLocal, engine
from app.models import (
    AIChatMessage,
    AcademicRule,
    ActivityLog,
    AnalyticsEvent,
    Course,
    CourseOffering,
    CoursePrerequisite,
    Internship,
    InternshipApplication,
    Major,
    PlannerState,
    Recommendation,
    ResumeDocument,
    ResumeProfile,
    SavedCourse,
    SavedInternship,
    SecurityAudit,
    Skill,
    Student,
    StudentCourse,
    StudentSkill,
    StudyPlan,
    User,
)


MAJORS = [
    {'name': 'Cyber Security', 'department': 'School of Computing', 'description': 'Secure systems, networks, applications, and cloud workloads.'},
    {'name': 'Computer Science', 'department': 'School of Computing', 'description': 'Software engineering, algorithms, data structures, and AI foundations.'},
    {'name': 'Data Science', 'department': 'School of Computing', 'description': 'Machine learning, statistics, analytics, and data engineering.'},
    {'name': 'Business Information Systems', 'department': 'School of Business', 'description': 'Technology-enabled operations, analytics, and product delivery.'},
]

SKILLS = [
    {'name': 'Python', 'category': 'Programming'},
    {'name': 'SQL', 'category': 'Data'},
    {'name': 'FastAPI', 'category': 'Backend'},
    {'name': 'React', 'category': 'Frontend'},
    {'name': 'Network Security', 'category': 'Security'},
    {'name': 'Linux', 'category': 'Infrastructure'},
    {'name': 'Cloud Fundamentals', 'category': 'Cloud'},
    {'name': 'Data Analysis', 'category': 'Analytics'},
    {'name': 'Machine Learning', 'category': 'AI'},
    {'name': 'Project Management', 'category': 'Business'},
    {'name': 'UI Design', 'category': 'Frontend'},
    {'name': 'DevOps', 'category': 'Infrastructure'},
]

COURSES = [
    ('CS101', 'Programming Fundamentals', 3, 'Computer Science', 'Build core problem-solving and programming skills using Python.'),
    ('CS102', 'Object-Oriented Programming', 3, 'Computer Science', 'Design maintainable software with classes, objects, and testing.'),
    ('CS201', 'Data Structures', 3, 'Computer Science', 'Apply arrays, stacks, queues, trees, and graphs to real problems.'),
    ('CS301', 'Database Systems', 3, 'Computer Science', 'Model, query, and optimize relational databases using SQL.'),
    ('CS305', 'Web Application Development', 3, 'Computer Science', 'Build full-stack web applications with APIs and frontend integration.'),
    ('CY201', 'Network Security', 3, 'Cyber Security', 'Protect enterprise networks and understand common attack paths.'),
    ('CY305', 'Ethical Hacking', 3, 'Cyber Security', 'Perform controlled vulnerability assessment and penetration testing.'),
    ('CY310', 'Digital Forensics', 3, 'Cyber Security', 'Collect and analyze digital evidence from compromised systems.'),
    ('CY320', 'Cloud Security', 3, 'Cyber Security', 'Secure cloud workloads, IAM, secrets, and deployment pipelines.'),
    ('DS201', 'Statistics for Data Science', 3, 'Data Science', 'Use probability and statistics to reason about datasets and experiments.'),
    ('DS210', 'Data Visualization', 3, 'Data Science', 'Communicate insights through dashboards and visual narratives.'),
    ('DS320', 'Machine Learning', 3, 'Data Science', 'Train and evaluate predictive models on real-world datasets.'),
    ('BIS220', 'Business Process Analysis', 3, 'Business Information Systems', 'Model business workflows and identify systems improvement opportunities.'),
    ('BIS310', 'Product Analytics', 3, 'Business Information Systems', 'Measure engagement, funnels, retention, and product decision quality.'),
]

PREREQUISITES = [
    ('CS102', 'CS101'),
    ('CS201', 'CS102'),
    ('CS301', 'CS201'),
    ('CS305', 'CS201'),
    ('CY305', 'CY201'),
    ('CY310', 'CY201'),
    ('CY320', 'CY201'),
    ('DS210', 'DS201'),
    ('DS320', 'DS201'),
]

ACADEMIC_RULES = [
    ('Fall', 0.00, 1.99, 13),
    ('Fall', 2.00, 2.99, 18),
    ('Fall', 3.00, 4.30, 21),
    ('Spring', 0.00, 1.99, 13),
    ('Spring', 2.00, 2.99, 18),
    ('Spring', 3.00, 4.30, 21),
    ('Summer', 0.00, 2.99, 7),
    ('Summer', 3.00, 4.30, 9),
]

COURSE_OFFERINGS = [
    ('CS101', 'Fall', '2026/2027', True),
    ('CS101', 'Spring', '2026/2027', True),
    ('CS102', 'Spring', '2026/2027', True),
    ('CS201', 'Fall', '2026/2027', True),
    ('CS301', 'Fall', '2026/2027', True),
    ('CS305', 'Spring', '2026/2027', True),
    ('CY201', 'Fall', '2026/2027', True),
    ('CY305', 'Spring', '2026/2027', True),
    ('CY310', 'Spring', '2026/2027', True),
    ('CY320', 'Fall', '2026/2027', True),
    ('DS201', 'Fall', '2026/2027', True),
    ('DS210', 'Spring', '2026/2027', True),
    ('DS320', 'Fall', '2026/2027', True),
    ('BIS220', 'Fall', '2026/2027', True),
    ('BIS310', 'Spring', '2026/2027', True),
]

STUDY_PLAN_BY_MAJOR = {
    'Computer Science': [
        ('CS101', 'Fall', 1, 1),
        ('CS102', 'Spring', 1, 2),
        ('CS201', 'Fall', 2, 3),
        ('CS301', 'Fall', 3, 4),
        ('CS305', 'Spring', 3, 5),
    ],
    'Cyber Security': [
        ('CS101', 'Fall', 1, 1),
        ('CY201', 'Spring', 1, 2),
        ('CY305', 'Fall', 2, 3),
        ('CY310', 'Spring', 2, 4),
        ('CY320', 'Fall', 3, 5),
    ],
    'Data Science': [
        ('CS101', 'Fall', 1, 1),
        ('DS201', 'Spring', 1, 2),
        ('DS210', 'Fall', 2, 3),
        ('CS301', 'Spring', 2, 4),
        ('DS320', 'Fall', 3, 5),
    ],
    'Business Information Systems': [
        ('CS101', 'Fall', 1, 1),
        ('BIS220', 'Spring', 1, 2),
        ('CS301', 'Fall', 2, 3),
        ('BIS310', 'Spring', 2, 4),
        ('CS305', 'Fall', 3, 5),
    ],
}

INTERNSHIPS = [
    {'company_name': 'Orange Cyberdefense', 'position': 'Cyber Security Intern', 'description': 'Support SOC operations, alert triage, and vulnerability reporting.', 'location': 'Cairo', 'work_mode': 'hybrid'},
    {'company_name': 'IBM Egypt', 'position': 'Backend Engineering Intern', 'description': 'Help build Python services, internal APIs, and integration tooling.', 'location': 'Cairo', 'work_mode': 'hybrid'},
    {'company_name': 'Microsoft ADC', 'position': 'Software Engineering Intern', 'description': 'Ship product features, automation, and test coverage improvements.', 'location': 'Cairo', 'work_mode': 'onsite'},
    {'company_name': 'Valeo', 'position': 'Data Analyst Intern', 'description': 'Work on analytics pipelines, KPI dashboards, and reporting automation.', 'location': 'Cairo', 'work_mode': 'hybrid'},
    {'company_name': 'Dell Technologies', 'position': 'Cloud Operations Intern', 'description': 'Assist with cloud monitoring, security posture, and deployment support.', 'location': 'Remote', 'work_mode': 'remote'},
    {'company_name': 'Banque Misr', 'position': 'Information Security Intern', 'description': 'Review security controls, logs, and awareness procedures.', 'location': 'Cairo', 'work_mode': 'onsite'},
    {'company_name': 'Instabug', 'position': 'Frontend Engineering Intern', 'description': 'Build React UI flows and improve developer-facing product quality.', 'location': 'Cairo', 'work_mode': 'hybrid'},
    {'company_name': 'SWVL', 'position': 'Product Analytics Intern', 'description': 'Analyze growth experiments and user behavior data.', 'location': 'Cairo', 'work_mode': 'hybrid'},
]

ACCOUNT_USERS = [
    {'student_code': 'ADM001', 'full_name': 'Lina Hassan', 'password': 'Admin@12345', 'major': 'Business Information Systems', 'gpa': 3.95, 'skills_summary': 'Leadership, operations, analytics, governance', 'profile_image_url': None, 'role': 'admin'},
    {'student_code': '230145612', 'full_name': 'Mohamed Ahmed', 'password': 'EduMate@123', 'major': 'Cyber Security', 'gpa': 3.42, 'skills_summary': 'Python, Linux, SIEM, network security', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '230245613', 'full_name': 'Salma Nabil', 'password': 'EduMate@123', 'major': 'Computer Science', 'gpa': 3.68, 'skills_summary': 'Python, FastAPI, SQL, React', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '230345614', 'full_name': 'Youssef Tarek', 'password': 'EduMate@123', 'major': 'Data Science', 'gpa': 3.51, 'skills_summary': 'SQL, pandas, visualization, machine learning', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '240145615', 'full_name': 'Nour Ali', 'password': 'EduMate@123', 'major': 'Cyber Security', 'gpa': 3.34, 'skills_summary': 'Cloud security, IAM, Python, SOC workflows', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '240245616', 'full_name': 'Omar Khaled', 'password': 'EduMate@123', 'major': 'Business Information Systems', 'gpa': 3.12, 'skills_summary': 'Product analytics, dashboards, business analysis', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '240345617', 'full_name': 'Huda Samir', 'password': 'EduMate@123', 'major': 'Computer Science', 'gpa': 3.74, 'skills_summary': 'UI design, JavaScript, React, design systems', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '250145618', 'full_name': 'Karim Essam', 'password': 'EduMate@123', 'major': 'Data Science', 'gpa': 3.21, 'skills_summary': 'SQL, Power BI, dashboards, ETL', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '250245619', 'full_name': 'Farah Adel', 'password': 'EduMate@123', 'major': 'Computer Science', 'gpa': 3.83, 'skills_summary': 'JavaScript, UI systems, frontend testing', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '250345620', 'full_name': 'Ziad Mostafa', 'password': 'EduMate@123', 'major': 'Cyber Security', 'gpa': 2.97, 'skills_summary': 'Networks, SOC analysis, Linux basics', 'profile_image_url': None, 'role': 'student'},
    {'student_code': '250445621', 'full_name': 'Rana Magdy', 'password': 'EduMate@123', 'major': 'Business Information Systems', 'gpa': 3.47, 'skills_summary': 'Business analysis, product metrics, presentations', 'profile_image_url': None, 'role': 'student'},
]

SUT_EMAIL_DOMAIN = 'sut.edu.eg'


def build_name_slug(full_name: str) -> str:
    return '.'.join(segment.lower() for segment in full_name.split() if segment.strip())


def build_student_email_slug(full_name: str) -> str:
    parts = [segment.lower() for segment in full_name.split() if segment.strip()]
    return parts[0] if parts else 'student'


def derive_intake_year(student_code: str) -> int | None:
    if student_code.startswith('20') and len(student_code) >= 4 and student_code[:4].isdigit():
        return int(student_code[:4])
    if len(student_code) >= 2 and student_code[:2].isdigit():
        return 2000 + int(student_code[:2])
    return None


def derive_graduation_year(student_code: str) -> int | None:
    intake_year = derive_intake_year(student_code)
    if intake_year is None:
        return None
    return intake_year + 4


def build_account_email(account: dict[str, object]) -> str:
    full_name = str(account['full_name'])
    name_slug = build_name_slug(full_name)
    if account['role'] == 'student':
        return f"{build_student_email_slug(full_name)}{account['student_code']}@{SUT_EMAIL_DOMAIN}"
    return f"{name_slug}@{SUT_EMAIL_DOMAIN}"


for account in ACCOUNT_USERS:
    account['email'] = build_account_email(account)
    account['graduation_year'] = derive_graduation_year(str(account['student_code'])) if account['role'] == 'student' else None


def upsert(session, model, lookup, values):
    instance = session.query(model).filter_by(**lookup).first()
    if instance is None:
        instance = model(**lookup, **values)
        session.add(instance)
    else:
        for key, value in values.items():
            setattr(instance, key, value)
    session.flush()
    return instance


def ensure_skill_link(session, student, skill, level):
    upsert(session, StudentSkill, {'student_id': student.id, 'skill_id': skill.id}, {'level': level})


def ensure_course_enrollment(session, student, course, semester, grade, status):
    upsert(session, StudentCourse, {'student_id': student.id, 'course_id': course.id, 'semester': semester}, {'grade': grade, 'status': status})


def build_semesters_json(plan_rows):
    semester_data = {}
    for semester, courses in plan_rows.items():
        semester_data[semester] = [{'course': course_name, 'credits': str(credits)} for course_name, credits in courses]
    return json.dumps({'semesterData': semester_data, 'totalCredits': sum(item[1] for rows in plan_rows.values() for item in rows), 'gradProgress': 45})


def seed() -> None:
    with engine.connect() as conn:
        conn.execute(sa_text("SET FOREIGN_KEY_CHECKS=0"))
        Base.metadata.create_all(bind=engine)
        conn.execute(sa_text("SET FOREIGN_KEY_CHECKS=1"))
        conn.commit()
    session = SessionLocal()
    try:
        major_map = {}
        for item in MAJORS:
            major = upsert(session, Major, {'name': item['name']}, {'department': item['department'], 'description': item['description']})
            major_map[item['name']] = major

        skill_map = {}
        for item in SKILLS:
            skill = upsert(session, Skill, {'name': item['name']}, {'category': item['category']})
            skill_map[item['name']] = skill

        course_map = {}
        for code, name, credits, major_name, description in COURSES:
            course = upsert(session, Course, {'code': code}, {'name': name, 'credits': credits, 'major_id': major_map[major_name].id, 'description': description})
            course_map[code] = course

        for course_code, prereq_code in PREREQUISITES:
            upsert(session, CoursePrerequisite, {'course_id': course_map[course_code].id, 'prerequisite_course_id': course_map[prereq_code].id}, {})

        for semester_type, min_gpa, max_gpa, max_credits in ACADEMIC_RULES:
            upsert(session, AcademicRule, {'semester_type': semester_type, 'min_gpa': min_gpa, 'max_gpa': max_gpa}, {'max_credits': max_credits})

        for course_code, semester, academic_year, is_open in COURSE_OFFERINGS:
            upsert(session, CourseOffering, {'course_id': course_map[course_code].id, 'semester': semester, 'academic_year': academic_year}, {'is_open': is_open})

        for major_name, rows in STUDY_PLAN_BY_MAJOR.items():
            major = major_map[major_name]
            for course_code, semester, recommended_level_no, display_order in rows:
                upsert(
                    session,
                    StudyPlan,
                    {'major_id': major.id, 'course_id': course_map[course_code].id},
                    {'semester': semester, 'recommended_level_no': recommended_level_no, 'display_order': display_order, 'is_active': True},
                )

        internship_map = {}
        deadline = date.today() + timedelta(days=45)
        for item in INTERNSHIPS:
            internship = upsert(session, Internship, {'company_name': item['company_name'], 'position': item['position']}, {'description': item['description'], 'location': item['location'], 'work_mode': item['work_mode'], 'application_deadline': deadline, 'is_active': True})
            internship_map[(item['company_name'], item['position'])] = internship

        students = []
        for item in ACCOUNT_USERS:
            user = upsert(
                session,
                User,
                {'email': item['email']},
                {
                    'name': item['full_name'],
                    'role': item['role'],
                    'password_hash': get_password_hash(item['password']),
                    'is_active': True,
                },
            )
            student = upsert(
                session,
                Student,
                {'student_code': item['student_code']},
                {
                    'user_id': user.id,
                    'gpa': item['gpa'],
                    'major_id': major_map[item['major']].id,
                    'graduation_year': item['graduation_year'],
                    'skills_summary': item['skills_summary'],
                    'profile_image_url': item['profile_image_url'],
                },
            )
            students.append(student)

        session.flush()
        # active_user_ids = [student.user_id for student in students if student.user_id]
        # session.query(User).filter(~User.id.in_(active_user_ids)).delete(synchronize_session=False)
        # session.flush()
        student_map = {student.student_code: student for student in students}
        seeded_student_ids = [student.id for student in students]

        for model in (StudentSkill, StudentCourse, SavedCourse, SavedInternship, InternshipApplication, ResumeDocument, ResumeProfile, Recommendation, PlannerState, ActivityLog, AnalyticsEvent, AIChatMessage):
            session.query(model).filter(model.student_id.in_(seeded_student_ids)).delete(synchronize_session=False)

        skill_levels = {
            '230145612': [('Python', 'advanced'), ('Linux', 'advanced'), ('Network Security', 'advanced'), ('Cloud Fundamentals', 'intermediate')],
            '230245613': [('Python', 'advanced'), ('FastAPI', 'advanced'), ('SQL', 'intermediate'), ('React', 'intermediate')],
            '230345614': [('SQL', 'advanced'), ('Data Analysis', 'advanced'), ('Machine Learning', 'intermediate')],
            '240145615': [('Cloud Fundamentals', 'advanced'), ('Network Security', 'intermediate'), ('Python', 'intermediate')],
            '240245616': [('Project Management', 'advanced'), ('Data Analysis', 'intermediate'), ('SQL', 'intermediate')],
            '240345617': [('React', 'advanced'), ('UI Design', 'advanced'), ('Python', 'intermediate')],
            '250145618': [('SQL', 'advanced'), ('Data Analysis', 'advanced'), ('DevOps', 'beginner')],
            '250245619': [('React', 'advanced'), ('UI Design', 'advanced'), ('Python', 'intermediate')],
            '250345620': [('Network Security', 'intermediate'), ('Linux', 'intermediate'), ('Cloud Fundamentals', 'beginner')],
            '250445621': [('Project Management', 'intermediate'), ('Data Analysis', 'intermediate'), ('SQL', 'beginner')],
        }
        for student_code, items in skill_levels.items():
            student = student_map[student_code]
            for skill_name, level in items:
                ensure_skill_link(session, student, skill_map[skill_name], level)

        enrollment_plan = {
            '230145612': [('CS101', 'Semester 1', 'A', 'completed'), ('CY201', 'Semester 2', 'A-', 'completed'), ('CY305', 'Semester 3', None, 'planned'), ('CY320', 'Semester 4', None, 'planned')],
            '230245613': [('CS101', 'Semester 1', 'A', 'completed'), ('CS102', 'Semester 2', 'A-', 'completed'), ('CS201', 'Semester 3', 'B+', 'completed'), ('CS305', 'Semester 4', None, 'planned')],
            '230345614': [('CS101', 'Semester 1', 'A-', 'completed'), ('DS201', 'Semester 2', 'A', 'completed'), ('DS210', 'Semester 3', 'A-', 'completed'), ('DS320', 'Semester 4', None, 'planned')],
            '240145615': [('CS101', 'Semester 1', 'B+', 'completed'), ('CY201', 'Semester 2', 'A', 'completed'), ('CY310', 'Semester 3', None, 'planned')],
            '240245616': [('BIS220', 'Semester 2', 'A-', 'completed'), ('CS301', 'Semester 3', 'B+', 'completed'), ('BIS310', 'Semester 4', None, 'planned')],
            '240345617': [('CS101', 'Semester 1', 'A', 'completed'), ('CS102', 'Semester 2', 'B+', 'completed'), ('CS305', 'Semester 3', None, 'planned')],
            '250145618': [('CS101', 'Semester 1', 'B+', 'completed'), ('DS201', 'Semester 2', None, 'planned')],
            '250245619': [('CS101', 'Semester 1', 'A-', 'completed'), ('CS102', 'Semester 2', None, 'planned')],
            '250345620': [('CS101', 'Semester 1', 'B', 'completed'), ('CY201', 'Semester 2', None, 'planned')],
            '250445621': [('CS101', 'Semester 1', 'A-', 'completed'), ('BIS220', 'Semester 2', None, 'planned')],
        }
        for student_code, rows in enrollment_plan.items():
            student = student_map[student_code]
            for course_code, semester, grade, status in rows:
                ensure_course_enrollment(session, student, course_map[course_code], semester, grade, status)

        saved_courses = {
            '230145612': [('CompTIA Security+ Prep', 'Coursera', 'security'), ('SOC Analyst Path', 'TryHackMe', 'security')],
            '230245613': [('FastAPI in Practice', 'Udemy', 'backend'), ('System Design Basics', 'Educative', 'backend')],
            '230345614': [('Data Storytelling', 'LinkedIn Learning', 'analytics'), ('ML Ops Foundations', 'Coursera', 'ai')],
            '240145615': [('Cloud Security Basics', 'AWS Skill Builder', 'cloud')],
            '240245616': [('Product Metrics', 'Udacity', 'business')],
            '240345617': [('Modern UI Systems', 'Frontend Masters', 'frontend')],
            '250145618': [('Power BI Essentials', 'Coursera', 'analytics')],
            '250245619': [('Frontend Performance', 'Frontend Masters', 'frontend')],
            '250345620': [('SOC Fundamentals', 'Cisco Skills for All', 'security')],
            '250445621': [('Business Communication', 'Coursera', 'business')],
        }
        for student_code, rows in saved_courses.items():
            student = student_map[student_code]
            for index, (title, provider, category) in enumerate(rows, start=1):
                session.add(SavedCourse(student_id=student.id, external_id=f'{student.student_code}-course-{index}', title=title, provider=provider, category=category, difficulty='intermediate', duration='6 weeks', progress=min(25 * index, 100), enrolled=True, description=f'{title} recommended for {getattr(student.major, "name", "career growth")}.', image_url=None, course_url='https://example.com/course', source='seed'))

        saved_internships = {
            '230145612': [('Cyber Security Intern', 'Orange Cyberdefense', 'cyber', 92)],
            '230245613': [('Backend Engineering Intern', 'IBM Egypt', 'backend', 90), ('Software Engineering Intern', 'Microsoft ADC', 'software', 87)],
            '230345614': [('Data Analyst Intern', 'Valeo', 'data', 91)],
            '240145615': [('Cloud Operations Intern', 'Dell Technologies', 'cloud', 86)],
            '240245616': [('Product Analytics Intern', 'SWVL', 'analytics', 84)],
            '240345617': [('Frontend Engineering Intern', 'Instabug', 'frontend', 89)],
            '250145618': [('Data Analyst Intern', 'Valeo', 'data', 88)],
            '250245619': [('Frontend Engineering Intern', 'Instabug', 'frontend', 85)],
            '250345620': [('Information Security Intern', 'Banque Misr', 'security', 82)],
            '250445621': [('Product Analytics Intern', 'SWVL', 'analytics', 80)],
        }
        for student_code, rows in saved_internships.items():
            student = student_map[student_code]
            for title, company, code, score in rows:
                session.add(SavedInternship(student_id=student.id, title=title, company_name=company, position_code=code, match_score=score, match_reason=f'Good fit based on {student.skills_summary}.', salary='Competitive', apply_url='https://example.com/internship', status='saved'))

        applications = {
            '230145612': [('Orange Cyberdefense', 'Cyber Security Intern', 'submitted')],
            '230245613': [('IBM Egypt', 'Backend Engineering Intern', 'submitted')],
            '230345614': [('Valeo', 'Data Analyst Intern', 'submitted')],
            '240345617': [('Instabug', 'Frontend Engineering Intern', 'reviewing')],
            '250145618': [('Valeo', 'Data Analyst Intern', 'submitted')],
            '250345620': [('Banque Misr', 'Information Security Intern', 'submitted')],
        }
        for student_code, rows in applications.items():
            student = student_map[student_code]
            for company_name, position, status in rows:
                internship = internship_map[(company_name, position)]
                session.add(InternshipApplication(student_id=student.id, internship_id=internship.id, application_date=date.today() - timedelta(days=7), status=status))

        resume_profiles = {
            '230145612': ('Cyber Security Student', 'Interested in SOC analysis, secure infrastructure, and incident response.', 84),
            '230245613': ('Backend Developer', 'Builds clean APIs and reliable data-driven web applications.', 88),
            '230345614': ('Data Science Student', 'Enjoys analytics, ML experiments, and decision support dashboards.', 86),
            '240145615': ('Cloud Security Trainee', 'Focused on IAM, cloud posture, and secure deployment pipelines.', 82),
            '240245616': ('Business Analyst', 'Combines analytics and stakeholder communication to improve products.', 80),
            '240345617': ('Frontend Developer', 'Designs polished interfaces and ships usable web experiences.', 87),
            '250145618': ('Junior Data Analyst', 'Builds useful dashboards and turns messy data into decisions.', 83),
            '250245619': ('Frontend Engineer in Training', 'Builds fast, polished interfaces with attention to visual consistency.', 85),
            '250345620': ('Security Operations Student', 'Learning defensive monitoring, vulnerability basics, and incident workflows.', 78),
            '250445621': ('Business Systems Student', 'Interested in process improvement, dashboards, and product coordination.', 81),
        }
        for student_code, (title, summary, ats_score) in resume_profiles.items():
            student = student_map[student_code]
            session.add(ResumeProfile(student_id=student.id, full_name=student.full_name, title=title, email=student.email, phone='+20 100 000 0000', location='Cairo, Egypt', linkedin=f'linkedin.com/in/{student.student_code.lower()}', github='github.com/edumate-demo', skills=student.skills_summary, summary=summary, template_name='modern', education_json=json.dumps([{'degree': getattr(student.major, 'name', ''), 'school': 'SUT', 'year': str(student.graduation_year)}]), experience_json=json.dumps([{'title': 'Student Trainee', 'company': 'EduMate Labs', 'dates': '2025 - Present', 'desc': 'Worked on product prototypes, research, and presentations.'}]), projects_json=json.dumps([{'name': 'Career Planner App', 'tech': 'FastAPI, MySQL, JavaScript', 'desc': 'A planning and employability platform for students.'}]), ats_score=ats_score))
            session.add(ResumeDocument(student_id=student.id, file_url=f'https://example.com/resumes/{student.student_code}.pdf', file_name=f'{student.student_code}_resume.pdf', ats_score=ats_score))
            session.add(Recommendation(student_id=student.id, recommendation_type='career', description=f'Prioritize internships and projects aligned with {title}.'))

        planner_plans = {
            '230145612': {'sem1': [('Programming Fundamentals', 3), ('Network Basics', 3)], 'sem2': [('Network Security', 3), ('Linux Administration', 3)]},
            '230245613': {'sem1': [('Programming Fundamentals', 3), ('Discrete Math', 3)], 'sem2': [('Object-Oriented Programming', 3), ('Database Systems', 3)]},
            '230345614': {'sem1': [('Programming Fundamentals', 3), ('Statistics for Data Science', 3)], 'sem2': [('Data Visualization', 3), ('Machine Learning', 3)]},
            '240145615': {'sem1': [('Programming Fundamentals', 3), ('Network Security', 3)], 'sem2': [('Cloud Security', 3), ('Digital Forensics', 3)]},
            '240245616': {'sem1': [('Business Process Analysis', 3), ('Database Systems', 3)], 'sem2': [('Product Analytics', 3), ('Project Delivery', 3)]},
            '240345617': {'sem1': [('Programming Fundamentals', 3), ('UI Basics', 3)], 'sem2': [('Web Application Development', 3), ('Design Systems', 3)]},
            '250145618': {'sem1': [('Programming Fundamentals', 3), ('Statistics for Data Science', 3)], 'sem2': [('Data Visualization', 3), ('Business Intelligence', 3)]},
            '250245619': {'sem1': [('Programming Fundamentals', 3), ('Design Principles', 3)], 'sem2': [('Object-Oriented Programming', 3), ('Frontend Systems', 3)]},
            '250345620': {'sem1': [('Programming Fundamentals', 3), ('Introduction to Cyber Security', 3)], 'sem2': [('Network Security', 3), ('Linux Essentials', 3)]},
            '250445621': {'sem1': [('Programming Fundamentals', 3), ('Business Process Analysis', 3)], 'sem2': [('Product Analytics', 3), ('Business Communication', 3)]},
        }
        for student_code, plan in planner_plans.items():
            student = student_map[student_code]
            session.add(PlannerState(student_id=student.id, career_path=getattr(student.major, 'name', 'Career Path'), mode='preview', semesters_json=build_semesters_json(plan), taken_subjects_json=json.dumps(['CS101']), grades_json=json.dumps({'CS101': 'A'}), roadmap_json=json.dumps([{'id': 'roadmap-y1-1', 'checked': True}, {'id': 'roadmap-y1-2', 'checked': True}]), goals_json=json.dumps([{'id': 'goal1', 'text': 'Complete one internship', 'dueDate': 'Aug 2026', 'completed': False, 'progress': 60}]), skills_progress_json=json.dumps([{'name': 'Communication', 'targetDate': 'Dec 2026', 'level': 'intermediate', 'progress': 55}])))

        activity_text = {
            '230145612': ['Saved a cyber security course', 'Updated resume summary', 'Viewed planning page'],
            '230245613': ['Saved a backend internship', 'Generated resume preview', 'Asked AI about interviews'],
            '230345614': ['Reviewed dashboard stats', 'Saved a data course', 'Applied to data analyst internship'],
            '240145615': ['Updated profile skills', 'Saved cloud internship'],
            '240245616': ['Checked upcoming events', 'Saved product analytics course'],
            '240345617': ['Updated frontend portfolio', 'Ran ATS check on resume'],
            '250145618': ['Saved analytics course', 'Opened planner overview'],
            '250245619': ['Opened ATS report popup', 'Saved a frontend course'],
            '250345620': ['Reviewed security dashboard tips', 'Saved a SOC pathway course'],
            '250445621': ['Updated planner goals', 'Viewed internship suggestions'],
        }
        for student_code, rows in activity_text.items():
            student = student_map[student_code]
            for text in rows:
                session.add(ActivityLog(student_id=student.id, action='seeded_activity', text=text))
                session.add(AnalyticsEvent(student_id=student.id, event_type='page_view', source='web', payload=json.dumps({'text': text})))

        chat_prompts = {
            '230145612': ('How do I improve for SOC roles?', 'Focus on incident response practice, SIEM workflows, and concise resume bullets.'),
            '230245613': ('What should I revise for backend interviews?', 'Practice APIs, SQL joins, authentication, and explaining tradeoffs clearly.'),
            '230345614': ('Which projects help for analytics internships?', 'Build one dashboard project and one predictive analysis case study with clear metrics.'),
            '240345617': ('How can I make my frontend portfolio stand out?', 'Show polished case studies, performance work, and accessible responsive layouts.'),
            '250245619': ('How do I improve my first-year frontend resume?', 'Highlight coursework, a polished project, and measurable UI improvements.'),
        }
        for student_code, (user_message, assistant_message) in chat_prompts.items():
            student = student_map[student_code]
            session.add(AIChatMessage(student_id=student.id, channel='chat', user_message=user_message, assistant_message=assistant_message))

        session.query(SecurityAudit).filter(SecurityAudit.identifier.in_([user['email'] for user in ACCOUNT_USERS])).delete(synchronize_session=False)
        session.add(SecurityAudit(ip_address='127.0.0.1', event_type='seed', identifier='lina.hassan@sut.edu.eg', details='Seeded normalized users and student records.'))
        session.add(SecurityAudit(ip_address='127.0.0.1', event_type='seed', identifier='mohamed.ahmed230145612@sut.edu.eg', details='Seeded student accounts, planning state, and sample activity.'))

        session.commit()

        print('Seed completed successfully.')
        print('Users:')
        for item in ACCOUNT_USERS:
            print(f"- {item['email']} | {item['password']} | {item['role']} | grad={item['graduation_year']}")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == '__main__':
    seed()
