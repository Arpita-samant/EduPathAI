from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_demo: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Profile Schemas ---
class TechnicalSkill(BaseModel):
    name: str
    proficiency: int = Field(ge=1, le=5, default=3) # 1: Beginner, 5: Expert
    verified: bool = False
    score: Optional[int] = None

class ProjectItem(BaseModel):
    title: str
    tech_stack: List[str] = []
    github_link: Optional[str] = ""
    live_link: Optional[str] = ""
    description: str = ""

class CertificationItem(BaseModel):
    name: str
    issuer: str
    year: Optional[int] = 2024
    url: Optional[str] = ""

class ProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    technical_skills: Optional[List[TechnicalSkill]] = None
    soft_skills: Optional[List[str]] = None
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None
    interests: Optional[List[str]] = None
    career_goals: Optional[str] = None
    target_career: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    education_level: str
    degree: str
    major: str
    graduation_year: int
    gpa: float
    technical_skills: List[Dict[str, Any]]
    soft_skills: List[str]
    certifications: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    interests: List[str]
    career_goals: str
    completeness_score: int
    target_career: str
    updated_at: datetime
    class Config:
        from_attributes = True

class ResumeParseResponse(BaseModel):
    extracted_profile: ProfileUpdate
    raw_text_length: int
    message: str

# --- Career Recommendation Schemas ---
class CareerSuitabilityBreakdown(BaseModel):
    academic_fit: int # 0-100
    verified_skill_score: int # 0-100
    interest_alignment: int # 0-100
    market_demand: int # 0-100
    overall_match: int # 0-100

class CareerRecommendationItem(BaseModel):
    id: str
    title: str
    match_percentage: int
    market_demand: str # "High Growth (+28%)", "Very High Demand"
    avg_entry_salary: str # "$85,000 - $110,000"
    description: str
    why_it_matches: str
    suitability_breakdown: CareerSuitabilityBreakdown
    key_required_skills: List[str]
    recommended_path: bool = False

# --- Career Recommendation & Chat Schemas ---
class SingleCareerRecommendation(BaseModel):
    title: str # ONLY ONE career selected!
    match_percentage: int
    tagline: str
    description: str
    why_it_fits: str
    primary_skill_alignment: str
    suitability_breakdown: Dict[str, int]
    market_outlook: Dict[str, str]
    key_skills_to_master: List[str]
    day_in_the_life: str
    roadmap_unlocked: bool

class CareerRecommendationResponse(BaseModel):
    career: Optional[SingleCareerRecommendation] = None
    has_analyzed: bool = False
    best_fit_skill: str = ""
    profile_summary: str = ""

class CareerSelectRequest(BaseModel):
    target_career: str

class CareerChatRequest(BaseModel):
    career_title: str
    message: str
    history: List[Dict[str, str]] = []

class CareerChatResponse(BaseModel):
    reply: str
    suggested_questions: List[str]

# --- Assessment Schemas ---
class AssessmentQuestionItem(BaseModel):
    id: int
    category: str # "interest", "technical", "soft_skills", "work_style", "learning_goals"
    title: str
    question: str
    suggested_options: List[str]
    allow_custom: bool = True
    placeholder: str = "Type your own custom answer or click a suggested option..."

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[str, str] # {question_id: answer_text}

class AssessmentAnalysisResponse(BaseModel):
    selected_best_fit_skill: str # ONLY ONE SKILL SELECTED
    skill_category: str
    confidence_score: int
    why_this_skill: str
    strengths: List[str]
    growth_areas: List[str]
    analysis_summary: str

# --- Best-Fit Schemas ---
class DomainComparisonItem(BaseModel):
    domain: str
    suitability_score: float
    verified_skill: float
    interest_alignment: float
    academic_fit: float
    self_reported_skill: float
    goal_alignment: float
    match_tag: str
    pros: List[str]
    cons: List[str]

class BestFitResponse(BaseModel):
    recommended_domain: str
    rationale: str
    comparisons: List[DomainComparisonItem]
    radar_data: List[Dict[str, Any]]

