import json

from sqlalchemy.orm import Session

from app.models import PlannerState
from app.schemas.planning import GPASummary, PlannerStateUpsert

GRADE_POINTS = {'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0}


class PlanningService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_state(self, student_id: int) -> PlannerState:
        state = self.db.query(PlannerState).filter(PlannerState.student_id == student_id).first()
        if not state:
            state = PlannerState(student_id=student_id)
            self.db.add(state)
            self.db.commit()
            self.db.refresh(state)
        return state

    def upsert_state(self, student_id: int, payload: PlannerStateUpsert) -> PlannerState:
        state = self.get_or_create_state(student_id)
        for key, value in payload.model_dump().items():
            setattr(state, key, value)
        self.db.add(state)
        self.db.commit()
        self.db.refresh(state)
        return state

    def calculate_gpa_summary(self, student_id: int) -> GPASummary:
        state = self.get_or_create_state(student_id)
        grades = json.loads(state.grades_json or '{}') if state.grades_json else {}
        if not grades:
            return GPASummary(term_gpa=0.0, cumulative_gpa=0.0, total_graded_courses=0, distribution={})

        distribution = {}
        total_points = 0.0
        count = 0
        for grade in grades.values():
            if grade in GRADE_POINTS:
                distribution[grade] = distribution.get(grade, 0) + 1
                total_points += GRADE_POINTS[grade]
                count += 1
        gpa = round(total_points / count, 2) if count else 0.0
        return GPASummary(term_gpa=gpa, cumulative_gpa=gpa, total_graded_courses=count, distribution=distribution)
