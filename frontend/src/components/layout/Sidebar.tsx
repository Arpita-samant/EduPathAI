import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Sparkles,
  ClipboardCheck,
  MapPin,
  Briefcase,
  GitPullRequest,
  FileText,
  BookOpen,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiOrb } from '../common/AiOrb';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      label: 'Workspace',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
      ]
    },
    {
      label: 'Career Guidance Pipeline',
      items: [
        { label: 'Smart Profile', icon: UserCheck, route: '/profile' },
        { label: 'Skill Assessment', icon: ClipboardCheck, route: '/assessment' },
        { label: 'AI Career Match', icon: Sparkles, route: '/careers' },
        { label: 'Adaptive Roadmap', icon: MapPin, route: '/roadmap' },
      ]
    },
    {
      label: 'Real-Time Industry',
      items: [
        { label: 'Live Opportunities', icon: Briefcase, route: '/jobs' },
        { label: 'Skill Gap Matrix', icon: GitPullRequest, route: '/skill-gap' },
        { label: 'Resume ATS Scanner', icon: FileText, route: '/resume-ats' },
        { label: 'Curated Hub', icon: BookOpen, route: '/resources' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#17191C]/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#E4E5E9] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#E4E5E9]/60">
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <AiOrb size="sm" pulse={true} />
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-normal tracking-tight text-[#17191C]">
                EduPath
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#C7B5D9]/20 text-[#536C8A] border border-[#C7B5D9]/30">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 text-[11px] font-medium text-[#6F7782] tracking-wider uppercase mb-2">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.route}
                      onClick={() => {
                        onNavigate(item.route);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#F9F9FB] text-[#193D50] border border-[#E4E5E9] shadow-soft font-medium'
                          : 'text-[#6F7782] hover:bg-[#F9F9FB] hover:text-[#17191C]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-[#536C8A]' : 'text-[#6F7782]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#536C8A]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card Footer */}
        <div className="p-3.5 border-t border-[#E4E5E9]/60 bg-[#F9F9FB]/60">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#E4E5E9] shadow-soft">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#EAEFF5] text-[#536C8A] border border-[#A8B9D0]/30 flex items-center justify-center text-xs font-medium shrink-0">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#17191C] truncate">
                  {user?.full_name || 'Guest Explorer'}
                </div>
                <div className="text-[10px] text-[#6F7782] truncate">
                  {user?.email || 'Signed in'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onNavigate('/');
              }}
              title="Sign Out"
              className="p-1.5 text-[#6F7782] hover:text-[#17191C] hover:bg-[#F9F9FB] rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
