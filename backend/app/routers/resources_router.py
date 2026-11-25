from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas, auth
from app.curated_courses import CURATED_COURSES_100

router = APIRouter(prefix="/resources", tags=["Curated Learning Resources"])

@router.get("", response_model=schemas.LearningResourcesListResponse)
def get_resources(
    skill: Optional[str] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    prioritize_gaps: bool = True,
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Auto-seed the 100 free curated courses if not already present
    existing_count = db.query(models.LearningResource).count()
    if existing_count < 100:
        existing_titles = {t[0] for t in db.query(models.LearningResource.title).all()}
        for course in CURATED_COURSES_100:
            if course["title"] not in existing_titles:
                db.add(models.LearningResource(**course))
        db.commit()

    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first() if current_user else None
    
    # Identify gaps
    user_skills_dict = {s.get("name", "").lower(): s for s in (profile.technical_skills if profile else [])}
    missing_or_partial_tags = []
    
    # Common core skills to check against
    core_skills = ["Docker", "Kubernetes", "PostgreSQL", "Next.js", "Redis", "TypeScript", "CI/CD", "FastAPI"]
    for cs in core_skills:
        cs_lower = cs.lower()
        if cs_lower not in user_skills_dict or not user_skills_dict[cs_lower].get("verified"):
            missing_or_partial_tags.append(cs)

    query = db.query(models.LearningResource)
    if skill:
        skill_term = f"%{skill.strip().lower()}%"
        query = query.filter(func.lower(models.LearningResource.skill_tag).like(skill_term))
    if resource_type:
        query = query.filter(models.LearningResource.resource_type == resource_type)
    if difficulty:
        query = query.filter(models.LearningResource.difficulty == difficulty)
    if search:
        search_fmt = f"%{search.strip().lower()}%"
        query = query.filter(
            (func.lower(models.LearningResource.title).like(search_fmt)) |
            (func.lower(models.LearningResource.provider).like(search_fmt)) |
            (func.lower(models.LearningResource.skill_tag).like(search_fmt))
        )

    all_resources = query.all()

    # Prioritize items matching student's skill gaps
    if prioritize_gaps and missing_or_partial_tags:
        def gap_priority(r):
            for i, tag in enumerate(missing_or_partial_tags):
                if tag.lower() in r.skill_tag.lower() or r.skill_tag.lower() in tag.lower():
                    return i
            return 999
        all_resources.sort(key=gap_priority)

    return {
        "resources": all_resources,
        "total": len(all_resources),
        "prioritized_skills": missing_or_partial_tags[:4]
    }
