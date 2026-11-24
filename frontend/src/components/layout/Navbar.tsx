import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiOrb } from '../common/AiOrb';

interface NavbarProps {
  onNavigate: (route: string) => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { user, loginDemo } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E4E5E9]/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <AiOrb size="sm" pulse={true} />
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-normal tracking-tight text-[#17191C]">
                EduPath
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#C7B5D9]/20 text-[#536C8A] border border-[#C7B5D9]/30">
                Workspace
              </span>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-normal text-[#6F7782]">
            <a href="#how-it-works" className="hover:text-[#17191C] transition-colors">
              Pipeline
            </a>
            <a href="#features" className="hover:text-[#17191C] transition-colors">
              Capabilities
            </a>
            <a href="#comparison" className="hover:text-[#17191C] transition-colors">
              Why EduPath
            </a>
            <a href="#curriculum" className="hover:text-[#17191C] transition-colors">
              Architecture
            </a>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    await loginDemo();
                    onNavigate('/dashboard');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#193D50] bg-[#F9F9FB] hover:bg-[#EAEFF5] transition border border-[#E4E5E9] hover:border-[#C7B5D9]/60 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Try Demo</span>
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
