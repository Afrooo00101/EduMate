from sqlalchemy import inspect
from app.database import engine

inspector = inspect(engine)
columns = inspector.get_columns('academic_rules')
print("Columns in academic_rules:")
for col in columns:
    print(f"- {col['name']}: {col['type']}")
