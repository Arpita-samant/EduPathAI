# CareerVector — Personalized Career Guidance & Roadmap Generator

> **Full-Stack AI SaaS Web Application**  
> Moving students from career confusion to verified career readiness through multi-stage AI assessments, explainable suitability breakdowns, closed-loop adaptive roadmaps, and ATS resume optimization.

---

## 🌟 Core Innovation

Instead of returning generic career labels based on self-reported checkboxes, EduPath AI runs a closed-loop intelligence pipeline answering four critical questions:

1. **Why a career suits the student**: Evidence-backed Explainable AI (XAI) Suitability Cards across Academic Fit, Verified Skill Score, Interest Alignment, and Live Market Demand.
2. **What skills they are missing**: 3-tier categorization into *Mastered* (green), *Partially Developed* (amber), and *Missing* (red) relative to live industry roles.
3. **How to close those gaps**: Structured 8-week adaptive roadmap with milestone hands-on projects and curated free resources.
4. **Where those skills lead**: Semantic job/internship matching and an AI Resume ATS Analyzer with concrete before/after bullet point rewrites.

---

## 🚀 Key Features & Modules

| Module | Route | Purpose & Key Capabilities |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Professional conversion page, 4-step horizontal engine flow, Traditional vs. EduPath comparison table, 6 capability cards, and 1-click demo entry. |
| **Executive Dashboard** | `/dashboard` | **Unified Career Readiness Score (0–100)** KPI ring with full breakdown, weekly streak, active phase tracker, and zero-dead-ends guidance. |
| **Module 1: Smart Profile** | `/profile` | Comprehensive academic, skills, projects, and goals form with **PDF/DOCX/TXT resume auto-fill** via Gemini structured JSON extraction. |
| **Module 2: AI Career Match** | `/careers` | Top 3 ranked domains with Explainable AI (XAI) Suitability Cards breaking down academic, verified skill, interest, and demand factors. |
| **Module 3: Skill Assessment** | `/assessment` | Adaptive timed test with domain MCQs (Easy → Medium → Hard), practical scenario debugging tasks, and interest calibration awarding verified skill tags. |
| **Module 4: Best-Fit Selection** | `/careers/best-fit` | 5-factor weighted suitability scoring matrix with Recharts Multi-Domain Radar Chart and side-by-side comparison. |
| **Module 5: Learning Roadmap** | `/roadmap` | 8-week timeline grouped by Foundation, Intermediate, and Capstone phases with mini-project specs, GitHub repo submissions, and Markdown export. |
| **Module 6: Adaptive Closed-Loop** | `/dashboard & /roadmap` | "Update My Plan" button that recalibrates remaining milestones based on project submissions and assessment velocity. |
| **Module 7: Company & Jobs** | `/jobs` | 28+ realistic tech roles & internships from Stripe, Vercel, Supabase, Datadog, etc., with semantic match % and role detail drawers. |
| **Module 8: Skill Gap Analysis** | `/skill-gap` | Categorizes target role skills into Mastered, Partial, and Missing buckets with one-click resource and roadmap integration. |
| **Module 9: AI Resume ATS** | `/resume-ats` | Overall ATS compatibility score (0–100), matched vs. missing high-impact keywords, formatting audits, and concrete before/after bullet rewrites. |
| **Module 10: Curated Resources** | `/resources` | 50+ high-signal free learning materials (courses, official docs, repos, practice platforms) prioritized by detected skill gaps. |

---

## 📐 Formulas & Scoring Engine

### 1. Weighted Suitability Score
$$\text{Suitability Score} = 0.30(\text{Verified Skill}) + 0.25(\text{Interest Alignment}) + 0.20(\text{Academic/Project Fit}) + 0.15(\text{Self-Reported}) + 0.10(\text{Goal Alignment})$$

### 2. Unified Career Readiness Score (0–100)
$$\text{Career Readiness} = 0.35(\text{Verified Assessment}) + 0.25(\text{Roadmap Completion}) + 0.20(\text{Resume ATS Score}) + 0.20(\text{Project Portfolio Health})$$

---

## 💻 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide React + Recharts
- **Backend**: Python 3.13 + FastAPI + Uvicorn + SQLAlchemy + Pydantic v2
- **Document Extraction**: PyPDF + python-docx
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-2.5-pro`) with deterministic high-fidelity heuristic fallback
- **Authentication**: JWT Bearer Tokens + Passlib / Bcrypt password hashing
- **Database**: SQLite (local zero-config out-of-the-box, PostgreSQL compatible via SQLAlchemy)

---

## 🛠️ Quick Start & Running Locally

### Option A: Using the Startup Scripts (Recommended)

On Windows PowerShell:
```powershell
.\start.ps1
```
Or double-click `run.bat`.

### Option B: Manual Execution

#### 1. Start the Backend API
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend initializes the database and automatically seeds 28 realistic jobs, 26 high-yield learning resources, and the demo student profile (*Alex Chen*).
- **Backend API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

#### 2. Start the Frontend
In a new terminal:
```powershell
cd frontend
npm run dev
```
- **Frontend URL**: `http://localhost:5173`

---

## 👤 Instant Demo Profile (Alex Chen)
On the Landing Page or login modal, click **"Try Demo Profile"** to explore the entire application with pre-loaded realistic senior undergraduate data:
- **Email**: `demo@edupath.ai`
- **Full Name**: Alex Chen
- **Degree**: B.Tech in Computer Science & Engineering (GPA 3.82)
- **Verified Skills**: React (88%), TypeScript (84%), Python (86%), FastAPI (80%), PostgreSQL, Docker
- **Projects**: Smart Campus Space Reservation Engine, Real-Time Dev Metrics Dashboard
- **Active Roadmap**: Week 1 completed, Week 2 in progress
- **Career Readiness Score**: 85/100

---

## 📄 License
MIT License. Built for full-stack excellence with Antigravity.
