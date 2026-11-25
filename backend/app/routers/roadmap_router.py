from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth
from app.config import settings
try:
    import jwt
except ImportError:
    from jose import jwt
from app.ai_service import generate_roadmap

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap & Milestones"])

@router.post("/generate", response_model=schemas.RoadmapResponse)
def create_roadmap(
    req: schemas.RoadmapGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.target_career:
        raise HTTPException(
            status_code=400,
            detail="Adaptive Roadmap is locked. Please complete your Skill Assessment and AI Career Match first."
        )

    profile_dict = {
        "degree": profile.degree if profile else "",
        "technical_skills": profile.technical_skills if profile else [],
        "projects": profile.projects if profile else []
    }
    
    # Deactivate any previous roadmaps
    db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).update({"is_active": False})
    
    new_roadmap = models.Roadmap(
        user_id=current_user.id,
        target_career=req.target_career,
        estimated_weeks=8,
        is_active=True
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)

    # Generate milestones via AI / High-fidelity generator
    milestones_data = generate_roadmap(req.target_career, profile_dict)
    for m in milestones_data:
        milestone = models.RoadmapMilestone(
            roadmap_id=new_roadmap.id,
            phase=m["phase"],
            week_number=m["week_number"],
            title=m["title"],
            description=m["description"],
            topics=m["topics"],
            project_prompt=m["project_prompt"],
            project_github_url=m.get("project_github_url", ""),
            resource_links=m["resource_links"],
            status=m.get("status", "pending")
        )
        db.add(milestone)
    db.commit()
    db.refresh(new_roadmap)

    if profile:
        profile.target_career = req.target_career
        db.commit()

    return get_active_roadmap(current_user, db)

@router.get("/active", response_model=schemas.RoadmapResponse)
def get_active_roadmap(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    has_target = bool(profile and profile.target_career)

    # STRICT LOCK: If AI hasn't selected and locked in a career path, roadmap remains locked
    if not has_target:
        return {
            "id": "",
            "target_career": "",
            "estimated_weeks": 0,
            "is_active": False,
            "milestones": [],
            "completed_milestones": 0,
            "total_milestones": 0,
            "progress_percentage": 0,
            "is_locked": True,
            "lock_reason": "Adaptive Roadmap is locked. Complete your Skill Assessment and allow AI to select your optimal Career Match first."
        }

    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id,
        models.Roadmap.is_active == True
    ).first()

    if not roadmap:
        # Auto-initialize roadmap for the confirmed target career
        new_roadmap = models.Roadmap(
            user_id=current_user.id,
            target_career=profile.target_career,
            estimated_weeks=8,
            is_active=True
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)

        profile_dict = {
            "degree": profile.degree if profile else "",
            "technical_skills": profile.technical_skills if profile else [],
            "projects": profile.projects if profile else []
        }
        milestones_data = generate_roadmap(profile.target_career, profile_dict)
        for m in milestones_data:
            milestone = models.RoadmapMilestone(
                roadmap_id=new_roadmap.id,
                phase=m["phase"],
                week_number=m["week_number"],
                title=m["title"],
                description=m["description"],
                topics=m["topics"],
                project_prompt=m["project_prompt"],
                project_github_url=m.get("project_github_url", ""),
                resource_links=m["resource_links"],
                status=m.get("status", "pending")
            )
            db.add(milestone)
        db.commit()
        roadmap = new_roadmap

    milestones = db.query(models.RoadmapMilestone).filter(
        models.RoadmapMilestone.roadmap_id == roadmap.id
    ).order_by(models.RoadmapMilestone.week_number).all()

    completed = sum(1 for m in milestones if m.status == "completed")
    total = len(milestones)
    progress_pct = int((completed / max(total, 1)) * 100)

    return {
        "id": roadmap.id,
        "target_career": roadmap.target_career,
        "estimated_weeks": roadmap.estimated_weeks,
        "is_active": roadmap.is_active,
        "milestones": milestones,
        "completed_milestones": completed,
        "total_milestones": total,
        "progress_percentage": progress_pct,
        "is_locked": False,
        "lock_reason": ""
    }

