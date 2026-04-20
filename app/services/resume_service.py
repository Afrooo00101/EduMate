import json
from typing import Any

from sqlalchemy.orm import Session

from app.models import ResumeProfile
from app.schemas.resume import ATSCheckResponse, ATSScoreBreakdown, ResumePreviewRequest, ResumeProfileUpsert

_ATS_WEIGHTS = {
    'skills': {'weight': 30, 'cap': 8},
    'experience': {'weight': 25, 'cap': 4},
    'education': {'weight': 15, 'cap': 2},
    'summary': {'weight': 15, 'cap': 1},
    'contact': {'weight': 15, 'cap': 2},
}

_ATS_KEYWORDS = [
    'python',
    'sql',
    'react',
    'aws',
    'api',
    'agile',
    'leadership',
    'communication',
]


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
        profile.ats_score = self.ats_check(payload).score
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def ats_check(self, payload: ResumePreviewRequest) -> ATSCheckResponse:
        parsed = self._build_resume_snapshot(payload)

        skills = parsed['skills']
        experience = parsed['experience']
        education = parsed['education']
        summary = parsed['summary']
        has_email = bool(parsed['email'])
        has_phone = bool(parsed['phone'])

        breakdown = {
            'skills': self._scaled_score(len(skills), _ATS_WEIGHTS['skills']['cap'], _ATS_WEIGHTS['skills']['weight']),
            'experience': self._scaled_score(len(experience), _ATS_WEIGHTS['experience']['cap'], _ATS_WEIGHTS['experience']['weight']),
            'education': self._scaled_score(len(education), _ATS_WEIGHTS['education']['cap'], _ATS_WEIGHTS['education']['weight']),
            'summary': _ATS_WEIGHTS['summary']['weight'] if summary else 0,
            'contact': self._scaled_score((1 if has_email else 0) + (1 if has_phone else 0), _ATS_WEIGHTS['contact']['cap'], _ATS_WEIGHTS['contact']['weight']),
        }

        total = sum(breakdown.values())
        grade = self._grade_label(total)
        text_blob = ' '.join(filter(None, [
            parsed['title'],
            parsed['summary'],
            parsed['skills_text'],
            json.dumps(experience),
            json.dumps(education),
            json.dumps(parsed['projects']),
        ])).lower()

        strengths = []
        if skills:
            strengths.append(f'{len(skills)} skill keywords detected')
        if experience:
            strengths.append(f'{len(experience)} experience entr{"y" if len(experience) == 1 else "ies"} found')
        if education:
            strengths.append(f'{len(education)} education entr{"y" if len(education) == 1 else "ies"} found')
        if summary:
            strengths.append('Professional summary is present')
        if has_email and has_phone:
            strengths.append('Contact information is complete')
        if not strengths:
            strengths.append('Start by adding contact details, a summary, skills, and structured experience')

        missing_keywords = [keyword for keyword in _ATS_KEYWORDS if keyword not in text_blob][:5]
        recommendations = self._build_recommendations(skills, experience, education, summary, has_email, has_phone, missing_keywords)

        return ATSCheckResponse(
            score=total,
            grade=grade,
            strengths=strengths,
            missing_keywords=missing_keywords,
            detected_skills=skills[:12],
            recommendations=recommendations,
            breakdown=ATSScoreBreakdown(**breakdown),
        )

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

    @staticmethod
    def _scaled_score(count: int, cap: int, weight: int) -> int:
        return round(min(count, cap) / cap * weight)

    @staticmethod
    def _grade_label(total: int) -> str:
        if total >= 85:
            return 'Excellent'
        if total >= 65:
            return 'Good'
        if total >= 45:
            return 'Fair'
        return 'Poor'

    @staticmethod
    def _parse_json_list(raw_value: str | None) -> list[dict[str, Any]]:
        if not raw_value:
            return []
        try:
            parsed = json.loads(raw_value)
        except json.JSONDecodeError:
            return []
        return parsed if isinstance(parsed, list) else []

    @staticmethod
    def _extract_skill_names(skills_text: str | None) -> list[str]:
        if not skills_text:
            return []
        return [item.strip() for item in skills_text.replace('\n', ',').split(',') if item.strip()]

    def _build_resume_snapshot(self, payload: ResumePreviewRequest) -> dict[str, Any]:
        education = self._parse_json_list(payload.education_json)
        experience = self._parse_json_list(payload.experience_json)
        projects = self._parse_json_list(payload.projects_json)
        skills = self._extract_skill_names(payload.skills)

        return {
            'title': payload.title or '',
            'summary': (payload.summary or '').strip(),
            'email': (payload.email or '').strip(),
            'phone': (payload.phone or '').strip(),
            'skills_text': payload.skills or '',
            'skills': skills,
            'education': education,
            'experience': experience,
            'projects': projects,
        }

    @staticmethod
    def _build_recommendations(
        skills: list[str],
        experience: list[dict[str, Any]],
        education: list[dict[str, Any]],
        summary: str,
        has_email: bool,
        has_phone: bool,
        missing_keywords: list[str],
    ) -> list[str]:
        recommendations: list[str] = []
        if not has_email or not has_phone:
            recommendations.append('Add both email and phone number so ATS systems can score contact completeness.')
        if not summary:
            recommendations.append('Write a short professional summary focused on your target role and strongest skills.')
        if len(skills) < 5:
            recommendations.append('Add more relevant technical and soft skills as comma-separated keywords.')
        if not experience:
            recommendations.append('Add at least one experience entry with measurable impact and clear responsibilities.')
        if not education:
            recommendations.append('Add your degree, university, and graduation year in the education section.')
        if missing_keywords:
            recommendations.append(f'Consider adding relevant keywords such as: {", ".join(missing_keywords)}.')
        return recommendations[:5]
