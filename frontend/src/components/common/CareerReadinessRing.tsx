import React from 'react';

interface CareerReadinessRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showBreakdown?: boolean;
  breakdown?: {
    verified_assessment?: number;
    roadmap_progress?: number;
    resume_ats?: number;
    project_portfolio?: number;
  };
}

export const CareerReadinessRing: React.FC<CareerReadinessRingProps> = ({
  score,
  size = 140,
  strokeWidth = 9,
  showBreakdown = false,
  breakdown
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#A8B9D0';
  let badgeLabel = 'Not Started';
  let badgeClass = 'bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9]';

  if (normalizedScore >= 80) {
    strokeColor = '#536C8A';
    badgeLabel = 'Industry Ready';
    badgeClass = 'bg-[#C7B5D9]/20 text-[#193D50] border border-[#C7B5D9]/40';
  } else if (normalizedScore >= 60) {
    strokeColor = '#536C8A';
    badgeLabel = 'Competitive';
    badgeClass = 'bg-[#A8B9D0]/20 text-[#536C8A] border border-[#A8B9D0]/40';
  } else if (normalizedScore > 0) {
    strokeColor = '#C7B5D9';
    badgeLabel = 'Foundational';
    badgeClass = 'bg-[#EAEFF5] text-[#536C8A] border border-[#E4E5E9]';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E4E5E9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-light tracking-tight text-[#17191C]">
            {normalizedScore}
          </span>
          <span className="text-[11px] font-normal text-[#6F7782]">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2.5 text-center">
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-medium ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      {showBreakdown && breakdown && (
        <div className="w-full mt-4 space-y-2 text-xs text-[#6F7782] bg-[#F9F9FB] p-3.5 rounded-2xl border border-[#E4E5E9]">
          <div className="flex justify-between items-center">
            <span>Verified Assessment (35%)</span>
            <span className="font-mono font-medium text-[#17191C]">
              {breakdown.verified_assessment !== undefined && breakdown.verified_assessment > 0 ? `${breakdown.verified_assessment}%` : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Roadmap Milestones (25%)</span>
            <span className="font-mono font-medium text-[#17191C]">
              {breakdown.roadmap_progress !== undefined && breakdown.roadmap_progress > 0 ? `${breakdown.roadmap_progress}%` : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Resume ATS Score (20%)</span>
            <span className="font-mono font-medium text-[#17191C]">
              {breakdown.resume_ats !== undefined && breakdown.resume_ats > 0 ? `${breakdown.resume_ats}%` : '0%'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Project Artifacts (20%)</span>
            <span className="font-mono font-medium text-[#17191C]">
              {breakdown.project_portfolio !== undefined && breakdown.project_portfolio > 0 ? `${breakdown.project_portfolio}%` : '0%'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
