from app.database import SessionLocal
from app.models import User, Student, Major
from app.core.security import get_password_hash

def add_user(email, name, student_code, major_name="Cyber Security"):
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            return
        
        major = db.query(Major).filter(Major.name == major_name).first()
        if not major:
            major = db.query(Major).first()
            
        new_user = User(
            name=name,
            email=email,
            role='student',
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
        print(f"Added user {email} successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error adding user {email}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_user("mohamed240102199@sut.edu.eg", "Mohamed User", "240102199")
    add_user("nour250103006@sut.edu.eg", "Nour User", "250103006")
    add_user("mohamed@sut.edu.eg", "Mohamed Generic", "240100000") # Backup
