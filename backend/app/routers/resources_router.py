from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/resources", tags=["Curated Learning Resources"])

@router.get("", response_model=schemas.LearningResourcesListResponse)
def get_resources(
    skill: Optional[str] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    prioritize_gaps: bool = True,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    
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
        query = query.filter(models.LearningResource.skill_tag.ilike(f"%{skill}%"))
    if resource_type:
        query = query.filter(models.LearningResource.resource_type == resource_type)
    if difficulty:
        query = query.filter(models.LearningResource.difficulty == difficulty)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (models.LearningResource.title.ilike(search_fmt)) |
            (models.LearningResource.provider.ilike(search_fmt)) |
            (models.LearningResource.skill_tag.ilike(search_fmt))
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
