import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Search,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { AtsAnalysisResponse } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

export const AtsResumePage: React.FC = () => {
  const [analysis, setAnalysis] = useState<AtsAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form inputs
  const [targetRole, setTargetRole] = useState('Junior Full-Stack Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Seeking a Junior Full-Stack Engineer with strong TypeScript, React, and REST API skills. Experience with PostgreSQL, Docker containerization, and automated CI/CD pipelines is a plus. Passion for building scalable customer-facing applications.'
  );
  const [resumeText, setResumeText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api.getLatestAts()
      .then((res) => {
        setAnalysis(res);
      })
      .catch(() => {})
      .finally(() => {
        setInitialLoading(false);
      });
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('target_role', targetRole);
      formData.append('job_description', jobDescription);
      if (selectedFile) {
        formData.append('resume_file', selectedFile);
      } else if (resumeText) {
        formData.append('resume_text', resumeText);
      }

      const res = await api.analyzeAts(formData);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
          <FileText className="w-3.5 h-3.5 text-[#536C8A]" />
          <span>AI Resume ATS Analyzer</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
          Applicant Tracking System (ATS) Audit & Bullet Rewrite Engine
        </h2>
        <p className="text-xs text-[#6F7782] mt-1 max-w-2xl font-light leading-relaxed">
          Recruiters use automated ATS parsers to filter candidates. This scanner analyzes your resume against target job descriptions, catches keyword drop-offs, and provides high-conversion STAR rewrites.
        </p>
      </div>

      {/* Input Scanner Form */}
      <form onSubmit={handleScan} className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft space-y-4">
        <h3 className="text-sm font-normal text-[#17191C] pb-3 border-b border-[#E4E5E9]/60">
          Target Job Description & Resume Input
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
              Target Job Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Junior Full-Stack Engineer"
              className="w-full px-4 py-2.5 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
              Upload Resume (PDF / DOCX / TXT)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] hover:bg-white text-xs font-light text-[#17191C] flex items-center gap-2 w-full truncate transition"
              >
                <Upload className="w-3.5 h-3.5 text-[#536C8A] shrink-0" />
                <span className="truncate">
                  {selectedFile ? selectedFile.name : 'Upload PDF/DOCX (or paste text below)'}
                </span>
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-[#6F7782] hover:text-[#17191C] text-xs font-light"
                >
                  Clear
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-normal text-[#6F7782] mb-1.5 flex items-center justify-between">
            <span>Or Paste Resume Text (No profile or file upload needed)</span>
            {selectedFile && <span className="text-[11px] text-[#536C8A]">Uploaded file active</span>}
          </label>
          <textarea
            rows={3}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={!!selectedFile}
            placeholder="Paste your resume experience, skills, and projects here directly..."
            className="w-full px-4 py-2.5 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition font-light leading-relaxed disabled:bg-[#F9F9FB] disabled:text-[#6F7782]"
          />
        </div>

        <div>
          <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
            Target Job Description (Paste from LinkedIn, Indeed, or Company Career Page)
          </label>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste raw job description here..."
            className="w-full px-4 py-3 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition font-light leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft disabled:opacity-40"
          >
            {loading ? (
              <>
                <AiOrb size="xs" />
                <span>Evaluating ATS Match...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Full ATS Compatibility Audit</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Audit Output Dashboard */}
      {analysis && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="text-xs font-normal text-[#6F7782] uppercase tracking-wider block">
                Target Role: {analysis.target_role}
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#17191C] mt-1">
                Overall ATS Compatibility Score
              </h3>
              <p className="text-xs text-[#6F7782] mt-1 max-w-xl font-light leading-relaxed">
                {analysis.summary_verdict}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right flex items-center gap-2">
                <AiOrb size="sm" />
                <span className="font-mono text-4xl font-light text-[#17191C]">
                  {analysis.ats_score}
                </span>
                <span className="text-xs text-[#6F7782] uppercase block font-light">/ 100</span>
              </div>
            </div>
          </div>

          {/* Keywords Match Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="bg-white rounded-[22px] border border-[#E4E5E9] p-5.5 shadow-soft space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E5E9]/60">
                <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#536C8A]" />
                  Matched Keywords ({analysis.matched_keywords.length})
                </span>
                <span className="text-[10px] font-normal text-[#536C8A] bg-[#536C8A]/10 px-2 py-0.5 rounded-full border border-[#536C8A]/20">
                  Detected in Resume
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-3 py-1 rounded-full bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white rounded-[22px] border border-[#E4E5E9] p-5.5 shadow-soft space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E5E9]/60">
                <span className="text-xs font-normal text-[#17191C] uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-[#6F7782]" />
                  Missing Keywords ({analysis.missing_keywords.length})
                </span>
                <span className="text-[10px] font-normal text-[#6F7782] bg-[#F9F9FB] px-2 py-0.5 rounded-full border border-[#E4E5E9]">
                  In Job Description
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-3 py-1 rounded-full bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9]"
                  >
                    ✕ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Formatting & Structure Audit */}
          {analysis.formatting_issues.length > 0 && (
            <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft space-y-4">
              <h4 className="text-sm font-normal text-[#17191C] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#536C8A]" />
                Formatting, Structure & Parser Readability Audit
              </h4>

              <div className="space-y-3">
                {analysis.formatting_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-normal text-[#17191C]">{issue.issue}</span>
                      <p className="text-[#6F7782] font-light mt-0.5">{issue.recommendation}</p>
                    </div>
                    <span
                      className={`text-[10px] font-normal uppercase px-2.5 py-0.5 rounded-full self-start sm:self-center shrink-0 border ${
                        issue.severity === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : issue.severity === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-white text-[#6F7782] border-[#E4E5E9]'
                      }`}
                    >
                      {issue.severity} Severity
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section-by-Section Bullet Point Rewrite Suggestions */}
          <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-normal text-[#17191C] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#536C8A]" />
                  Section-by-Section Bullet Point Rewrite Suggestions
                </h4>
                <p className="text-xs text-[#6F7782] font-light mt-0.5">
                  AI transforms passive phrasing into high-conversion STAR bullets with quantifiable metrics.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {analysis.rewrite_suggestions.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] space-y-3">
                  {/* Before */}
                  <div>
                    <span className="text-[10px] font-normal uppercase tracking-wider text-[#6F7782] block mb-1">
                      Current Phrasing:
                    </span>
                    <div className="text-xs text-[#6F7782] bg-white p-3 rounded-xl border border-[#E4E5E9] font-mono font-light">
                      "{item.original_bullet}"
                    </div>
                  </div>

                  {/* After */}
                  <div>
                    <span className="text-[10px] font-normal uppercase tracking-wider text-[#536C8A] block mb-1">
                      Recommended High-Impact ATS Phrasing:
                    </span>
                    <div className="text-xs text-[#17191C] bg-white p-3 rounded-xl border border-[#536C8A]/30 font-mono flex items-center justify-between gap-3">
                      <span className="leading-relaxed">"{item.improved_bullet}"</span>
                      <button
                        onClick={() => copyBullet(item.improved_bullet, idx)}
                        className="px-2.5 py-1 rounded-lg bg-[#F9F9FB] hover:bg-white text-[#17191C] border border-[#E4E5E9] text-[11px] font-normal flex items-center gap-1 shrink-0 transition"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#536C8A]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#6F7782]" />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#6F7782] font-light">
                    <strong className="text-[#17191C] font-normal">Rationale: </strong>
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
