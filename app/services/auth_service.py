from datetime import datetime, UTC

from sqlalchemy.orm import Session, joinedload

from app.core.security import get_password_hash, verify_password
from app.models import SecurityAudit, Student, User
from app.schemas.auth import RegisterRequest

SUT_EMAIL_DOMAIN = '@sut.edu.eg'


def parse_student_identity_from_email(email: str) -> dict[str, str] | None:
    normalized = normalize_sut_email(email)
    local_part = normalized.removesuffix(SUT_EMAIL_DOMAIN)
    letters = []
    digits = []
    hit_digits = False

    for char in local_part:
        if char.isdigit():
            hit_digits = True
            digits.append(char)
        elif char.isalpha() and not hit_digits:
            letters.append(char)
        else:
            return None

    if not letters or len(digits) < 3:
        return None

    first_name = ''.join(letters).lower()
    student_code = ''.join(digits)
    return {
        'first_name': first_name,
        'full_name': first_name.capitalize(),
        'student_code': student_code,
    }


def build_student_email(full_name: str, student_code: str) -> str:
    first_name = next((segment.strip().lower() for segment in full_name.split() if segment.strip()), 'student')
    return f'{first_name}{student_code}{SUT_EMAIL_DOMAIN}'


def normalize_sut_email(email: str) -> str:
    normalized = email.strip().lower()
    if not normalized.endswith(SUT_EMAIL_DOMAIN):
        raise ValueError('Only @sut.edu.eg email addresses are allowed')
    return normalized


def derive_graduation_year_from_student_code(student_code: str) -> int | None:
    code = (student_code or '').strip()
    if code.startswith('20') and len(code) >= 4 and code[:4].isdigit():
        return int(code[:4]) + 4
    if len(code) >= 2 and code[:2].isdigit():
        return 2000 + int(code[:2]) + 4
    return None


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_student(self, payload: RegisterRequest) -> Student:
        normalized_email = normalize_sut_email(payload.email)
        parsed_identity = parse_student_identity_from_email(normalized_email)
        resolved_student_code = parsed_identity['student_code'] if parsed_identity else (payload.student_code or '').strip()
        resolved_full_name = parsed_identity['full_name'] if parsed_identity else (payload.full_name or '').strip()

        if not resolved_student_code or not resolved_full_name:
            raise ValueError('Student email must follow firstname<ID>@sut.edu.eg or provide matching name and student ID')

        graduation_year = derive_graduation_year_from_student_code(resolved_student_code)
        if graduation_year is None:
            raise ValueError('Student code must begin with the admission year')
        expected_email = build_student_email(resolved_full_name, resolved_student_code)
        if normalized_email != expected_email:
            raise ValueError(f'Student email must be {expected_email}')

        existing_user = self.db.query(User).filter(User.email == normalized_email).first()
        existing_student = self.db.query(Student).filter(Student.student_code == resolved_student_code).first()
        if existing_user or existing_student:
            raise ValueError('Student already exists')

        user = User(
            name=resolved_full_name,
            email=normalized_email,
            role='student',
            password_hash=get_password_hash(payload.password),
            is_active=True,
        )
        self.db.add(user)
        self.db.flush()

        student = Student(
            user_id=user.id,
            student_code=resolved_student_code,
            major_id=payload.major_id,
            graduation_year=graduation_year,
            skills_summary=payload.skills_summary,
        )
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def authenticate(self, email: str, password: str) -> Student | None:
        normalized_email = email.strip().lower()
        user = self.db.query(User).options(joinedload(User.student)).filter(User.email == normalized_email).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        if not user.is_active or not user.student:
            return None
        user.last_login = datetime.now(UTC).replace(tzinfo=None)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user.student

    def log_security_event(self, ip_address: str, event_type: str, identifier: str | None, details: str) -> None:
        self.db.add(SecurityAudit(ip_address=ip_address, event_type=event_type, identifier=identifier, details=details))
        self.db.commit()
