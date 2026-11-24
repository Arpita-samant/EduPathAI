from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.ai_service import (
    get_comprehensive_assessment_questions,
    analyze_assessment_and_select_skill,
    generate_adaptive_assessment,
    score_assessment
)

router = APIRouter(prefix="/assessment", tags=["Skill & Interest Assessment"])

@router.get("/questions", response_model=List[schemas.AssessmentQuestionItem])
def get_assessment_questions():
    """Returns the comprehensive multi-dimensional questions covering Interests, Tech, Soft Skills, Work Style & Goals."""
    return get_comprehensive_assessment_questions()

@router.post("/submit", response_model=schemas.AssessmentAnalysisResponse)
def submit_assessment(
    req: schemas.AssessmentSubmitRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits user answers (selected or custom text).
    AI analyzes the responses and profile to select ONLY ONE best-fit core skill / superpower.
    """
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    profile_dict = {
        "degree": profile.degree if profile else "",
        "major": profile.major if profile else "",
        "technical_skills": profile.technical_skills if profile else [],
        "projects": profile.projects if profile else [],
        "interests": profile.interests if profile else [],
        "career_goals": profile.career_goals if profile else ""
    }
    
    # Run AI analysis to pick ONLY ONE best-fit skill
    analysis = analyze_assessment_and_select_skill(profile_dict, req.answers)
    selected_skill = analysis["selected_best_fit_skill"]
    
    # Save in profile
    if profile:
        profile.best_fit_skill = selected_skill
        # If technical skills already exist, mark the relevant one as verified or add it
        skills = profile.technical_skills or []
        found = False
        for s in skills:
            if s.get("name", "").lower() in selected_skill.lower() or selected_skill.lower() in s.get("name", "").lower():
                s["verified"] = True
                s["proficiency"] = 5
                found = True
        if not found and len(skills) < 10:
            skills.append({"name": selected_skill, "proficiency": 5, "verified": True})
        profile.technical_skills = skills
        db.commit()

    # Record assessment in database
    assessment = models.Assessment(
        user_id=current_user.id,
        domain=selected_skill,
        questions=[],
        answers=req.answers,
        skill_score=float(analysis.get("confidence_score", 92)),
        interest_score=95.0,
        suitability_score=float(analysis.get("confidence_score", 92)),
        ai_explanation={
            "selected_best_fit_skill": selected_skill,
            "skill_category": analysis.get("skill_category", "Engineering"),
            "why_this_skill": analysis.get("why_this_skill", ""),
            "strengths": analysis.get("strengths", []),
            "growth_areas": analysis.get("growth_areas", []),
            "analysis_summary": analysis.get("analysis_summary", "")
        }
    )
    db.add(assessment)
    db.commit()

    return {
        "selected_best_fit_skill": selected_skill,
        "skill_category": analysis.get("skill_category", "Engineering"),
        "confidence_score": int(analysis.get("confidence_score", 92)),
        "why_this_skill": analysis.get("why_this_skill", ""),
        "strengths": analysis.get("strengths", []),
        "growth_areas": analysis.get("growth_areas", []),
        "analysis_summary": analysis.get("analysis_summary", "")
    }

@router.get("/latest", response_model=Optional[schemas.AssessmentAnalysisResponse])
def get_latest_assessment(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    assessment = db.query(models.Assessment).filter(models.Assessment.user_id == current_user.id).order_by(models.Assessment.created_at.desc()).first()
    
    if not assessment and (not profile or not profile.best_fit_skill):
        return None
        
    ai_expl = assessment.ai_explanation if (assessment and isinstance(assessment.ai_explanation, dict)) else {}
    selected_skill = profile.best_fit_skill if (profile and profile.best_fit_skill) else (assessment.domain if assessment else "")
    
    if not selected_skill:
        return None
        
    return {
        "selected_best_fit_skill": selected_skill,
        "skill_category": ai_expl.get("skill_category", "Core Specialization"),
        "confidence_score": int(assessment.skill_score if assessment else 90),
        "why_this_skill": ai_expl.get("why_this_skill", f"Verified profile match for {selected_skill}"),
        "strengths": ai_expl.get("strengths", ["Demonstrated high technical velocity", "Consistent alignment with modern engineering demands"]),
        "growth_areas": ai_expl.get("growth_areas", ["Deepen containerization knowledge", "Expand production cloud deployments"]),
        "analysis_summary": ai_expl.get("analysis_summary", f"Selected {selected_skill} as your primary core skill.")
    }
