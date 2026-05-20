import sys
import os
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import engine, Base
import app.models # Ensure all models are loaded

def sync_schema():
    print("Syncing schema (creating missing tables)...")
    try:
        # This will create tables that don't exist yet, but won't touch existing ones
        Base.metadata.create_all(bind=engine)
        print("Schema sync complete!")
    except Exception as e:
        print(f"Error syncing schema: {e}")

if __name__ == "__main__":
    sync_schema()
