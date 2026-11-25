import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  ExternalLink,
  GitBranch,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserCheck,
  Lock
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
  const [recalibrating, setRecalibrating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modal / input state for submitting GitHub link
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [githubUrlInput, setGithubUrlInput] = useState('');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveRoadmap();
      if (!data && user?.email) {
        const vault = getUserVault(user.email);
        if (vault?.target_career) {
          try {
            console.info('[Roadmap] Generating roadmap from vault target career...');
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
    const nextStatus = m.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.updateMilestone(m.id, nextStatus, m.project_github_url);
      await fetchRoadmap();
      setMessage({
        text: `Milestone Week ${m.week_number} marked as ${nextStatus}! Career Readiness Score updated.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveGithubUrl = async (mId: string) => {
    try {
      await api.updateMilestone(mId, 'completed', githubUrlInput);
      setEditingMilestoneId(null);
      setGithubUrlInput('');
      await fetchRoadmap();
      setMessage({
        text: 'Project GitHub repository submitted! Milestone marked completed.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalibrate = async () => {
    setRecalibrating(true);
    setMessage(null);
    try {
      const res = await api.recalibrateRoadmap();
      await fetchRoadmap();
      setMessage({
        text: res.message || 'Roadmap re-calibrated successfully based on recent progress!',
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setRecalibrating(false);
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
    if (!roadmap) {
      setMessage({ text: 'Roadmap data is not loaded yet.', type: 'info' });
      return;
    }

    const printWindow = window.open('', '_blank', 'width=960,height=850');
    if (!printWindow) {
      alert('Please enable popups in your browser to export your roadmap as a PDF.');
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
        (m) => (m.phase || '').toLowerCase() === phase.toLowerCase() ||
               (phase === 'Capstone & Job-Ready' && (m.phase || '').toLowerCase().includes('capstone'))
      );
      const itemsToRender = phaseMilestones.length > 0 ? phaseMilestones : (phase === 'Foundation' ? milestones : []);
      if (itemsToRender.length === 0 && phaseMilestones.length === 0) return;

      milestonesSectionsHtml += `
        <div class="phase-section">
          <div class="phase-title-badge">
            <span>${escapeHtml(phase)} Phase</span>
          </div>
          <div class="milestones-grid">
      `;

      itemsToRender.forEach((m) => {
        const isDone = m.status === 'completed';
        const isCurrent = m.status === 'in_progress';
        const statusLabel = isDone ? 'Completed' : (isCurrent ? 'In Progress' : 'Pending');
        const statusBadgeClass = isDone ? 'badge-completed' : (isCurrent ? 'badge-progress' : 'badge-pending');

        const topicsList = (m.topics || []).map((t: any) => {
          const tName = typeof t === 'string' ? t : t.name;
          const tDone = typeof t === 'object' && t.completed;
          return `
            <li class="topic-item ${tDone ? 'topic-done' : ''}">
              <span class="topic-icon">${tDone ? '✓' : '•'}</span>
              <span>${escapeHtml(tName)}</span>
            </li>
          `;
        }).join('');

        const resourcesList = (m.resource_links || []).map((r: any) => `
          <a href="${escapeHtml(r.url || '#')}" target="_blank" class="resource-link">
            ${escapeHtml(r.title || 'Resource')} <span class="res-tag">(${escapeHtml(r.type || 'Guide')})</span>
          </a>
        `).join('');

        milestonesSectionsHtml += `
          <div class="milestone-card ${isCurrent ? 'current-card' : ''}">
            <div class="milestone-header">
              <div class="milestone-meta">
                <span class="week-pill">Week ${m.week_number}</span>
                <span class="phase-label">${escapeHtml(m.phase || phase)}</span>
              </div>
              <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
            </div>

            <h3 class="milestone-title">${escapeHtml(m.title)}</h3>
            <p class="milestone-desc">${escapeHtml(m.description || '')}</p>

            ${topicsList ? `
              <div class="section-group">
                <div class="group-title">Key Learning Topics:</div>
                <ul class="topics-list">${topicsList}</ul>
              </div>
            ` : ''}

            ${m.project_prompt ? `
              <div class="section-group project-box">
                <div class="group-title">Hands-on Practical Project:</div>
                <div class="project-text">${escapeHtml(m.project_prompt)}</div>
                ${m.project_github_url ? `
                  <div class="github-link">
                    <strong>Submitted GitHub Repo:</strong>
                    <span>${escapeHtml(m.project_github_url)}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${resourcesList ? `
              <div class="section-group">
                <div class="group-title">Curated Free Learning Resources:</div>
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
            <span class="status-badge badge-${m.status}">${m.status}</span>
          </div>
          <h3 class="milestone-title">${escapeHtml(m.title)}</h3>
          <p class="milestone-desc">${escapeHtml(m.description || '')}</p>
        </div>
      `).join('');
    }

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CareerVector Roadmap - ${escapeHtml(targetCareer)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #536C8A;
      color: white;
    }

    .btn-primary:hover {
      background: #193D50;
    }

    .btn-secondary {
      background: #F9F9FB;
      color: #17191C;
      border: 1px solid #E4E5E9;
    }

    .doc-header {
      border-bottom: 2px solid #E4E5E9;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }

    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: #536C8A;
      letter-spacing: -0.5px;
    }

    .doc-badge {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #536C8A;
      background: rgba(83, 108, 138, 0.08);
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1px solid rgba(83, 108, 138, 0.2);
    }

    .main-title {
      font-size: 26px;
      font-weight: 600;
      color: #17191C;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .sub-meta {
      font-size: 13px;
      color: #6F7782;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    .stat-box {
      background: #F9F9FB;
      border: 1px solid #E4E5E9;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }

    .stat-val {
      font-size: 20px;
      font-weight: 700;
      color: #17191C;
      margin-bottom: 2px;
    }

    .stat-lbl {
      font-size: 11px;
      color: #6F7782;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .phase-section {
      margin-bottom: 28px;
    }

    .phase-title-badge {
      margin-bottom: 14px;
      display: inline-block;
    }

    .phase-title-badge span {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #536C8A;
      border-bottom: 2px solid #536C8A;
      padding-bottom: 4px;
    }

    .milestones-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .milestone-card {
      border: 1px solid #E4E5E9;
      border-radius: 12px;
      padding: 20px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .milestone-card.current-card {
      border-color: #536C8A;
      box-shadow: 0 2px 8px rgba(83, 108, 138, 0.08);
    }

    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .milestone-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .week-pill {
      font-size: 11px;
      font-weight: 600;
      background: #17191C;
      color: white;
      padding: 2px 10px;
      border-radius: 9999px;
    }

    .phase-label {
      font-size: 12px;
      color: #6F7782;
    }

    .status-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .badge-completed {
      background: #E8F5E9;
      color: #2E7D32;
    }

    .badge-progress {
      background: rgba(83, 108, 138, 0.12);
      color: #536C8A;
    }

    .badge-pending {
      background: #F1F3F5;
      color: #6F7782;
    }

    .milestone-title {
      font-size: 16px;
      font-weight: 600;
      color: #17191C;
      margin-bottom: 8px;
    }

    .milestone-desc {
      font-size: 13px;
      color: #555E68;
      line-height: 1.6;
      margin-bottom: 14px;
    }

    .section-group {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed #E4E5E9;
    }

    .group-title {
      font-size: 12px;
      font-weight: 600;
      color: #17191C;
      margin-bottom: 6px;
    }

    .topics-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .topic-item {
      font-size: 12px;
      color: #4A5568;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .topic-done {
      color: #2E7D32;
      text-decoration: line-through;
    }

    .topic-icon {
      font-weight: bold;
      color: #536C8A;
    }

    .project-box {
      background: #F9F9FB;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
      border-top: none;
      border: 1px solid #E4E5E9;
    }

    .project-text {
      font-size: 12px;
      color: #2D3748;
      line-height: 1.5;
    }

    .github-link {
      font-size: 11px;
      color: #536C8A;
      margin-top: 6px;
      word-break: break-all;
    }

    .resources-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .resource-link {
      font-size: 11px;
      color: #536C8A;
      text-decoration: none;
      background: #F9F9FB;
      border: 1px solid #E4E5E9;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .res-tag {
      color: #6F7782;
      font-size: 10px;
    }

    .doc-footer {
      margin-top: 40px;
      padding-top: 16px;
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
      .milestone-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
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
    <span class="tip"><strong>Tip:</strong> In the print destination dialog, select <strong>Save as PDF</strong> to download your roadmap.</span>
    <div class="action-buttons">
      <button class="btn btn-primary" onclick="window.print()">Save as PDF / Print</button>
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="container">
    <div class="doc-header">
      <div class="brand-row">
        <span class="brand-name">CareerVector AI</span>
        <span class="doc-badge">Official Learning Roadmap</span>
      </div>
      <h1 class="main-title">${escapeHtml(targetCareer)}</h1>
      <div class="sub-meta">
        <span><strong>Student:</strong> ${escapeHtml(studentName)} (${escapeHtml(studentEmail)})</span>
        <span><strong>Date Generated:</strong> ${escapeHtml(generatedDate)}</span>
        <span><strong>Status:</strong> Active Plan</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val">${progressPct}%</div>
        <div class="stat-lbl">Overall Progress</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${completedMilestones} / ${totalMilestones}</div>
        <div class="stat-lbl">Milestones Done</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${roadmap.estimated_weeks || 12} Weeks</div>
        <div class="stat-lbl">Estimated Duration</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Adaptive</div>
        <div class="stat-lbl">Curriculum Type</div>
      </div>
    </div>

    <div class="content-body">
      ${milestonesSectionsHtml}
    </div>

    <div class="doc-footer">
      <p>Generated by CareerVector AI • Personalized Career Acceleration Engine • https://careervector-sepia.vercel.app</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
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
          <span className="text-xs text-[#6F7782] font-normal">Loading your personalized roadmap...</span>
        </div>
      </div>
    );
  }

  const milestones = roadmap?.milestones || [];
  const filteredMilestones = milestones.filter((m) => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  // Group milestones by Phase
  const phases = ['Foundation', 'Intermediate', 'Capstone & Job-Ready'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-6 sm:p-7 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-[#536C8A]/10 text-[#536C8A] border border-[#536C8A]/20 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>Adaptive Learning Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#17191C] tracking-tight">
            Target Career: {roadmap?.target_career || 'Not Set'}
          </h2>
          <p className="text-xs text-[#6F7782] mt-1 font-light">
            {roadmap?.completed_milestones} of {roadmap?.total_milestones} milestones completed ({roadmap?.progress_percentage}%)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={handleRecalibrate}
            disabled={recalibrating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] text-[#17191C] hover:bg-white border border-[#E4E5E9] transition disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
            <span>{recalibrating ? 'Re-calibrating...' : 'Update Plan (AI Adapt)'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roadmap (PDF)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-white border border-[#E4E5E9] rounded-2xl flex items-center gap-2.5 text-xs text-[#17191C] shadow-soft">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#536C8A]" />
          <span className="font-light">{message.text}</span>
        </div>
      )}

      {/* If roadmap is locked or milestones empty */}
      {roadmap?.is_locked || milestones.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-[#E4E5E9] p-12 text-center max-w-2xl mx-auto shadow-soft">
          <AiOrb size="lg" pulse={true} className="mx-auto mb-4" />
          <h3 className="text-xl font-light text-[#17191C] mb-2">Adaptive Learning Roadmap is Protected</h3>
          <p className="text-xs sm:text-sm text-[#6F7782] max-w-md mx-auto mb-6 leading-relaxed font-light">
            {roadmap?.lock_reason ||
              'Your personalized week-by-week execution plan requires your skill assessment and career analysis to be completed first.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('/assessment')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#536C8A] text-white hover:bg-[#193D50] transition shadow-soft cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1. Complete Skill Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('/careers')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-normal bg-[#F9F9FB] text-[#17191C] hover:bg-white border border-[#E4E5E9] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#536C8A]" />
              <span>2. AI Career Match & Chat</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'all'
                    ? 'bg-[#17191C] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                All Milestones ({milestones.length})
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'in_progress'
                    ? 'bg-[#536C8A] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-normal transition ${
                  statusFilter === 'completed'
                    ? 'bg-[#536C8A] text-white'
                    : 'bg-white text-[#6F7782] border border-[#E4E5E9] hover:bg-[#F9F9FB]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Milestones grouped by phase */}
          <div className="space-y-8">
            {phases.map((phaseName) => {
              const phaseMilestones = filteredMilestones.filter((m) =>
                m.phase.toLowerCase().includes(phaseName.toLowerCase().split(' ')[0])
              );

              if (phaseMilestones.length === 0) return null;

              return (
                <div key={phaseName} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#536C8A]" />
                    <h3 className="text-xs font-normal uppercase tracking-wider text-[#6F7782]">
                      Phase: {phaseName}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {phaseMilestones.map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isInProgress = m.status === 'in_progress';

                      return (
                        <div
                          key={m.id}
                          className={`bg-white rounded-[22px] border p-6 transition-all duration-200 shadow-soft ${
                            isCompleted
                              ? 'border-[#E4E5E9] bg-white'
                              : isInProgress
                              ? 'border-[#536C8A] ring-1 ring-[#536C8A]/20'
                              : 'border-[#E4E5E9]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <button
                                onClick={() => handleToggleStatus(m)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                                  isCompleted
                                    ? 'bg-[#536C8A] text-white'
                                    : isInProgress
                                    ? 'border-2 border-[#536C8A] text-transparent hover:bg-[#536C8A]/10'
                                    : 'border-2 border-[#E4E5E9] text-transparent hover:bg-[#F9F9FB]'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-normal text-[#6F7782]">
                                    Week {m.week_number}
                                  </span>
                                  <h4 className="text-base font-normal text-[#17191C] leading-snug">
                                    {m.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-[#6F7782] font-light mt-1 max-w-2xl leading-relaxed">
                                  {m.description}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-normal px-3 py-1 rounded-full self-start shrink-0 border ${
                                isCompleted
                                  ? 'bg-[#536C8A]/10 text-[#536C8A] border-[#536C8A]/20'
                                  : isInProgress
                                  ? 'bg-[#F9F9FB] text-[#17191C] border-[#E4E5E9]'
                                  : 'bg-[#F9F9FB] text-[#6F7782] border-[#E4E5E9]'
                              }`}
                            >
                              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                            </span>
                          </div>

                          {/* Key Topics List */}
                          <div className="mt-5 pt-4 border-t border-[#E4E5E9]/60">
                            <span className="text-[11px] font-normal text-[#6F7782] uppercase tracking-wider block mb-2">
                              Core Competencies:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {m.topics.map((top, tIdx) => {
                                const name = typeof top === 'string' ? top : top.name;
                                return (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9]"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-[#536C8A]" />
                                    <span>{name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Hands-On Mini-Project Specification */}
                          <div className="mt-4 p-4.5 rounded-2xl bg-[#F9F9FB] border border-[#E4E5E9] text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-normal text-[#17191C] flex items-center gap-1.5">
                                <FolderGit2 className="w-4 h-4 text-[#536C8A]" />
                                Hands-On Mini-Project Specification:
                              </span>
                              {m.project_github_url && (
                                <a
                                  href={m.project_github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#536C8A] hover:underline flex items-center gap-1 text-[11px] font-normal"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  View Submitted Repo
                                </a>
                              )}
                            </div>
                            <p className="text-[#6F7782] font-light leading-relaxed">
                              {m.project_prompt}
                            </p>

                            {/* GitHub Submission Input Box */}
                            {editingMilestoneId === m.id ? (
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  type="url"
                                  value={githubUrlInput}
                                  onChange={(e) => setGithubUrlInput(e.target.value)}
                                  placeholder="https://github.com/username/project-repo"
                                  className="px-3.5 py-2 text-xs rounded-xl border border-[#E4E5E9] bg-white w-full outline-none text-[#17191C] focus:border-[#536C8A]"
                                />
                                <button
                                  onClick={() => handleSaveGithubUrl(m.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-normal bg-[#536C8A] text-white shrink-0 hover:bg-[#193D50] transition shadow-soft"
                                >
                                  Submit Repo
                                </button>
                                <button
                                  onClick={() => setEditingMilestoneId(null)}
                                  className="px-3 py-2 rounded-xl text-xs text-[#6F7782] hover:text-[#17191C]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3 flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingMilestoneId(m.id);
                                    setGithubUrlInput(m.project_github_url || '');
                                  }}
                                  className="text-[#536C8A] hover:text-[#193D50] font-normal flex items-center gap-1 text-xs"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  {m.project_github_url ? 'Update GitHub Link' : 'Submit Project GitHub URL'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Curated Free Resources */}
                          {m.resource_links && m.resource_links.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[#6F7782] font-light">Curated Resources:</span>
                              {m.resource_links.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#F9F9FB] text-[#17191C] border border-[#E4E5E9] transition font-light"
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
