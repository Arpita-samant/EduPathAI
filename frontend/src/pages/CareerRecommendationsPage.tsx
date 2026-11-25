import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Send,
  MessageSquare,
  User,
  Zap,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Unlock,
  ChevronRight
} from 'lucide-react';
import { SingleCareerRecommendation } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { saveUserVault, getUserVault } from '../utils/dataVault';
import { AiOrb } from '../components/common/AiOrb';

interface CareerRecommendationsPageProps {
  onNavigate: (route: string) => void;
  onSelectDomainForAssessment?: (domain: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const CareerRecommendationsPage: React.FC<CareerRecommendationsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [career, setCareer] = useState<SingleCareerRecommendation | null>(null);
  const [bestFitSkill, setBestFitSkill] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What projects will make my resume stand out most?',
    'What are the top technical interview expectations?',
    'What is the average timeline to become job-ready?'
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getCareerStatus();
      setBestFitSkill(res.best_fit_skill || '');
      if (res.has_analyzed && res.career) {
        setCareer(res.career);
        initializeChat(res.career);
        if (user?.email) {
          saveUserVault(user.email, { target_career: res.career.title });
        }
      } else if (user?.email) {
        const vault = getUserVault(user.email);
        if (vault?.target_career) {
          try {
            await api.selectCareer(vault.target_career);
            const retryRes = await api.getCareerStatus();
            if (retryRes.has_analyzed && retryRes.career) {
              setCareer(retryRes.career);
              initializeChat(retryRes.career);
            }
          } catch {
            // non-fatal
          }
        }
      }
    } catch (err) {
      console.error('Error fetching career status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.email]);

  const initializeChat = (targetCareer: SingleCareerRecommendation) => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 Hi! I analyzed your profile and selected **${targetCareer.title}** as your optimal career path based on your verified superpower in **${targetCareer.primary_skill_alignment}**.\n\nAsk me anything about daily responsibilities, portfolio projects, interview questions, or industry salary benchmarks!`
      }
    ]);
  };

  const handleAnalyzeSkills = async () => {
    setAnalyzing(true);
    try {
      const result = await api.analyzeBestCareer();
      setCareer(result);
      initializeChat(result);
      if (user?.email && result.title) {
        saveUserVault(user.email, { target_career: result.title });
      }
    } catch (err) {
      console.error('Error analyzing career:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !career || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await api.chatCareerAdvisor(career.title, text, newHistory);
      setMessages([...newHistory, { role: 'assistant', content: res.reply }]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      console.error('Error chatting with advisor:', err);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I encountered an issue generating a response. Please check your connection and try again.'
        }
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleUnlockRoadmap = () => {
    onNavigate('/roadmap');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AiOrb size="lg" pulse={true} />
          <span className="text-xs text-[#6F7782] font-normal">Checking AI Career Match status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. If Career NOT Analyzed Yet: Show Action Screen with Central AI Orb */}
      {!career && (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-8 sm:p-14 shadow-soft text-center relative overflow-hidden">
          {/* Subtle ambient background glow behind orb */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-[#C7B5D9]/25 via-[#A8B9D0]/20 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* Central AI Orb Visual */}
          <div className="relative z-10 flex flex-col items-center justify-center my-2">
            <AiOrb
              size={analyzing ? '3xl' : '2xl'}
              pulse={true}
              glow={true}
              className={`transition-all duration-700 ${analyzing ? 'animate-orb-analyzing' : 'hover:scale-105'}`}
            />
          </div>

          <div className="relative z-10 mt-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-3">
              <AiOrb size="xs" pulse={analyzing} glow={false} />
              <span>AI Career Match Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
              {analyzing ? 'Synthesizing Your Verified Potential' : 'Discover Your Single Best-Fit Career Path'}
            </h2>

            <p className="text-sm text-[#6F7782] mt-2.5 max-w-lg mx-auto font-light leading-relaxed">
              {analyzing
                ? 'AI is cross-referencing your verified technical capabilities, projects, education, and genuine interests against live hiring demand...'
                : 'Unlike generic platforms that present overwhelming, ambiguous lists, EduPath AI evaluates your verified competencies to select only ONE definitive, high-conviction career.'}
            </p>

            {/* Status Box */}
            <div className="my-6 max-w-md mx-auto p-4.5 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] text-left">
              <div className="text-[11px] font-normal text-[#6F7782] uppercase tracking-wider mb-1.5">
                Verified Superpower Status:
              </div>
              {bestFitSkill ? (
                <div className="flex items-center gap-2.5 text-sm font-normal text-[#17191C]">
                  <CheckCircle2 className="w-4 h-4 text-[#536C8A] shrink-0" />
                  <span>{bestFitSkill}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#6F7782] font-light">Skill Assessment Not Completed Yet</span>
                  <button
                    onClick={() => onNavigate('/assessment')}
                    className="text-xs font-normal text-[#536C8A] hover:underline"
                  >
                    Take Assessment →
                  </button>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzeSkills}
              disabled={analyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <AiOrb size="xs" pulse={true} glow={false} />
                  <span>AI Analyzing Career Match...</span>
                </>
              ) : (
                <>
                  <AiOrb size="xs" pulse={false} glow={false} />
                  <span>Analyze My Skills & Select Best Career</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. When Career is Analyzed: Display Single Best-Fit Career + Interactive Chat */}
      {career && (
        <div className="space-y-6">
          {/* Hero Career Card */}
          <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 sm:p-8 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#E4E5E9]/60">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="flex shrink-0">
                  <AiOrb size="md" pulse={true} glow={true} className="sm:hidden mt-0.5" />
                  <AiOrb size="xl" pulse={true} glow={true} className="hidden sm:block" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#536C8A]" />
                    <span>Single Best-Fit Career Path Selected</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-light text-[#17191C] tracking-tight">
                    {career.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6F7782] mt-1 font-light">{career.tagline}</p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F9F9FB] border border-[#E4E5E9]">
                  <AiOrb size="xs" />
                  <span className="font-mono text-xl font-normal text-[#17191C]">
                    {career.match_percentage}%
                  </span>
                  <span className="text-xs font-normal text-[#6F7782]">Match</span>
                </div>
                <span className="text-[11px] text-[#6F7782] mt-1 font-light">Calibrated against current market demand</span>
              </div>
            </div>

            {/* Why This Fits */}
            <div className="mt-6 p-5 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9]">
              <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider block mb-1.5 flex items-center gap-2">
                <AiOrb size="xs" glow={false} />
                <span>Why This Career Fits You</span>
              </span>
              <p className="text-sm text-[#6F7782] font-light leading-relaxed">{career.why_it_fits}</p>
            </div>

            {/* Suitability Breakdown Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {Object.entries(career.suitability_breakdown || {}).map(([key, val]) => (
                <div key={key} className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] text-center">
                  <span className="text-[11px] font-normal text-[#6F7782] uppercase tracking-wider block mb-1">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-lg font-normal text-[#17191C]">{val}%</span>
                </div>
              ))}
            </div>

            {/* Market Outlook & Compensation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E4E5E9]/60">
              <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9]">
                <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Salary Benchmark</span>
                </span>
                <span className="text-xs font-normal text-[#6F7782]">
                  {career.market_outlook?.avg_salary || '$85,000 - $115,000'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9]">
                <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Market Demand</span>
                </span>
                <span className="text-xs font-normal text-[#6F7782]">
                  {career.market_outlook?.demand_level || 'High Demand (+24% YoY)'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9]">
                <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>Open Opportunities</span>
                </span>
                <span className="text-xs font-normal text-[#6F7782]">
                  {career.market_outlook?.job_availability || '45,000+ open roles'}
                </span>
              </div>
            </div>

            {/* Key Skills Checklist */}
            <div className="mt-6 pt-6 border-t border-[#E4E5E9]/60">
              <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#536C8A]" />
                <span>Key Technical Competencies for This Career</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {career.key_skills_to_master?.map((sk, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs font-light bg-[#F9F9FB] border border-[#E4E5E9] text-[#17191C] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#536C8A]" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Day in the Life */}
            {career.day_in_the_life && (
              <div className="mt-6 p-4 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] text-xs text-[#6F7782] font-light leading-relaxed">
                <strong className="text-[#17191C] font-normal">A Day in the Life:</strong> {career.day_in_the_life}
              </div>
            )}

            {/* Roadmap Unlock Banner CTA */}
            <div className="mt-8 pt-6 border-t border-[#E4E5E9]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#536C8A]/10 text-[#536C8A] flex items-center justify-center shrink-0">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-normal text-[#17191C]">Adaptive Learning Roadmap Unlocked</h4>
                  <p className="text-xs text-[#6F7782] font-light">
                    Week-by-week milestones, capstone projects, and curated free resources are ready.
                  </p>
                </div>
              </div>

              <button
                onClick={handleUnlockRoadmap}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft shrink-0 cursor-pointer"
              >
                <span>Open Adaptive Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Interactive AI Career Chat Component */}
          <div className="bg-white rounded-[24px] border border-[#E4E5E9] shadow-soft overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 bg-[#F9F9FB] border-b border-[#E4E5E9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E4E5E9] flex items-center justify-center shadow-soft p-1">
                  <AiOrb size="sm" pulse={chatLoading} glow={chatLoading} />
                </div>
                <div>
                  <h3 className="text-sm font-normal text-[#17191C] flex items-center gap-2">
                    <span>EduPath AI Career Advisor</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[#536C8A] bg-[#536C8A]/10 px-2 py-0.5 rounded-full border border-[#536C8A]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#536C8A] animate-pulse" />
                      Active Mentor
                    </span>
                  </h3>
                  <p className="text-xs text-[#6F7782] font-light">
                    Ask questions about {career.title}, preparation, interview strategies, and day-to-day work
                  </p>
                </div>
              </div>

              <button
                onClick={() => initializeChat(career)}
                className="text-xs font-normal text-[#6F7782] hover:text-[#17191C] transition cursor-pointer"
              >
                Clear Chat
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[420px] overflow-y-auto">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-normal ${
                        isUser
                          ? 'bg-[#193D50] text-white'
                          : 'bg-white border border-[#E4E5E9] shadow-xs p-0.5'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <AiOrb size="xs" glow={false} />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-light ${
                        isUser
                          ? 'bg-[#536C8A] text-white rounded-tr-xs'
                          : 'bg-[#F9F9FB] border border-[#E4E5E9] text-[#17191C] rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E4E5E9] flex items-center justify-center p-0.5 shadow-xs">
                    <AiOrb size="xs" pulse={true} glow={true} />
                  </div>
                  <div className="bg-[#F9F9FB] border border-[#E4E5E9] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-[#6F7782] flex items-center gap-2">
                    <AiOrb size="xs" pulse={true} glow={true} />
                    <span>AI Career Advisor is generating guidance...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Follow-Up Questions Chips */}
            {suggestedQuestions.length > 0 && (
              <div className="px-4 sm:px-6 py-3 bg-[#F9F9FB]/60 border-t border-[#E4E5E9]/60 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-normal text-[#6F7782] shrink-0 flex items-center gap-1.5">
                  <AiOrb size="xs" glow={false} /> Suggested:
                </span>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={chatLoading}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white border border-[#E4E5E9] hover:border-[#A8B9D0] hover:text-[#17191C] transition text-[#6F7782] shrink-0 font-light cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-[#E4E5E9]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask anything about ${career.title}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E4E5E9] text-sm text-[#17191C] placeholder-[#6F7782]/50 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A]/20 outline-none transition bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#536C8A] text-white hover:bg-[#193D50] transition disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
