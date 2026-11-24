import React, { useEffect, useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Save,
  AlertCircle,
  ExternalLink,
  Award,
  GitBranch
} from 'lucide-react';
import { StudentProfile, TechnicalSkill, ProjectItem, CertificationItem } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState<number>(2026);
  const [gpa, setGpa] = useState<number>(3.8);
  const [careerGoals, setCareerGoals] = useState('');
  const [targetCareer, setTargetCareer] = useState('');

  const [skills, setSkills] = useState<TechnicalSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState(3);

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data);
      setEducationLevel(data.education_level || 'Undergraduate');
      setDegree(data.degree || '');
      setMajor(data.major || '');
      setGradYear(data.graduation_year || 2026);
      setGpa(data.gpa || 3.8);
      setCareerGoals(data.career_goals || '');
      setTargetCareer(data.target_career || '');
      setSkills(data.technical_skills || []);
      setProjects(data.projects || []);
      setCertifications(data.certifications || []);
      setSoftSkills(data.soft_skills || []);
      setInterests(data.interests || []);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.updateProfile({
        education_level: educationLevel,
        degree,
        major,
        graduation_year: Number(gradYear),
        gpa: Number(gpa),
        technical_skills: skills,
        soft_skills: softSkills,
        certifications,
        projects,
        interests,
        career_goals: careerGoals,
        target_career: targetCareer
      });
      setProfile(updated);
      setMessage({ text: 'Profile saved successfully! Completeness updated.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Error saving profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setParsing(true);
    setMessage(null);
    try {
      const res = await api.parseResume(formData);
      const ext = res.extracted_profile;
      if (ext.degree) setDegree(ext.degree);
      if (ext.major) setMajor(ext.major);
      if (ext.graduation_year) setGradYear(ext.graduation_year);
      if (ext.gpa) setGpa(ext.gpa);
      if (ext.technical_skills) setSkills(ext.technical_skills);
      if (ext.soft_skills) setSoftSkills(ext.soft_skills);
      if (ext.certifications) setCertifications(ext.certifications);
      if (ext.projects) setProjects(ext.projects);
      if (ext.interests) setInterests(ext.interests);
      if (ext.career_goals) setCareerGoals(ext.career_goals);

      setMessage({
        text: 'Resume parsed with structured extraction. Profile fields have been populated below.',
        type: 'success'
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to extract resume details', type: 'error' });
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      { name: newSkillName.trim(), proficiency: newSkillProf, verified: false }
    ]);
    setNewSkillName('');
    setNewSkillProf(3);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: 'New Portfolio Project',
        tech_stack: ['React', 'TypeScript'],
        github_link: '',
        live_link: '',
        description: 'Describe the problem solved, architecture used, and quantifiable outcome.'
      }
    ]);
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AiOrb size="md" pulse={true} />
          <span className="text-xs text-[#6F7782] font-normal">Loading student profile...</span>
        </div>
      </div>
    );
  }

  const completeness = profile?.completeness_score || 85;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header + Completeness Meter */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-5 sm:p-7 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
              Smart Student Profile
            </h2>
            <p className="text-xs text-[#6F7782] mt-1 font-light">
              Your comprehensive baseline used for AI career matching, adaptive assessments, and ATS scoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] text-[#17191C] hover:bg-white border border-[#E4E5E9] transition disabled:opacity-40 cursor-pointer"
            >
              <AiOrb size="xs" />
              <span>{parsing ? 'Parsing Resume...' : 'Auto-Fill via Resume'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft disabled:opacity-40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="pt-4 border-t border-[#E4E5E9]/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-normal text-[#17191C]">Profile Completeness</span>
            <span className="font-mono text-[#536C8A] font-normal">{completeness}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F9F9FB] rounded-full overflow-hidden border border-[#E4E5E9]">
            <div
              className="h-full bg-[#536C8A] rounded-full transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs border ${
              message.type === 'success'
                ? 'bg-white text-[#17191C] border-[#E4E5E9] shadow-soft'
                : 'bg-white text-rose-700 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#536C8A]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="font-light">{message.text}</span>
          </div>
        )}
      </div>

      {/* Main Multi-Section Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic Background */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
          <h3 className="text-base font-normal text-[#17191C] mb-4 pb-3 border-b border-[#E4E5E9]/60">
            01. Academic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
                Degree / Program
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech in Computer Science & Engineering"
                className="w-full px-4 py-2.5 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
                Major / Field of Study
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(Number(e.target.value))}
                placeholder="2026"
                className="w-full px-4 py-2.5 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
                Cumulative GPA
              </label>
              <input
                type="number"
                step="0.01"
                value={gpa}
                onChange={(e) => setGpa(Number(e.target.value))}
                placeholder="3.82"
                className="w-full px-4 py-2.5 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E5E9]/60">
            <div>
              <h3 className="text-base font-normal text-[#17191C]">
                02. Technical Skills & Verified Competencies
              </h3>
              <p className="text-xs text-[#6F7782] font-light mt-0.5">
                Self-rated proficiency (1–5). Verified skills reflect confirmed assessment outcomes.
              </p>
            </div>
          </div>

          {/* Add skill input row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5 p-3.5 bg-[#F9F9FB] rounded-2xl border border-[#E4E5E9]">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name (e.g. Docker, PostgreSQL, Go)"
              className="flex-1 w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E4E5E9] bg-white text-[#17191C] placeholder-[#6F7782]/50 focus:border-[#536C8A] outline-none"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#6F7782] font-light whitespace-nowrap">Proficiency:</span>
              <select
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(Number(e.target.value))}
                className="px-3 py-2 text-xs rounded-xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Elementary</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-normal bg-[#17191C] text-white hover:bg-[#536C8A] transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl border border-[#E4E5E9] bg-white flex items-center justify-between gap-2 shadow-soft"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-[#17191C] truncate">
                      {skill.name}
                    </span>
                    {skill.verified && (
                      <span
                        title="Verified by Assessment"
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#536C8A]" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6F7782] font-light">
                    <span>Level {skill.proficiency}/5</span>
                    {skill.score && <span className="font-mono text-[#536C8A]">({skill.score}%)</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="p-1.5 text-[#6F7782] hover:text-rose-500 rounded-lg hover:bg-[#F9F9FB] transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Portfolio Projects */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E5E9]/60">
            <div>
              <h3 className="text-base font-normal text-[#17191C]">
                03. Portfolio Projects & Evidence
              </h3>
              <p className="text-xs text-[#6F7782] font-light mt-0.5">
                Technical projects used to calculate project health and ATS evidence.
              </p>
            </div>
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-normal bg-[#F9F9FB] hover:bg-white text-[#17191C] border border-[#E4E5E9] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                    placeholder="Project Title"
                    className="font-normal text-sm text-[#17191C] bg-transparent border-b border-dashed border-[#E4E5E9] focus:border-[#536C8A] outline-none pb-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-[#6F7782] hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal text-[#6F7782] mb-1">
                      GitHub Repo URL
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E4E5E9] bg-white">
                      <GitBranch className="w-3.5 h-3.5 text-[#6F7782]" />
                      <input
                        type="url"
                        value={proj.github_link || ''}
                        onChange={(e) => updateProject(idx, 'github_link', e.target.value)}
                        placeholder="https://github.com/user/repo"
                        className="text-xs w-full outline-none text-[#17191C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-[#6F7782] mb-1">
                      Live Preview URL (Optional)
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E4E5E9] bg-white">
                      <ExternalLink className="w-3.5 h-3.5 text-[#6F7782]" />
                      <input
                        type="url"
                        value={proj.live_link || ''}
                        onChange={(e) => updateProject(idx, 'live_link', e.target.value)}
                        placeholder="https://demo.vercel.app"
                        className="text-xs w-full outline-none text-[#17191C]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-[#6F7782] mb-1">
                    Description & Quantifiable Impact
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    placeholder="What did you build? What was the outcome or scale?"
                    className="w-full px-3.5 py-2.5 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-xl border border-[#E4E5E9] bg-white focus:border-[#536C8A] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Career Goals & Aspirations */}
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
          <h3 className="text-base font-normal text-[#17191C] mb-4 pb-3 border-b border-[#E4E5E9]/60">
            04. Career Goals & Aspirations
          </h3>

          <div>
            <label className="block text-xs font-normal text-[#6F7782] mb-1.5">
              Target Aspirations & Desired Trajectory
            </label>
            <textarea
              rows={3}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="e.g. Seeking an Associate Full-Stack or AI Application Engineer role where I can build scalable web products..."
              className="w-full px-4 py-3 text-xs sm:text-sm text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
            />
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile & Update Readiness'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