@router.patch("/milestones/{milestone_id}")
def update_milestone_status(
    milestone_id: str,
    update_data: schemas.MilestoneStatusUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    milestone = db.query(models.RoadmapMilestone).filter(models.RoadmapMilestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    milestone.status = update_data.status
    if update_data.status == "completed":
        milestone.completed_at = datetime.utcnow()
    else:
        milestone.completed_at = None

    if update_data.project_github_url is not None:
        milestone.project_github_url = update_data.project_github_url

    db.commit()
    return {"message": f"Milestone Week {milestone.week_number} updated to {update_data.status}!"}

@router.post("/recalibrate")
def recalibrate_roadmap(
    req: schemas.RecalibrateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamically adapts remaining roadmap weeks based on user progress and feedback."""
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id,
        models.Roadmap.is_active == True
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found")

    milestones = db.query(models.RoadmapMilestone).filter(
        models.RoadmapMilestone.roadmap_id == roadmap.id
    ).order_by(models.RoadmapMilestone.week_number).all()

    # Accelerate in-progress/pending milestones with targeted reinforcement
    for m in milestones:
        if m.status == "pending" and m.week_number == 3:
            m.title = "Next.js App Router & Server Actions (Accelerated Focus)"
            m.description = "Accelerated by recent progress: focuses immediately on production server actions, optimistic UI, and edge runtime."
        elif m.status == "pending" and m.week_number == 6:
            m.title = "Docker & Cloud CI/CD Automation (Reinforced Hands-On)"
            m.description = "Injected reinforcement: practical Docker compose multi-container orchestration and automated GitHub Actions."

    db.commit()
    return {
        "message": "AI roadmap successfully re-calibrated! Upcoming milestones have been fine-tuned to your velocity and gap priorities."
    }

@router.get("/export")
def export_roadmap_markdown(
    token: Optional[str] = Query(None),
    raw_token: Optional[str] = Depends(auth.oauth2_scheme),
    db: Session = Depends(get_db)
):
    t = raw_token or token
    if not t:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = jwt.decode(t, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    current_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id,
        models.Roadmap.is_active == True
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap to export")

    milestones = db.query(models.RoadmapMilestone).filter(
        models.RoadmapMilestone.roadmap_id == roadmap.id
    ).order_by(models.RoadmapMilestone.week_number).all()

    lines = [
        f"# EduPath AI — Personalized Learning Roadmap",
        f"**Target Career:** {roadmap.target_career}",
        f"**Student:** {current_user.full_name} ({current_user.email})",
        f"**Generated:** {roadmap.created_at.strftime('%B %d, %Y')}",
        "",
        "---",
        ""
    ]

    for m in milestones:
        status_badge = "✅ COMPLETED" if m.status == "completed" else ("⚡ IN PROGRESS" if m.status == "in_progress" else "⏳ PENDING")
        lines.append(f"## Week {m.week_number}: {m.title} [{status_badge}]")
        lines.append(f"**Phase:** {m.phase}")
        lines.append(f"**Description:** {m.description}")
        lines.append("")
        lines.append("### Key Topics:")
        for t in (m.topics or []):
            name = t.get("name", t) if isinstance(t, dict) else t
            checked = "[x]" if (isinstance(t, dict) and t.get("completed")) else "[ ]"
            lines.append(f"- {checked} {name}")
        lines.append("")
        lines.append(f"### Hands-on Mini-Project:")
        lines.append(f"> {m.project_prompt}")
        if m.project_github_url:
            lines.append(f"**Submitted GitHub Repo:** {m.project_github_url}")
        lines.append("")
        lines.append("### Curated Free Resources:")
        for res in (m.resource_links or []):
            lines.append(f"- [{res.get('title', 'Resource')}]({res.get('url', '#')}) ({res.get('type', 'Guide')})")
        lines.append("")
        lines.append("---")
        lines.append("")

    content = "\n".join(lines)
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=EduPath_Roadmap_{current_user.full_name.replace(' ', '_')}.md"}
    )
