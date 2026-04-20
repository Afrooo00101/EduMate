from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.core.dependencies import get_client_ip
from app.database import get_db
from app.models import Student, User
from app.services.admin_settings_service import get_platform_settings, is_country_blocked, is_ip_blocked

settings = get_settings()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{settings.api_v1_prefix}/auth/login')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    return jwt.encode({'sub': subject, 'exp': expire}, settings.secret_key, algorithm='HS256')


def get_current_student(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Student:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials', headers={'WWW-Authenticate': 'Bearer'})
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'])
        subject = payload.get('sub')
        if subject is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).options(joinedload(User.student)).filter(User.email == subject).first()
    if not user or not user.is_active or not user.student:
        raise credentials_exception
    client_host = get_client_ip(request)
    if is_ip_blocked(db, client_host):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this IP address')
    platform_settings = get_platform_settings(db)
    if platform_settings.maintenance_mode and user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Platform is currently in maintenance mode')
    if is_country_blocked(db, request) and user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this region')
    return user.student


def require_admin(current_student: Student = Depends(get_current_student)) -> Student:
    if not current_student.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required')
    return current_student
