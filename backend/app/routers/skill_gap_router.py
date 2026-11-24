from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/skill-gap", tags=["Industry-Based Skill Gap Analysis"])

@router.get("/{target_identifier}", response_model=schemas.SkillGapResponse)
def get_skill_gap_analysis(
    target_identifier: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    user_skills = profile.technical_skills if profile else []
    
    # Check if target_identifier is a job_id UUID or a domain name
    job = db.query(models.JobRole).filter(models.JobRole.id == target_identifier).first()
    if job:
        role_name = f"{job.title} at {job.company}"
        required_skills = job.required_skills or []
    else:
        role_name = target_identifier if target_identifier != "default" else (profile.target_career if (profile and profile.target_career) else "Full-Stack Software Engineering")
        if "data" in role_name.lower() or "ai" in role_name.lower():
            required_skills = ["Python", "SQL", "Pandas", "NumPy", "scikit-learn", "PyTorch", "FastAPI", "Docker", "Vector DBs", "Git"]
        elif "cloud" in role_name.lower() or "devops" in role_name.lower():
            required_skills = ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "Python / Go", "Prometheus"]
        else:
            required_skills = ["TypeScript", "React", "Next.js", "Node.js / FastAPI", "PostgreSQL", "Docker", "REST APIs", "Git", "Redis", "CI/CD"]

    user_skills_dict = {s.get("name", "").lower(): s for s in user_skills}

    mastered = []
    partial = []
    missing = []

    for req in required_skills:
        req_clean = req.lower().strip()
        matched_user_skill = None
        for k, v in user_skills_dict.items():
            if k in req_clean or req_clean in k:
                matched_user_skill = v
                break

        # Find a linked curated resource for this skill
        res = db.query(models.LearningResource).filter(
            models.LearningResource.skill_tag.ilike(f"%{req[:6]}%")
        ).first()
        res_info = {
            "title": res.title if res else f"Mastering {req}",
            "url": res.url if res else f"https://www.google.com/search?q={req}+tutorial",
            "type": res.resource_type if res else "Tutorial"
        }

        if matched_user_skill:
            is_verified = matched_user_skill.get("verified", False)
            prof = matched_user_skill.get("proficiency", 3)
            if is_verified or prof >= 4:
                mastered.append({
                    "skill": req,
                    "status": "mastered",
                    "proficiency": prof,
                    "verified": is_verified,
                    "importance": "Critical" if req in ["TypeScript", "React", "Python", "SQL"] else "Recommended",
                    "resource_recommendation": res_info
                })
            else:
                partial.append({
                    "skill": req,
                    "status": "partial",
                    "proficiency": prof,
                    "verified": False,
                    "importance": "Critical" if req in ["PostgreSQL", "Docker", "FastAPI"] else "Recommended",
                    "resource_recommendation": res_info
                })
        else:
            missing.append({
                "skill": req,
                "status": "missing",
                "proficiency": 0,
                "verified": False,
                "importance": "Critical" if req in ["Docker", "Kubernetes", "PostgreSQL", "Next.js"] else "Recommended",
                "resource_recommendation": res_info
            })

    total_req = len(required_skills)
    readiness = int(((len(mastered) * 1.0 + len(partial) * 0.5) / max(total_req, 1)) * 100)

    priority_actions = []
    if missing:
        priority_actions.append(f"Immediate Priority: Level up in '{missing[0]['skill']}' via hands-on mini-projects.")
    if partial:
        priority_actions.append(f"Strengthen '{partial[0]['skill']}' through code implementation and test verification.")
    priority_actions.append(f"Validate mastery by taking the EduPath adaptive assessment for {role_name}.")

    return {
        "target_role": role_name,
        "readiness_percentage": readiness,
        "mastered": mastered,
        "partial": partial,
        "missing": missing,
        "priority_action_plan": priority_actions
    }
