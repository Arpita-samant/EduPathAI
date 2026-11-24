from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Unified Career Readiness KPI"])

@router.get("/summary", response_model=schemas.DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    latest_assessment = db.query(models.Assessment).filter(models.Assessment.user_id == current_user.id).order_by(models.Assessment.created_at.desc()).first()
    active_roadmap = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id, models.Roadmap.is_active == True).first()
    latest_ats = db.query(models.AtsAnalysis).filter(models.AtsAnalysis.user_id == current_user.id).order_by(models.AtsAnalysis.created_at.desc()).first()

    # User profile data
    skills = profile.technical_skills or [] if profile else []
    projects = profile.projects or [] if profile else []
    has_skills = len(skills) > 0
    projects_count = len(projects)
    target_career = profile.target_career if (profile and profile.target_career) else ""
    profile_completeness = profile.completeness_score if profile else 0

    # 1. Assessment Component (0-100) - NEVER default to 75 if unassessed!
    has_assessment = latest_assessment is not None
    assessment_score = float(latest_assessment.skill_score) if has_assessment else 0.0

    # 2. Roadmap Component (0-100) - Empty if no roadmap active!
    has_roadmap = active_roadmap is not None
    total_milestones = 0
    completed_milestones = 0
    current_phase = "Not Started"
    roadmap_completion_pct = 0.0

    if has_roadmap:
        milestones = db.query(models.RoadmapMilestone).filter(models.RoadmapMilestone.roadmap_id == active_roadmap.id).all()
        total_milestones = len(milestones) if milestones else 0
        completed_milestones = sum(1 for m in milestones if m.status == "completed")
        current_phase = "Foundation"
        for m in milestones:
            if m.status == "in_progress":
                current_phase = m.phase
                break
            elif m.status == "completed":
                current_phase = m.phase
        roadmap_completion_pct = (completed_milestones / max(total_milestones, 1)) * 100 if total_milestones > 0 else 0.0

    # 3. ATS Component (0-100) - NEVER default to 78 if no resume uploaded/scanned!
    has_ats = latest_ats is not None
    ats_score = int(latest_ats.ats_score) if has_ats else 0

    # 4. Project & Profile Health (0-100) - 0 if no projects!
    project_score = min(100, projects_count * 35 + 20) if projects_count > 0 else 0

    # Unified Career Readiness Formula:
    # If completely brand new without any activity, score is 0
    if not has_assessment and not has_roadmap and not has_ats and projects_count == 0:
        unified_score = 0
    else:
        unified_score = round(
            0.35 * assessment_score +
            0.25 * roadmap_completion_pct +
            0.20 * float(ats_score) +
            0.20 * float(project_score)
        )
        unified_score = min(100, max(0, int(unified_score)))

    # Skills counts
    verified_count = sum(1 for s in skills if s.get("verified"))
    total_skills_count = len(skills)

    # Activity streak
    if current_user.is_demo:
        weekly_streak = 4
    elif has_assessment or has_roadmap or has_ats or has_skills:
        weekly_streak = 1
    else:
        weekly_streak = 0

    # Top recommended jobs - ONLY match if user has added skills and selected a target career!
    top_jobs = []
    if has_skills and target_career:
        user_skill_names_list = [s.get("name", "") for s in skills]
        try:
            from app.job_aggregator import get_aggregated_live_jobs
            live_jobs, _ = get_aggregated_live_jobs(user_skills=user_skill_names_list)
            top_jobs = live_jobs[:3]
        except Exception:
            top_jobs_query = db.query(models.JobRole).limit(3).all()
            user_skill_names = {s.lower() for s in user_skill_names_list}
            for j in top_jobs_query:
                matched = [r for r in (j.required_skills or []) if any(r.lower() in us or us in r.lower() for us in user_skill_names)]
                missing = [r for r in (j.required_skills or []) if r not in matched]
                req_len = len(j.required_skills or [])
                match_pct = round((len(matched) / max(req_len, 1)) * 100) if req_len > 0 else 0
                top_jobs.append({
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "domain": j.domain,
                    "role_type": j.role_type,
                    "experience_level": j.experience_level,
                    "location": j.location,
                    "salary_range": j.salary_range,
                    "match_percentage": min(95, max(15, match_pct)),
                    "required_skills": j.required_skills or [],
                    "matched_skills": matched,
                    "missing_skills": missing,
                    "description": j.description,
                    "apply_url": j.apply_url
                })

    # Logical next action step sequence (Zero Dead Ends)
    if not has_skills or profile_completeness < 30:
        next_action = {
            "title": "Step 1: Complete Your Student Profile",
            "description": "Add your degree, technical skills, or upload your resume to unlock AI career guidance.",
            "href": "/profile",
            "cta": "Complete Profile"
        }
    elif not has_assessment or not (profile and profile.best_fit_skill):
        next_action = {
            "title": "Step 2: Complete Skill Assessment",
            "description": "Answer tailored questions to help AI evaluate your strengths and select your single core superpower.",
            "href": "/assessment",
            "cta": "Start Assessment"
        }
    elif not target_career:
        next_action = {
            "title": "Step 3: AI Career Match & Chat",
            "description": "Let AI analyze your skills to select your single best-fit career path and chat with your AI advisor.",
            "href": "/careers",
            "cta": "Match Career"
        }
    elif not has_roadmap:
        next_action = {
            "title": "Step 4: Unlock Your Adaptive Roadmap",
            "description": "Your single best career is selected! Open your week-by-week personalized learning roadmap.",
            "href": "/roadmap",
            "cta": "Open Roadmap"
        }
    elif not has_ats:
        next_action = {
            "title": "Step 4: Scan Resume with ATS Analyzer",
            "description": "Audit your resume against real job descriptions to identify missing keywords and impact metrics.",
            "href": "/resume-ats",
            "cta": "Run ATS Audit"
        }
    else:
        next_action = {
            "title": f"Continue Week {completed_milestones + 1} Milestone Project",
            "description": "Submit your component project repo to elevate your readiness score to 90%+.",
            "href": "/roadmap",
            "cta": "Continue Roadmap"
        }

    return {
        "career_readiness_score": unified_score,
        "score_breakdown": {
            "verified_assessment": round(assessment_score, 1),
            "roadmap_progress": round(roadmap_completion_pct, 1),
            "resume_ats": ats_score,
            "project_portfolio": project_score
        },
        "target_career": target_career,
        "current_phase": current_phase,
        "completed_milestones": completed_milestones,
        "total_milestones": total_milestones,
        "weekly_streak": weekly_streak,
        "verified_skills_count": verified_count,
        "total_skills_count": total_skills_count,
        "ats_score": ats_score,
        "top_recommended_jobs": top_jobs,
        "next_action_step": next_action
    }
