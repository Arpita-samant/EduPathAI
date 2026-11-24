import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Star,
  Sparkles,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  Layers
} from 'lucide-react';
import { LearningResourceItem } from '../types';
import { api } from '../api/client';
import { AiOrb } from '../components/common/AiOrb';

interface ResourcesPageProps {
  initialSkillFilter?: string;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ initialSkillFilter = '' }) => {
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [prioritizedSkills, setPrioritizedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [skillTag, setSkillTag] = useState(initialSkillFilter);
  const [resourceType, setResourceType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources({
        skill: skillTag || undefined,
        resource_type: resourceType || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined
      });
      setResources(data.resources || []);
      setPrioritizedSkills(data.prioritized_skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [skillTag, resourceType, difficulty]);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#536C8A]" />
              <span>Curated Free Learning Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
              High-Signal Free Resources Mapped to Your Gaps
            </h2>
            <p className="text-xs text-[#6F7782] mt-1 max-w-2xl font-light leading-relaxed">
              Zero paid affiliate spam. Only battle-tested official documentation, top open-source repositories, interactive tutorials, and practice platforms.
            </p>
          </div>

          <span className="font-mono text-xs text-[#6F7782] bg-[#F9F9FB] px-3.5 py-1.5 rounded-xl border border-[#E4E5E9]">
            {resources.length} Curated Materials
          </span>
        </div>

        {/* Prioritized Skill Chips */}
        {prioritizedSkills.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-light text-[#6F7782] flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
              Prioritized by Your Gaps:
            </span>
            {prioritizedSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => setSkillTag(sk)}
                className={`text-xs font-mono px-3 py-1 rounded-full border transition cursor-pointer ${
                  skillTag === sk
                    ? 'bg-[#17191C] text-white border-[#17191C]'
                    : 'bg-[#F9F9FB] text-[#6F7782] border-[#E4E5E9] hover:bg-white'
                }`}
              >
                {sk}
              </button>
            ))}
            {skillTag && (
              <button
                onClick={() => setSkillTag('')}
                className="text-xs text-[#536C8A] hover:underline font-normal ml-2 cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-[#6F7782]/60 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resource title, concept, or provider..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-[#17191C] placeholder-[#6F7782]/50 rounded-2xl border border-[#E4E5E9] focus:border-[#536C8A] outline-none bg-white transition"
            />
          </form>

          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
          >
            <option value="">All Resource Types</option>
            <option value="Free Course">Free Courses</option>
            <option value="Documentation">Official Documentation</option>
            <option value="GitHub Repo">GitHub Repositories</option>
            <option value="Tutorial">Tutorials</option>
            <option value="Practice Platform">Practice Platforms</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-2xl border border-[#E4E5E9] bg-white text-[#17191C] outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((res) => {
          const isDone = completedIds.has(res.id);
          return (
            <div
              key={res.id}
              className={`bg-white rounded-[22px] border p-5.5 transition flex flex-col justify-between shadow-soft ${
                isDone
                  ? 'border-[#536C8A]/40 bg-[#F9F9FB]'
                  : 'border-[#E4E5E9] hover:border-[#A8B9D0]/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#F9F9FB] border border-[#E4E5E9] text-[#6F7782]">
                    {res.resource_type}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#536C8A]">
                    <Star className="w-3.5 h-3.5 fill-[#536C8A] text-[#536C8A]" />
                    <span className="font-mono">{res.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-normal text-[#17191C] mt-3 leading-snug">
                  {res.title}
                </h3>
                <span className="text-xs text-[#6F7782] font-light block mt-1">
                  Provided by {res.provider}
                </span>

                <div className="flex items-center gap-2 mt-4 text-[11px]">
                  <span className="font-mono px-2.5 py-0.5 rounded-full bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20">
                    {res.skill_tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9]">
                    {res.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#536C8A] border border-[#E4E5E9]">
                    100% Free
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#E4E5E9]/60 flex items-center justify-between gap-3">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => toggleCompleted(res.id)}
                  title={isDone ? 'Mark Incomplete' : 'Mark as Completed'}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
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
    </div>
  );
};
