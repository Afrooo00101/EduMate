# EduMate — Smart Academic Planning and Career Guidance Platform

## 📚 Overview

EduMate is a comprehensive academic planning and career guidance platform designed for El-Sewedy University of Technology (SUT). It addresses the challenges students face when selecting courses, satisfying prerequisites, understanding credit limits, and planning a clear path toward graduation. The platform also supports administrators by providing data-driven insight into course demand and academic bottlenecks.

## ✨ Key Features

### 🎓 Academic Planning
- **Smart Semester Planning**: Generate course recommendations based on completed courses, GPA, credit limits, and prerequisites
- **Graduation Simulation**: Create Fastest, Balanced, and Light Load graduation strategies
- **Prerequisite Validation**: Automatic checking of course dependencies with clear explanations
- **GPA Tracking**: Credit-weighted GPA calculation with real-time updates
- **Summer Course Management**: Request and track summer course approvals

### 📄 Resume & Career Tools
- **ATS-Compliant CV Builder**: Structured resume creation with professional templates
- **Resume Scoring**: 0-100 ATS score with actionable feedback across 5 weighted sections:
  - Skills (30 points)
  - Experience (25 points)
  - Education (15 points)
  - Professional Summary (15 points)
  - Contact Information (15 points)
- **PDF Export**: Client-side CV generation using html2pdf.js

### 💼 Internship & Course Discovery
- **Internship Listings**: Browse, filter, save, and apply to opportunities
- **Course Catalog**: Filter courses by department, credits, and prerequisites
- **External API Integration**: Real-time internship and course market data

### 🤖 AI Assistant
- **Natural Language Support**: Ask questions about courses, planning, and career guidance
- **Chat History**: Persistent conversation storage for reference
- **Contextual Advice**: Personalized recommendations based on academic profile

### 👨‍💼 Administrative Dashboard
- **Demand Analysis**: Identify high-demand courses and bottlenecks
- **Course Opening Management**: Approve course sections based on student demand
- **Term Management**: Open, analyze, and close academic terms
- **Security Controls**: IP/Country blocking, maintenance mode, audit logging

### 🔒 Security Features
- JWT Authentication with configurable expiration
- bcrypt password hashing
- Role-based access control (Student, Advisor, Administrator)
- Input sanitization (bleach library)
- IP and country blocking
- Security audit logging
- CAPTCHA protection for registration
- @sut.edu.eg email verification

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL (35 tables)
- **ASGI Server**: Uvicorn
- **Authentication**: python-jose (JWT), passlib (bcrypt)
- **Security**: bleach (sanitization), httpx (external requests)

### Frontend
- **Web Client**: HTML, CSS, JavaScript (Vanilla JS)
- **Mobile Client**: Flutter (Dart)
- **Visualization**: Chart.js
- **PDF Generation**: html2pdf.js

### Development Tools
- VS Code with Git integration
- Figma for UI/UX prototyping
- Automatic OpenAPI documentation

## 🚀 Installation

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Modern web browser (for web client)
- Flutter SDK (for mobile client)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/edumate.git
cd edumate/backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and secret keys
```

5. **Initialize database**
```bash
python scripts/init_db.py
python scripts/seed_data.py
```

6. **Run the backend server**
```bash
uvicorn main:app --reload
```

### Web Client Setup

The web client is built with vanilla HTML, CSS, and JavaScript. Simply serve the files:

```bash
cd ../frontend
# Using Python's built-in server
python -m http.server 3000
# Or use any static file server of your choice
```

Open `http://localhost:3000` in your browser.

### Mobile Client Setup

```bash
cd ../mobile
flutter pub get
flutter run
```

## 📊 System Architecture

EduMate follows a clean three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │  HTML/CSS/JS │    │     Flutter Mobile Client        │  │
│  │  Web Client  │    │     (Android & iOS)              │  │
│  └──────────────┘    └──────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (HTTPS/JWT)
┌───────────────────────────▼─────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    FastAPI Backend                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │ Planning   │  │   ATS      │  │ Analytics  │   │   │
│  │  │ Engine     │  │   Engine   │  │ Service    │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │  Auth      │  │  Courses   │  │ Assistant  │   │   │
│  │  │ Service    │  │  Service   │  │ Service    │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MySQL Database                    │   │
│  │  35 tables: Students, Courses, Prerequisites,       │   │
│  │  Registrations, Resumes, Internships, Chat, etc.   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Key Modules

### Academic Planning Engine
The planning engine combines:
- **Rule-based validation**: Prerequisites, credit limits, GPA bands
- **Graph analysis**: Prerequisite dependency checking
- **Hybrid course scoring**: ML-assisted success prediction + rule-based factors
- **0/1 Knapsack optimization**: Select optimal course combinations within credit caps

