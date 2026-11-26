# CareerVector — AI Career Intelligence & Learning Engine

> **Full-Stack Autonomous Career Readiness & Navigation Platform**  
> Moving students and engineers from career confusion to verified career readiness through personalized AI skill assessments, explainable career matching, adaptive week-by-week learning roadmaps, real-time job stream intelligence, ATS resume audits, and curated free technical courses.

[![Live Demo](https://img.shields.io/badge/Live%20Platform-Vercel%20Deployed-536C8A?style=for-the-badge&logo=vercel)](https://careervector-sepia.vercel.app)
[![Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🌐 Live Deployment
- **Production URL**: [https://careervector-sepia.vercel.app](https://careervector-sepia.vercel.app)
- **Backend API**: Deployed as Vercel Serverless Functions (`/api/*`) backed by FastAPI

---

## 🌟 Core Value Proposition

Instead of generic career labels based on self-reported checkboxes, **CareerVector** provides a continuous, data-driven intelligence pipeline:

1. **Smart Profile & Resume Auto-Fill**: Parses student background, degree, coursework, technical stack, soft skills, certifications, and portfolio projects directly from uploaded resumes (PDF, DOCX, TXT) via AI extraction.
2. **Adaptive Timed Skill Assessment**: Tests conceptual mastery and practical problem solving with domain-specific MCQs, scenario-based debugging questions, and superpower evaluation.
3. **Single Best-Fit Career Selection**: Calculates suitability scores across academic alignment, verified assessment performance, and market demand, accompanied by an interactive conversational AI Career Mentor.
4. **8-Week Adaptive Learning Roadmap**: Generates a structured week-by-week curriculum with core learning topics, weekly practice projects, curated free resources, and 1-click **PDF Export**.
5. **Real-Time Job Opportunities Feed**: Aggregates live listings from Jobicy, Arbeitnow, Himalayas, and Adzuna with instant real-time keyword search, domain filters, and direct employer application links.
6. **AI Resume ATS Scanner**: Evaluates resume compatibility against target job descriptions, scoring keyword density, detecting formatting bugs, and generating high-impact STAR bullet rewrites.
7. **Curated Hub (100 Free Tech Courses)**: Direct directory of 100 free certified courses and handbooks across 9 major tech domains (Full-Stack, React, Python, Machine Learning, Cloud & DevOps, Cybersecurity, Data Science, System Design, and Mobile).

---

## 🚀 Key Modules & Architecture

| Module | Route | Description & Key Capabilities |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Conversion hero with 3D AI Orb, interactive workflow diagram, comparison matrix, feature spotlights, and secure authentication. |
| **Executive Workspace** | `/dashboard` | **Unified Career Readiness Score (0–100)** KPI ring, milestone progression tracker, verified skills breakdown, and quick action cards. |
| **Smart Profile** | `/profile` | Academic records, technical skills with proficiency meters, projects with GitHub links, and **AI Resume Auto-Fill**. |
| **Skill Assessment** | `/assessment` | Adaptive domain evaluation with timer, multiple-choice questions, scenario tests, and core superpower selection. |
| **AI Career Match & Mentor** | `/careers` | Single best-fit career match with match percentage, market insights, and interactive **Conversational AI Mentor Chat**. |
| **Learning Roadmap** | `/roadmap` | Clean 8-week structured roadmap with phases (Foundation, Intermediate, Capstone), weekly practice projects, resources, and **Export to PDF**. |
| **Live Opportunities Feed** | `/jobs` | Real-time multi-board job stream from Jobicy, Arbeitnow, Himalayas & Adzuna with instant search, fixed uniform cards, and role modal. |
| **AI Resume ATS Analyzer** | `/resume-ats` | PDF resume upload, ATS score gauge, keyword match/gap detection, formatting checklist, and before/after STAR bullet rewrites. |
| **Curated Free Hub** | `/resources` | 100 verified free tech courses across 9 domains with real-time keyword search (e.g. typing "ai" or "docker"), category filters, and balanced cards. |

---

## 📐 Scoring & Calibration Formulas

### 1. Weighted Career Suitability Formula
$$\text{Suitability Score} = 0.30(\text{Verified Skill}) + 0.25(\text{Interest Alignment}) + 0.20(\text{Academic/Project Fit}) + 0.15(\text{Self-Reported Stack}) + 0.10(\text{Career Goal Alignment})$$

### 2. Unified Career Readiness Score (0–100)
$$\text{Career Readiness} = 0.35(\text{Verified Assessment}) + 0.25(\text{Roadmap Completion}) + 0.20(\text{Resume ATS Score}) + 0.20(\text{Project Portfolio Health})$$

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite 8.3
- **Styling**: Tailwind CSS, Inter font styling, clean minimalistic borders (`#E4E5E9`), soft shadows
- **Icons**: Lucide React
- **Visuals**: AI Orb (PNG sequence / 3D rendered orb), CSS animations

### Backend
- **Framework**: Python 3.13 + FastAPI
- **Server**: Uvicorn (Local) / Vercel Serverless Function (`api/index.py`)
- **Database & ORM**: SQLAlchemy with SQLite (local development) / PostgreSQL compatible
- **Document Processing**: `pypdf`, `python-docx` for structured resume parsing
- **External Feeds**: Jobicy API, Arbeitnow API, Himalayas API, Adzuna API
- **AI Intelligence**: Google Gemini API integration with high-fidelity deterministic fallbacks

---

## 🛠️ Quick Start & Local Development

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 to v3.13)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Arpita-samant/CareerVector.git
cd CareerVector
```

### 2. Run with One-Click Startup Scripts (Windows)
```powershell
.\start.ps1
```
*Or double-click `run.bat`.*

---

### Manual Setup

#### Step 1: Backend Setup
```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`

#### Step 2: Frontend Setup
In a new terminal window:
```powershell
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 🔒 Authentication & Account Security
- Secure account registration and login with bcrypt password hashing and JWT authentication tokens.
- **Strict User Isolation**: User profile data, assessment results, and roadmaps are isolated per active account.
- **Zero-Profile Exploration**: Users can immediately browse **Live Opportunities**, run **Resume ATS Audits**, and access the **Curated Hub** without needing to build an academic profile first.

---

## 🚢 Deployment Architecture (Vercel)

The repository is configured for zero-configuration monorepo deployment on **Vercel**:
- `vercel.json` routes `/api/(.*)` requests to the Python serverless function in `api/index.py`.
- Static frontend assets are built via `tsc -b && vite build` and served from `dist/`.
- Cross-Origin Resource Sharing (CORS) is enabled for smooth communication between client and serverless endpoints.

---

## 📄 License
This project is licensed under the MIT License.
