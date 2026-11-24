import React, { useEffect, useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { SkillGapResponse } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

interface SkillGapPageProps {
  onNavigate: (route: string) => void;
  targetRoleIdentifier?: string;
  onFilterResourceBySkill?: (skill: string) => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({
  onNavigate,
  targetRoleIdentifier = 'default',
  onFilterResourceBySkill
}) => {
  const [selectedRole, setSelectedRole] = useState(targetRoleIdentifier);
  const [data, setData] = useState<SkillGapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSkillGap = async (roleId: string) => {
    setLoading(true);
    try {
      const res = await api.getSkillGap(roleId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap(selectedRole);
  }, [selectedRole]);

  const handleViewResource = (skill: string) => {
    if (onFilterResourceBySkill) {
      onFilterResourceBySkill(skill);
    }
    onNavigate('/resources');
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AiOrb size="md" pulse={true} />
          <span className="text-xs text-[#6F7782] font-normal">Analyzing industry skill gaps against live expectations...</span>
        </div>
      </div>
    );
  }

  const gapData = data || {
    target_role: 'Full-Stack Software Engineering',
    readiness_percentage: 75,
    mastered: [],
    partial: [],
    missing: [],
    priority_action_plan: []
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
            <GitPullRequest className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>Industry Skill Gap Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
            Skill Gap Breakdown: {gapData.target_role}
          </h2>
          <p className="text-xs text-[#6F7782] mt-1 font-light">
            Compare your verified profile against industry-standard requirements for entry-level and junior positions.
          </p>
        </div>

        {/* Role Selector & Overall Readiness */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full md:w-auto">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-normal uppercase tracking-wider text-[#6F7782] block mb-0.5">
              Role Readiness
            </span>
            <div className="flex items-center gap-2">
              <AiOrb size="xs" />
              <span className="font-mono text-2xl font-light text-[#17191C]">
                {gapData.readiness_percentage}%
              </span>
            </div>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-[#E4E5E9] text-xs font-normal bg-white text-[#17191C] outline-none shadow-soft"
          >
            <option value="default">Default Target Career</option>
            <option value="Full-Stack Software Engineering">Full-Stack SWE</option>
            <option value="AI & Machine Learning Engineering">AI & ML Engineer</option>
            <option value="Cloud Architecture & DevOps">Cloud & DevOps</option>
          </select>
        </div>
      </div>

      {/* Priority Action Plan Banner */}
      {gapData.priority_action_plan.length > 0 && (
        <div className="p-5 bg-[#17191C] text-white rounded-[22px] border border-[#17191C] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-normal text-[#C7B5D9] uppercase tracking-wider text-[11px] block mb-1">
              Priority Action Recommendation:
            </span>
            <span className="text-[#A8B9D0] font-light leading-relaxed">
              {gapData.priority_action_plan[0]}
            </span>
          </div>
          <button
            onClick={() => onNavigate('/roadmap')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#536C8A] text-white text-xs font-normal hover:bg-white hover:text-[#17191C] transition shrink-0"
          >
            <span>Review Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3 Visual Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bucket 1: Mastered Skills */}
        <div className="bg-white rounded-[22px] border border-[#E4E5E9] p-5.5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5E9]/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#536C8A]" />
              <h3 className="text-sm font-normal text-[#17191C]">
                Mastered Skills
              </h3>
            </div>
            <span className="font-mono text-xs font-normal text-[#536C8A] bg-[#536C8A]/10 px-2.5 py-0.5 rounded-full border border-[#536C8A]/20">
              {gapData.mastered.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6F7782] font-light">
            Verified by assessment tests or proven in portfolio repositories.
          </p>

          <div className="space-y-2.5">
            {gapData.mastered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#536C8A]" />
                    <span className="text-xs font-normal text-[#17191C]">{item.skill}</span>
                  </div>
                  <span className="text-[10px] text-[#6F7782] font-light ml-5 block mt-0.5">
                    Level {item.proficiency}/5 {item.verified && '• Verified'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#536C8A] font-normal">
                  100%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket 2: Partially Developed Skills */}
        <div className="bg-white rounded-[22px] border border-[#E4E5E9] p-5.5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5E9]/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C7B5D9]" />
              <h3 className="text-sm font-normal text-[#17191C]">
                Partially Developed
              </h3>
            </div>
            <span className="font-mono text-xs font-normal text-[#6F7782] bg-[#F9F9FB] px-2.5 py-0.5 rounded-full border border-[#E4E5E9]">
              {gapData.partial.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6F7782] font-light">
            Present in profile but requires verified testing or production depth.
          </p>

          <div className="space-y-2.5">
            {gapData.partial.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#536C8A]" />
                    <span className="text-xs font-normal text-[#17191C]">{item.skill}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6F7782] font-light">
                    Level {item.proficiency}/5
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E5E9]/60 text-[11px]">
                  <button
                    onClick={() => onNavigate('/assessment')}
                    className="text-[#536C8A] hover:underline font-normal"
                  >
                    Verify via Test
                  </button>
                  <button
                    onClick={() => handleViewResource(item.skill)}
                    className="text-[#6F7782] hover:text-[#17191C] flex items-center gap-1 font-light"
                  >
                    <BookOpen className="w-3 h-3 text-[#536C8A]" />
                    Resources
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket 3: Missing Target Skills */}
        <div className="bg-white rounded-[22px] border border-[#E4E5E9] p-5.5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5E9]/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#193D50]" />
              <h3 className="text-sm font-normal text-[#17191C]">
                Missing Skills
              </h3>
            </div>
            <span className="font-mono text-xs font-normal text-[#6F7782] bg-[#F9F9FB] px-2.5 py-0.5 rounded-full border border-[#E4E5E9]">
              {gapData.missing.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6F7782] font-light">
            Expected by recruiters for this target role but absent from your profile.
          </p>

          <div className="space-y-2.5">
            {gapData.missing.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-[#6F7782]" />
                    <span className="text-xs font-normal text-[#17191C]">{item.skill}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#17191C] border border-[#E4E5E9] font-normal">
                    {item.importance}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E5E9]/60 text-[11px]">
                  <button
                    onClick={() => onNavigate('/roadmap')}
                    className="text-[#536C8A] hover:underline font-normal flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add to Roadmap
                  </button>
                  <button
                    onClick={() => handleViewResource(item.skill)}
                    className="text-[#6F7782] hover:text-[#17191C] flex items-center gap-1 font-light"
                  >
                    <BookOpen className="w-3 h-3 text-[#536C8A]" />
                    Free Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