### Graduation Planner
Simulates future semesters to generate three strategies:
- **Fastest**: Minimize time to graduation
- **Balanced**: Even workload distribution
- **Light Load**: Reduced course load per semester

### Demand Analysis
Administrative tools to:
- Detect root-blocking prerequisites
- Calculate blocking impact
- Forecast future course demand
- Make data-driven opening decisions

## 📡 API Endpoints

The system exposes 121 REST API endpoints grouped by functional area:

| Category | Description |
|----------|-------------|
| `/auth/*` | Registration, login, social authentication |
| `/users/*` | Profile management |
| `/planning/*` | Academic planning, graduation simulation, registrations |
| `/admin/*` | Course analysis, term management, security controls |
| `/courses/*` | Course catalog, curriculum maps |
| `/resume/*` | Resume creation, ATS scoring |
| `/internships/*` | Internship browsing, saving, applying |
| `/assistant/*` | AI chat assistant |
| `/advising/*` | Advisor appointment scheduling |

*Full API documentation available at `/docs` when the server is running.*

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Individual module testing (planning engine, ATS scorer, etc.)
- **Integration Tests**: API endpoint testing with real database
- **Security Tests**: Authentication, authorization, input sanitization
- **Performance Tests**: Response time, scalability assessment

### Sample Test Cases
| Test ID | Description | Status |
|---------|-------------|--------|
| TC-01 | Register with @sut.edu.eg email | ✅ PASS |
| TC-02 | Register with non-SUT email | ✅ PASS |
| TC-05 | Generate prerequisite-respecting plan | ✅ PASS |
| TC-08 | Score complete resume | ✅ PASS |
| TC-12 | Access admin endpoint as student | ✅ PASS |

## 📈 Performance

- **Individual Planning**: < 2 seconds per request
- **Administrative Analysis**: < 5 seconds for demand analysis (prototype scale)
- **ATS Scoring**: Near-instantaneous scoring
- **Caching**: Database query caching for frequent operations
- **Fallback**: Rule-based scoring when ML predictor is unavailable

## 🔐 Security Implementation

- **Authentication**: JWT with 24-hour expiry, refresh token rotation
- **Authorization**: Role-based decorators on all endpoints
- **Password Security**: bcrypt hashing (12 rounds)
- **Input Validation**: Pydantic models + bleach sanitization
- **Network Security**: CORS whitelist, IP/Country blocking
- **Audit Logging**: All security-critical actions logged
- **Data Protection**: HTTPS enforced, sensitive data encrypted at rest

## 📝 Project Timeline

| Phase | Activities | Timeline |
|-------|-----------|----------|
| Phase 1: Research | Requirements gathering, literature review | Weeks 1-2 |
| Phase 2: Design | Schema modeling, API design, UI wireframing | Weeks 3-4 |
| Phase 3: Build | Implementation of all modules | Weeks 5-8 |
| Phase 4: Testing | Functional and security testing | Weeks 9-10 |
| Phase 5: Delivery | Documentation, demo, presentation | Weeks 11-12 |

## 👥 Team

| Student Name | Student ID |
|--------------|------------|
| Ahmed Hossam Eldeen | 230103734 |
| Abdelsallam Ayman | 240103016 |
| Mahmoud Hany | 240101818 |
| Ali Samir | 240103429 |
| Mohamed Ahmed | 240102199 |
| Yousef Mohamed | 240103017 |
| Rahma Mohamed | 230105941 |
| Amr Nabil | 240101716 |
| Mohamed Hany | 240102326 |

**Supervisor**: Eng. Asmaa M. Elgezawy

## 🎓 Course Information

- **Institution**: El-Sewedy University of Technology
- **Faculty**: Faculty of Engineering Technology
- **Semester**: 2025/2026
- **Course**: Graduation Project II

## 🔮 Future Work

1. **Demand Forecasting**: Persist and visualize future course-demand from graduation simulations
2. **Job Finder**: Direct integration for full-time job placement
3. **Major Recommendation**: Suggest specializations based on performance and interests
4. **Live SIS Integration**: Connect directly to university's student information system
5. **Multi-Institution Support**: Expand to other faculties and universities
6. **Mobile Feature Parity**: Complete Flutter implementation of all admin workflows

## 📄 License

This project is developed for academic purposes at El-Sewedy University of Technology. All rights reserved.

## 🙏 Acknowledgments

- Eng. Asmaa M. Elgezawy for supervision and guidance
- Faculty of Engineering Technology for resources and support
- All team members for their dedication and hard work

---

**EduMate** — Empowering students to make informed academic and career decisions.
