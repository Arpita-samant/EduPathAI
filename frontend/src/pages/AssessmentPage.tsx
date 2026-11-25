import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  Zap,
  TrendingUp,
  Brain,
  Edit3
} from 'lucide-react';
import { AssessmentQuestionItem, AssessmentAnalysisResponse } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { saveUserVault } from '../utils/dataVault';
import { AiOrb } from '../components/common/AiOrb';

interface AssessmentPageProps {
  onNavigate: (route: string) => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AssessmentQuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AssessmentAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load questions and existing result on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const qList = await api.getAssessmentQuestions();
        setQuestions(qList || []);
        
        const latest = await api.getLatestAssessment();
        if (latest && latest.selected_best_fit_skill) {
          setAnalysisResult(latest);
        }
      } catch (err) {
        console.error('Error loading assessment:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const currentQ = questions[currentIdx];

  // Sync customText when switching questions
  useEffect(() => {
    if (currentQ) {
      setCustomText(answers[String(currentQ.id)] || '');
    }
  }, [currentIdx, currentQ]);

  const handleSelectOption = (optionText: string) => {
    if (!currentQ) return;
    setCustomText(optionText);
    setAnswers((prev) => ({
      ...prev,
      [String(currentQ.id)]: optionText
    }));
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomText(val);
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [String(currentQ.id)]: val
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitAssessmentAnalysis(answers);
    } catch (err) {
      console.warn('Backend assessment submission error, proceeding to career match:', err);
    } finally {
      setSubmitting(false);
      onNavigate('/careers');
    }
  };

  const handleRetake = () => {
    setAnalysisResult(null);
    setAnswers({});
    setCustomText('');
    setCurrentIdx(0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-12 text-center max-w-xl mx-auto shadow-soft">
        <AiOrb size="lg" pulse={true} className="mx-auto mb-4" />
        <p className="text-sm font-normal text-[#6F7782]">Loading skill assessment framework...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Questionnaire View (when no result yet or retaking) */}
      {!analysisResult && questions.length > 0 && (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] shadow-soft overflow-hidden">
          {/* Top Progress & Context */}
          <div className="px-6 py-4 bg-[#F9F9FB] border-b border-[#E4E5E9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#536C8A] bg-[#536C8A]/10 px-2.5 py-1 rounded-full border border-[#536C8A]/20">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-normal text-[#6F7782] tracking-wide uppercase">
                {currentQ?.category?.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs text-[#6F7782] font-mono">
              {Math.round(((currentIdx + 1) / questions.length) * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-[#F9F9FB]">
            <div
              className="h-full bg-[#536C8A] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <span className="text-xs font-normal text-[#536C8A] tracking-wider uppercase block mb-1">
                {currentQ?.title}
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-[#17191C] leading-snug">
                {currentQ?.question}
              </h2>
              <p className="text-xs text-[#6F7782] mt-1.5 font-light">
                Choose a suggested option below or express your answer in your own words.
              </p>
            </div>

            {/* Suggested Options */}
            <div className="space-y-2.5 mb-6">
              <div className="text-xs font-normal text-[#6F7782] flex items-center gap-1.5 mb-2">
                <AiOrb size="xs" glow={false} />
                <span>Suggested Responses</span>
              </div>
              {currentQ?.suggested_options.map((opt, oIdx) => {
                const isSelected = answers[String(currentQ.id)] === opt;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#536C8A] bg-[#536C8A]/5 text-[#17191C] font-normal shadow-xs'
                        : 'border-[#E4E5E9] hover:border-[#A8B9D0]/60 hover:bg-[#F9F9FB] text-[#6F7782]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center transition ${
                        isSelected ? 'border-[#536C8A] bg-[#536C8A]' : 'border-[#E4E5E9] bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="leading-relaxed font-light text-[#17191C]">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Answer Input */}
            <div className="pt-5 border-t border-[#E4E5E9]/60">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-normal text-[#6F7782] flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#6F7782]" />
                  <span>Or write your custom response:</span>
                </label>
                {customText && (
                  <span className="text-[11px] text-[#536C8A] font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#536C8A]" /> Recorded
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={customText}
                onChange={handleCustomTextChange}
                placeholder={currentQ?.placeholder || 'Type your personalized answer here...'}
                className="w-full px-4 py-3 rounded-2xl border border-[#E4E5E9] text-sm text-[#17191C] placeholder-[#6F7782]/50 focus:border-[#536C8A] focus:ring-1 focus:ring-[#536C8A]/20 outline-none transition bg-white"
              />
            </div>

            {/* Controls */}
            <div className="mt-8 pt-5 border-t border-[#E4E5E9]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-normal text-[#6F7782] hover:text-[#17191C] hover:bg-[#F9F9FB] disabled:opacity-30 transition cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!answers[String(currentQ?.id)]?.trim() || submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft disabled:opacity-40 cursor-pointer"
              >
                <span>
                  {submitting
                    ? 'Submitting & Opening AI Career Match...'
                    : currentIdx < questions.length - 1
                    ? 'Next Step'
                    : 'Submit & Proceed to AI Career Match'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Submitting Animation with Central AI Orb */}
      {submitting && (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-soft relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-[#C7B5D9]/25 via-[#A8B9D0]/20 to-transparent blur-3xl pointer-events-none rounded-full" />
          <AiOrb size="2xl" pulse={true} glow={true} className="mx-auto mb-6 animate-orb-analyzing" />
          <h3 className="text-xl font-light text-[#17191C]">Analyzing Your Skill Profile</h3>
          <p className="text-xs text-[#6F7782] mt-2 max-w-sm mx-auto font-light leading-relaxed">
            Synthesizing technical experience, genuine interests, soft skills, and daily work style to extract your
            single highest-yield core superpower...
          </p>
        </div>
      )}

      {/* 3. Completed State: Simple prompt directing to AI Career Match */}
      {analysisResult && !submitting && (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-8 sm:p-12 shadow-soft text-center max-w-xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-light text-[#17191C]">
              Skill Assessment Completed
            </h2>
            <p className="text-xs text-[#6F7782] mt-2 max-w-md mx-auto font-light leading-relaxed">
              Your assessment answers have been recorded. Proceed directly to AI Career Match to analyze your verified skills, synthesize your profile details, and generate your adaptive learning roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('/careers')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
            >
              <span>Proceed to AI Career Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-normal text-[#6F7782] hover:text-[#17191C] bg-[#F9F9FB] border border-[#E4E5E9] transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
