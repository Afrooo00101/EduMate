from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Student

db = SessionLocal()
users = db.query(User).all()
print("Users in database:")
for u in users:
    print(f"- {u.email} (Role: {u.role})")
db.close()
