import sys
import os
from pathlib import Path
import bcrypt
import random

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal
from app.models import User, Advisor, Student, Major, ChatMessage

def seed_advanced_test_data():
    db = SessionLocal()
    try:
        print("Starting advanced test data seeding...")
        
        # 1. Create Advisors (shbah el-adema)
        advisors_to_create = [
            {"name": "Dr. Mohamed Nasr", "email": "m.nasr@sut.edu.eg", "code": "ADV101", "dept": "Computer Science"},
            {"name": "Dr. Sarah Ahmed", "email": "s.ahmed@sut.edu.eg", "code": "ADV102", "dept": "Information Systems"},
            {"name": "Dr. Khaled Ibrahim", "email": "k.ibrahim@sut.edu.eg", "code": "ADV103", "dept": "Cyber Security"}
        ]
        
        hashed_password = bcrypt.hashpw("Advisor@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        created_advisors = []
        for adv_data in advisors_to_create:
            user = db.query(User).filter(User.email == adv_data["email"]).first()
            if not user:
                user = User(
                    name=adv_data["name"],
                    email=adv_data["email"],
                    role="advisor",
                    password_hash=hashed_password,
                    is_active=True
                )
                db.add(user)
                db.flush()
                
                advisor = Advisor(
                    user_id=user.id,
                    employee_code=adv_data["code"],
                    department=adv_data["dept"]
                )
                db.add(advisor)
                created_advisors.append(advisor)
                print(f"Created Advisor: {adv_data['email']}")
            else:
                advisor = db.query(Advisor).filter(Advisor.user_id == user.id).first()
                if advisor:
                    created_advisors.append(advisor)
                print(f"Advisor already exists: {adv_data['email']}")

        # 2. Link existing students to advisors
        students = db.query(Student).all()
        print(f"Found {len(students)} existing students. Linking to advisors...")
        
        if created_advisors:
            for i, student in enumerate(students):
                # Only update if student doesn't have an advisor
                if not student.advisor_id:
                    assigned_advisor = created_advisors[i % len(created_advisors)]
                    student.advisor_id = assigned_advisor.id
                    print(f"Linked student {student.student_code} to advisor {assigned_advisor.employee_code}")

        # 3. Add some initial chat messages
        print("Adding initial chat messages...")
        if created_advisors and students:
            for student in students[:5]: # Only first 5 students for brevity
                if student.advisor_id:
                    # Message from advisor to student
                    msg1 = ChatMessage(
                        advisor_id=student.advisor_id,
                        student_id=student.id,
                        sender_role="advisor",
                        content=f"Welcome {student.user.name}, how can I help you with your registration today?",
                        is_read=True
                    )
                    # Message from student to advisor
                    msg2 = ChatMessage(
                        advisor_id=student.advisor_id,
                        student_id=student.id,
                        sender_role="student",
                        content="Thank you Dr., I have a question about the CS301 course.",
                        is_read=False
                    )
                    db.add(msg1)
                    db.add(msg2)
            print("Chat messages added.")

        db.commit()
        print("Seeding complete!")
        
    except Exception as e:
        print(f"CRITICAL ERROR during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_advanced_test_data()
