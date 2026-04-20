from sqlalchemy import Boolean, Column, Integer, String, Text

from app.database import Base
from app.models.base import TimestampMixin


class SecurityAudit(TimestampMixin, Base):
    __tablename__ = 'security_audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(64), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    identifier = Column(String(255))
    details = Column(Text)


class PlatformSetting(TimestampMixin, Base):
    __tablename__ = 'platform_settings'

    id = Column(Integer, primary_key=True, index=True)
    maintenance_mode = Column(Boolean, nullable=False, default=False)
    session_timeout_minutes = Column(Integer, nullable=False, default=30)
    max_login_attempts = Column(Integer, nullable=False, default=5)
    country_access_mode = Column(String(30), nullable=False, default='allow_all')


class BlockedIPRule(TimestampMixin, Base):
    __tablename__ = 'blocked_ip_rules'

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(64), nullable=False, unique=True, index=True)
    reason = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)


class BlockedCountryRule(TimestampMixin, Base):
    __tablename__ = 'blocked_country_rules'

    id = Column(Integer, primary_key=True, index=True)
    country_name = Column(String(120), nullable=False, unique=True, index=True)
    notes = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
