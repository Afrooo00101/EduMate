from sqlalchemy.orm import Session

from sqlalchemy import text

from app.models import AIChatMessage, Recommendation
from app.schemas.assistant import ChatRequest
from app.schemas.resume import RecommendationCreate


class AIService:
    def __init__(self, db: Session):
        self.db = db

    def _next_id(self, table_name: str) -> int:
        return int(self.db.execute(text(f'SELECT COALESCE(MAX(id), 0) + 1 FROM {table_name}')).scalar() or 1)

    def create_recommendation(self, student_id: int, payload: RecommendationCreate) -> Recommendation:
        recommendation = Recommendation(student_id=student_id, **payload.model_dump())
        self.db.add(recommendation)
        self.db.commit()
        self.db.refresh(recommendation)
        return recommendation

    def list_recommendations(self, student_id: int):
        return self.db.query(Recommendation).filter(Recommendation.student_id == student_id).order_by(Recommendation.generated_at.desc()).all()

    def generate_chat_response(self, message: str) -> str:
        lowered = message.lower()
        if 'resume' in lowered or 'cv' in lowered:
            return 'Focus on measurable achievements, relevant keywords, and a clear summary section.'
        if 'internship' in lowered or 'job' in lowered:
            return 'Prioritize roles aligned with your skills and tailor each application to the company description.'
        if 'course' in lowered or 'learn' in lowered or 'study' in lowered:
            return 'Choose courses that strengthen your target path, then balance them across semesters to avoid overload.'
        if 'interview' in lowered:
            return 'Practice concise project stories, review fundamentals, and prepare examples that show problem solving.'
        return 'I can help with resume building, internships, planning, courses, and interview preparation.'

    def create_chat_message(self, student_id: int, payload: ChatRequest):
        response = self.generate_chat_response(payload.message)
        item = AIChatMessage(
            id=self._next_id('ai_chat_messages'),
            student_id=student_id,
            channel=payload.channel,
            user_message=payload.message,
            assistant_message=response,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def list_chat_history(self, student_id: int, channel: str | None = None):
        query = self.db.query(AIChatMessage).filter(AIChatMessage.student_id == student_id)
        if channel:
            query = query.filter(AIChatMessage.channel == channel)
        return query.order_by(AIChatMessage.created_at.asc()).all()
