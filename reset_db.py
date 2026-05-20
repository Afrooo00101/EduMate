
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import Base, engine, SessionLocal
from app.models import User, Student, Advisor, Major, Course, ChatMessage
import app.models # Ensure all models are loaded
import bcrypt

def reset_database():
    print("Starting Database Reset...")
    
    # 1. Drop all tables
    print("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    # 2. Create all tables from current models
    print("Creating new tables from scratch...")
    Base.metadata.create_all(bind=engine)
    
    # 3. Seed basic data (Admin)
    print("Seeding initial data...")
    db = SessionLocal()
    try:
        # Create Admin
        admin_email = "admin@sut.edu.eg"
        password = "Admin@12345"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin = User(
            name="System Admin",
            email=admin_email,
            role="admin",
            password_hash=hashed,
            is_active=True
        )
        db.add(admin)
        
        # Create some basic Majors if they don't exist
        majors_data = [
            {"name": "Computer Science", "department": "IT", "description": "CS Dept"},
            {"name": "Information Systems", "department": "IT", "description": "IS Dept"},
            {"name": "Cyber Security", "department": "IT", "description": "Security Dept"}
        ]
        for m_data in majors_data:
            major = Major(**m_data)
            db.add(major)
            
        db.commit()
        print(f"Reset complete! Admin created: {admin_email}")
        print("Tables created: users, students, advisors, chat_messages, majors, courses, etc.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
