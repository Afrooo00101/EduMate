from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Boolean, func
from sqlalchemy.dialects.mysql import INTEGER as UNSIGNED_INTEGER
from sqlalchemy.orm import relationship

from app.database import Base


class ChatMessage(Base):
    """A message sent between an advisor and a student."""
    __tablename__ = 'advisor_chat'

    id = Column(UNSIGNED_INTEGER(unsigned=True), primary_key=True, index=True)
    advisor_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = Column(UNSIGNED_INTEGER(unsigned=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)

    # 'advisor' or 'student'
    sender_role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column('send_at', DateTime, nullable=False, server_default=func.now())

    advisor = relationship('User', foreign_keys=[advisor_id])
    student = relationship('Student', foreign_keys=[student_id])
