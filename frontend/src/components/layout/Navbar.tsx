import React, { useState } from 'react';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AiOrb } from '../common/AiOrb';

interface NavbarProps {
  onNavigate: (route: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { user, loginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoClick = async () => {
    setMobileMenuOpen(false);
    await loginDemo();
    onNavigate('/dashboard');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E4E5E9]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <AiOrb size="sm" pulse={true} />
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] sm:text-[18px] font-normal tracking-tight text-[#17191C]">
                EduPath
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#C7B5D9]/20 text-[#536C8A] border border-[#C7B5D9]/30">
                Workspace
              </span>
            </div>
          </div>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex items-center gap-8 text-[14px] font-normal text-[#6F7782]">
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNavClick('#how-it-works'); }} className="hover:text-[#17191C] transition-colors">
              Pipeline
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="hover:text-[#17191C] transition-colors">
              Capabilities
            </a>
            <a href="#comparison" onClick={(e) => { e.preventDefault(); handleNavClick('#comparison'); }} className="hover:text-[#17191C] transition-colors">
              Why EduPath
            </a>
            <a href="#curriculum" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="hover:text-[#17191C] transition-colors">
              Architecture
            </a>
          </div>

          {/* Right CTAs Desktop */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3">
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
                  onClick={handleDemoClick}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-[#193D50] bg-[#F9F9FB] hover:bg-[#EAEFF5] transition border border-[#E4E5E9] hover:border-[#C7B5D9]/60 cursor-pointer"
                  title="Try 1-Click Demo Profile"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Try Demo</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal?.('signin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#17191C] bg-white hover:bg-[#F9F9FB] transition border border-[#E4E5E9] hover:border-[#536C8A]/40 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal?.('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Bar */}
          <div className="flex sm:hidden items-center gap-2">
            {!user ? (
              <>
                <button
                  onClick={() => onOpenAuthModal?.('signin')}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#17191C] bg-white border border-[#E4E5E9] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={handleDemoClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#193D50] bg-[#F9F9FB] border border-[#E4E5E9] cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#536C8A]" />
                  <span>Demo</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#536C8A] text-white cursor-pointer"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6F7782] hover:text-[#17191C] hover:bg-[#F9F9FB] rounded-xl transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md border-b border-[#E4E5E9] px-5 py-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2.5 text-sm text-[#17191C] font-normal pb-3 border-b border-[#E4E5E9]/60">
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left py-1 text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
            >
              Pipeline
            </button>
            <button
              onClick={() => handleNavClick('#features')}
              className="text-left py-1 text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
            >
              Capabilities
            </button>
            <button
              onClick={() => handleNavClick('#comparison')}
              className="text-left py-1 text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
            >
              Why EduPath
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/dashboard');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium bg-[#536C8A] text-white cursor-pointer"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.('signin');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-[#17191C] bg-white border border-[#E4E5E9] cursor-pointer"
                >
                  <span>Sign In to Workspace</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.('signup');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium bg-[#536C8A] text-white cursor-pointer"
                >
                  <span>Create Account (Get Started)</span>
                </button>
                <button
                  onClick={handleDemoClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-[#193D50] bg-[#F9F9FB] border border-[#E4E5E9] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Try Demo Workspace</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
