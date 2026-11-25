import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { AiOrb } from '../common/AiOrb';

interface AppHeaderProps {
  currentRoute: string;
  onOpenSidebar: () => void;
  onNavigate: (route: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentRoute, onOpenSidebar, onNavigate }) => {
  const { user } = useAuth();
  const [readinessScore, setReadinessScore] = useState<number>(0);

  useEffect(() => {
    if (user) {
      api.getDashboardSummary()
        .then(data => {
          if (data && data.career_readiness_score !== undefined) {
            setReadinessScore(data.career_readiness_score);
          }
        })
        .catch(() => {});
    }
  }, [user, currentRoute]);

  const getPageTitle = (route: string) => {
    switch (route) {
      case '/dashboard': return { title: 'Executive Workspace', subtitle: 'Live readiness KPIs, verified superpower & career trajectory' };
      case '/profile': return { title: 'Smart Profile', subtitle: 'Academic records, verified technical stack & portfolio projects' };
      case '/assessment': return { title: 'Skill Assessment', subtitle: 'Multi-dimensional evaluation & core superpower selection' };
      case '/careers': return { title: 'AI Career Match & Mentor', subtitle: 'Single best-fit career analysis & conversational AI advisor' };
      case '/roadmap': return { title: 'Learning Roadmap', subtitle: 'Step-by-step weekly guide and practical projects' };
      case '/jobs': return { title: 'Live Opportunities Feed', subtitle: 'Real-time multi-API stream from Jobicy, Arbeitnow, Himalayas & Adzuna' };
      case '/resume-ats': return { title: 'AI Resume ATS Analyzer', subtitle: 'Keyword matching, format audits & STAR bullet rewrites' };
      case '/resources': return { title: 'Curated Free Hub', subtitle: 'High-signal courses, documentation & interactive practice' };
      default: return { title: 'EduPath AI Workspace', subtitle: 'Personalized career intelligence' };
    }
  };

  const pageInfo = getPageTitle(currentRoute);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E4E5E9]/80 px-5 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-[#6F7782] hover:text-[#17191C] hover:bg-[#F9F9FB] rounded-xl lg:hidden transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-[17px] sm:text-[19px] font-normal text-[#17191C] tracking-tight leading-tight">
            {pageInfo.title}
          </h1>
          <p className="hidden sm:block text-[12px] text-[#6F7782] font-normal leading-none mt-1">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Readiness Score Pill with Floating Orb Accent */}
        <div
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#F9F9FB] hover:bg-white rounded-full border border-[#E4E5E9] hover:border-[#C7B5D9]/50 shadow-soft cursor-pointer transition-all duration-200"
          title="Unified Career Readiness KPI"
        >
          <AiOrb size="sm" pulse={false} />
          <div className="flex items-baseline gap-1 text-[13px]">
            <span className="text-[#6F7782] font-normal text-[12px]">Readiness</span>
            <span className="font-mono font-medium text-[#17191C]">{readinessScore}/100</span>
          </div>
        </div>
      </div>
    </header>
  );
};
