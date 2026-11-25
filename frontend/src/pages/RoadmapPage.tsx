import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { RoadmapResponse, MilestoneItem } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getUserVault } from '../utils/dataVault';
import { AiOrb } from '../components/common/AiOrb';

interface RoadmapPageProps {
  onNavigate?: (route: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveRoadmap();
      if (!data && user?.email) {
        const vault = getUserVault(user.email);
        if (vault?.target_career) {
          try {
            const genData = await api.generateRoadmap(vault.target_career);
            setRoadmap(genData);
            return;
          } catch {
            // non-fatal
          }
        }
      }
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [user?.email]);

  const handleToggleStatus = async (m: MilestoneItem) => {
    const nextStatus: 'completed' | 'in_progress' = m.status === 'completed' ? 'in_progress' : 'completed';
    // Optimistic UI update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated: MilestoneItem[] = prev.milestones.map((item) =>
        item.id === m.id ? { ...item, status: nextStatus } : item
      );
      const compCount = updated.filter((i) => i.status === 'completed').length;
      const pct = Math.round((compCount / (updated.length || 1)) * 100);
      return {
        ...prev,
        milestones: updated,
        completed_milestones: compCount,
        progress_percentage: pct
      };
    });

    try {
      await api.updateMilestone(m.id, nextStatus);
    } catch (err: any) {
      console.error(err);
      fetchRoadmap();
    }
  };

  const escapeHtml = (str: string) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleExportPDF = () => {
    if (!roadmap) return;

    const printWindow = window.open('', '_blank', 'width=960,height=850');
    if (!printWindow) {
      alert('Please enable popups in your browser to download your roadmap.');
      return;
    }

    const studentName = user?.full_name || 'Student';
    const studentEmail = user?.email || '';
    const targetCareer = roadmap.target_career || 'Target Career';
    const totalMilestones = roadmap.total_milestones || (roadmap.milestones?.length || 0);
    const completedMilestones = roadmap.completed_milestones || 0;
    const progressPct = roadmap.progress_percentage || Math.round((completedMilestones / (totalMilestones || 1)) * 100);
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const milestones = roadmap.milestones || [];
    const phases = ['Foundation', 'Intermediate', 'Capstone & Job-Ready'];

    let milestonesSectionsHtml = '';

    phases.forEach((phase) => {
      const phaseMilestones = milestones.filter(
        (m) => (m.phase || '').toLowerCase().includes(phase.toLowerCase().split(' ')[0])
      );
      if (phaseMilestones.length === 0) return;

      milestonesSectionsHtml += `
        <div class="phase-section">
          <div class="phase-title">
            <span>${escapeHtml(phase)} Phase</span>
          </div>
          <div class="milestones-grid">
      `;

      phaseMilestones.forEach((m) => {
        const isDone = m.status === 'completed';
        const isCurrent = m.status === 'in_progress';
        const statusLabel = isDone ? 'Completed' : (isCurrent ? 'In Progress' : 'Pending');
        const statusBadgeClass = isDone ? 'badge-completed' : (isCurrent ? 'badge-progress' : 'badge-pending');

        const topicsList = (m.topics || []).map((t: any) => {
          const tName = typeof t === 'string' ? t : t.name;
          return `<span class="topic-tag">${escapeHtml(tName)}</span>`;
        }).join(' ');

        const resourcesList = (m.resource_links || []).map((r: any) => `
          <a href="${escapeHtml(r.url || '#')}" target="_blank" class="resource-link">
            ${escapeHtml(r.title || 'Resource')}
          </a>
        `).join('');

        milestonesSectionsHtml += `
          <div class="milestone-card ${isCurrent ? 'current-card' : ''}">
            <div class="milestone-header">
              <div class="milestone-meta">
                <span class="week-pill">Week ${m.week_number}</span>
                <span class="milestone-title">${escapeHtml(m.title)}</span>
              </div>
              <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
            </div>

            <p class="milestone-desc">${escapeHtml(m.description || '')}</p>

            ${topicsList ? `
              <div class="section-group">
                <div class="group-title">Topics to Learn:</div>
                <div class="topics-wrap">${topicsList}</div>
              </div>
            ` : ''}

            ${m.project_prompt ? `
              <div class="section-group project-box">
                <div class="group-title">Weekly Project:</div>
                <div class="project-text">${escapeHtml(m.project_prompt)}</div>
              </div>
            ` : ''}

            ${resourcesList ? `
              <div class="section-group">
                <div class="group-title">Recommended Resources:</div>
                <div class="resources-flex">${resourcesList}</div>
              </div>
            ` : ''}
          </div>
        `;
      });

      milestonesSectionsHtml += `
          </div>
        </div>
      `;
    });

    if (!milestonesSectionsHtml && milestones.length > 0) {
      milestonesSectionsHtml = milestones.map((m) => `
        <div class="milestone-card">
          <div class="milestone-header">
            <span class="week-pill">Week ${m.week_number}</span>
            <span class="milestone-title">${escapeHtml(m.title)}</span>
          </div>
          <p class="milestone-desc">${escapeHtml(m.description || '')}</p>
        </div>
      `).join('');
    }

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Career Roadmap - ${escapeHtml(targetCareer)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #17191C;
      background: #F9F9FB;
      line-height: 1.5;
      padding: 24px;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border-radius: 16px;
      border: 1px solid #E4E5E9;
    }

    .action-bar {
      position: sticky;
      top: 0;
      max-width: 860px;
      margin: 0 auto 20px auto;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #E4E5E9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      z-index: 100;
    }

    .action-bar .tip {
      font-size: 13px;
      color: #6F7782;
    }

    .btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: #536C8A;
      color: white;
    }

    .btn-secondary {
      background: #F9F9FB;
      color: #17191C;
      border: 1px solid #E4E5E9;
      margin-left: 8px;
    }

    .doc-header {
      border-bottom: 2px solid #E4E5E9;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      color: #536C8A;
      margin-bottom: 4px;
    }

    .main-title {
      font-size: 24px;
      font-weight: 600;
      color: #17191C;
      margin-bottom: 6px;
    }

    .sub-meta {
      font-size: 12px;
      color: #6F7782;
      display: flex;
      gap: 16px;
    }

    .stats-row {
      display: flex;
      gap: 12px;
      margin-bottom: 28px;
    }

    .stat-box {
      flex: 1;
      background: #F9F9FB;
      border: 1px solid #E4E5E9;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }

    .stat-val {
      font-size: 18px;
      font-weight: 700;
      color: #17191C;
    }

    .stat-lbl {
      font-size: 11px;
      color: #6F7782;
      margin-top: 2px;
    }

    .phase-section {
      margin-bottom: 24px;
    }

    .phase-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #536C8A;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #E4E5E9;
    }

    .milestones-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .milestone-card {
      border: 1px solid #E4E5E9;
      border-radius: 10px;
      padding: 16px;
      background: #ffffff;
      page-break-inside: avoid;
    }

    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .milestone-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .week-pill {
      font-size: 11px;
      font-weight: 600;
      background: #536C8A;
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .milestone-title {
      font-size: 14px;
      font-weight: 600;
      color: #17191C;
    }

    .status-badge {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .badge-completed {
      background: #E8F5E9;
      color: #2E7D32;
    }

    .badge-progress {
      background: #EFF6FF;
      color: #536C8A;
    }

    .badge-pending {
      background: #F1F3F5;
      color: #6F7782;
    }

    .milestone-desc {
      font-size: 12px;
      color: #555E68;
      line-height: 1.5;
      margin-bottom: 10px;
    }

    .section-group {
      margin-top: 8px;
    }

    .group-title {
      font-size: 11px;
      font-weight: 600;
      color: #17191C;
      margin-bottom: 4px;
    }

    .topics-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .topic-tag {
      font-size: 11px;
      background: #F9F9FB;
      border: 1px solid #E4E5E9;
      color: #17191C;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .project-box {
      background: #F9F9FB;
      border-radius: 8px;
      padding: 10px;
      margin-top: 8px;
      border: 1px solid #E4E5E9;
    }

    .project-text {
      font-size: 11px;
      color: #2D3748;
      line-height: 1.4;
    }

    .resources-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .resource-link {
      font-size: 11px;
      color: #536C8A;
      text-decoration: none;
      background: #F9F9FB;
      border: 1px solid #E4E5E9;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .doc-footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #E4E5E9;
      text-align: center;
      font-size: 11px;
      color: #6F7782;
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .action-bar {
        display: none !important;
      }
      .container {
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      @page {
        size: A4 portrait;
        margin: 15mm 12mm 15mm 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <span class="tip">In the print destination dialog, select <strong>Save as PDF</strong> to download your roadmap.</span>
    <div>
      <button class="btn btn-primary" onclick="window.print()">Save as PDF</button>
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="container">
    <div class="doc-header">
      <div class="brand-name">CareerVector AI</div>
      <h1 class="main-title">${escapeHtml(targetCareer)} Roadmap</h1>
      <div class="sub-meta">
        <span>${escapeHtml(studentName)}</span>
        <span>${escapeHtml(generatedDate)}</span>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-val">${progressPct}%</div>
        <div class="stat-lbl">Progress</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${completedMilestones} / ${totalMilestones}</div>
        <div class="stat-lbl">Completed</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${roadmap.estimated_weeks || 8} Weeks</div>
        <div class="stat-lbl">Duration</div>
      </div>
    </div>

    <div>
      ${milestonesSectionsHtml}
    </div>

    <div class="doc-footer">
      <p>Generated by CareerVector AI • https://careervector-sepia.vercel.app</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  if (loading && !roadmap) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AiOrb size="md" pulse={true} />
          <span className="text-xs text-[#6F7782] font-normal">Loading your roadmap...</span>
        </div>
      </div>
    );
  }

  const milestones = roadmap?.milestones || [];
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredMilestones = milestones.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const phases = ['Foundation', 'Intermediate', 'Capstone & Job-Ready'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Locked State */}
      {roadmap?.is_locked || totalCount === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-10 text-center max-w-lg mx-auto shadow-soft">
          <AiOrb size="md" pulse={true} className="mx-auto mb-4" />
          <h3 className="text-lg font-normal text-[#17191C] mb-2">Roadmap is Locked</h3>
          <p className="text-xs text-[#6F7782] mb-6 leading-relaxed font-light">
            Complete your Skill Assessment to generate your personalized step-by-step learning roadmap.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('/assessment')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
          >
            <span>Start Skill Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-white rounded-[20px] border border-[#E4E5E9] p-6 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-[#17191C] tracking-tight">
                  {roadmap?.target_career || 'Learning'} Roadmap
                </h2>
                <p className="text-xs text-[#6F7782] mt-1 font-light">
                  8-week step-by-step curriculum with hands-on projects and free learning resources
                </p>
              </div>

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#17191C] font-normal">
                  {completedCount} of {totalCount} weeks completed
                </span>
                <span className="font-mono text-[#536C8A] font-normal">{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F3F5] overflow-hidden">
                <div
                  className="h-full bg-[#536C8A] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Simple Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#17191C] text-white'
                  : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
              }`}
            >
              All Weeks ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition cursor-pointer ${
                statusFilter === 'in_progress'
                  ? 'bg-[#536C8A] text-white'
                  : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-[#536C8A] text-white'
                  : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Milestones grouped by phase */}
          <div className="space-y-6">
            {phases.map((phaseName) => {
              const phaseMilestones = filteredMilestones.filter((m) =>
                (m.phase || '').toLowerCase().includes(phaseName.toLowerCase().split(' ')[0])
              );

              if (phaseMilestones.length === 0) return null;

              return (
                <div key={phaseName} className="space-y-3">
                  <h3 className="text-xs font-normal uppercase tracking-wider text-[#6F7782] px-1">
                    {phaseName}
                  </h3>

                  <div className="space-y-3">
                    {phaseMilestones.map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isInProgress = m.status === 'in_progress';

                      return (
                        <div
                          key={m.id}
                          className={`bg-white rounded-[18px] border p-5 transition-all shadow-soft ${
                            isCompleted
                              ? 'border-[#E4E5E9] bg-white opacity-90'
                              : isInProgress
                              ? 'border-[#536C8A] ring-1 ring-[#536C8A]/20'
                              : 'border-[#E4E5E9]'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F9F9FB] border border-[#E4E5E9] text-[#536C8A]">
                                  Week {m.week_number}
                                </span>
                                <h4 className="text-sm sm:text-base font-normal text-[#17191C]">
                                  {m.title}
                                </h4>
                              </div>
                              <p className="text-xs text-[#6F7782] font-light leading-relaxed">
                                {m.description}
                              </p>
                            </div>

                            <button
                              onClick={() => handleToggleStatus(m)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal transition shrink-0 cursor-pointer ${
                                isCompleted
                                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] hover:bg-[#C8E6C9]'
                                  : isInProgress
                                  ? 'bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 hover:bg-[#536C8A] hover:text-white'
                                  : 'bg-[#F9F9FB] text-[#6F7782] border border-[#E4E5E9] hover:bg-white hover:text-[#17191C]'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isCompleted ? 'Completed' : 'Mark as Done'}</span>
                            </button>
                          </div>

                          {/* Key Topics */}
                          {m.topics && m.topics.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-[#E4E5E9]/60">
                              <span className="text-[11px] text-[#6F7782] font-light block mb-1.5">
                                What you'll learn:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {m.topics.map((top, tIdx) => {
                                  const name = typeof top === 'string' ? top : top.name;
                                  return (
                                    <span
                                      key={tIdx}
                                      className="px-2.5 py-1 rounded-md text-xs font-light bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9]"
                                    >
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Weekly Project */}
                          {m.project_prompt && (
                            <div className="mt-3 p-3 rounded-xl bg-[#F9F9FB] border border-[#E4E5E9] text-xs">
                              <span className="font-normal text-[#17191C] block mb-1">
                                Weekly Practice Project:
                              </span>
                              <p className="text-[#6F7782] font-light leading-relaxed">
                                {m.project_prompt}
                              </p>
                            </div>
                          )}

                          {/* Recommended Resources */}
                          {m.resource_links && m.resource_links.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[#6F7782] font-light flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-[#536C8A]" />
                                Resources:
                              </span>
                              {m.resource_links.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white hover:bg-[#F9F9FB] text-[#536C8A] border border-[#E4E5E9] transition font-light"
                                >
                                  <span>{res.title}</span>
                                  <ExternalLink className="w-3 h-3 text-[#6F7782]" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
