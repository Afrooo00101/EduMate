
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.database import SessionLocal
from app.models import User, Advisor, Student

db = SessionLocal()
u_count = db.query(User).count()
a_count = db.query(Advisor).count()
s_count = db.query(Student).count()
print(f"Stats: Users={u_count}, Advisors={a_count}, Students={s_count}")
db.close()
