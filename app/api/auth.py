from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.captcha import verify_captcha
from app.core.dependencies import InMemoryAttemptLimiter, get_client_ip
from app.core.security import create_access_token, get_current_student
from app.database import get_db
from app.schemas import APIMessage, LoginRequest, RegisterRequest, StudentRead, TokenResponse
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

    student = service.authenticate(payload.email, payload.password)
    if not student:
        limited = login_limiter.register_failure(client_ip)
        service.log_security_event(client_ip, 'login_failed', payload.email, 'Invalid credentials')
        if not limited.allowed:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail='Too many failed attempts. Temporary block applied.')
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Login failed')

    login_limiter.reset(client_ip)
    token = create_access_token(student.email)
    return TokenResponse(access_token=token, expires_in_minutes=120, student=student)


@router.get('/me', response_model=StudentRead)
def get_me(current_student=Depends(get_current_student)):
    return current_student


@router.post('/logout', response_model=APIMessage)
def logout(_: object = Depends(get_current_student)):
    return APIMessage(message='Logout is handled on the client by removing the token.')
