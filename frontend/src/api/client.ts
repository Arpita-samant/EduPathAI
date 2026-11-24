const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://localhost:8000/api');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('edupath_token');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  loginDemo: () => request<any>('/auth/demo', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  parseResume: (formData: FormData) => request<any>('/profile/parse-resume', { method: 'POST', body: formData }),

  // Careers
  getCareerStatus: () => request<any>('/careers/recommend'),
  analyzeBestCareer: () => request<any>('/careers/analyze', { method: 'POST' }),
  chatCareerAdvisor: (career_title: string, message: string, history?: any[]) => 
    request<any>('/careers/chat', { method: 'POST', body: JSON.stringify({ career_title, message, history: history || [] }) }),
  getCareerRecommendations: () => request<any>('/careers/recommend'),
  selectCareer: (target_career: string) => request<any>('/careers/select', { method: 'POST', body: JSON.stringify({ target_career }) }),

  // Assessment
  getAssessmentQuestions: () => request<any>('/assessment/questions'),
  submitAssessmentAnalysis: (answers: Record<string, string>) => 
    request<any>('/assessment/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  generateAssessment: (domain: string) => request<any>('/assessment/generate', { method: 'POST', body: JSON.stringify({ domain }) }),
  submitAssessment: (domain: string, answers: Record<string, any>) => request<any>('/assessment/submit', { method: 'POST', body: JSON.stringify({ domain, answers }) }),
  getLatestAssessment: () => request<any>('/assessment/latest'),

  // Roadmap
  getActiveRoadmap: () => request<any>('/roadmap/active'),
  generateRoadmap: (target_career: string) => request<any>('/roadmap/generate', { method: 'POST', body: JSON.stringify({ target_career }) }),
  updateMilestone: (id: string, status: string, project_github_url?: string) => 
    request<any>(`/roadmap/milestones/${id}`, { method: 'PATCH', body: JSON.stringify({ status, project_github_url }) }),
  recalibrateRoadmap: (feedback_notes?: string) => request<any>('/roadmap/recalibrate', { method: 'POST', body: JSON.stringify({ feedback_notes }) }),
  getExportUrl: () => `${API_BASE}/roadmap/export`,

  // Jobs
  getJobMatches: (params?: { source?: string; domain?: string; role_type?: string; experience_level?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.source) searchParams.append('source', params.source);
    if (params?.domain) searchParams.append('domain', params.domain);
    if (params?.role_type) searchParams.append('role_type', params.role_type);
    if (params?.experience_level) searchParams.append('experience_level', params.experience_level);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request<any>(`/jobs/matches${qs ? `?${qs}` : ''}`);
  },
  getJobDetail: (id: string) => request<any>(`/jobs/${id}`),

  // Skill Gap
  getSkillGap: (targetIdentifier: string = 'default') => request<any>(`/skill-gap/${encodeURIComponent(targetIdentifier)}`),

  // ATS
  analyzeAts: (formData: FormData) => request<any>('/ats/analyze', { method: 'POST', body: formData }),
  getLatestAts: () => request<any>('/ats/latest'),

  // Resources
  getResources: (params?: { skill?: string; resource_type?: string; difficulty?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.skill) searchParams.append('skill', params.skill);
    if (params?.resource_type) searchParams.append('resource_type', params.resource_type);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request<any>(`/resources${qs ? `?${qs}` : ''}`);
  },

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),
};
