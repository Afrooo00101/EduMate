# Frontend to Backend Coverage

## Fully transferred business features
- Authentication and registration
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`
- User profile
  - `GET /api/v1/users/me`
  - `PUT /api/v1/users/me`
- Dashboard data
  - `GET /api/v1/analytics/dashboard/me`
  - `GET /api/v1/analytics/activity/me`
  - `POST /api/v1/analytics/activity/me`
- AI assistant/chat
  - `POST /api/v1/assistant/chat/me`
  - `GET /api/v1/assistant/chat/me`
- Courses and course search
  - `GET /api/v1/courses`
  - `GET /api/v1/courses/search`
  - `GET /api/v1/skills`
  - `GET /api/v1/majors`
- Saved courses
  - `GET /api/v1/courses/saved/me`
  - `POST /api/v1/courses/saved/me`
  - `DELETE /api/v1/courses/saved/me/{id}`
- Internships and internship search
  - `GET /api/v1/internships`
  - `GET /api/v1/internships/applications/me`
  - `POST /api/v1/internships/applications/me`
- Saved internships
  - `GET /api/v1/internships/saved/me`
  - `POST /api/v1/internships/saved/me`
  - `PATCH /api/v1/internships/saved/me/{id}`
  - `DELETE /api/v1/internships/saved/me/{id}`
- Resume builder state
  - `GET /api/v1/resume/profile/me`
  - `PUT /api/v1/resume/profile/me`
  - `GET /api/v1/resume/templates`
  - `POST /api/v1/resume/preview`
  - `POST /api/v1/resume/ats-check`
- Resume documents
  - `GET /api/v1/resume/documents/me`
  - `POST /api/v1/resume/documents/me`
- Recommendations
  - `GET /api/v1/resume/recommendations/me`
  - `POST /api/v1/resume/recommendations/me`
- Planning data and GPA state
  - `GET /api/v1/planning/me`
  - `POST /api/v1/planning/me/courses`
  - `GET /api/v1/planning/state/me`
  - `PUT /api/v1/planning/state/me`
  - `GET /api/v1/planning/gpa/me`
- Analytics events
  - `POST /api/v1/analytics/events`
  - `GET /api/v1/analytics/events/me`
- Admin features
  - `GET /api/v1/admin/users`
  - `GET /api/v1/admin/security-logs`
  - `GET /api/v1/admin/dashboard`

## Frontend-only UI functions by nature
These are not meaningful backend endpoints because they only control browser rendering or local interaction:
- page navigation and page toggles
- theme toggling and theme icon display
- sidebar open/close
- modal open/close animations
- DOM rendering helpers and button state updates
- client PDF download action itself

## Important note
All substantive app features from the frontend now have backend storage or API coverage. UI-only functions still belong in the frontend because they are presentation behavior, not server business logic.
