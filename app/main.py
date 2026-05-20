from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

if __package__ in (None, ''):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from sqlalchemy.exc import SQLAlchemyError

import app.models  # noqa: F401
from app.api import (
    admin_router,
    advising_router,
    analytics_router,
    assistant_router,
    auth_router,
    chat_router,
    courses_router,
    internships_router,
    planning_router,
    resume_router,
    users_router,
    advisors_router,
)
from app.config import get_settings
from app.core.dependencies import get_client_ip
from app.database import Base, SessionLocal, check_database_connection, engine
from app.models import User
from app.services.admin_settings_service import get_platform_settings, is_country_blocked, is_ip_blocked
from app.api.requests_page import router as requests_page_router
from app.api.coursesdetails_page import router as coursesdetails_router

settings = get_settings()
logger = logging.getLogger(__name__)
app_state = {'database_connected': False, 'database_error': None}


@asynccontextmanager
async def lifespan(_: FastAPI):
    connected, error = check_database_connection()
    app_state['database_connected'] = connected
    app_state['database_error'] = error

    if not connected:
        logger.warning('Database unavailable at startup: %s', error)
    elif settings.create_database_schema:
        try:
            Base.metadata.create_all(bind=engine)
        except SQLAlchemyError as exc:
            app_state['database_connected'] = False
            app_state['database_error'] = str(exc)
            logger.warning('Database schema initialization skipped: %s', exc)
    else:
        logger.info('Database connection verified; schema auto-creation is disabled')

    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def enforce_platform_access_controls(request, call_next):
    # Always pass OPTIONS (CORS preflight) requests through immediately
    if request.method == 'OPTIONS':
        return await call_next(request)

    path = request.url.path
    always_allowed = {'/', '/health', '/docs', '/openapi.json', '/redoc'}
    login_path = f'{settings.api_v1_prefix}/auth/login'
    logout_path = f'{settings.api_v1_prefix}/auth/logout'

    if path in always_allowed:
        return await call_next(request)

    if path.startswith(settings.api_v1_prefix):
        db = SessionLocal()
        try:
            try:
                platform_settings = get_platform_settings(db)
            except Exception as e:
                logger.error(f"Database error in middleware: {e}")
                # We'll allow the request to proceed but without platform settings if the DB is down
                platform_settings = None

            client_ip = get_client_ip(request)

            if is_ip_blocked(db, client_ip):
                return JSONResponse(status_code=403, content={'detail': 'Access denied from this IP address'})

            if is_country_blocked(db, request):
                return JSONResponse(status_code=403, content={'detail': 'Access denied from this region'})

            if platform_settings and platform_settings.maintenance_mode and path not in {login_path, logout_path}:
                is_admin = False
                authorization = request.headers.get('authorization', '')
                if authorization.startswith('Bearer '):
                    token = authorization.split(' ', 1)[1].strip()
                    try:
                        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'])
                        subject = payload.get('sub')
                        if subject:
                            user = db.query(User).filter(
                                User.email == subject,
                                User.role == 'admin',
                                User.is_active.is_(True),
                            ).first()
                            is_admin = user is not None
                    except JWTError:
                        is_admin = False

                if not is_admin:
                    return JSONResponse(status_code=503, content={'detail': 'Platform is currently in maintenance mode'})
        finally:
            db.close()

    return await call_next(request)



@app.get('/', tags=['root'])
def root():
    return {
        'message': 'EduMate API is running',
        'docs_url': '/docs',
        'health_url': '/health',
        'api_prefix': settings.api_v1_prefix,
    }
@app.get('/health', tags=['health'])
def health_check():
    status_value = 'ok' if app_state['database_connected'] else 'degraded'
    return {
        'status': status_value,
        'service': settings.app_name,
        'database_connected': app_state['database_connected'],
        'database_error': app_state['database_error'],
    }


@app.exception_handler(ValueError)
async def value_error_handler(_, exc: ValueError):
    return JSONResponse(status_code=400, content={'detail': str(exc)})


for router in (
    auth_router,
    users_router,
    admin_router,
    advising_router,
    courses_router,
    internships_router,
    resume_router,
    analytics_router,
    assistant_router,
    planning_router,
    requests_page_router,
    coursesdetails_router,
    advisors_router,
    chat_router,
):
    app.include_router(router, prefix=settings.api_v1_prefix)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
