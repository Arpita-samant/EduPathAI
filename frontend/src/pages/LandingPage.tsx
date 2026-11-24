import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  ClipboardCheck,
  MapPin,
  GitPullRequest,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { AiOrb } from '../components/common/AiOrb';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onOpenAuthModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { loginDemo } = useAuth();

  const handleDemoClick = async () => {
    await loginDemo();
    onNavigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex flex-col text-[#17191C]">
      <Navbar onNavigate={onNavigate} onOpenAuthModal={onOpenAuthModal} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32 border-b border-[#E4E5E9]/70">
        {/* Soft background ambient gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#C7B5D9]/20 via-[#A8B9D0]/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Banner with mini AI Orb */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-normal bg-white/90 text-[#193D50] border border-[#E4E5E9] mb-8 shadow-soft">
              <AiOrb size="sm" pulse={true} />
              <span>Minimalist AI Workspace for Career Acceleration</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-light text-[#17191C] tracking-tight leading-[1.15]">
              Move from Career Confusion to{' '}
              <span className="font-normal text-[#193D50] underline decoration-[#C7B5D9]/70 decoration-2 underline-offset-4">
                Career Readiness
              </span>
              .
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#6F7782] leading-relaxed font-normal max-w-2xl mx-auto">
              Multi-stage AI assessments, explainable career matching, adaptive learning roadmaps,
              and live real-time job matching—engineered to verify competence and close skill gaps.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition shadow-soft cursor-pointer"
              >
                <span>Build My Career Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-[#193D50] bg-white hover:bg-[#F9F9FB] border border-[#E4E5E9] hover:border-[#C7B5D9]/60 transition shadow-soft cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#536C8A]" />
                <span>Explore Demo Workspace</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-7 text-xs text-[#6F7782] font-normal">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#536C8A]" />
                Zero Black-Box Scoring
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#536C8A]" />
                Verified Technical Mini-Tasks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#536C8A]" />
                Live Jobicy, Arbeitnow, Himalayas & Adzuna Feed
              </span>
            </div>
          </div>

          {/* Interactive-Style Dashboard Preview Card */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-[26px] border border-[#E4E5E9] bg-white shadow-card overflow-hidden">
              {/* Browser Chrome Header */}
              <div className="bg-[#F9F9FB] px-5 py-3.5 border-b border-[#E4E5E9] flex items-center justify-between text-xs text-[#6F7782]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5E9]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5E9]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5E9]" />
                  <span className="ml-3 font-mono text-[11px] text-[#6F7782]">
                    workspace.edupath.ai/alex-chen
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C7B5D9]/20 text-[#193D50] font-mono text-[11px] border border-[#C7B5D9]/30">
                    Readiness: 88/100
                  </span>
                </div>
              </div>

              {/* Preview Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F9F9FB]/40">
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-[22px] border border-[#E4E5E9] shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium uppercase text-[#6F7782] tracking-wider">
                      Single Career Path
                    </span>
                    <span className="font-mono text-xs text-[#193D50] bg-[#EAEFF5] px-2 py-0.5 rounded-md border border-[#E4E5E9]">
                      94% Match
                    </span>
                  </div>
                  <h4 className="font-normal text-[#17191C] text-[17px]">Full-Stack Software Engineer</h4>
                  <p className="text-xs text-[#6F7782] mt-1 mb-4 leading-relaxed">
                    Based on verified core skill: Full-Stack Web Architecture.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#6F7782]">Verified Competency</span>
                        <span className="font-mono text-[#17191C]">92%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
                        <div className="h-full bg-[#536C8A] rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#6F7782]">Interest Alignment</span>
                        <span className="font-mono text-[#17191C]">96%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]/50">
                        <div className="h-full bg-[#C7B5D9] rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-[22px] border border-[#E4E5E9] shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium uppercase text-[#6F7782] tracking-wider">
                      Live Multi-API Stream
                    </span>
                    <span className="text-[11px] text-[#536C8A] font-medium">70+ Live Roles</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E4E5E9]">
                      <span className="text-[#17191C] font-normal truncate">Fandom • Accounting Assistant</span>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Jobicy</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E4E5E9]">
                      <span className="text-[#17191C] font-normal truncate">Eventinc • AI Engineer</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Arbeitnow</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F9F9FB] border border-[#E4E5E9]">
                      <span className="text-[#17191C] font-normal truncate">Stryker • Staff Engineer</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Himalayas</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-[22px] border border-[#E4E5E9] shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium uppercase text-[#6F7782] tracking-wider">
                      Adaptive Roadmap
                    </span>
                    <span className="font-mono text-xs text-[#536C8A] bg-[#EAEFF5] px-2 py-0.5 rounded border border-[#E4E5E9]">
                      Week 2 / 8
                    </span>
                  </div>
                  <h5 className="font-normal text-[#17191C] text-[15px]">
                    React 18 Architecture & State
                  </h5>
                  <p className="text-xs text-[#6F7782] mt-1 leading-relaxed">
                    Milestone: Accessible keyboard Data Grid with custom hooks.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E4E5E9]/60 flex items-center justify-between text-xs">
                    <span className="text-[#536C8A] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Week 1 Completed
                    </span>
                    <button
                      onClick={handleDemoClick}
                      className="text-[#536C8A] hover:text-[#193D50] font-medium cursor-pointer"
                    >
                      View Roadmap →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Pipeline */}
      <section id="how-it-works" className="py-20 bg-white border-b border-[#E4E5E9]/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-medium uppercase tracking-wider text-[#536C8A]">
              The 4-Step Career Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] mt-1.5">
              How EduPath AI Guides Your Journey
            </h2>
            <p className="text-sm text-[#6F7782] mt-2 font-normal">
              From initial baseline assessment to verified competence, interactive AI mentorship, and job readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-[22px] border border-[#E4E5E9] bg-[#F9F9FB] shadow-soft">
              <div className="font-mono text-2xl font-light text-[#536C8A] mb-3">01</div>
              <h3 className="text-[16px] font-normal text-[#17191C] mb-1.5">
                Smart Profile
              </h3>
              <p className="text-xs text-[#6F7782] leading-relaxed font-normal">
                Upload your resume or enter your coursework and projects. The parser structures your verified skills baseline.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[22px] border border-[#E4E5E9] bg-[#F9F9FB] shadow-soft">
              <div className="font-mono text-2xl font-light text-[#C7B5D9] mb-3">02</div>
              <h3 className="text-[16px] font-normal text-[#17191C] mb-1.5">
                Skill Assessment
              </h3>
              <p className="text-xs text-[#6F7782] leading-relaxed font-normal">
                Multi-dimensional questions with clickable suggested options and custom text inputs. AI analyzes and isolates your single superpower.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[22px] border border-[#E4E5E9] bg-[#F9F9FB] shadow-soft">
              <div className="font-mono text-2xl font-light text-[#A8B9D0] mb-3">03</div>
              <h3 className="text-[16px] font-normal text-[#17191C] mb-1.5">
                AI Career Match & Chat
              </h3>
              <p className="text-xs text-[#6F7782] leading-relaxed font-normal">
                AI locks in your single best-fit career path. Chat live with your conversational AI advisor to discuss preparation and strategies.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-[22px] border border-[#E4E5E9] bg-[#F9F9FB] shadow-soft">
              <div className="font-mono text-2xl font-light text-[#193D50] mb-3">04</div>
              <h3 className="text-[16px] font-normal text-[#17191C] mb-1.5">
                Adaptive Roadmap
              </h3>
              <p className="text-xs text-[#6F7782] leading-relaxed font-normal">
                Unlocks your 8-week execution plan with capstone project prompts, GitHub linking, and live role matches from 4 job APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-20 bg-[#F9F9FB] border-b border-[#E4E5E9]/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-medium uppercase tracking-wider text-[#536C8A]">
              Clear Differentiation
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] mt-1.5">
              Traditional Career Portals vs. EduPath AI
            </h2>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E4E5E9] shadow-soft overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9F9FB] border-b border-[#E4E5E9] text-[11px] font-medium uppercase text-[#6F7782]">
                <tr>
                  <th className="py-4 px-6 font-medium">Capability</th>
                  <th className="py-4 px-6 font-medium text-[#6F7782]">Traditional Portals</th>
                  <th className="py-4 px-6 font-medium text-[#193D50] bg-[#C7B5D9]/10">EduPath AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E5E9]/60 text-xs text-[#17191C]">
                <tr>
                  <td className="py-4 px-6 font-medium">Skill Evaluation</td>
                  <td className="py-4 px-6 text-[#6F7782] flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#C84C4C] shrink-0" />
                    Self-reported checkboxes
                  </td>
                  <td className="py-4 px-6 font-medium bg-[#C7B5D9]/5">
                    <span className="flex items-center gap-1.5 text-[#536C8A]">
                      <CheckCircle2 className="w-4 h-4 text-[#536C8A] shrink-0" />
                      Multi-dimensional evaluation & single superpower selection
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Career Selection</td>
                  <td className="py-4 px-6 text-[#6F7782] flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#C84C4C] shrink-0" />
                    Confusing list of 20 generic roles
                  </td>
                  <td className="py-4 px-6 font-medium bg-[#C7B5D9]/5">
                    <span className="flex items-center gap-1.5 text-[#536C8A]">
                      <CheckCircle2 className="w-4 h-4 text-[#536C8A] shrink-0" />
                      Single best-fit career match + conversational AI advisor
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Roadmap Access</td>
                  <td className="py-4 px-6 text-[#6F7782] flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#C84C4C] shrink-0" />
                    Static, generic PDFs
                  </td>
                  <td className="py-4 px-6 font-medium bg-[#C7B5D9]/5">
                    <span className="flex items-center gap-1.5 text-[#536C8A]">
                      <CheckCircle2 className="w-4 h-4 text-[#536C8A] shrink-0" />
                      Strictly unlocked only when optimal career is matched
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">Real-Time Opportunities</td>
                  <td className="py-4 px-6 text-[#6F7782] flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#C84C4C] shrink-0" />
                    Stale mock postings
                  </td>
                  <td className="py-4 px-6 font-medium bg-[#C7B5D9]/5">
                    <span className="flex items-center gap-1.5 text-[#536C8A]">
                      <CheckCircle2 className="w-4 h-4 text-[#536C8A] shrink-0" />
                      Live aggregation from Jobicy, Arbeitnow, Himalayas & Adzuna
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="py-20 bg-white border-b border-[#E4E5E9]/70">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-medium uppercase tracking-wider text-[#536C8A]">
              Comprehensive Workspace
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] mt-1.5">
              Everything You Need in One Minimal Interface
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Smart Profile & Resume Parse', icon: FileText, desc: 'Auto-extract skills, education, and portfolio artifacts from PDF/DOCX resumes.' },
              { title: 'Single AI Career Match', icon: Sparkles, desc: 'Pinpoint your definitive career trajectory backed by evidence without decision paralysis.' },
              { title: 'Conversational AI Advisor', icon: Zap, desc: 'Chat directly with your career mentor on projects, interviews, and market compensation.' },
              { title: 'Adaptive Weekly Roadmap', icon: MapPin, desc: 'Locked until career is analyzed, unlocking an 8-week execution path with capstones.' },
              { title: 'Live 4-API Role Matching', icon: Globe, desc: 'Real-time job postings streamed directly from Jobicy, Arbeitnow, Himalayas & Adzuna.' },
              { title: 'AI Resume ATS Analyzer', icon: ShieldCheck, desc: 'Score your resume against target JDs, catch missing keywords, and get STAR rewrites.' }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-[24px] border border-[#E4E5E9] bg-white hover:border-[#A8B9D0]/60 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#EAEFF5] text-[#536C8A] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-normal text-[#17191C] mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#6F7782] leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-[#193D50] text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-[#C7B5D9]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-5 text-center relative">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Ready to Accelerate Your Career Trajectory?
          </h2>
          <p className="mt-3 text-slate-300 text-sm max-w-lg mx-auto font-normal">
            Explore the 1-click guest workspace or create your account to unlock your personalized learning roadmap.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDemoClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-medium bg-white text-[#193D50] hover:bg-[#F9F9FB] transition shadow-soft cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
              <span>Explore Demo Workspace</span>
            </button>
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-medium bg-[#536C8A] text-white hover:bg-[#435872] transition cursor-pointer"
            >
              <span>Get Started Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto py-7 bg-white border-t border-[#E4E5E9] text-xs text-[#6F7782]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AiOrb size="sm" pulse={false} />
            <span className="font-normal text-[#17191C]">EduPath AI</span>
            <span>— Minimal AI Career Workspace</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-[#17191C] transition">
              Pipeline
            </a>
            <a href="#features" className="hover:text-[#17191C] transition">
              Capabilities
            </a>
            <span className="text-[#6F7782]/70">© 2026 EduPath AI.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
