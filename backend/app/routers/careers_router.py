from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.ai_service import analyze_and_recommend_single_career, career_advisor_chat

router = APIRouter(prefix="/careers", tags=["AI Career Match & Advisor"])

@router.get("/recommend", response_model=schemas.CareerRecommendationResponse)
def get_career_status(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checks if the user has already analyzed and locked in their single best-fit career.
    """
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    best_fit_skill = profile.best_fit_skill if (profile and profile.best_fit_skill) else ""
    target_career = profile.target_career if (profile and profile.target_career) else ""

    profile_dict = {
        "degree": profile.degree if profile else "",
        "major": profile.major if profile else "",
        "technical_skills": profile.technical_skills if profile else [],
        "projects": profile.projects if profile else [],
        "interests": profile.interests if profile else [],
        "career_goals": profile.career_goals if profile else "",
        "best_fit_skill": best_fit_skill
    }

    if not target_career:
        return {
            "career": None,
            "has_analyzed": False,
            "best_fit_skill": best_fit_skill,
            "profile_summary": f"{len(profile_dict.get('technical_skills', []))} skills cataloged, verified core skill: '{best_fit_skill or 'None yet'}'"
        }

    # User already has target career selected, return the structured recommendation
    career_data = analyze_and_recommend_single_career(profile_dict, best_fit_skill or "Full-Stack Web Architecture")
    career_data["title"] = target_career # preserve exact selected title
    
    return {
        "career": career_data,
        "has_analyzed": True,
        "best_fit_skill": best_fit_skill,
        "profile_summary": f"Target career confirmed: {target_career}"
    }

@router.post("/analyze", response_model=schemas.SingleCareerRecommendation)
def analyze_and_select_career(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    User clicks 'Analyze My Skills':
    AI analyzes profile and selected core skill, selects ONLY ONE best-fit career, and locks it in.
    """
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    best_fit_skill = profile.best_fit_skill if (profile and profile.best_fit_skill) else "Full-Stack Web Architecture"

    profile_dict = {
        "degree": profile.degree if profile else "",
        "major": profile.major if profile else "",
        "technical_skills": profile.technical_skills if profile else [],
        "projects": profile.projects if profile else [],
        "interests": profile.interests if profile else [],
        "career_goals": profile.career_goals if profile else "",
        "best_fit_skill": best_fit_skill
    }

    career_recommendation = analyze_and_recommend_single_career(profile_dict, best_fit_skill)
    
    # Lock in this single career for the student!
    if profile:
        profile.target_career = career_recommendation["title"]
        db.commit()

    return career_recommendation

@router.post("/chat", response_model=schemas.CareerChatResponse)
def chat_with_career_advisor(
    req: schemas.CareerChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interactive AI Career Advisor Chat.
    Enables students to ask questions and receive advice about their single best-fit career.
    """
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    profile_dict = {
        "degree": profile.degree if profile else "Computer Science",
        "technical_skills": profile.technical_skills if profile else [],
        "projects": profile.projects if profile else []
    }

    chat_result = career_advisor_chat(
        career_title=req.career_title,
        message=req.message,
        history=req.history,
        profile_summary=profile_dict
    )

    return chat_result

@router.post("/select")
def select_target_career(
    req: schemas.CareerSelectRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if profile:
        profile.target_career = req.target_career
        db.commit()
    return {"message": f"Confirmed '{req.target_career}' as your primary career trajectory!"}
