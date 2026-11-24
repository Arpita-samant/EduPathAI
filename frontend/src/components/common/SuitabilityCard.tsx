import React from 'react';
import { CareerRecommendationItem } from '../../types';
import { ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import { AiOrb } from './AiOrb';

interface SuitabilityCardProps {
  career: CareerRecommendationItem;
  onVerifyFit: (domain: string) => void;
  onSelectCareer?: (domain: string) => void;
  isSelected?: boolean;
}

export const SuitabilityCard: React.FC<SuitabilityCardProps> = ({
  career,
  onVerifyFit,
  onSelectCareer,
  isSelected = false
}) => {
  const { suitability_breakdown } = career;

  return (
    <div
      className={`bg-white rounded-[24px] border p-6 transition-all duration-300 relative flex flex-col justify-between ${
        isSelected
          ? 'border-[#536C8A] ring-1 ring-[#C7B5D9]/40 shadow-card-hover'
          : 'border-[#E4E5E9] hover:border-[#A8B9D0]/60 hover:shadow-card-hover'
      }`}
    >
      {career.recommended_path && (
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-normal bg-[#193D50] text-white shadow-soft">
            <AiOrb size="xs" glow={false} />
            Recommended Best-Fit Path
          </span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mt-1">
          <div>
            <h3 className="text-lg font-normal text-[#17191C] leading-snug">
              {career.title}
            </h3>
            <p className="text-[13px] text-[#6F7782] mt-1 line-clamp-2 leading-relaxed">
              {career.description}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-light text-[#193D50]">
                {career.match_percentage}%
              </span>
              <span className="text-[11px] text-[#6F7782]">Fit</span>
            </div>
          </div>
        </div>

        {/* Market demand & Salary pill strip */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-[12px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAEFF5] text-[#536C8A] font-medium border border-[#E4E5E9]">
            <TrendingUp className="w-3 h-3" />
            {career.market_demand}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F9F9FB] text-[#6F7782] font-medium border border-[#E4E5E9]">
            <DollarSign className="w-3 h-3 text-[#6F7782]" />
            Avg. {career.avg_entry_salary}
          </span>
        </div>

        {/* Why it matches quote box */}
        <div className="mt-4 p-3.5 bg-[#F9F9FB] rounded-2xl border border-[#E4E5E9] text-[13px] text-[#17191C] leading-relaxed">
          <span className="font-medium text-[#536C8A] block mb-0.5 text-xs">Why This Matches You:</span>
          {career.why_it_matches}
        </div>

        {/* Explainable AI (XAI) Suitability Breakdown */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-[#E4E5E9]/60">
          <div className="text-[11px] font-medium text-[#6F7782] tracking-wider uppercase mb-2">
            Evidence-Backed Match Breakdown
          </div>

          {/* Academic Fit */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6F7782]">Academic & Coursework</span>
              <span className="font-mono text-[#17191C]">{suitability_breakdown.academic_fit}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
              <div
                className="h-full bg-[#536C8A] rounded-full transition-all duration-700"
                style={{ width: `${suitability_breakdown.academic_fit}%` }}
              />
            </div>
          </div>

          {/* Verified Skill Score */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6F7782]">Verified Competency</span>
              <span className="font-mono text-[#17191C]">{suitability_breakdown.verified_skill_score}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
              <div
                className="h-full bg-[#C7B5D9] rounded-full transition-all duration-700"
                style={{ width: `${suitability_breakdown.verified_skill_score}%` }}
              />
            </div>
          </div>

          {/* Interest Alignment */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6F7782]">Interest Alignment</span>
              <span className="font-mono text-[#17191C]">{suitability_breakdown.interest_alignment}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
              <div
                className="h-full bg-[#A8B9D0] rounded-full transition-all duration-700"
                style={{ width: `${suitability_breakdown.interest_alignment}%` }}
              />
            </div>
          </div>

          {/* Market Demand */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6F7782]">Market Demand</span>
              <span className="font-mono text-[#17191C]">{suitability_breakdown.market_demand}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
              <div
                className="h-full bg-[#193D50] rounded-full transition-all duration-700"
                style={{ width: `${suitability_breakdown.market_demand}%` }}
              />
            </div>
          </div>
        </div>

        {/* Required Skills Badges */}
        <div className="mt-4 pt-3 border-t border-[#E4E5E9]/60">
          <span className="text-[11px] font-medium text-[#6F7782] uppercase tracking-wider block mb-2">
            Key Prerequisites:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {career.key_required_skills.map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-[#E4E5E9]/60 flex items-center gap-2.5">
        <button
          onClick={() => onVerifyFit(career.title)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium bg-[#536C8A] hover:bg-[#435872] text-white transition shadow-soft cursor-pointer"
        >
          <span>Verify Fit with Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {onSelectCareer && (
          <button
            onClick={() => onSelectCareer(career.title)}
            className="py-2.5 px-3 rounded-xl text-xs font-medium border border-[#E4E5E9] hover:bg-[#F9F9FB] text-[#17191C] transition cursor-pointer"
          >
            Lock In
          </button>
        )}
      </div>
    </div>
  );
};
