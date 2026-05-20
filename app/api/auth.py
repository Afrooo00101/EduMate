from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.captcha import verify_captcha
from app.core.dependencies import InMemoryAttemptLimiter, get_client_ip
from app.core.security import create_access_token, get_current_user
from app.database import get_db
from app.models import User
from app.schemas import APIMessage, LoginRequest, RegisterRequest, SocialLoginRequest, StudentRead, TokenResponse, UserRead
from app.services.admin_settings_service import get_platform_settings, is_country_blocked, is_ip_blocked
from app.services.auth_service import AuthService
from app.utils.helpers import SuspiciousInputError, sanitize_model

router = APIRouter(prefix='/auth', tags=['auth'])
login_limiter = InMemoryAttemptLimiter(max_attempts=5, window_seconds=60, block_seconds=300)


@router.post('/register', response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def register_student(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Input rejected')

    service = AuthService(db)
    try:
        return service.register_student(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post('/login', response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    service = AuthService(db)
    platform_settings = get_platform_settings(db)
    login_limiter.max_attempts = platform_settings.max_login_attempts

    if is_ip_blocked(db, client_ip):
        service.log_security_event(client_ip, 'blocked_ip', payload.email, 'Login blocked by IP rule')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this IP address')

    if is_country_blocked(db, request):
        service.log_security_event(client_ip, 'blocked_country', payload.email, 'Login blocked by country access rule')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this region')

    precheck = login_limiter.check(client_ip)
    if not precheck.allowed:
        service.log_security_event(client_ip, 'brute_force_block', payload.email, 'Too many attempts from IP')
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f'Too many failed attempts. Retry in {precheck.retry_after_seconds} seconds.')

    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        service.log_security_event(client_ip, 'xss_rejected', payload.email, 'Forbidden script content detected')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Input rejected, login failed')

    captcha_ok = await verify_captcha(payload.captcha_token, client_ip)
    if not captcha_ok:
        service.log_security_event(client_ip, 'captcha_failed', payload.email, 'Missing or invalid captcha token')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='CAPTCHA required')

    user = service.authenticate(payload.email, payload.password)
    if not user:
        limited = login_limiter.register_failure(client_ip)
        service.log_security_event(client_ip, 'login_failed', payload.email, 'Invalid credentials')
        if not limited.allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail='Too many failed attempts. Temporary block applied.')
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Login failed')

    if platform_settings.maintenance_mode and user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Platform is currently in maintenance mode')

    login_limiter.reset(client_ip)
    service.log_security_event(client_ip, 'login_success', user.email, 'User authenticated successfully')
    timeout_minutes = platform_settings.session_timeout_minutes
    token = create_access_token(user.email, timedelta(minutes=timeout_minutes))
    return TokenResponse(access_token=token, expires_in_minutes=timeout_minutes, user=user)


@router.post('/social-login', response_model=TokenResponse)
async def social_login(payload: SocialLoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    service = AuthService(db)
    platform_settings = get_platform_settings(db)

    if is_ip_blocked(db, client_ip):
        service.log_security_event(client_ip, 'blocked_ip', payload.email, 'Social login blocked by IP rule')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this IP address')

    if is_country_blocked(db, request):
        service.log_security_event(client_ip, 'blocked_country', payload.email, 'Social login blocked by country access rule')
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Access denied from this region')

    try:
        payload = sanitize_model(payload)
    except SuspiciousInputError:
        service.log_security_event(client_ip, 'xss_rejected', payload.email, 'Forbidden script content detected during social login')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Input rejected, login failed')

    try:
        student = service.authenticate_social(payload)
    except ValueError as exc:
        service.log_security_event(client_ip, 'social_login_failed', payload.email, str(exc))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if platform_settings.maintenance_mode and not student.is_admin:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Platform is currently in maintenance mode')

    service.log_security_event(client_ip, 'social_login_success', student.user.email, f'Social login via {payload.provider}')
    timeout_minutes = platform_settings.session_timeout_minutes
    token = create_access_token(student.user.email, timedelta(minutes=timeout_minutes))
    return TokenResponse(access_token=token, expires_in_minutes=timeout_minutes, user=student.user)


@router.get('/me', response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post('/logout', response_model=APIMessage)
def logout(_: object = Depends(get_current_user)):
    return APIMessage(message='Logout is handled on the client by removing the token.')
