from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

if __package__ in (None, ''):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

import app.models  # noqa: F401
from app.api import (
    admin_router,
    analytics_router,
    assistant_router,
    auth_router,
    courses_router,
    internships_router,
    planning_router,
    resume_router,
    users_router,
)
from app.config import get_settings
from app.database import Base, check_database_connection, engine

settings = get_settings()
logger = logging.getLogger(__name__)
app_state = {'database_connected': False, 'database_error': None}


@asynccontextmanager
async def lifespan(_: FastAPI):
    connected, error = check_database_connection()
    app_state['database_connected'] = connected
    app_state['database_error'] = error

    if connected:
        try:
            Base.metadata.create_all(bind=engine)
        except SQLAlchemyError as exc:
            app_state['database_connected'] = False
            app_state['database_error'] = str(exc)
            logger.warning('Database schema initialization skipped: %s', exc)
    else:
        logger.warning('Database unavailable at startup: %s', error)

    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)



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
    courses_router,
    internships_router,
    resume_router,
    analytics_router,
    assistant_router,
    planning_router,
):
    app.include_router(router, prefix=settings.api_v1_prefix)


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app.main:app', host='127.0.0.1', port=8000, reload=True)


