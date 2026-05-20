from app.schemas.admin_settings import (
    AdminCreateRequest,
    BlockedIPRuleCreate,
    BlockedIPRuleRead,
    CountryAccessRead,
    CountryAccessUpdate,
    PlatformSettingsRead,
    PlatformSettingsUpdate,
)
from app.schemas.advising import AdvisorOutcomeSubmit, AdvisorPerformance, AdvisorSlotCreate, AdvisorSlotRead, AppointmentCreate, AppointmentRead, OutcomeRead, SlotAvailability, StudentOutcomeSubmit, TimeWindow
from app.schemas.analytics import ActivityLogCreate, ActivityLogRead, AnalyticsEventCreate, AnalyticsEventRead, DashboardResponse, DashboardStats, UpcomingEvent
from app.schemas.assistant import ChatMessageRead, ChatRequest
from app.schemas.auth import LoginRequest, RegisterRequest, SocialLoginRequest, TokenResponse
from app.schemas.common import APIMessage
from app.schemas.course import CourseCreate, CourseRead, SavedCourseCreate, SavedCourseRead, StudentCourseRead, StudentCourseUpsert
from app.schemas.internship import InternshipApplicationCreate, InternshipApplicationRead, InternshipCreate, InternshipRead, SavedInternshipCreate, SavedInternshipRead, SavedInternshipUpdate
from app.schemas.planning import GPASummary, PlannerStateRead, PlannerStateUpsert, PlanningOverview
from app.schemas.resume import ATSCheckResponse, RecommendationCreate, RecommendationRead, ResumeCreate, ResumePreviewRequest, ResumePreviewResponse, ResumeProfileRead, ResumeProfileUpsert, ResumeRead
from app.schemas.user import AdvisorCreate, AdvisorRead, AdvisorUpdate, MajorCreate, MajorRead, SkillCreate, SkillRead, StudentRead, StudentUpdate, UserRead
from app.schemas.requests_page import RequestPageCreate, RequestPageRead
from app.schemas.coursesdetails import CourseDetailsCreate, CourseDetailsRead
