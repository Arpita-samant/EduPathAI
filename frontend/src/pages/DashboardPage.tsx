import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  FileText,
  Briefcase,
  GitPullRequest,
  BookOpen,
  MapPin,
  RefreshCw,
  UserCheck,
  Radio,
  Zap
} from 'lucide-react';
import { CareerReadinessRing } from '../components/common/CareerReadinessRing';
import { AiOrb } from '../components/common/AiOrb';
import { DashboardSummaryResponse, RoadmapResponse } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [sumRes, roadRes] = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getActiveRoadmap()
      ]);
      if (sumRes.status === 'fulfilled') {
        setData(sumRes.value);
      }
      if (roadRes.status === 'fulfilled') {
        setRoadmap(roadRes.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AiOrb size="md" pulse={true} />
          <span className="text-sm text-[#6F7782] font-normal">Synthesizing workspace metrics...</span>
        </div>
      </div>
    );
  }

  const summary = data || {
    career_readiness_score: 0,
    score_breakdown: {
      verified_assessment: 0,
      roadmap_progress: 0,
      resume_ats: 0,
      project_portfolio: 0
    },
    target_career: '',
    current_phase: 'Setup & Profiling',
    completed_milestones: 0,
    total_milestones: 0,
    weekly_streak: 0,
    verified_skills_count: 0,
    total_skills_count: 0,
    ats_score: 0,
    top_recommended_jobs: [],
    next_action_step: {
      title: 'Step 1: Complete Your Student Profile',
      description: 'Add your degree, technical skills, or upload your resume to unlock AI career guidance.',
      href: '/profile',
      cta: 'Complete Profile'
    }
  };

  const hasActiveRoadmap = roadmap && roadmap.milestones && roadmap.milestones.length > 0;
  const hasTargetCareer = Boolean(summary.target_career && summary.target_career.trim().length > 0);

  return (
    <div className="space-y-7">
      {/* Welcome Banner Card */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-soft">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <AiOrb size="md" pulse={true} className="mt-1 shrink-0" />
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-[26px] font-light text-[#17191C] tracking-tight">
                Welcome back, {user?.full_name || 'Explorer'}
              </h2>
              {user?.is_demo && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#C7B5D9]/20 text-[#536C8A] border border-[#C7B5D9]/30">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6F7782] mt-1 font-normal">
              Target Career:{' '}
              <span className="text-[#17191C] font-medium">
                {hasTargetCareer ? summary.target_career : 'Not Selected Yet'}
              </span>{' '}
              • Trajectory Phase:{' '}
              <span className="text-[#536C8A] font-medium">
                {hasTargetCareer ? summary.current_phase : 'Initial Setup'}
              </span>
            </p>
          </div>
        </div>

        {/* Next Action Step Card */}
        <div className="bg-[#F9F9FB] border border-[#E4E5E9] hover:border-[#C7B5D9]/50 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full lg:max-w-md transition-all duration-200">
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#536C8A] block mb-0.5">
              Suggested Next Step
            </span>
            <div className="text-[13px] font-medium text-[#17191C] truncate">
              {summary.next_action_step.title}
            </div>
            <div className="text-[11px] text-[#6F7782] truncate mt-0.5 font-normal">
              {summary.next_action_step.description}
            </div>
          </div>
          <button
            onClick={() => onNavigate(summary.next_action_step.href)}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
          >
            <span>{summary.next_action_step.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Level KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Unified Career Readiness Ring Card */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 sm:p-6 shadow-soft flex flex-col justify-between sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6F7782] uppercase tracking-wider">
                Readiness Score
              </span>
              <span className="text-[10px] font-mono text-[#536C8A] bg-[#EAEFF5] px-2 py-0.5 rounded-full border border-[#E4E5E9]">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#6F7782] mb-4 font-normal">
              Dynamic index synthesizing verified assessments, capstones, roadmap & resume ATS.
            </p>
          </div>

          <CareerReadinessRing
            score={summary.career_readiness_score}
            showBreakdown={true}
            breakdown={summary.score_breakdown}
          />
        </div>

        {/* KPI 2: Verified Skills */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-1">
              Verified Skills
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-light text-[#17191C] font-mono">
                {summary.verified_skills_count}
              </span>
              <span className="text-xs text-[#6F7782]">
                / {summary.total_skills_count} total
              </span>
            </div>
            <span className="text-[11px] text-[#6F7782] mt-1 inline-flex items-center gap-1">
              {summary.verified_skills_count > 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span className="text-[#536C8A] font-medium">Verified via mini-tasks</span>
                </>
              ) : (
                <span>No skills verified yet</span>
              )}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F9F9FB] text-[#536C8A] border border-[#E4E5E9] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Roadmap Progress */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-1">
              Roadmap Milestones
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-light text-[#17191C] font-mono">
                {summary.completed_milestones}
              </span>
              <span className="text-xs text-[#6F7782]">
                / {summary.total_milestones > 0 ? `${summary.total_milestones} wks` : '0 wks'}
              </span>
            </div>
            <span className="text-[11px] text-[#6F7782] mt-1 block">
              {summary.total_milestones > 0
                ? `Phase: ${summary.current_phase}`
                : 'Locked until career selection'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F9F9FB] text-[#536C8A] border border-[#E4E5E9] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Weekly Streak */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-1">
              Activity Velocity
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-light text-[#17191C] font-mono">
                {summary.weekly_streak}
              </span>
              <span className="text-xs text-[#6F7782]">wks active</span>
            </div>
            <span className="text-[11px] text-[#6F7782] mt-1 inline-flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${summary.weekly_streak > 0 ? 'text-[#C98A2C]' : 'text-[#6F7782]'}`} />
              {summary.weekly_streak > 0 ? (
                <span className="text-[#C98A2C] font-medium">Active streak</span>
              ) : (
                <span>Consistent velocity</span>
              )}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F9F9FB] text-[#C98A2C] border border-[#E4E5E9] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 5: ATS Resume Score */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-1">
              Resume ATS Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-light text-[#17191C] font-mono">
                {summary.ats_score > 0 ? summary.ats_score : 0}
              </span>
              <span className="text-xs text-[#6F7782]">/ 100</span>
            </div>
            <span className="text-[11px] text-[#6F7782] mt-1 block">
              {summary.ats_score > 0 ? 'Audited against live JDs' : 'No resume scan yet'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F9F9FB] text-[#536C8A] border border-[#E4E5E9] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 shadow-soft sm:col-span-2 lg:col-span-2 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-2.5">
            Guidance Pipeline Shortcuts
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onNavigate('/profile')}
              className="p-3 rounded-xl border border-[#E4E5E9] hover:bg-[#F9F9FB] hover:border-[#A8B9D0]/50 text-xs font-normal text-[#17191C] text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#536C8A]" />
              <span>Smart Profile</span>
            </button>
            <button
              onClick={() => onNavigate('/assessment')}
              className="p-3 rounded-xl border border-[#E4E5E9] hover:bg-[#F9F9FB] hover:border-[#A8B9D0]/50 text-xs font-normal text-[#17191C] text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C7B5D9]" />
              <span>Skill Test</span>
            </button>
            <button
              onClick={() => onNavigate('/careers')}
              className="p-3 rounded-xl border border-[#E4E5E9] hover:bg-[#F9F9FB] hover:border-[#A8B9D0]/50 text-xs font-normal text-[#17191C] text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#536C8A]" />
              <span>AI Match & Chat</span>
            </button>
            <button
              onClick={() => onNavigate('/jobs')}
              className="p-3 rounded-xl border border-[#E4E5E9] hover:bg-[#F9F9FB] hover:border-[#A8B9D0]/50 text-xs font-normal text-[#17191C] text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#536C8A]" />
              <span>Live Roles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two Column Row: Active Roadmap & Real-Time Job Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Learning Roadmap */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-normal text-[#17191C]">
                  Active Learning Roadmap
                </h3>
                <p className="text-xs text-[#6F7782] mt-0.5">
                  {hasActiveRoadmap
                    ? `Curriculum for ${roadmap?.target_career} (${roadmap?.completed_milestones}/${roadmap?.total_milestones} milestones done)`
                    : 'Personalized execution plan unlocked by AI career matching'}
                </p>
              </div>

              {hasActiveRoadmap && (
                <button
                  onClick={() => onNavigate('/roadmap')}
                  className="text-xs font-medium text-[#536C8A] hover:text-[#193D50] flex items-center gap-1"
                >
                  Full Roadmap
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasActiveRoadmap ? (
              <div className="space-y-3">
                {roadmap.milestones.slice(0, 3).map((m) => {
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in_progress';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isInProgress
                          ? 'border-[#536C8A]/40 bg-[#F9F9FB]'
                          : 'border-[#E4E5E9] bg-white opacity-85'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-medium ${
                            isCompleted
                              ? 'bg-[#536C8A] text-white'
                              : isInProgress
                              ? 'bg-[#193D50] text-white'
                              : 'bg-[#F9F9FB] border border-[#E4E5E9] text-[#6F7782]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : m.week_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#6F7782]">
                              Week {m.week_number}
                            </span>
                            <span className="text-xs font-medium text-[#17191C]">{m.title}</span>
                          </div>
                          <p className="text-xs text-[#6F7782] mt-0.5 line-clamp-1">{m.description}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                          isCompleted
                            ? 'text-[#536C8A] bg-[#C7B5D9]/15 border-[#C7B5D9]/30'
                            : isInProgress
                            ? 'text-[#193D50] bg-[#EAEFF5] border-[#E4E5E9]'
                            : 'text-[#6F7782] bg-[#F9F9FB] border-[#E4E5E9]'
                        }`}
                      >
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 px-4 text-center border border-dashed border-[#E4E5E9] rounded-2xl bg-[#F9F9FB]/60 my-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E4E5E9] text-[#536C8A] flex items-center justify-center mx-auto mb-3 shadow-soft">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-normal text-[#17191C] mb-1">
                  Roadmap Locked Until Career Selection
                </h4>
                <p className="text-xs text-[#6F7782] max-w-md mx-auto mb-5 leading-relaxed font-normal">
                  Complete your skill assessment and let AI select your optimal career path to unlock your week-by-week curriculum.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => onNavigate('/assessment')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Take Skill Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('/careers')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-white border border-[#E4E5E9] text-[#17191C] hover:bg-[#F9F9FB] transition cursor-pointer"
                  >
                    <span>Career Match & Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Real-Time Live Job Roles */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-normal text-[#17191C]">
                  Live Opportunities
                </h3>
                <p className="text-xs text-[#6F7782] mt-0.5">
                  Multi-API feed matched to your background
                </p>
              </div>
              <button
                onClick={() => onNavigate('/jobs')}
                className="text-xs font-medium text-[#536C8A] hover:text-[#193D50] flex items-center gap-1 cursor-pointer"
              >
                Browse All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {summary.top_recommended_jobs.length > 0 ? (
              <div className="space-y-3">
                {summary.top_recommended_jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onNavigate('/jobs')}
                    className="p-3.5 rounded-2xl border border-[#E4E5E9] hover:border-[#A8B9D0]/50 hover:bg-[#F9F9FB] cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {job.source && (
                          <span className="text-[9px] font-medium uppercase tracking-wider text-[#536C8A] bg-[#F9F9FB] px-1.5 py-0.5 rounded border border-[#E4E5E9] inline-block mb-1">
                            {job.source}
                          </span>
                        )}
                        <h4 className="text-xs font-medium text-[#17191C] leading-snug">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-[#6F7782] mt-0.5">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-normal text-[#193D50] bg-[#EAEFF5] px-2 py-0.5 rounded-md border border-[#E4E5E9] shrink-0">
                        {job.match_percentage}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {job.required_skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 text-center border border-dashed border-[#E4E5E9] rounded-2xl bg-[#F9F9FB]/60 my-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E4E5E9] text-[#6F7782] flex items-center justify-center mx-auto mb-3 shadow-soft">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-normal text-[#17191C] mb-1">
                  Add Skills to Stream Live Matches
                </h4>
                <p className="text-xs text-[#6F7782] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                  Live postings from Jobicy, Arbeitnow, Himalayas and Adzuna match dynamically against your verified competencies.
                </p>
                <button
                  onClick={() => onNavigate('/profile')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
                >
                  <span>Complete Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
