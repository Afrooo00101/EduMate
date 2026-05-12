import sys
import os
from pathlib import Path

# Add the Backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models import User, Student, Major
from app.core.security import get_password_hash

def add_user(email, name, student_code, role='student', major_name="Cyber Security"):
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            return
        
        # Ensure at least one major exists
        major = db.query(Major).filter(Major.name == major_name).first()
        if not major:
            major = Major(name=major_name, department="IT", description="Cyber Security Major")
            db.add(major)
            db.flush()
            
        new_user = User(
            name=name,
            email=email,
            role=role,
            password_hash=get_password_hash("EduMate@123"),
            is_active=True
        )
        db.add(new_user)
        db.flush()
        
        new_student = Student(
            user_id=new_user.id,
            student_code=student_code,
            major_id=major.id,
            graduation_year=2028,
            gpa=3.5
        )
        db.add(new_student)
        db.commit()
        print(f"Added {role} {email} successfully (Password: EduMate@123).")
    except Exception as e:
        db.rollback()
        print(f"Error adding user {email}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Add the user that was failing to login
    add_user("mohamed230145612@sut.edu.eg", "Mohamed", "230145612")
    # Add an admin user
    add_user("admin@sut.edu.eg", "Admin User", "000000001", role='admin')
