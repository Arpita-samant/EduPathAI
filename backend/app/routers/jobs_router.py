from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.job_aggregator import get_aggregated_live_jobs, clean_html, extract_skills_from_text

router = APIRouter(prefix="/jobs", tags=["Company & Job Matching (Live Multi-API)"])

def calculate_match_percentage(user_skills: List[str], required_skills: List[str]) -> tuple:
    if not user_skills or not required_skills:
        return 0, [], required_skills[:]

    user_skills_lower = {s.lower() for s in user_skills}
    matched = []
    missing = []
    
    for req in required_skills:
        req_lower = req.lower()
        if any(req_lower in s or s in req_lower for s in user_skills_lower):
            matched.append(req)
        else:
            missing.append(req)
            
    pct = round((len(matched) / len(required_skills)) * 100)
    final_pct = min(96, pct)
    return final_pct, matched, missing

@router.get("/matches", response_model=schemas.JobsListResponse)
def get_job_matches(
    source: Optional[str] = None,
    domain: Optional[str] = None,
    role_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    search: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns real-time aggregated job listings from 4 providers:
    1. Jobicy (Remote Jobs API)
    2. Arbeitnow (Tech Job Board API)
    3. Himalayas (Remote Jobs API)
    4. Adzuna (Developer API with Key 171c50966d0d1f32a46e12efa55dea28)
    """
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    user_skill_names = [s.get("name", "") for s in (profile.technical_skills or [])] if profile else []

    # Return empty matches until user completes profile steps (adds skills or selects a target career)
    if not user_skill_names and not (profile and profile.target_career):
        return {
            "jobs": [],
            "total": 0,
            "active_sources": [
                {"name": "Jobicy", "status": "Ready", "count": 0, "url": "https://jobicy.com/api/v2/remote-jobs"},
                {"name": "Arbeitnow", "status": "Ready", "count": 0, "url": "https://www.arbeitnow.com/api/job-board-api"},
                {"name": "Himalayas", "status": "Ready", "count": 0, "url": "https://himalayas.app/jobs/api"},
                {"name": "Adzuna", "status": "Key Configured", "count": 0, "url": "https://developer.adzuna.com"}
            ]
        }

    # Fetch real-time live jobs from all 4 providers!
    live_jobs, sources_status = get_aggregated_live_jobs(
        user_skills=user_skill_names,
        source_filter=source,
        domain_filter=domain,
        search_query=search
    )

    # Filter by role_type and experience_level if specified
    filtered = live_jobs
    if role_type and role_type.lower() != "all":
        filtered = [j for j in filtered if role_type.lower() in j.get("role_type", "").lower()]
    if experience_level and experience_level.lower() != "all":
        filtered = [j for j in filtered if experience_level.lower() in j.get("experience_level", "").lower()]

    return {
        "jobs": filtered,
        "total": len(filtered),
        "active_sources": sources_status
    }

@router.get("/{job_id}", response_model=schemas.JobMatchItem)
def get_job_detail(
    job_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    user_skill_names = [s.get("name", "") for s in (profile.technical_skills or [])] if profile else []

    # Check live cached jobs first
    live_jobs, _ = get_aggregated_live_jobs(user_skills=user_skill_names)
    for j in live_jobs:
        if j.get("id") == job_id:
            return j

    # Fallback to DB
    job = db.query(models.JobRole).filter(models.JobRole.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job role not found")

    pct, matched, missing = calculate_match_percentage(user_skill_names, job.required_skills or [])
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "domain": job.domain,
        "role_type": job.role_type,
        "experience_level": job.experience_level,
        "location": job.location,
        "salary_range": job.salary_range,
        "match_percentage": pct,
        "required_skills": job.required_skills or [],
        "matched_skills": matched,
        "missing_skills": missing,
        "description": job.description,
        "apply_url": job.apply_url,
        "source": "Local DB",
        "company_logo": "",
        "posted_at": ""
    }
