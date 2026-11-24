import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    ats_analyses = relationship("AtsAnalysis", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    
    education_level = Column(String(100), default="Undergraduate")
    degree = Column(String(150), default="")
    major = Column(String(150), default="")
    graduation_year = Column(Integer, default=2026)
    gpa = Column(Float, default=0.0)
    
    # JSON structured columns
    technical_skills = Column(JSON, default=list)  # list of {name, proficiency: 1-5, verified: bool, score: int}
    soft_skills = Column(JSON, default=list)       # list of strings
    certifications = Column(JSON, default=list)    # list of {name, issuer, year, url}
    projects = Column(JSON, default=list)          # list of {title, tech_stack, github_link, live_link, description}
    interests = Column(JSON, default=list)         # list of strings
    career_goals = Column(Text, default="")
    raw_resume_text = Column(Text, default="")
    completeness_score = Column(Integer, default=0)
    target_career = Column(String(150), default="")
    best_fit_skill = Column(String(150), default="")
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    domain = Column(String(100), nullable=False)
    
    questions = Column(JSON, default=list)         # [{id, question, options, correct_index, explanation, difficulty, type}]
    answers = Column(JSON, default=dict)           # {question_id: selected_index/answer}
    
    skill_score = Column(Float, default=0.0)       # 0 - 100
    interest_score = Column(Float, default=0.0)    # 0 - 100
    suitability_score = Column(Float, default=0.0) # 0 - 100
    ai_explanation = Column(JSON, default=dict)    # {breakdown, strengths, recommendations, fit_analysis}
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_career = Column(String(150), nullable=False)
    estimated_weeks = Column(Integer, default=12)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    milestones = relationship("RoadmapMilestone", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapMilestone.week_number")
    user = relationship("User", back_populates="roadmaps")

class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id"), nullable=False)
    
    phase = Column(String(100), default="Foundation") # Foundation, Intermediate, Capstone / Job-Ready
    week_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    topics = Column(JSON, default=list)               # list of topic strings or {name, completed: bool}
    project_prompt = Column(Text, default="")
    project_github_url = Column(String(255), default="")
    resource_links = Column(JSON, default=list)       # list of {title, url, type}
    status = Column(String(50), default="pending")    # pending, in_progress, completed
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="milestones")

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), nullable=False)
    company = Column(String(150), nullable=False)
    domain = Column(String(100), nullable=False)
    role_type = Column(String(50), default="Full-Time") # Internship, Full-Time, Apprenticeship
    experience_level = Column(String(50), default="Entry-Level") # Entry-Level, 0-2 Years, Graduate
    required_skills = Column(JSON, default=list)       # list of strings
    description = Column(Text, default="")
    location = Column(String(100), default="Remote / Hybrid")
    salary_range = Column(String(100), default="$75,000 - $95,000")
    apply_url = Column(String(255), default="https://example.com/careers")

class AtsAnalysis(Base):
    __tablename__ = "ats_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_role = Column(String(150), nullable=False)
    job_description = Column(Text, nullable=False)
    ats_score = Column(Integer, default=0)            # 0 - 100
    matched_keywords = Column(JSON, default=list)     # list of strings
    missing_keywords = Column(JSON, default=list)     # list of strings
    formatting_issues = Column(JSON, default=list)    # list of {issue, severity, recommendation}
    rewrite_suggestions = Column(JSON, default=list)  # list of {original_bullet, improved_bullet, reason}
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ats_analyses")

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    resource_type = Column(String(100), default="Free Course") # Free Course, Documentation, GitHub Repo, Tutorial, Practice Platform
    skill_tag = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    is_free = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    provider = Column(String(100), default="Open Source / Community")
