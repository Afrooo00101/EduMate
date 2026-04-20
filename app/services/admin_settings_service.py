from __future__ import annotations

from ipaddress import ip_address

from sqlalchemy.orm import Session

from app.models import BlockedCountryRule, BlockedIPRule, Major, PlatformSetting, SecurityAudit, Student, User


DEFAULT_SETTINGS = {
    'maintenance_mode': False,
    'session_timeout_minutes': 30,
    'max_login_attempts': 5,
    'country_access_mode': 'allow_all',
}


def get_platform_settings(db: Session) -> PlatformSetting:
    settings = db.query(PlatformSetting).order_by(PlatformSetting.id.asc()).first()
    if settings is None:
        settings = PlatformSetting(**DEFAULT_SETTINGS)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_platform_settings(
    db: Session,
    *,
    maintenance_mode: bool,
    session_timeout_minutes: int,
    max_login_attempts: int,
    country_access_mode: str,
) -> PlatformSetting:
    settings = get_platform_settings(db)
    settings.maintenance_mode = maintenance_mode
    settings.session_timeout_minutes = session_timeout_minutes
    settings.max_login_attempts = max_login_attempts
    settings.country_access_mode = country_access_mode
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def list_ip_rules(db: Session) -> list[BlockedIPRule]:
    return db.query(BlockedIPRule).order_by(BlockedIPRule.created_at.desc()).all()


def create_ip_rule(db: Session, *, ip_value: str, reason: str | None) -> BlockedIPRule:
    normalized_ip = str(ip_address(ip_value.strip()))
    existing = db.query(BlockedIPRule).filter(BlockedIPRule.ip_address == normalized_ip).first()
    if existing:
        existing.reason = reason.strip() if reason else existing.reason
        existing.is_active = True
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    rule = BlockedIPRule(ip_address=normalized_ip, reason=reason.strip() if reason else None, is_active=True)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def delete_ip_rule(db: Session, *, rule_id: int) -> None:
    rule = db.query(BlockedIPRule).filter(BlockedIPRule.id == rule_id).first()
    if rule is None:
        raise ValueError('IP rule not found')
    db.delete(rule)
    db.commit()


def is_ip_blocked(db: Session, client_ip: str | None) -> bool:
    if not client_ip:
        return False
    try:
        normalized_ip = str(ip_address(client_ip.strip()))
    except ValueError:
        return False
    return db.query(BlockedIPRule).filter(
        BlockedIPRule.ip_address == normalized_ip,
        BlockedIPRule.is_active.is_(True),
    ).first() is not None


def list_blocked_countries(db: Session) -> list[BlockedCountryRule]:
    return db.query(BlockedCountryRule).filter(BlockedCountryRule.is_active.is_(True)).order_by(BlockedCountryRule.country_name.asc()).all()


def get_country_access(db: Session) -> dict[str, object]:
    settings = get_platform_settings(db)
    return {
        'mode': settings.country_access_mode,
        'blocked_countries': [rule.country_name for rule in list_blocked_countries(db)],
    }


def update_country_access(db: Session, *, mode: str, blocked_countries: list[str]) -> dict[str, object]:
    settings = get_platform_settings(db)
    settings.country_access_mode = mode
    db.add(settings)

    existing_rules = {rule.country_name.casefold(): rule for rule in db.query(BlockedCountryRule).all()}
    normalized_names: list[str] = []
    for name in blocked_countries:
        normalized = ' '.join(str(name).strip().split())
        if normalized:
            normalized_names.append(normalized.title())

    requested = {name.casefold(): name for name in normalized_names}

    for key, rule in existing_rules.items():
        if key not in requested:
            db.delete(rule)

    for key, display_name in requested.items():
        rule = existing_rules.get(key)
        if rule is None:
            db.add(BlockedCountryRule(country_name=display_name, is_active=True))
        else:
            rule.country_name = display_name
            rule.is_active = True
            db.add(rule)

    db.commit()
    return get_country_access(db)


def extract_request_country(request) -> str | None:
    headers = request.headers
    raw_value = headers.get('cf-ipcountry') or headers.get('x-country-code') or headers.get('x-country-name')
    if not raw_value:
        return None
    normalized = ' '.join(raw_value.strip().split())
    return normalized.title() if normalized else None


def is_country_blocked(db: Session, request) -> bool:
    settings = get_platform_settings(db)
    if settings.country_access_mode != 'block_specific':
        return False
    country_name = extract_request_country(request)
    if not country_name:
        return False
    return db.query(BlockedCountryRule).filter(
        BlockedCountryRule.country_name == country_name,
        BlockedCountryRule.is_active.is_(True),
    ).first() is not None


def build_next_admin_code(db: Session) -> str:
    existing_codes = [
        row[0]
        for row in db.query(Student.student_code)
        .filter(Student.student_code.like('ADM%'))
        .all()
    ]
    numeric_parts = [int(code[3:]) for code in existing_codes if len(code) > 3 and code[3:].isdigit()]
    return f'ADM{(max(numeric_parts, default=0) + 1):03d}'


def create_admin_user(db: Session, *, full_name: str, email: str, password: str) -> Student:
    from app.core.security import get_password_hash

    normalized_email = email.strip().lower()
    if not normalized_email.endswith('@sut.edu.eg'):
        raise ValueError('Admin email must end with @sut.edu.eg')

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise ValueError('Email already in use')

    major = db.query(Major).filter(Major.name == 'Business Information Systems').first()
    if major is None:
        major = db.query(Major).order_by(Major.id.asc()).first()

    user = User(
        name=full_name.strip(),
        email=normalized_email,
        role='admin',
        password_hash=get_password_hash(password),
        is_active=True,
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        student_code=build_next_admin_code(db),
        major_id=major.id if major else None,
        graduation_year=None,
        skills_summary='Administration, platform operations, governance',
    )
    db.add(student)
    db.add(SecurityAudit(
        ip_address='127.0.0.1',
        event_type='admin_created',
        identifier=normalized_email,
        details='Admin account created from admin settings panel',
    ))
    db.commit()
    db.refresh(student)
    return student


def delete_admin_user(db: Session, *, student_id: int, current_admin_id: int) -> None:
    student = db.query(Student).join(User, Student.user_id == User.id).filter(Student.id == student_id).first()
    if student is None or student.user is None or student.user.role != 'admin':
        raise ValueError('Admin user not found')
    if student.id == current_admin_id:
        raise ValueError('You cannot delete your own admin account')

    admin_count = db.query(User).filter(User.role == 'admin').count()
    if admin_count <= 1:
        raise ValueError('At least one admin account must remain')

    user = student.user
    db.delete(student)
    db.flush()
    db.delete(user)
    db.commit()
