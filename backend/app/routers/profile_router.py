from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.parser_service import extract_text_from_file
from app.ai_service import parse_resume_to_profile

router = APIRouter(prefix="/profile", tags=["Student Profile"])

def calculate_completeness(profile_data: dict) -> int:
    score = 0
    if profile_data.get("degree") and profile_data.get("major"):
        score += 20
    skills = profile_data.get("technical_skills") or []
    if len(skills) >= 3:
        score += 30
    elif len(skills) > 0:
        score += 15
    projects = profile_data.get("projects") or []
    if len(projects) >= 2:
        score += 25
    elif len(projects) == 1:
        score += 15
    certs = profile_data.get("certifications") or []
    soft = profile_data.get("soft_skills") or []
    if certs or soft:
        score += 15
    if profile_data.get("career_goals"):
        score += 10
    return min(100, score)

@router.get("", response_model=schemas.ProfileResponse)
def get_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id, completeness_score=10)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=schemas.ProfileResponse)
def update_profile(
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = profile_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if field == "technical_skills" and val is not None:
            # preserve existing verification status if skill name matches
            existing_skills = {s.get("name", "").lower(): s for s in (profile.technical_skills or [])}
            new_skills = []
            for s in val:
                s_dict = s if isinstance(s, dict) else s.model_dump()
                name_key = s_dict.get("name", "").lower()
                if name_key in existing_skills and existing_skills[name_key].get("verified"):
                    s_dict["verified"] = True
                    s_dict["score"] = existing_skills[name_key].get("score", 85)
                new_skills.append(s_dict)
            setattr(profile, field, new_skills)
        elif field in ["projects", "certifications"] and val is not None:
            serialized_list = [item if isinstance(item, dict) else item.model_dump() for item in val]
            setattr(profile, field, serialized_list)
        elif val is not None:
            setattr(profile, field, val)

    # Recalculate completeness
    profile.completeness_score = calculate_completeness({
        "degree": profile.degree,
        "major": profile.major,
        "technical_skills": profile.technical_skills,
        "projects": profile.projects,
        "certifications": profile.certifications,
        "soft_skills": profile.soft_skills,
        "career_goals": profile.career_goals
    })

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/parse-resume", response_model=schemas.ResumeParseResponse)
async def parse_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Security & size verification
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith(".docx") or file.filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a PDF, DOCX, or TXT resume.")
    
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 5MB limit.")

    try:
        raw_text, file_type = extract_text_from_file(file.filename, file_bytes)
        if len(raw_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract sufficient text from resume. Ensure it is text-based.")
        
        extracted_data = parse_resume_to_profile(raw_text)
        
        # Save raw resume text in profile
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if profile:
            profile.raw_resume_text = raw_text
            db.commit()

        return {
            "extracted_profile": extracted_data,
            "raw_text_length": len(raw_text),
            "message": f"Successfully parsed {file_type.upper()} resume! Review extracted details below."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing error: {str(e)}")
