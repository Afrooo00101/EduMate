import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import check_database_connection
from app.config import get_settings

settings = get_settings()
print(f"Connecting to: {settings.database_url}")
connected, error = check_database_connection()
if connected:
    print("Database connection successful!")
else:
    print(f"Database connection failed: {error}")
