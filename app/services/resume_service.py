import json

from sqlalchemy.orm import Session

from app.models import ResumeProfile
from app.schemas.resume import ATSCheckResponse, ResumePreviewRequest, ResumeProfileUpsert


class ResumeService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_profile(self, student_id: int) -> ResumeProfile:
        profile = self.db.query(ResumeProfile).filter(ResumeProfile.student_id == student_id).first()
        if not profile:
            profile = ResumeProfile(student_id=student_id)
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def upsert_profile(self, student_id: int, payload: ResumeProfileUpsert) -> ResumeProfile:
        profile = self.get_or_create_profile(student_id)
        for key, value in payload.model_dump().items():
            setattr(profile, key, value)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def ats_check(self, payload: ResumePreviewRequest) -> ATSCheckResponse:
        text = ' '.join(filter(None, [payload.title, payload.skills, payload.summary, payload.education_json, payload.experience_json, payload.projects_json])).lower()
        keywords = ['python', 'sql', 'react', 'aws', 'project', 'leadership', 'internship']
        present = [k for k in keywords if k in text]
        missing = [k for k in keywords if k not in text]
        score = min(100, 40 + len(present) * 8)
        return ATSCheckResponse(score=score, strengths=present or ['structured content'], missing_keywords=missing[:5])

    def render_preview(self, payload: ResumePreviewRequest) -> str:
        education = payload.education_json or '[]'
        experience = payload.experience_json or '[]'
        projects = payload.projects_json or '[]'
        return f"""
        <div>
          <h1>{payload.full_name or 'Student Name'}</h1>
          <h2>{payload.title or 'Professional Title'}</h2>
          <p>{payload.email or ''} | {payload.phone or ''} | {payload.location or ''}</p>
          <h3>Summary</h3>
          <p>{payload.summary or ''}</p>
          <h3>Skills</h3>
          <p>{payload.skills or ''}</p>
          <h3>Education</h3>
          <pre>{education}</pre>
          <h3>Experience</h3>
          <pre>{experience}</pre>
          <h3>Projects</h3>
          <pre>{projects}</pre>
        </div>
        """

    def list_templates(self):
        return [
            'modern', 'elegant', 'creative', 'classic', 'compact', 'harvard', 'sidebar',
            'minimalHeader', 'sidebarPhoto', 'softPink', 'blueProfessional', 'blueModernHeader',
            'minimalElegantPhoto', 'professionalTwoColumn', 'cleanHeader', 'academicStyle'
        ]
