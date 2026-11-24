export interface User {
  id: string;
  email: string;
  full_name: string;
  is_demo: boolean;
  created_at: string;
}

export interface TechnicalSkill {
  name: string;
  proficiency: number; // 1 to 5
  verified?: boolean;
  score?: number;
}

export interface ProjectItem {
  title: string;
  tech_stack: string[];
  github_link?: string;
  live_link?: string;
  description: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: number;
  url?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  education_level: string;
  degree: string;
  major: string;
  graduation_year: number;
  gpa: number;
  technical_skills: TechnicalSkill[];
  soft_skills: string[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  interests: string[];
  career_goals: string;
  completeness_score: number;
  target_career: string;
  best_fit_skill?: string;
  updated_at: string;
}

export interface CareerSuitabilityBreakdown {
  academic_fit: number;
  verified_skill_score: number;
  interest_alignment: number;
  market_demand: number;
  overall_match: number;
}

export interface SingleCareerRecommendation {
  title: string;
  match_percentage: number;
  tagline: string;
  description: string;
  why_it_fits: string;
  primary_skill_alignment: string;
  suitability_breakdown: Record<string, number>;
  market_outlook: {
    demand_level: string;
    avg_salary: string;
    job_availability: string;
  };
  key_skills_to_master: string[];
  day_in_the_life: string;
  roadmap_unlocked: boolean;
}

export interface CareerRecommendationResponse {
  career: SingleCareerRecommendation | null;
  has_analyzed: boolean;
  best_fit_skill: string;
  profile_summary: string;
}

export interface CareerChatRequest {
  career_title: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export interface CareerChatResponse {
  reply: string;
  suggested_questions: string[];
}

export interface AssessmentQuestionItem {
  id: number;
  category: string;
  title: string;
  question: string;
  suggested_options: string[];
  allow_custom: boolean;
  placeholder?: string;
}

export interface AssessmentAnalysisResponse {
  selected_best_fit_skill: string;
  skill_category: string;
  confidence_score: number;
  why_this_skill: string;
  strengths: string[];
  growth_areas: string[];
  analysis_summary: string;
}

export interface CareerRecommendationItem {
  id: string;
  title: string;
  match_percentage: number;
  market_demand: string;
  avg_entry_salary: string;
  description: string;
  why_it_matches: string;
  suitability_breakdown: CareerSuitabilityBreakdown;
  key_required_skills: string[];
  recommended_path: boolean;
}

export interface AssessmentQuestion {
  id: number;
  type: string;
  difficulty: string;
  domain: string;
  question: string;
  options: string[];
}

export interface AssessmentScoreResult {
  domain: string;
  skill_score: number;
  interest_score: number;
  suitability_score: number;
  total_questions: number;
  correct_count: number;
  strengths: string[];
  weaknesses: string[];
  ai_feedback: string;
  updated_skills: TechnicalSkill[];
}

export interface DomainComparisonItem {
  domain: string;
  suitability_score: number;
  verified_skill: number;
  interest_alignment: number;
  academic_fit: number;
  self_reported_skill: number;
  goal_alignment: number;
  match_tag: string;
  pros: string[];
  cons: string[];
}

export interface BestFitResponse {
  recommended_domain: string;
  rationale: string;
  comparisons: DomainComparisonItem[];
  radar_data: any[];
}

export interface MilestoneTopic {
  name: string;
  completed?: boolean;
}

export interface MilestoneResource {
  title: string;
  url: string;
  type: string;
}

export interface MilestoneItem {
  id: string;
  phase: string;
  week_number: number;
  title: string;
  description: string;
  topics: MilestoneTopic[];
  project_prompt: string;
  project_github_url?: string;
  resource_links: MilestoneResource[];
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
}

export interface RoadmapResponse {
  id: string;
  target_career: string;
  estimated_weeks: number;
  is_active: boolean;
  milestones: MilestoneItem[];
  completed_milestones: number;
  total_milestones: number;
  progress_percentage: number;
  is_locked?: boolean;
  lock_reason?: string;
}

export interface JobSourceStatus {
  name: string;
  status: string;
  count: number;
  url: string;
}

export interface JobMatchItem {
  id: string;
  title: string;
  company: string;
  domain: string;
  role_type: string;
  experience_level: string;
  location: string;
  salary_range: string;
  match_percentage: number;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  description: string;
  apply_url: string;
  source?: string;
  company_logo?: string;
  posted_at?: string;
}

export interface JobsListResponse {
  jobs: JobMatchItem[];
  total: number;
  active_sources?: JobSourceStatus[];
}

export interface SkillGapItem {
  skill: string;
  status: 'mastered' | 'partial' | 'missing';
  proficiency: number;
  verified: boolean;
  importance: string;
  resource_recommendation?: {
    title: string;
    url: string;
    type: string;
  };
}

export interface SkillGapResponse {
  target_role: string;
  readiness_percentage: number;
  mastered: SkillGapItem[];
  partial: SkillGapItem[];
  missing: SkillGapItem[];
  priority_action_plan: string[];
}

export interface FormattingIssue {
  issue: string;
  severity: string;
  recommendation: string;
}

export interface RewriteSuggestion {
  original_bullet: string;
  improved_bullet: string;
  reason: string;
}

export interface AtsAnalysisResponse {
  id: string;
  target_role: string;
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_issues: FormattingIssue[];
  rewrite_suggestions: RewriteSuggestion[];
  summary_verdict: string;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  url: string;
  resource_type: string;
  skill_tag: string;
  difficulty: string;
  is_free: boolean;
  rating: number;
  provider: string;
}

export interface DashboardSummaryResponse {
  career_readiness_score: number;
  score_breakdown: {
    verified_assessment: number;
    roadmap_progress: number;
    resume_ats: number;
    project_portfolio: number;
  };
  target_career: string;
  current_phase: string;
  completed_milestones: number;
  total_milestones: number;
  weekly_streak: number;
  verified_skills_count: number;
  total_skills_count: number;
  ats_score: number;
  top_recommended_jobs: JobMatchItem[];
  next_action_step: {
    title: string;
    description: string;
    href: string;
    cta: string;
  };
}
