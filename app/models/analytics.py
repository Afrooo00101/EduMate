from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class AnalyticsEvent(TimestampMixin, Base):
    __tablename__ = 'analytics_events'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    source = Column(String(100), nullable=False, default='web')
    payload = Column(Text)

    student = relationship('Student', back_populates='analytics_events')


class ActivityLog(TimestampMixin, Base):
    __tablename__ = 'activity_logs'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    text = Column(Text, nullable=False)

    student = relationship('Student', back_populates='activity_logs')


class AIChatMessage(TimestampMixin, Base):
    __tablename__ = 'ai_chat_messages'

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)
    channel = Column(String(50), nullable=False, default='chat')
    user_message = Column(Text, nullable=False)
    assistant_message = Column(Text, nullable=False)

    student = relationship('Student', back_populates='ai_chat_messages')
