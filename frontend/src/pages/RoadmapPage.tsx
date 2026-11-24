import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  ExternalLink,
  GitBranch,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserCheck,
  Lock
} from 'lucide-react';
import { RoadmapResponse, MilestoneItem } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

interface RoadmapPageProps {
  onNavigate?: (route: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigate }) => {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalibrating, setRecalibrating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modal / input state for submitting GitHub link
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [githubUrlInput, setGithubUrlInput] = useState('');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveRoadmap();
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleStatus = async (m: MilestoneItem) => {
    const nextStatus = m.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.updateMilestone(m.id, nextStatus, m.project_github_url);
      await fetchRoadmap();
      setMessage({
        text: `Milestone Week ${m.week_number} marked as ${nextStatus}! Career Readiness Score updated.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveGithubUrl = async (mId: string) => {
    try {
      await api.updateMilestone(mId, 'completed', githubUrlInput);
      setEditingMilestoneId(null);
      setGithubUrlInput('');
      await fetchRoadmap();
      setMessage({
        text: 'Project GitHub repository submitted! Milestone marked completed.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalibrate = async () => {
    setRecalibrating(true);
    setMessage(null);
    try {
      const res = await api.recalibrateRoadmap();
      await fetchRoadmap();
      setMessage({
        text: res.message || 'Roadmap re-calibrated successfully based on recent progress!',
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setRecalibrating(false);
    }
  };

  const handleExport = () => {
    window.open(api.getExportUrl(), '_blank');
  };

  if (loading && !roadmap) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AiOrb size="md" pulse={true} />
          <span className="text-xs text-[#6F7782] font-normal">Loading your personalized roadmap...</span>
        </div>
      </div>
    );
  }

  const milestones = roadmap?.milestones || [];
  const filteredMilestones = milestones.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  // Group milestones by Phase
  const phases = ['Foundation', 'Intermediate', 'Capstone & Job-Ready'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>Adaptive Learning Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
            Target Career: {roadmap?.target_career || 'Not Set'}
          </h2>
          <p className="text-xs text-[#6F7782] mt-1 font-light">
            {roadmap?.completed_milestones} of {roadmap?.total_milestones} milestones completed ({roadmap?.progress_percentage}%)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={handleRecalibrate}
            disabled={recalibrating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] text-[#17191C] hover:bg-white border border-[#E4E5E9] transition disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>{recalibrating ? 'Re-calibrating...' : 'Update Plan (AI Adapt)'}</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roadmap</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-white border border-[#E4E5E9] rounded-2xl flex items-center gap-2.5 text-xs text-[#17191C] shadow-soft">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#536C8A]" />
          <span className="font-light">{message.text}</span>
        </div>
      )}

      {/* If roadmap is locked or milestones empty */}
      {roadmap?.is_locked || milestones.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-12 text-center max-w-2xl mx-auto shadow-soft">
          <AiOrb size="lg" pulse={true} className="mx-auto mb-4" />
          <h3 className="text-xl font-light text-[#17191C] mb-2">Adaptive Learning Roadmap is Protected</h3>
          <p className="text-xs sm:text-sm text-[#6F7782] max-w-md mx-auto mb-6 leading-relaxed font-light">
            {roadmap?.lock_reason ||
              'Your personalized week-by-week execution plan requires your skill assessment and career analysis to be completed first.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('/assessment')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Complete Skill Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('/careers')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] text-[#17191C] hover:bg-white border border-[#E4E5E9] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
              <span>2. AI Career Match & Chat</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'all'
                    ? 'bg-[#17191C] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                All Milestones ({milestones.length})
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'in_progress'
                    ? 'bg-[#536C8A] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'completed'
                    ? 'bg-[#536C8A] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Milestones grouped by phase */}
          <div className="space-y-8">
            {phases.map((phaseName) => {
              const phaseMilestones = filteredMilestones.filter((m) =>
                m.phase.toLowerCase().includes(phaseName.toLowerCase().split(' ')[0])
              );

              if (phaseMilestones.length === 0) return null;

              return (
                <div key={phaseName} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#536C8A]" />
                    <h3 className="text-xs font-normal uppercase tracking-wider text-[#6F7782]">
                      Phase: {phaseName}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {phaseMilestones.map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isInProgress = m.status === 'in_progress';

                      return (
                        <div
                          key={m.id}
                          className={`bg-white rounded-[22px] border p-6 transition-all duration-200 shadow-soft ${
                            isCompleted
                              ? 'border-[#E4E5E9] bg-white'
                              : isInProgress
                              ? 'border-[#536C8A] ring-1 ring-[#536C8A]/20'
                              : 'border-[#E4E5E9]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <button
                                onClick={() => handleToggleStatus(m)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                                  isCompleted
                                    ? 'bg-[#536C8A] text-white'
                                    : isInProgress
                                    ? 'border-2 border-[#536C8A] text-transparent hover:bg-[#536C8A]/10'
                                    : 'border-2 border-[#E4E5E9] text-transparent hover:bg-[#F9F9FB]'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-normal text-[#6F7782]">
                                    Week {m.week_number}
                                  </span>
                                  <h4 className="text-base font-normal text-[#17191C] leading-snug">
                                    {m.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-[#6F7782] font-light mt-1 max-w-2xl leading-relaxed">
                                  {m.description}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-normal px-3 py-1 rounded-full self-start shrink-0 border ${
                                isCompleted
                                  ? 'bg-[#536C8A]/10 text-[#536C8A] border-[#536C8A]/20'
                                  : isInProgress
                                  ? 'bg-[#F9F9FB] text-[#17191C] border-[#E4E5E9]'
                                  : 'bg-[#F9F9FB] text-[#6F7782] border-[#E4E5E9]'
                              }`}
                            >
                              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                            </span>
                          </div>

                          {/* Key Topics List */}
                          <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60">
                            <span className="text-[11px] font-normal text-[#6F7782] uppercase tracking-wider block mb-2">
                              Core Competencies:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {m.topics.map((top, tIdx) => {
                                const name = typeof top === 'string' ? top : top.name;
                                return (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9]"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-[#536C8A]" />
                                    <span>{name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Hands-On Mini-Project Specification */}
                          <div className="mt-4 p-4.5 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-normal text-[#17191C] flex items-center gap-1.5">
                                <FolderGit2 className="w-4 h-4 text-[#536C8A]" />
                                Hands-On Mini-Project Specification:
                              </span>
                              {m.project_github_url && (
                                <a
                                  href={m.project_github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#536C8A] hover:underline flex items-center gap-1 text-[11px] font-normal"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  View Submitted Repo
                                </a>
                              )}
                            </div>
                            <p className="text-[#6F7782] font-light leading-relaxed">
                              {m.project_prompt}
                            </p>

                            {/* GitHub Submission Input Box */}
                            {editingMilestoneId === m.id ? (
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  type="url"
                                  value={githubUrlInput}
                                  onChange={(e) => setGithubUrlInput(e.target.value)}
                                  placeholder="https://github.com/username/project-repo"
                                  className="px-3.5 py-2 text-xs rounded-xl border border-[#E4E5E9] bg-white w-full outline-none text-[#17191C] focus:border-[#536C8A]"
                                />
                                <button
                                  onClick={() => handleSaveGithubUrl(m.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-normal bg-[#536C8A] text-white shrink-0 hover:bg-[#193D50] transition shadow-soft"
                                >
                                  Submit Repo
                                </button>
                                <button
                                  onClick={() => setEditingMilestoneId(null)}
                                  className="px-3 py-2 rounded-xl text-xs text-[#6F7782] hover:text-[#17191C]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3 flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingMilestoneId(m.id);
                                    setGithubUrlInput(m.project_github_url || '');
                                  }}
                                  className="text-[#536C8A] hover:text-[#193D50] font-normal flex items-center gap-1 text-xs"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  {m.project_github_url ? 'Update GitHub Link' : 'Submit Project GitHub URL'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Curated Free Resources */}
                          {m.resource_links && m.resource_links.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[#6F7782] font-light">Curated Resources:</span>
                              {m.resource_links.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9] transition font-light"
                                >
                                  <span>{res.title}</span>
                                  <ExternalLink className="w-3 h-3 text-[#6F7782]" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
