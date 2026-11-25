import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Star,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  X,
  Compass
} from 'lucide-react';
import { LearningResourceItem } from '../types';
import { api } from '../api/client';
import { INITIAL_CURATED_COURSES } from '../data/curatedCourses';
import { AiOrb } from '../components/common/AiOrb';

interface ResourcesPageProps {
  initialSkillFilter?: string;
}

const DOMAIN_CATEGORIES = [
  { label: 'All (100 Courses)', value: '' },
  { label: 'AI / ML', value: 'AI / ML' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Programming', value: 'Programming' },
  { label: 'DSA & CS', value: 'Computer Science' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Databases & SQL', value: 'Databases' },
  { label: 'Cloud Computing', value: 'Cloud' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'DevOps & Systems', value: 'DevOps' },
];

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ initialSkillFilter = '' }) => {
  const [resources, setResources] = useState<LearningResourceItem[]>(INITIAL_CURATED_COURSES);
  const [prioritizedSkills, setPrioritizedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [skillTag, setSkillTag] = useState(initialSkillFilter);
  const [resourceType, setResourceType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources({
        skill: skillTag || selectedDomain || undefined,
        resource_type: resourceType || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined
      });
      if (data && data.resources && data.resources.length > 0) {
        setResources(data.resources);
      }
      if (data && data.prioritized_skills) {
        setPrioritizedSkills(data.prioritized_skills);
      }
    } catch (err) {
      console.warn('[Resources] Fetch fallback to bundled 100 directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [skillTag, selectedDomain, resourceType, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const toggleCompleted = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Instant real-time as-you-type search matching title, provider, skill tag, or type
  const displayedResources = resources.filter((res) => {
    // Domain filter
    if (selectedDomain && !res.skill_tag.toLowerCase().includes(selectedDomain.toLowerCase())) {
      return false;
    }
    // Specific skill tag filter
    if (skillTag && !res.skill_tag.toLowerCase().includes(skillTag.toLowerCase())) {
      return false;
    }
    // Resource type filter
    if (resourceType && res.resource_type.toLowerCase() !== resourceType.toLowerCase()) {
      return false;
    }
    // Difficulty filter
    if (difficulty && !res.difficulty.toLowerCase().includes(difficulty.toLowerCase())) {
      return false;
    }
    // Search query matching (e.g. typing "ai" matches any course whose name/title, provider, or topic includes "ai")
    if (search.trim()) {
      const sq = search.trim().toLowerCase();
      const inTitle = res.title.toLowerCase().includes(sq);
      const inProvider = res.provider.toLowerCase().includes(sq);
      const inSkill = res.skill_tag.toLowerCase().includes(sq);
      const inType = res.resource_type.toLowerCase().includes(sq);
      return inTitle || inProvider || inSkill || inType;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#536C8A]" />
              <span>100 Free Technology Courses Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
              Curated Free Learning Hub
            </h2>
            <p className="text-xs text-[#6F7782] mt-1 max-w-2xl font-light leading-relaxed">
              100 battle-tested free courses across Web Dev, AI/ML, Languages, DSA, Data Science, Databases, Cloud, Cybersecurity, and DevOps. Zero affiliate barriers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#17191C] bg-[#F9F9FB] px-3.5 py-2 rounded-xl border border-[#E4E5E9]">
              {displayedResources.length} Courses Active
            </span>
          </div>
        </div>

        {/* Major Domain Category Chips */}
        <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-light text-[#6F7782] mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#536C8A]" />
            Domain:
          </span>
          {DOMAIN_CATEGORIES.map((cat) => {
            const isSelected = selectedDomain === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedDomain(cat.value);
                  setSkillTag('');
                }}
                className={`text-xs px-3 py-1 rounded-full border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#17191C] text-white border-[#17191C] shadow-soft'
                    : 'bg-[#F9F9FB] text-[#6F7782] border-[#E4E5E9] hover:bg-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Prioritized Skill Chips if available */}
        {prioritizedSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-light text-[#6F7782] flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
              Target Skills:
            </span>
            {prioritizedSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => setSkillTag(sk)}
                className={`text-xs font-mono px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                  skillTag === sk
                    ? 'bg-[#536C8A] text-white border-[#536C8A]'
                    : 'bg-[#F9F9FB] text-[#536C8A] border-[#E4E5E9] hover:bg-white'
                }`}
              >
                {sk}
              </button>
            ))}
            {skillTag && (
              <button
                onClick={() => setSkillTag('')}
                className="text-xs text-[#536C8A] hover:underline font-normal ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Search & Filters Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6F7782]/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, skills, or topics (e.g. type 'ai', 'python', 'docker')..."
                className="w-full pl-10 pr-8 py-2.5 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
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
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
            >
              <option value="">All Formats</option>
              <option value="Free Course">Free Courses</option>
              <option value="Documentation">Documentation & Handbooks</option>
              <option value="Tutorial">Tutorials & Guides</option>
              <option value="Practice Platform">Practice Platforms</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {displayedResources.length === 0 && !loading ? (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-12 text-center max-w-xl mx-auto shadow-soft">
          <AiOrb size="md" pulse={true} className="mx-auto mb-4" />
          <h3 className="text-lg font-normal text-[#17191C] mb-1">No Free Courses Found Matching "{search}"</h3>
          <p className="text-xs text-[#6F7782] max-w-sm mx-auto mb-5 leading-relaxed font-light">
            Try typing a shorter keyword (like "ai", "react", "cloud") or select "All (100 Courses)" to explore our full curriculum directory.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDomain('');
              setSkillTag('');
              setResourceType('');
              setDifficulty('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Search & Show All 100 Courses</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedResources.map((res) => {
            const isDone = completedIds.has(res.id);
            return (
              <div
                key={res.id}
                className={`h-[295px] bg-white rounded-[22px] border p-5 transition flex flex-col justify-between shadow-soft ${
                  isDone
                    ? 'border-[#536C8A]/40 bg-[#F9F9FB]'
                    : 'border-[#E4E5E9] hover:border-[#A8B9D0]/60'
                }`}
              >
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="h-6 flex items-center justify-between gap-2 shrink-0">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#F9F9FB] border border-[#E4E5E9] text-[#6F7782] truncate">
                      {res.resource_type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[#536C8A] shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#536C8A] text-[#536C8A]" />
                      <span className="font-mono">{res.rating || 4.8}</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-normal text-[#17191C] mt-2.5 leading-snug line-clamp-2 h-11 flex items-center shrink-0" title={res.title}>
                    {res.title}
                  </h3>
                  <span className="text-xs text-[#6F7782] font-light block mt-1 truncate h-5 shrink-0">
                    Platform: <strong className="font-medium text-[#17191C]">{res.provider}</strong>
                  </span>

                  <div className="mt-auto pt-3 flex flex-wrap items-center gap-1.5 text-[11px] h-7 overflow-hidden shrink-0">
                    <span className="font-mono px-2.5 py-0.5 rounded-full bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 truncate max-w-[150px]" title={res.skill_tag}>
                      {res.skill_tag}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9] shrink-0">
                      {res.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[#2E7D32] border border-[#E4E5E9] shrink-0 font-medium">
                      100% Free
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3.5 border-t border-[#E4E5E9]/60 flex items-center justify-between gap-3 shrink-0">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft truncate"
                  >
                    <span>Open Free Course</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  <button
                    onClick={() => toggleCompleted(res.id)}
                    title={isDone ? 'Mark Incomplete' : 'Mark as Completed'}
                    className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                      isDone
                        ? 'bg-[#536C8A] text-white border-[#536C8A]'
                        : 'border-[#E4E5E9] text-[#6F7782] hover:text-[#17191C] hover:bg-[#F9F9FB]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
