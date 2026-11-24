from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    user = models.User(
        email=user_in.email,
        password_hash=auth.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_demo=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize empty student profile
    profile = models.StudentProfile(
        user_id=user.id,
        education_level="Undergraduate",
        degree="",
        major="",
        gpa=0.0,
        completeness_score=0,
        technical_skills=[],
        soft_skills=[],
        projects=[],
        certifications=[],
        interests=[],
        career_goals="",
        target_career=""
    )
    db.add(profile)
    db.commit()

    access_token = auth.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    access_token = auth.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/demo", response_model=schemas.Token)
def login_demo(db: Session = Depends(get_db)):
    """One-click instant login for the seeded realistic student demo profile."""
    demo_user = db.query(models.User).filter(models.User.email == "demo@edupath.ai").first()
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user not found. Database may need initialization."
        )
    access_token = auth.create_access_token(data={"sub": demo_user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": demo_user
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
