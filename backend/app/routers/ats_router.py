from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.parser_service import extract_text_from_file
from app.ai_service import analyze_resume_ats

router = APIRouter(prefix="/ats", tags=["Resume ATS Analyzer"])

@router.post("/analyze", response_model=schemas.AtsAnalysisResponse)
async def analyze_ats(
    target_role: str = Form("Full-Stack Software Engineer"),
    job_description: str = Form(...),
    resume_text: str = Form(None),
    resume_file: UploadFile = File(None),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first() if current_user else None

    resolved_resume_text = ""
    if resume_file and resume_file.filename:
        file_bytes = await resume_file.read()
        extracted_text, _ = extract_text_from_file(resume_file.filename, file_bytes)
        resolved_resume_text = extracted_text
    elif resume_text and resume_text.strip():
        resolved_resume_text = resume_text.strip()
    elif profile and profile.raw_resume_text:
        resolved_resume_text = profile.raw_resume_text
    else:
        # Synthesize from profile attributes or general background if no raw text exists
        skills_str = ", ".join(s.get("name", "") for s in (profile.technical_skills or [])) if profile else "TypeScript, React, Python, SQL, REST APIs"
        projects_str = "\n".join(f"- {p.get('title')}: {p.get('description')}" for p in (profile.projects or [])) if profile else ""
        candidate_name = current_user.full_name if current_user else "Applicant"
        resolved_resume_text = f"Candidate: {candidate_name}\nSkills: {skills_str}\nEducation: {profile.degree if profile else 'Computer Science & Engineering'}\nProjects:\n{projects_str}"

    if len(resolved_resume_text.strip()) < 30:
        raise HTTPException(status_code=400, detail="Resume text is too short to evaluate. Please provide a valid resume.")

    analysis_data = analyze_resume_ats(resolved_resume_text, job_description, target_role)

    # Save record if user logged in
    rec_id = "ats-guest-analysis"
    if current_user:
        ats_record = models.AtsAnalysis(
            user_id=current_user.id,
            target_role=target_role,
            job_description=job_description,
            ats_score=analysis_data.get("ats_score", 80),
            matched_keywords=analysis_data.get("matched_keywords", []),
            missing_keywords=analysis_data.get("missing_keywords", []),
            formatting_issues=analysis_data.get("formatting_issues", []),
            rewrite_suggestions=analysis_data.get("rewrite_suggestions", [])
        )
        db.add(ats_record)
        db.commit()
        db.refresh(ats_record)
        rec_id = ats_record.id

    return {
        "id": rec_id,
        "target_role": target_role,
        "ats_score": analysis_data.get("ats_score", 80),
        "matched_keywords": analysis_data.get("matched_keywords", []),
        "missing_keywords": analysis_data.get("missing_keywords", []),
        "formatting_issues": analysis_data.get("formatting_issues", []),
        "rewrite_suggestions": analysis_data.get("rewrite_suggestions", []),
        "summary_verdict": analysis_data.get("summary_verdict", "Analysis complete.")
    }

@router.get("/latest", response_model=schemas.AtsAnalysisResponse)
def get_latest_ats(
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=404, detail="No ATS analysis on file yet.")

    record = db.query(models.AtsAnalysis).filter(
        models.AtsAnalysis.user_id == current_user.id
    ).order_by(models.AtsAnalysis.created_at.desc()).first()

    if not record:
        raise HTTPException(status_code=404, detail="No ATS analysis on file yet.")

    return {
        "id": record.id,
        "target_role": record.target_role,
        "ats_score": record.ats_score,
        "matched_keywords": record.matched_keywords or [],
        "missing_keywords": record.missing_keywords or [],
        "formatting_issues": record.formatting_issues or [],
        "rewrite_suggestions": record.rewrite_suggestions or [],
        "summary_verdict": f"Scored {record.ats_score}/100 for {record.target_role}."
    }