# --- Roadmap Schemas ---
class RoadmapGenerateRequest(BaseModel):
    target_career: str

class MilestoneTopic(BaseModel):
    name: str
    completed: bool = False

class MilestoneResource(BaseModel):
    title: str
    url: str
    type: str = "Tutorial"

class MilestoneItem(BaseModel):
    id: str
    phase: str
    week_number: int
    title: str
    description: str
    topics: List[Dict[str, Any]]
    project_prompt: str
    project_github_url: Optional[str] = ""
    resource_links: List[Dict[str, Any]]
    status: str
    completed_at: Optional[datetime] = None

class RoadmapResponse(BaseModel):
    id: str
    target_career: str
    estimated_weeks: int
    is_active: bool
    milestones: List[MilestoneItem]
    completed_milestones: int
    total_milestones: int
    progress_percentage: int
    is_locked: bool = False
    lock_reason: Optional[str] = ""

class MilestoneStatusUpdate(BaseModel):
    status: str # "pending", "in_progress", "completed"
    project_github_url: Optional[str] = None

class RecalibrateRequest(BaseModel):
    feedback_notes: Optional[str] = None

# --- Job Matching Schemas ---
class JobSourceStatus(BaseModel):
    name: str # "Jobicy", "Arbeitnow", "Himalayas", "Adzuna"
    status: str # "Active (Live)", "Needs App ID"
    count: int
    url: str

class JobMatchItem(BaseModel):
    id: str
    title: str
    company: str
    domain: str
    role_type: str
    experience_level: str
    location: str
    salary_range: str
    match_percentage: int
    required_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    description: str
    apply_url: str
    source: Optional[str] = "Jobicy"
    company_logo: Optional[str] = ""
    posted_at: Optional[Any] = ""

class JobsListResponse(BaseModel):
    jobs: List[JobMatchItem]
    total: int
    active_sources: Optional[List[JobSourceStatus]] = []

# --- Skill Gap Schemas ---
class SkillGapItem(BaseModel):
    skill: str
    status: str # "mastered", "partial", "missing"
    proficiency: int # 0 to 5
    verified: bool
    importance: str # "Critical", "Recommended", "Optional"
    resource_recommendation: Optional[Dict[str, Any]] = None

class SkillGapResponse(BaseModel):
    target_role: str
    readiness_percentage: int
    mastered: List[SkillGapItem]
    partial: List[SkillGapItem]
    missing: List[SkillGapItem]
    priority_action_plan: List[str]

# --- ATS Schemas ---
class FormattingIssue(BaseModel):
    issue: str
    severity: str # "Low", "Medium", "High"
    recommendation: str

class RewriteSuggestion(BaseModel):
    original_bullet: str
    improved_bullet: str
    reason: str

class AtsAnalyzeRequest(BaseModel):
    target_role: str
    job_description: str
    resume_text: Optional[str] = None

class AtsAnalysisResponse(BaseModel):
    id: str
    target_role: str
    ats_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    formatting_issues: List[FormattingIssue]
    rewrite_suggestions: List[RewriteSuggestion]
    summary_verdict: str

# --- Resources Schemas ---
class LearningResourceItem(BaseModel):
    id: str
    title: str
    url: str
    resource_type: str
    skill_tag: str
    difficulty: str
    is_free: bool
    rating: float
    provider: str

class LearningResourcesListResponse(BaseModel):
    resources: List[LearningResourceItem]
    total: int
    prioritized_skills: List[str]

# --- Unified Dashboard KPI Schemas ---
class DashboardSummaryResponse(BaseModel):
    career_readiness_score: int # 0-100 unified score
    score_breakdown: Dict[str, Any]
    target_career: str
    current_phase: str
    completed_milestones: int
    total_milestones: int
    weekly_streak: int
    verified_skills_count: int
    total_skills_count: int
    ats_score: int
    top_recommended_jobs: List[JobMatchItem]
    next_action_step: Dict[str, str]
