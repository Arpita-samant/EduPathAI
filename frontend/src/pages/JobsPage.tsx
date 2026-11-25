import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  DollarSign,
  FileText,
  X,
  Globe,
  Radio,
  Zap,
  RefreshCw
} from 'lucide-react';
import { JobMatchItem, JobSourceStatus } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

interface JobsPageProps {
  onNavigate: (route: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<JobMatchItem[]>([]);
  const [activeSources, setActiveSources] = useState<JobSourceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobMatchItem | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobMatches({
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        domain: domainFilter || undefined,
        role_type: roleTypeFilter || undefined,
        search: search || undefined
      });
      setJobs(data.jobs || []);
      if (data.active_sources) {
        setActiveSources(data.active_sources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sourceFilter, domainFilter, roleTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleRunAts = (_job: JobMatchItem) => {
    onNavigate('/resume-ats');
  };

  // Instant real-time as-you-type search matching title, company, domain, description, and skills
  const displayedJobs = jobs.filter((job) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.domain.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      (job.required_skills && job.required_skills.some((s) => s.toLowerCase().includes(term))) ||
      (job.matched_skills && job.matched_skills.some((s) => s.toLowerCase().includes(term))) ||
      (job.missing_skills && job.missing_skills.some((s) => s.toLowerCase().includes(term)))
    );
  });

  const getSourceBadgeStyle = (source?: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('jobicy')) {
      return 'bg-[#C7B5D9]/15 text-[#536C8A] border-[#C7B5D9]/30';
    }
    if (s.includes('arbeitnow')) {
      return 'bg-[#A8B9D0]/15 text-[#193D50] border-[#A8B9D0]/30';
    }
    if (s.includes('himalayas')) {
      return 'bg-[#536C8A]/10 text-[#536C8A] border-[#536C8A]/20';
    }
    if (s.includes('adzuna')) {
      return 'bg-[#193D50]/5 text-[#193D50] border-[#193D50]/15';
    }
    return 'bg-[#F9F9FB] text-[#6F7782] border-[#E4E5E9]';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
              <Radio className="w-3.5 h-3.5 text-[#536C8A] animate-pulse" />
              <span>Real-Time Multi-API Job Stream</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
              Live Role & Internship Matches
            </h2>
            <p className="text-xs text-[#6F7782] mt-1 font-light">
              Aggregated in real time from <strong>Jobicy</strong>, <strong>Arbeitnow</strong>, <strong>Himalayas</strong>, and <strong>Adzuna</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchJobs()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-normal text-[#17191C] bg-[#F9F9FB] hover:bg-white border border-[#E4E5E9] rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#536C8A] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
            <span className="font-mono text-xs font-normal text-[#6F7782] bg-[#F9F9FB] px-3.5 py-2 rounded-xl border border-[#E4E5E9]">
              {displayedJobs.length} Roles Active
            </span>
          </div>
        </div>

        {/* Live Source Status Bar */}
        <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60">
          <span className="text-[11px] font-normal text-[#6F7782] uppercase tracking-wider block mb-2.5">
            Connected Live Job APIs:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { name: 'Jobicy', desc: 'Remote Jobs API', tag: 'Live Active' },
              { name: 'Arbeitnow', desc: 'Tech Board API', tag: 'Live Active' },
              { name: 'Himalayas', desc: 'Remote Jobs API', tag: 'Live Active' },
              { name: 'Adzuna', desc: 'Developer API', tag: 'Connected' }
            ].map((src) => (
              <div
                key={src.name}
                className="p-3 rounded-2xl border border-[#E4E5E9] bg-[#F9F9FB] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-normal text-[#17191C] block">{src.name}</span>
                  <span className="text-[10px] text-[#6F7782] font-light">{src.desc}</span>
                </div>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-white border border-[#E4E5E9] text-[#536C8A]">
                  {src.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Source Filter Chips */}
        <div className="mt-4 pt-4 border-t border-[#E4E5E9]/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-light text-[#6F7782] mr-1">Source:</span>
          {['all', 'jobicy', 'arbeitnow', 'himalayas', 'adzuna'].map((src) => {
            const isSelected = sourceFilter === src;
            return (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1 rounded-full text-xs font-normal capitalize transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#17191C] text-white shadow-soft'
                    : 'bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9] hover:bg-white'
                }`}
              >
                {src === 'all' ? 'All 4 Providers' : src}
              </button>
            );
          })}
        </div>

        {/* Filters & Search Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6F7782]/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search domain, role, company, or skills (e.g. React, Python, Cloud)..."
                className="w-full pl-10 pr-8 py-2.5 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setTimeout(() => fetchJobs(), 0); }}
                  className="absolute right-3 top-3 text-[#6F7782] hover:text-[#17191C]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
            >
              <option value="">All Domains & Fields</option>
              <option value="Software">Software Engineering</option>
              <option value="Frontend">Frontend & Web</option>
              <option value="Backend">Backend & Systems</option>
              <option value="AI">AI / Machine Learning</option>
              <option value="Data">Data Science & Analytics</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="Mobile">Mobile (iOS & Android)</option>
              <option value="Security">Cybersecurity</option>
              <option value="Design">Product & UI/UX</option>
            </select>

            <select
              value={roleTypeFilter}
              onChange={(e) => setRoleTypeFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
            >
              <option value="">All Role Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {displayedJobs.length === 0 && !loading ? (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-12 text-center max-w-xl mx-auto shadow-soft">
          <AiOrb size="md" pulse={true} className="mx-auto mb-4" />
          <h3 className="text-lg font-normal text-[#17191C] mb-1">No Opportunities Found for Selected Filters</h3>
          <p className="text-xs text-[#6F7782] max-w-sm mx-auto mb-5 leading-relaxed font-light">
            No live listings match your current search terms or domain filter. Reset filters to view all live roles across Jobicy, Arbeitnow, Himalayas, and Adzuna.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setDomainFilter('');
              setRoleTypeFilter('');
              setSourceFilter('all');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters & Show All Live Roles</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedJobs.map((job) => (
            <div
              key={job.id}
              className="h-[395px] bg-white rounded-[22px] border border-[#E4E5E9] p-5 hover:border-[#A8B9D0]/60 shadow-soft transition flex flex-col justify-between"
            >
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header: Company, Source & Domain */}
                <div className="h-6 flex items-center justify-between gap-2 mb-2 shrink-0">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className={`text-[10px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getSourceBadgeStyle(job.source)}`}>
                      {job.source || 'Live Feed'}
                    </span>
                    {job.domain && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#F9F9FB] text-[#536C8A] border border-[#E4E5E9] truncate" title={job.domain}>
                        {job.domain}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-normal text-[#17191C] bg-[#F9F9FB] px-2.5 py-0.5 rounded-full border border-[#E4E5E9] shrink-0">
                    <AiOrb size="xs" />
                    <span>{job.match_percentage}%</span>
                  </div>
                </div>

                {/* Company & Title */}
                <div className="flex items-start gap-3 mt-1 shrink-0">
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={job.company}
                      className="w-9 h-9 rounded-xl object-contain bg-[#F9F9FB] border border-[#E4E5E9] shrink-0 p-1"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-light text-[#6F7782] block truncate">
                      {job.company}
                    </span>
                    <h3 className="text-sm font-normal text-[#17191C] leading-snug line-clamp-2 h-10 flex items-center" title={job.title}>
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* Badges: Role Type & Experience */}
                <div className="h-6 flex items-center gap-1.5 mt-2 shrink-0 overflow-hidden">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9] shrink-0">
                    {job.role_type || 'Full-Time'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9] shrink-0 truncate">
                    {job.experience_level || 'Entry / Mid'}
                  </span>
                </div>

                {/* Location & Salary */}
                <div className="h-5 flex items-center gap-2 mt-2 text-[11px] text-[#6F7782] font-light shrink-0">
                  <span className="flex items-center gap-1 truncate max-w-[130px]">
                    <MapPin className="w-3 h-3 text-[#6F7782]/60 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#17191C] truncate flex-1 min-w-0">
                    <DollarSign className="w-3 h-3 text-[#6F7782]/60 shrink-0" />
                    <span className="truncate">{job.salary_range}</span>
                  </span>
                </div>

                {/* Description Preview */}
                <p className="text-xs text-[#6F7782] font-light mt-2 line-clamp-2 h-9 leading-relaxed overflow-hidden shrink-0">
                  {job.description}
                </p>

                {/* Skill Overlap Badges */}
                <div className="mt-auto pt-2 border-t border-[#E4E5E9]/60 h-8 flex items-center gap-1 overflow-hidden shrink-0">
                  {job.matched_skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 shrink-0 truncate max-w-[100px]"
                      title={s}
                    >
                      ✓ {s}
                    </span>
                  ))}
                  {job.missing_skills.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9] shrink-0 truncate max-w-[90px]"
                      title={s}
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-3 pt-3 border-t border-[#E4E5E9]/60 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 py-2 px-3 text-xs font-normal rounded-xl bg-[#F9F9FB] hover:bg-white border border-[#E4E5E9] text-[#17191C] transition text-center cursor-pointer truncate"
                >
                  View Details
                </button>
                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Apply Directly"
                    className="p-2 rounded-xl bg-[#536C8A]/10 hover:bg-[#536C8A]/20 text-[#536C8A] border border-[#536C8A]/20 transition shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191C]/30 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-xl w-full border border-[#E4E5E9] shadow-soft overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-normal uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSourceBadgeStyle(selectedJob.source)}`}>
                      Live from {selectedJob.source || 'Job Board'}
                    </span>
                    <span className="text-xs text-[#6F7782] font-light">• {selectedJob.role_type}</span>
                  </div>
                  <h3 className="text-xl font-normal text-[#17191C]">
                    {selectedJob.title}
                  </h3>
                  <div className="text-xs font-normal text-[#536C8A] mt-0.5">
                    {selectedJob.company}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F7782] font-light mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#F9F9FB] border border-[#E4E5E9] text-[#17191C]">{selectedJob.location}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F9F9FB] border border-[#E4E5E9] text-[#17191C]">{selectedJob.salary_range}</span>
                    {selectedJob.domain && (
                      <span className="px-2 py-0.5 rounded-md bg-[#536C8A]/10 border border-[#536C8A]/20 text-[#536C8A] font-normal">{selectedJob.domain}</span>
                    )}
                    {selectedJob.experience_level && (
                      <span className="px-2 py-0.5 rounded-md bg-[#F9F9FB] border border-[#E4E5E9] text-[#6F7782]">{selectedJob.experience_level}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1.5 text-[#6F7782] hover:text-[#17191C] rounded-xl hover:bg-[#F9F9FB] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Match Gauge */}
              <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-[#17191C] font-normal block">Your Role Match Score</span>
                  <div className="text-[11px] text-[#6F7782] font-light">Calibrated against your verified skills</div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xl font-normal text-[#17191C]">
                  <AiOrb size="sm" />
                  <span>{selectedJob.match_percentage}%</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-[#6F7782] font-light leading-relaxed mb-4 max-h-48 overflow-y-auto bg-[#F9F9FB] p-4 rounded-2xl border border-[#E4E5E9]">
                {selectedJob.description}
              </div>

              {/* Skills Breakdown */}
              <div className="space-y-3 mb-6">
                {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                  <div>
                    <span className="text-xs font-normal text-[#17191C] block mb-1.5">
                      All Key Role Skills ({selectedJob.required_skills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.required_skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-normal text-[#17191C] block mb-1.5">
                    Skills You Match ({selectedJob.matched_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.matched_skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.missing_skills.length > 0 && (
                  <div>
                    <span className="text-xs font-normal text-[#6F7782] block mb-1.5">
                      Missing Target Skills ({selectedJob.missing_skills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.missing_skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9]"
                        >
                          ✕ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-[#E4E5E9]/60">
                {selectedJob.apply_url && (
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft"
                  >
                    <span>Apply Directly on {selectedJob.source || 'Provider'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => handleRunAts(selectedJob)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] hover:bg-white border border-[#E4E5E9] text-[#17191C] transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#536C8A]" />
                  <span>ATS Resume Audit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
