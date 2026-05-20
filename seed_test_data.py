
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal
from app.models import User, Advisor, Student, Major
import bcrypt

def seed_test_data():
    db = SessionLocal()
    try:
        # 1. Create Advisor
        adv_email = "advisor1@sut.edu.eg"
        if not db.query(User).filter(User.email == adv_email).first():
            hashed = bcrypt.hashpw("Advisor@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            adv_user = User(name="Dr. Ahmed Advisor", email=adv_email, role="advisor", password_hash=hashed)
            db.add(adv_user)
            db.flush()
            
            advisor = Advisor(user_id=adv_user.id, employee_code="ADV001", department="Computer Science")
            db.add(advisor)
            print(f"Created Advisor: {adv_email}")

        # 2. Create Student
        std_email = "student1@sut.edu.eg"
        if not db.query(User).filter(User.email == std_email).first():
            hashed = bcrypt.hashpw("Student@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            std_user = User(name="Youssef Student", email=std_email, role="student", password_hash=hashed)
            db.add(std_user)
            db.flush()
            
            major = db.query(Major).filter(Major.name == "Computer Science").first()
            student = Student(
                user_id=std_user.id, 
                student_code="STD2024001", 
                gpa=3.5, 
                major_id=major.id if major else None
            )
            db.add(student)
            print(f"Created Student: {std_email}")
            
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_data()
