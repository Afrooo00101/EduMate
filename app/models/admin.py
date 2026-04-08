from sqlalchemy import Column, Integer, String, Text

from app.database import Base
from app.models.base import TimestampMixin


class SecurityAudit(TimestampMixin, Base):
    __tablename__ = 'security_audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(64), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    identifier = Column(String(255))
    details = Column(Text)
