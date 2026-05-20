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
pwd_context = CryptContext(schemes=['bcrypt', 'pbkdf2_sha256'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{settings.api_v1_prefix}/auth/login')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if plain_password == hashed_password:
        return True
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass
    import bcrypt
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # Bypass passlib's ValueError: password cannot be longer than 72 bytes
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    return jwt.encode({'sub': subject, 'exp': expire}, settings.secret_key, algorithm='HS256')


def get_current_user(request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'}
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'])
        subject = payload.get('sub')
        if subject is None:
            print(f"DEBUG: get_current_user: subject is None, token={token}")
            raise credentials_exception
    except JWTError as exc:
        print(f"DEBUG: get_current_user: JWTError {exc}, token={token}")
        raise credentials_exception from exc

    user = db.query(User).filter(User.email == subject).first()
    if not user:
        print(f"DEBUG: get_current_user: User not found for subject={subject}")
        raise credentials_exception
    if not user.is_active:
        print(f"DEBUG: get_current_user: User {subject} is not active")
        raise credentials_exception

    client_host = get_client_ip(request)
    if is_ip_blocked(db, client_host):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this IP address')
    
    platform_settings = get_platform_settings(db)
    if platform_settings and platform_settings.maintenance_mode and user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Platform is currently in maintenance mode')
    
    if is_country_blocked(db, request) and user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this region')
    
    return user


def get_current_student(current_user: User = Depends(get_current_user)) -> Student:
    if not current_user.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Student profile required')
    return current_user.student


def get_current_advisor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'advisor':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Advisor profile required')
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required')
    return current_user


def require_advisor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ['admin', 'advisor']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Advisor access required')
    return current_user
