from app.models.admin import BlockedCountryRule, BlockedIPRule, PlatformSetting, SecurityAudit
from app.models.advising import AdvisorSlot, Appointment, AppointmentOutcome
from app.models.analytics import AIChatMessage, ActivityLog, AnalyticsEvent
from app.models.chat import ChatMessage
from app.models.course import Course, CourseOffering, CoursePrerequisite, SavedCourse, StudentCourse
from app.models.internship import Internship, InternshipApplication, SavedInternship
from app.models.planning import AcademicRule, PlannerState, StudyPlan
from app.models.resume import Recommendation, ResumeDocument, ResumeProfile
from app.models.user import Advisor, Major, Skill, Student, StudentSkill, User
from .requests import CourseRequest
from .coursesdetails import CourseDetails

__all__ = [
    'AcademicRule',
    'AdvisorSlot', 'Appointment', 'AppointmentOutcome',
    'AIChatMessage', 'ActivityLog', 'AnalyticsEvent',
    'ChatMessage',
    'Course', 'CourseOffering', 'CoursePrerequisite', 'SavedCourse', 'StudentCourse',
    'Internship', 'InternshipApplication', 'SavedInternship',
    'Major', 'PlannerState', 'Recommendation', 'ResumeDocument', 'ResumeProfile',
    'BlockedCountryRule', 'BlockedIPRule',
    'PlatformSetting', 'SecurityAudit', 'Skill', 'Student', 'StudentSkill', 'StudyPlan', 'User', 'Advisor'
]
