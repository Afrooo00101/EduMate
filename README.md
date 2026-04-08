# EduMate Backend

Professional FastAPI backend for the EduMate web and mobile apps.

## Structure
- `app/api`: thin HTTP route handlers
- `app/models`: SQLAlchemy models split by domain
- `app/core`: shared security and dependency helpers
- `app/services`: business logic layer
- `app/utils`: sanitization and helper utilities
- `app/schemas`: request and response models
- `run.py`: local development runner

## Start
1. Create and activate a virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and update MySQL settings.
4. Start with one of these commands:
   - `uvicorn app.main:app --reload`
   - `python run.py`
   - `python app/main.py`

## Notes
- Login still enforces CAPTCHA and brute-force protection.
- ORM queries protect against SQL injection.
- Inputs are sanitized before persistence to reduce XSS risk.
