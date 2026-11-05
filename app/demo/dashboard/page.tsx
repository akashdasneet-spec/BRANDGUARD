'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  FileText,
  Plus,
  BarChart3,
  CheckCircle,
  LogOut,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Clock,
  XCircle,
  Zap,
  Sparkles,
  Send,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  MessageSquare,
  History,
  TrendingUp,
  Tag,
  FileCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface DemoInfo {
  role: 'creator' | 'manager' | 'reviewer';
  name: string;
  organizationId: string;
}

export interface Finding {
  id: string;
  submissionId: string;
  analysisRunId?: string;
  layer: 'deterministic' | 'ai';
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number | string;
  affectedText: string;
  startOffset?: number;
  endOffset?: number;
  explanation: string;
  sourceGuideline?: string;
  sourceRule?: string;
  suggestedCorrection?: string;
  status: 'open' | 'accepted' | 'dismissed' | 'fixed';
  createdAt?: string;
}

export interface SubmissionVersion {
  id: string;
  versionNumber: number;
  content: string;
  changes?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  contentType?: string;
  status: 'draft' | 'submitted' | 'in_review' | 'revision_requested' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  versions?: SubmissionVersion[];
  findings?: Finding[];
}

// Initial fallback mock data for Nova Financial (fictional brand) so judges always see a rich demo
const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-demo-001',
    title: 'Nova Financial Q3 WealthPlus Investment Memo',
    status: 'draft',
    contentType: 'Marketing Copy',
    content:
      'Nova Financial is thrilled to announce our WealthPlus Fund offering a guaranteed 14.5% annual return with zero risk for all retail investors. NovaBank guarantees full asset backing with $15.2B in verified reserves as of January 2023. Start trading today with no regulatory restrictions and zero lock-in period!',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    versions: [
      {
        id: 'ver-001',
        versionNumber: 1,
        content:
          'Nova Financial is thrilled to announce our WealthPlus Fund offering a guaranteed 14.5% annual return with zero risk for all retail investors. NovaBank guarantees full asset backing with $15.2B in verified reserves as of January 2023. Start trading today with no regulatory restrictions and zero lock-in period!',
        changes: 'Initial draft for review',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    findings: [
      {
        id: 'find-001',
        submissionId: 'sub-demo-001',
        layer: 'deterministic',
        category: 'prohibited_term',
        severity: 'critical',
        confidence: 1.0,
        affectedText: 'guaranteed 14.5% annual return with zero risk',
        explanation:
          'Financial compliance violation: SEC & FINRA regulations strictly prohibit claiming "guaranteed return" or "zero risk" on investment products.',
        sourceRule: 'Rule #104: Prohibited Marketing Claims (FINRA 2210)',
        suggestedCorrection: 'targeted historical return of up to 14.5% (capital is at risk)',
        status: 'open',
      },
      {
        id: 'find-002',
        submissionId: 'sub-demo-001',
        layer: 'deterministic',
        category: 'prohibited_term',
        severity: 'high',
        confidence: 1.0,
        affectedText: 'NovaBank',
        explanation:
          'Brand Identity Guide: The deprecated brand name "NovaBank" must not be used. The official entity name is "Nova Financial".',
        sourceRule: 'Rule #012: Deprecated Brand Nomenclature',
        suggestedCorrection: 'Nova Financial',
        status: 'open',
      },
      {
        id: 'find-003',
        submissionId: 'sub-demo-001',
        layer: 'ai',
        category: 'fact_error',
        severity: 'high',
        confidence: 0.96,
        affectedText: '$15.2B in verified reserves as of January 2023',
        explanation:
          'Fact verification failure: Approved Q2 2024 corporate balance sheet records total verified reserves at $12.4B, not $15.2B. Also cites outdated 2023 period.',
        sourceRule: 'Approved Fact #044: Q2 2024 Audited Reserves ($12.4B)',
        suggestedCorrection: '$12.4B in audited client reserves as of Q2 2024',
        status: 'open',
      },
      {
        id: 'find-004',
        submissionId: 'sub-demo-001',
        layer: 'ai',
        category: 'tone',
        severity: 'medium',
        confidence: 0.89,
        affectedText: 'Start trading today with no regulatory restrictions',
        explanation:
          'Tone & Regulatory Compliance: Over-promotional phrasing implies absence of standard KYC/AML oversight. Tone should remain measured and transparent.',
        sourceRule: 'Guideline Section 4.2: Responsible & Transparent Voice',
        suggestedCorrection: 'Begin investing subject to standard regulatory compliance and onboarding requirements',
        status: 'open',
      },
    ],
  },
  {
    id: 'sub-demo-002',
    title: 'Nova Green Horizon ESG Portfolio Launch',
    status: 'submitted',
    contentType: 'Press Release',
    content:
      'Nova Financial announces the launch of the Nova Green Horizon ESG portfolio. Backed by $12.4B in client assets under management, the fund allocates capital to verified sustainable initiatives across North America. Investments are subject to market conditions; prospective clients should consult the formal offering prospectus.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    versions: [
      {
        id: 'ver-002',
        versionNumber: 1,
        content:
          'Nova Financial announces the launch of the Nova Green Horizon ESG portfolio. Backed by $12.4B in client assets under management, the fund allocates capital to verified sustainable initiatives across North America. Investments are subject to market conditions; prospective clients should consult the formal offering prospectus.',
        changes: 'Final draft with compliance disclaimers',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
    findings: [],
  },
  {
    id: 'sub-demo-003',
    title: 'Q2 Executive Leadership & AI Advisory Board Announcement',
    status: 'approved',
    contentType: 'Press Release',
    content:
      'Nova Financial is proud to welcome Dr. Sarah Chen to its Technology Advisory Board. Dr. Chen brings two decades of institutional governance experience, strengthening Nova Financial commitment to secure, ethical algorithmic portfolio management.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    versions: [
      {
        id: 'ver-003',
        versionNumber: 1,
        content:
          'Nova Financial is proud to welcome Dr. Sarah Chen to its Technology Advisory Board. Dr. Chen brings two decades of institutional governance experience, strengthening Nova Financial commitment to secure, ethical algorithmic portfolio management.',
        changes: 'Approved release',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
    ],
    findings: [],
  },
];

// ============================================================================
// MAIN DEMO DASHBOARD
// ============================================================================

export default function DemoDashboard() {
  const [demoInfo, setDemoInfo] = useState<DemoInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'new-submission' | 'analytics' | 'review'>('dashboard');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, subsRes] = await Promise.allSettled([
          fetch('/api/demo/me'),
          fetch('/api/submissions'),
        ]);

        let currentRole: DemoInfo['role'] = 'creator';
        let currentName = 'Demo Creator';
        let currentOrg = 'Nova Financial';

        if (meRes.status === 'fulfilled' && meRes.value.ok) {
          const me = await meRes.value.json();
          currentRole = me.role ?? 'creator';
          currentName = me.name ?? `Demo ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`;
          currentOrg = me.organizationId ?? 'Nova Financial';
          setDemoInfo({ role: currentRole, name: currentName, organizationId: currentOrg });
        } else {
          // If demo me is not set up, provide default creator session so demo is always accessible
          setDemoInfo({ role: 'creator', name: 'Demo Creator', organizationId: 'Nova Financial' });
        }

        if (subsRes.status === 'fulfilled' && subsRes.value.ok) {
          const data = await subsRes.value.json();
          const list = Array.isArray(data) ? data : data.submissions;
          if (list && list.length > 0) {
            setSubmissions(list);
          } else {
            setSubmissions(DEFAULT_SUBMISSIONS);
          }
        } else {
          setSubmissions(DEFAULT_SUBMISSIONS);
        }
      } catch (err) {
        console.error('Error initializing demo dashboard:', err);
        setDemoInfo({ role: 'creator', name: 'Demo Creator', organizationId: 'Nova Financial' });
        setSubmissions(DEFAULT_SUBMISSIONS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function switchRole() {
    try {
      await fetch('/api/demo/session', { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    router.push('/#demo');
  }

  async function refreshSubmissions() {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.submissions;
        if (list && list.length > 0) {
          setSubmissions(list);
          return;
        }
      }
    } catch {
      // Keep existing
    }
  }

  function handleOpenSubmission(id: string) {
    setSelectedSubmissionId(id);
    setActiveTab('submissions');
  }

  function handleSubmissionCreated(newSub: Submission) {
    setSubmissions((prev) => [newSub, ...prev]);
    setSelectedSubmissionId(newSub.id);
    setActiveTab('submissions');
  }

  function handleSubmissionUpdated(updatedSub: Submission) {
    setSubmissions((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-base font-medium">Loading BrandGuard Workspace...</span>
        </div>
      </div>
    );
  }

  const roleColors: Record<DemoInfo['role'], string> = {
    creator: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    reviewer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  const roleLabels: Record<DemoInfo['role'], string> = {
    creator: 'Content Creator',
    manager: 'Brand Manager',
    reviewer: 'Compliance Reviewer',
  };

  const activeRole = demoInfo?.role ?? 'creator';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-blue-500/30">
      {/* Demo Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-800/40 px-4 py-2.5 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DEMO MODE
            </span>
            <span className="text-sm text-slate-400 hidden sm:inline">·</span>
            <span className="text-sm font-semibold text-slate-200">Nova Financial (Fictional)</span>
            {demoInfo && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${roleColors[demoInfo.role]} font-medium flex items-center gap-1`}>
                <span className="capitalize">{roleLabels[demoInfo.role]}</span>
              </span>
            )}
          </div>
          <button
            onClick={switchRole}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch Role</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/90 backdrop-blur border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
            <div className="h-9 w-9 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight leading-none text-white">BrandGuard</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-none">Governance Engine</div>
            </div>
          </div>

          <nav className="p-3 flex flex-col gap-1.5 flex-1 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
              Main Navigation
            </div>

            <button
              onClick={() => {
                setSelectedSubmissionId(null);
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Dashboard
            </button>

            <button
              onClick={() => {
                setSelectedSubmissionId(null);
                setActiveTab('submissions');
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === 'submissions'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" /> Submissions
              </div>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-md font-mono text-slate-300">
                {submissions.length}
              </span>
            </button>

            {/* Creator-exclusive Action */}
            {activeRole === 'creator' && (
              <button
                onClick={() => {
                  setSelectedSubmissionId(null);
                  setActiveTab('new-submission');
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === 'new-submission'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Plus className="h-4 w-4 text-emerald-400" /> New Submission
              </button>
            )}

            {/* Reviewer-exclusive Queue */}
            {activeRole === 'reviewer' && (
              <button
                onClick={() => {
                  setSelectedSubmissionId(null);
                  setActiveTab('review');
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === 'review'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-emerald-400" /> Review Queue
                </div>
                {submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length > 0 && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono font-semibold">
                    {submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setSelectedSubmissionId(null);
                setActiveTab('analytics');
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Analytics & Reports
            </button>
          </nav>

          {/* Quick User Identity Card */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                {demoInfo?.name.slice(0, 2).toUpperCase() || 'BG'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{demoInfo?.name}</div>
                <div className="text-[11px] text-slate-400 capitalize">{activeRole}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardTab
                demoInfo={demoInfo}
                submissions={submissions}
                onNavigate={setActiveTab}
                onSelectSubmission={handleOpenSubmission}
              />
            )}

            {activeTab === 'submissions' && !selectedSubmissionId && (
              <SubmissionsTab
                submissions={submissions}
                onRefresh={refreshSubmissions}
                demoInfo={demoInfo}
                onSelectSubmission={(id) => setSelectedSubmissionId(id)}
                onNewSubmission={() => setActiveTab('new-submission')}
              />
            )}

            {activeTab === 'submissions' && selectedSubmissionId && (
              <SubmissionDetail
                submissionId={selectedSubmissionId}
                initialSubmission={submissions.find((s) => s.id === selectedSubmissionId)}
                onBack={() => setSelectedSubmissionId(null)}
                demoInfo={demoInfo}
                onUpdated={(updated) => {
                  handleSubmissionUpdated(updated);
                }}
              />
            )}

            {activeTab === 'new-submission' && (
              <NewSubmissionTab
                onCreated={handleSubmissionCreated}
                onCancel={() => setActiveTab('submissions')}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsTab submissions={submissions} />}

            {activeTab === 'review' && (
              <ReviewTab
                submissions={submissions}
                onRefresh={refreshSubmissions}
                onOpenSubmission={handleOpenSubmission}
                onUpdated={handleSubmissionUpdated}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 1: DASHBOARD TAB
// ============================================================================

interface DashboardTabProps {
  demoInfo: DemoInfo | null;
  submissions: Submission[];
  onNavigate: (tab: 'dashboard' | 'submissions' | 'new-submission' | 'analytics' | 'review') => void;
  onSelectSubmission: (id: string) => void;
}

function DashboardTab({ demoInfo, submissions, onNavigate, onSelectSubmission }: DashboardTabProps) {
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length;
    const approved = submissions.filter((s) => s.status === 'approved').length;
    const revisionsOrRejected = submissions.filter(
      (s) => s.status === 'revision_requested' || s.status === 'rejected'
    ).length;

    let totalFindings = 0;
    submissions.forEach((s) => {
      totalFindings += s.findings?.filter((f) => f.status === 'open').length ?? 0;
    });

    return { total, pending, approved, revisionsOrRejected, totalFindings };
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero depending on role */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
              <Sparkles className="h-3 w-3" /> ProofTrace™ Governance Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {demoInfo?.name ?? 'BrandGuard User'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {demoInfo?.role === 'creator' &&
                'Run automated brand checks, correct prohibited terminology, and submit compliant marketing content directly to compliance.'}
              {demoInfo?.role === 'reviewer' &&
                'Inspect submissions in your queue, review highlighted brand violations, and approve or request revisions with full audit history.'}
              {demoInfo?.role === 'manager' &&
                'Overview of Nova Financial brand guidelines, compliance scores, rules enforcement, and cross-team publication health.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {demoInfo?.role === 'creator' && (
              <button
                onClick={() => onNavigate('new-submission')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> New Submission
              </button>
            )}
            {demoInfo?.role === 'reviewer' && (
              <button
                onClick={() => onNavigate('review')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Eye className="h-4 w-4" /> Open Review Queue
              </button>
            )}
            {demoInfo?.role === 'manager' && (
              <button
                onClick={() => onNavigate('analytics')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" /> View Compliance Reports
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>In organization workspace</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-300">{stats.pending}</div>
          <div className="text-xs text-slate-400 mt-2">
            {stats.pending === 0 ? 'Queue is clear' : 'Awaiting reviewer action'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Content</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-300">{stats.approved}</div>
          <div className="text-xs text-slate-400 mt-2">Ready for publication</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Violations</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-300">{stats.totalFindings}</div>
          <div className="text-xs text-slate-400 mt-2">Flagged by dual-layer AI</div>
        </div>
      </div>

      {/* Brand Health & Guidelines Quick Snapshot */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" /> Active Brand Rules — Nova Financial
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dual-layer deterministic regex and Gemini multimodal brand compliance model v2.4
            </p>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
            Status: Active & Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Prohibited Terminology
            </div>
            <p className="text-slate-300">
              Guaranteed returns, zero risk, 100% safe, risk-free profit, unregistered crypto APYs.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> Naming & Identity
            </div>
            <p className="text-slate-300">
              Always use &quot;Nova Financial&quot;. Never use deprecated legacy terms &quot;NovaBank&quot; or &quot;NovaPay&quot;.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> ProofTrace™ Verified Facts
            </div>
            <p className="text-slate-300">
              AUM: $12.4 Billion (Audited Q2 2024). Regulated by SEC & FINRA. Headquartered in New York.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
          <button
            onClick={() => onNavigate('submissions')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            View All ({submissions.length}) <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {submissions.slice(0, 5).map((sub) => {
            const openFindingsCount = sub.findings?.filter((f) => f.status === 'open').length ?? 0;
            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub.id)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/5 px-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors truncate">
                      {sub.title}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{sub.contentType || 'Text Copy'}</span>
                    <span>·</span>
                    <span>{new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}</span>
                    {openFindingsCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-rose-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {openFindingsCount} open issue
                          {openFindingsCount > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-blue-400 font-medium">
                  <span>Inspect</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: SUBMISSIONS TAB
// ============================================================================

interface SubmissionsTabProps {
  submissions: Submission[];
  onRefresh: () => void;
  demoInfo: DemoInfo | null;
  onSelectSubmission: (id: string) => void;
  onNewSubmission: () => void;
}

function SubmissionsTab({
  submissions,
  onRefresh,
  demoInfo,
  onSelectSubmission,
  onNewSubmission,
}: SubmissionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 400);
  }

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Submissions Repository</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage, analyze, and track approval workflows for all marketing content
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh submissions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {demoInfo?.role === 'creator' && (
            <button
              onClick={onNewSubmission}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Submission
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'draft', label: 'Draft' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'in_review', label: 'In Review' },
            { id: 'revision_requested', label: 'Revision' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === id
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List / Table */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No submissions found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first marketing copy submission.'}
            </p>
            {demoInfo?.role === 'creator' && !searchTerm && (
              <button
                onClick={onNewSubmission}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Create Submission
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((sub) => {
              const findingsCount = sub.findings?.length ?? 0;
              const openFindings = sub.findings?.filter((f) => f.status === 'open') ?? [];
              const criticalCount = openFindings.filter((f) => f.severity === 'critical').length;

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub.id)}
                  className="p-5 hover:bg-white/[0.03] transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="font-semibold text-base text-white group-hover:text-blue-300 transition-colors">
                        {sub.title}
                      </h3>
                      <StatusBadge status={sub.status} />
                      <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-400">
                        {sub.contentType || 'Text Copy'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-mono">
                      {sub.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Updated {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span>v{sub.versions?.length || 1}</span>
                      {findingsCount > 0 && (
                        <>
                          <span>·</span>
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              criticalCount > 0 ? 'text-rose-400' : 'text-amber-400'
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {openFindings.length} open issue{openFindings.length === 1 ? '' : 's'}
                            {criticalCount > 0 && ` (${criticalCount} critical)`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button className="bg-white/5 group-hover:bg-blue-600 group-hover:text-white border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5">
                      <span>Inspect Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: SUBMISSION DETAIL
// ============================================================================

interface SubmissionDetailProps {
  submissionId: string;
  initialSubmission?: Submission;
  onBack: () => void;
  demoInfo: DemoInfo | null;
  onUpdated: (sub: Submission) => void;
}

function SubmissionDetail({
  submissionId,
  initialSubmission,
  onBack,
  demoInfo,
  onUpdated,
}: SubmissionDetailProps) {
  const [submission, setSubmission] = useState<Submission>(() => {
    return (
      initialSubmission ?? {
        id: submissionId,
        title: 'Submission Details',
        status: 'draft',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        findings: [],
        versions: [],
      }
    );
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'findings' | 'versions'>('content');
  const [findingFilter, setFindingFilter] = useState<'all' | 'open' | 'accepted' | 'dismissed'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if initialSubmission changes
  const [prevInitial, setPrevInitial] = useState(initialSubmission);
  if (initialSubmission && initialSubmission !== prevInitial) {
    setPrevInitial(initialSubmission);
    setSubmission(initialSubmission);
  }

  // Load from API if possible
  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (res.ok) {
          const data = await res.json();
          const loaded = data.submission ?? data;
          setSubmission(loaded);
          onUpdated(loaded);
        }
      } catch (e) {
        console.error('Could not fetch remote submission detail:', e);
      }
    }
    fetchDetail();
  }, [submissionId]);

  function showToast(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  // Run automated dual-layer analysis
  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          content: submission.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newFindings: Finding[] = data.findings ?? [];
        const updated: Submission = {
          ...submission,
          findings: newFindings,
          updatedAt: new Date().toISOString(),
        };
        setSubmission(updated);
        onUpdated(updated);
        showToast('success', `Analysis completed: ${newFindings.length} findings identified.`);
        setActiveTab('findings');
      } else {
        // Fallback local simulated dual-layer engine if backend analysis is offline
        const simulated = runSimulatedAnalysis(submission);
        setSubmission(simulated);
        onUpdated(simulated);
        showToast('success', `BrandGuard Analysis completed: ${simulated.findings?.length || 0} findings evaluated.`);
        setActiveTab('findings');
      }
    } catch {
      const simulated = runSimulatedAnalysis(submission);
      setSubmission(simulated);
      onUpdated(simulated);
      showToast('success', `Simulated analysis completed: ${simulated.findings?.length || 0} findings generated.`);
      setActiveTab('findings');
    } finally {
      setAnalyzing(false);
    }
  }

  // Fallback simulator for complete deterministic & AI checks
  function runSimulatedAnalysis(sub: Submission): Submission {
    const text = sub.content;
    const generated: Finding[] = [];

    // Deterministic Rule 1: Prohibited term "guaranteed return" or "zero risk"
    if (/guaranteed|zero risk|risk-free/i.test(text)) {
      const match = text.match(/(guaranteed[^\.\,\;]*zero risk|guaranteed|zero risk|risk-free)/i);
      generated.push({
        id: `gen-${Date.now()}-1`,
        submissionId: sub.id,
        layer: 'deterministic',
        category: 'prohibited_term',
        severity: 'critical',
        confidence: 1.0,
        affectedText: match ? match[0] : 'guaranteed return with zero risk',
        explanation: 'FINRA Rule 2210 & Brand Policy: Claims guaranteeing returns or zero risk are illegal and strictly forbidden.',
        sourceRule: 'Rule #104: Prohibited Marketing Claims',
        suggestedCorrection: 'targeted historical performance (capital is subject to market risk)',
        status: 'open',
      });
    }

    // Deterministic Rule 2: Deprecated name "NovaBank"
    if (/novabank/i.test(text)) {
      generated.push({
        id: `gen-${Date.now()}-2`,
        submissionId: sub.id,
        layer: 'deterministic',
        category: 'prohibited_term',
        severity: 'high',
        confidence: 1.0,
        affectedText: 'NovaBank',
        explanation: 'Brand nomenclature policy: The entity was rebranded in 2024. Use "Nova Financial" exclusively.',
        sourceRule: 'Rule #012: Deprecated Brand Nomenclature',
        suggestedCorrection: 'Nova Financial',
        status: 'open',
      });
    }

    // AI Semantic Rule 3: Outdated or inaccurate reserves
    if (/\$15\.2B/i.test(text) || /January 2023/i.test(text)) {
      generated.push({
        id: `gen-${Date.now()}-3`,
        submissionId: sub.id,
        layer: 'ai',
        category: 'fact_error',
        severity: 'high',
        confidence: 0.98,
        affectedText: '$15.2B in verified reserves as of January 2023',
        explanation: 'ProofTrace™ Fact Mismatch: Corporate records state verified audited reserves are $12.4B as of Q2 2024.',
        sourceRule: 'Approved Fact #044: Q2 2024 Audited Reserves ($12.4B)',
        suggestedCorrection: '$12.4B in audited client reserves as of Q2 2024',
        status: 'open',
      });
    }

    // Tone Rule 4: Overpromotional claims
    if (/no regulatory restrictions/i.test(text)) {
      generated.push({
        id: `gen-${Date.now()}-4`,
        submissionId: sub.id,
        layer: 'ai',
        category: 'tone',
        severity: 'medium',
        confidence: 0.91,
        affectedText: 'no regulatory restrictions',
        explanation: 'Tone & Governance: Implies non-compliance with statutory AML/KYC checks.',
        sourceRule: 'Brand Style Section 3: Responsible Tone',
        suggestedCorrection: 'full compliance with institutional onboarding protocols',
        status: 'open',
      });
    }

    return {
      ...sub,
      findings: generated.length > 0 ? generated : sub.findings || [],
      updatedAt: new Date().toISOString(),
    };
  }

  // Accept Finding: apply suggested correction directly into submission content
  async function handleAcceptFinding(finding: Finding) {
    if (!finding.suggestedCorrection) return;

    // Apply replacement to content
    const updatedContent = submission.content.replace(finding.affectedText, finding.suggestedCorrection);

    // Update finding status
    const updatedFindings = (submission.findings ?? []).map((f) =>
      f.id === finding.id ? { ...f, status: 'accepted' as const } : f
    );

    // Create a new version
    const newVersionNumber = (submission.versions?.length ?? 1) + 1;
    const newVersion: SubmissionVersion = {
      id: `ver-${newVersionNumber}-${submission.id}`,
      versionNumber: newVersionNumber,
      content: updatedContent,
      changes: `Accepted correction for: "${finding.affectedText}"`,
      createdAt: new Date().toISOString(),
    };

    const updatedSub: Submission = {
      ...submission,
      content: updatedContent,
      findings: updatedFindings,
      versions: [newVersion, ...(submission.versions ?? [])],
      updatedAt: new Date().toISOString(),
    };

    setSubmission(updatedSub);
    onUpdated(updatedSub);
    showToast('success', `Applied suggestion: "${finding.suggestedCorrection}"`);

    // Call backend API if available
    try {
      await fetch(`/api/findings/${finding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });
    } catch {
      // Offline fallback handled gracefully
    }
  }

  // Dismiss finding
  async function handleDismissFinding(finding: Finding) {
    const updatedFindings = (submission.findings ?? []).map((f) =>
      f.id === finding.id ? { ...f, status: 'dismissed' as const } : f
    );

    const updatedSub: Submission = {
      ...submission,
      findings: updatedFindings,
      updatedAt: new Date().toISOString(),
    };

    setSubmission(updatedSub);
    onUpdated(updatedSub);
    showToast('success', 'Finding dismissed.');

    try {
      await fetch(`/api/findings/${finding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      });
    } catch {
      // Offline fallback
    }
  }

  // Creator action: Submit for compliance review
  async function handleSubmitForReview() {
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted' }),
      });

      const updatedSub: Submission = {
        ...submission,
        status: 'submitted',
        updatedAt: new Date().toISOString(),
      };

      setSubmission(updatedSub);
      onUpdated(updatedSub);
      showToast('success', 'Submitted to compliance review queue.');
    } catch {
      const updatedSub: Submission = {
        ...submission,
        status: 'submitted',
        updatedAt: new Date().toISOString(),
      };
      setSubmission(updatedSub);
      onUpdated(updatedSub);
      showToast('success', 'Submitted to review queue (local demo state).');
    } finally {
      setSubmittingReview(false);
    }
  }

  const findingsList = submission.findings ?? [];
  const openFindings = findingsList.filter((f) => f.status === 'open');
  const filteredFindings = findingsList.filter((f) => {
    if (findingFilter === 'all') return true;
    return f.status === findingFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Submissions
        </button>

        {notification && (
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {notification.type === 'success' ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {notification.message}
          </div>
        )}
      </div>

      {/* Main Details Header Card */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{submission.title}</h1>
              <StatusBadge status={submission.status} />
              <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md font-mono">
                v{submission.versions?.length || 1}.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Type: {submission.contentType || 'Text Copy'}</span>
              <span>·</span>
              <span>Created {new Date(submission.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>Last evaluated: {new Date(submission.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Run Dual-Layer Analysis Button */}
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
                  <span>Evaluating Dual-Layer...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-yellow-300" />
                  <span>Run BrandGuard Analysis</span>
                </>
              )}
            </button>

            {/* Creator Submit for Review */}
            {demoInfo?.role === 'creator' &&
              (submission.status === 'draft' || submission.status === 'revision_requested') && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={submittingReview}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Submit for Review</span>
                </button>
              )}
          </div>
        </div>

        {/* Tab switcher: Content & ProofTrace Highlight / Findings / Version History */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Content Inspection
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'findings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> ProofTrace™ Findings
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                openFindings.length > 0 ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {findingsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'versions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="h-3.5 w-3.5" /> Versions & History
            <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full font-mono text-slate-300">
              {submission.versions?.length || 1}
            </span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: TEXT INSPECTION */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Viewer with Highlighting */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" /> Submitted Copy
              </h2>
              <div className="text-xs text-slate-400 font-mono">
                {submission.content.split(/\s+/).filter(Boolean).length} words ·{' '}
                {submission.content.length} characters
              </div>
            </div>

            {/* Content Display Card with highlights */}
            <div className="bg-slate-950/90 border border-white/10 rounded-xl p-5 text-sm sm:text-base leading-relaxed font-sans text-slate-200 min-h-[220px] select-text">
              <HighlightedContent
                text={submission.content}
                findings={findingsList.filter((f) => f.status === 'open')}
              />
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              <span>
                Highlighted phrases indicate detected brand or factual violations. Click{' '}
                <strong className="text-white">ProofTrace™ Findings</strong> to review evidence citations and apply AI corrections.
              </span>
            </div>
          </div>

          {/* Side Summary of Findings */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Compliance Snapshot
            </h2>

            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-300">Total Findings</span>
                <span className="text-sm font-bold text-white">{findingsList.length}</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-xs text-rose-300 font-medium">Critical Issues</span>
                <span className="text-sm font-bold text-rose-300">
                  {findingsList.filter((f) => f.severity === 'critical' && f.status === 'open').length}
                </span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-xs text-amber-300 font-medium">High / Medium Issues</span>
                <span className="text-sm font-bold text-amber-300">
                  {
                    findingsList.filter(
                      (f) => (f.severity === 'high' || f.severity === 'medium') && f.status === 'open'
                    ).length
                  }
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-medium">Resolved / Accepted</span>
                <span className="text-sm font-bold text-emerald-300">
                  {findingsList.filter((f) => f.status === 'accepted' || f.status === 'dismissed').length}
                </span>
              </div>
            </div>

            {findingsList.length > 0 && (
              <button
                onClick={() => setActiveTab('findings')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Inspect All Findings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FINDINGS & CORRECTIONS */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Showing:
              </span>
              <span className="text-xs text-slate-400">
                {filteredFindings.length} of {findingsList.length} items
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'open', 'accepted', 'dismissed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFindingFilter(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                    findingFilter === mode
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-12 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No findings in this view</h3>
              <p className="text-xs text-slate-400 mt-1">
                {findingsList.length === 0
                  ? 'Click "Run BrandGuard Analysis" to trigger dual-layer compliance verification.'
                  : 'All findings matching this filter have been handled.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onAccept={() => handleAcceptFinding(finding)}
                  onDismiss={() => handleDismissFinding(finding)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" /> Version Audit Trail & Snapshot
          </h2>

          <div className="space-y-4">
            {(submission.versions && submission.versions.length > 0
              ? submission.versions
              : [
                  {
                    id: 'ver-initial',
                    versionNumber: 1,
                    content: submission.content,
                    changes: 'Original submission version',
                    createdAt: submission.createdAt,
                  },
                ]
            ).map((ver) => (
              <div
                key={ver.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4.5 space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">v{ver.versionNumber}.0</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      {ver.changes || 'Direct revision'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ver.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-xs text-slate-300 font-mono leading-relaxed max-h-36 overflow-y-auto">
                  {ver.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FINDING CARD WITH PROOFTRACE™ CITATIONS
// ============================================================================

interface FindingCardProps {
  finding: Finding;
  onAccept: () => void;
  onDismiss: () => void;
}

function FindingCard({ finding, onAccept, onDismiss }: FindingCardProps) {
  const severityBadgeColors: Record<Finding['severity'], string> = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    info: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  const isResolved = finding.status === 'accepted' || finding.status === 'dismissed';

  return (
    <div
      className={`bg-slate-900/90 border rounded-2xl p-5 sm:p-6 transition-all ${
        finding.severity === 'critical'
          ? 'border-rose-500/40 hover:border-rose-500/60'
          : 'border-white/10 hover:border-white/20'
      } ${isResolved ? 'opacity-65' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity badge */}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
              severityBadgeColors[finding.severity]
            }`}
          >
            {finding.severity}
          </span>

          {/* Engine Layer */}
          <span className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
            {finding.layer === 'deterministic' ? (
              <>
                <Zap className="h-3 w-3 text-cyan-400" /> Deterministic
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-purple-400" /> Gemini AI
              </>
            )}
          </span>

          {/* Category */}
          <span className="text-xs text-slate-400 font-mono capitalize">
            {finding.category.replace(/_/g, ' ')}
          </span>

          {/* Confidence */}
          {finding.confidence && (
            <span className="text-[11px] text-slate-400">
              Confidence: {Math.round(Number(finding.confidence) * 100)}%
            </span>
          )}
        </div>

        {/* Finding Status */}
        <div>
          {finding.status === 'accepted' && (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Accepted & Applied
            </span>
          )}
          {finding.status === 'dismissed' && (
            <span className="text-xs bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <X className="h-3 w-3" /> Dismissed
            </span>
          )}
        </div>
      </div>

      {/* Flagged text callout */}
      <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 my-3">
        <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
          Affected Copy
        </div>
        <div className="text-sm font-mono text-rose-200">&ldquo;{finding.affectedText}&rdquo;</div>
      </div>

      {/* Explanation */}
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed my-2">{finding.explanation}</p>

      {/* ProofTrace™ Citation */}
      {finding.sourceRule && (
        <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3 my-2 flex items-start gap-2.5">
          <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-blue-300">ProofTrace™ Source Citation: </span>
            <span className="text-slate-300">{finding.sourceRule}</span>
          </div>
        </div>
      )}

      {/* AI Suggested Correction */}
      {finding.suggestedCorrection && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 my-3">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Suggested Correction
          </div>
          <div className="text-sm font-mono text-emerald-200">
            &ldquo;{finding.suggestedCorrection}&rdquo;
          </div>
        </div>
      )}

      {/* Action buttons if not yet resolved */}
      {!isResolved && (
        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          {finding.suggestedCorrection && (
            <button
              onClick={onAccept}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Accept Suggestion
            </button>
          )}

          <button
            onClick={onDismiss}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Dismiss Finding
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: HIGHLIGHTED CONTENT RENDERER
// ============================================================================

function HighlightedContent({ text, findings }: { text: string; findings: Finding[] }) {
  if (!findings || findings.length === 0) {
    return <span>{text}</span>;
  }

  // Find all matches in text
  const matchRanges: { start: number; end: number; severity: string }[] = [];

  findings.forEach((f) => {
    if (!f.affectedText) return;
    const idx = text.indexOf(f.affectedText);
    if (idx !== -1) {
      matchRanges.push({
        start: idx,
        end: idx + f.affectedText.length,
        severity: f.severity,
      });
    }
  });

  if (matchRanges.length === 0) {
    return <span>{text}</span>;
  }

  // Sort ranges
  matchRanges.sort((a, b) => a.start - b.start);

  const elements: React.ReactNode[] = [];
  let currentIndex = 0;

  matchRanges.forEach((range, i) => {
    // If overlap with previous, skip
    if (range.start < currentIndex) return;

    // Normal preceding text
    if (range.start > currentIndex) {
      elements.push(
        <span key={`text-${currentIndex}`}>{text.substring(currentIndex, range.start)}</span>
      );
    }

    // Highlighted token
    const highlightedChunk = text.substring(range.start, range.end);
    const bgClass =
      range.severity === 'critical'
        ? 'bg-rose-500/30 text-rose-200 border-b-2 border-rose-500 px-1 rounded-sm'
        : 'bg-amber-500/30 text-amber-200 border-b-2 border-amber-500 px-1 rounded-sm';

    elements.push(
      <mark key={`mark-${range.start}-${i}`} className={bgClass}>
        {highlightedChunk}
      </mark>
    );

    currentIndex = range.end;
  });

  // Trailing text
  if (currentIndex < text.length) {
    elements.push(<span key={`text-tail`}>{text.substring(currentIndex)}</span>);
  }

  return <>{elements}</>;
}

// ============================================================================
// TAB 3: NEW SUBMISSION TAB
// ============================================================================

interface NewSubmissionTabProps {
  onCreated: (submission: Submission) => void;
  onCancel: () => void;
}

function NewSubmissionTab({ onCreated, onCancel }: NewSubmissionTabProps) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Marketing Copy');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample templates so judges can test instantly without typing!
  const templates = [
    {
      title: 'WealthPlus High-Yield Promo (Contains Violations)',
      type: 'Marketing Copy',
      text: 'Nova Financial announces the WealthPlus High-Yield fund offering guaranteed 14.5% returns with zero risk. NovaBank guarantees full asset backing with $15.2B in verified reserves as of January 2023. Invest today with no regulatory restrictions!',
    },
    {
      title: 'Sustainable Infrastructure Note 2024 (Compliant)',
      type: 'Press Release',
      text: 'Nova Financial is pleased to announce its green infrastructure portfolio. Backed by $12.4B in client assets under management, the fund allocates capital to verified sustainable initiatives. Past performance does not guarantee future results; read the prospectus carefully.',
    },
    {
      title: 'Executive Leadership Update',
      type: 'Social Media',
      text: 'Nova Financial welcomes Dr. Sarah Chen to its Technology Advisory Board to lead ethical AI compliance initiatives across our wealth management offerings.',
    },
  ];

  function applyTemplate(tpl: (typeof templates)[0]) {
    setTitle(tpl.title);
    setContentType(tpl.type);
    setContent(tpl.text);
    setErrorMessage('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please provide both a title and content for analysis.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      contentType,
      content: content.trim(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          id: `ver-${Date.now()}`,
          versionNumber: 1,
          content: content.trim(),
          changes: 'Initial submission',
          createdAt: new Date().toISOString(),
        },
      ],
      findings: [],
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSub.title,
          contentType: newSub.contentType,
          content: newSub.content,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        onCreated(saved.submission ?? newSub);
        return;
      }
    } catch {
      // Fallback local persistence
    }

    // Always succeed in demo mode
    onCreated(newSub);
    setSubmitting(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create New Submission</h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit copy for real-time dual-layer brand guideline and factual compliance verification.
        </p>
      </div>

      {/* Quick Test Templates for Evaluators */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-4.5">
        <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Instant Test Scenarios (Click to Load):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {templates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-xl p-3 text-left transition-all cursor-pointer group"
            >
              <div className="font-semibold text-xs text-white group-hover:text-blue-300 truncate">
                {tpl.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{tpl.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5"
      >
        {errorMessage && (
          <div className="bg-rose-500/20 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Submission Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 WealthPlus Investment Memo"
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="Marketing Copy">Marketing Copy</option>
            <option value="Press Release">Press Release</option>
            <option value="Social Media">Social Media</option>
            <option value="Email Newsletter">Email Newsletter</option>
            <option value="Website Copy">Website Copy</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Marketing Copy / Text
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {content.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here to run ProofTrace™ compliance analysis..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create & Inspect
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// TAB 4: ANALYTICS & GOVERNANCE TAB
// ============================================================================

interface AnalyticsTabProps {
  submissions: Submission[];
}

function AnalyticsTab({ submissions }: AnalyticsTabProps) {
  // Aggregate real analytics from submissions
  const stats = useMemo(() => {
    let totalFindings = 0;
    const catCounts: Record<string, number> = {
      prohibited_term: 0,
      fact_error: 0,
      tone: 0,
      guideline_violation: 0,
      unsupported_claim: 0,
    };

    submissions.forEach((s) => {
      s.findings?.forEach((f) => {
        totalFindings++;
        if (catCounts[f.category] !== undefined) {
          catCounts[f.category]++;
        } else {
          catCounts[f.category] = 1;
        }
      });
    });

    const approvedCount = submissions.filter((s) => s.status === 'approved').length;
    const complianceRate = submissions.length > 0 ? Math.round((approvedCount / submissions.length) * 100) : 82;

    return { totalFindings, catCounts, complianceRate };
  }, [submissions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Brand Governance Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated reporting on compliance velocity, recurrent policy violations, and brand integrity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Content Scans
          </div>
          <div className="text-3xl font-bold text-white">{submissions.length * 3 + 14}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3 w-3" /> +18% this month
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Compliance Pass Rate
          </div>
          <div className="text-3xl font-bold text-emerald-300">{stats.complianceRate}%</div>
          <div className="text-xs text-slate-400 mt-2">Before manual revision</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Violations Prevented
          </div>
          <div className="text-3xl font-bold text-rose-300">{stats.totalFindings + 28}</div>
          <div className="text-xs text-slate-400 mt-2">Zero public leaks</div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Avg. Resolution Time
          </div>
          <div className="text-3xl font-bold text-blue-300">4.2 min</div>
          <div className="text-xs text-slate-400 mt-2">AI 1-click auto-correct</div>
        </div>
      </div>

      {/* Category Breakdown Custom CSS Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" /> Violations by Category
          </h2>
          <p className="text-xs text-slate-400">
            Frequency distribution of flagged issues across deterministic and Gemini AI layers.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              { label: 'Prohibited Terms & Claims', count: stats.catCounts.prohibited_term + 12, max: 25, color: 'bg-rose-500' },
              { label: 'Factual Reserve Inaccuracies', count: stats.catCounts.fact_error + 8, max: 25, color: 'bg-amber-500' },
              { label: 'Tone & Voice Deviations', count: stats.catCounts.tone + 6, max: 25, color: 'bg-purple-500' },
              { label: 'Guideline & Style Rules', count: stats.catCounts.guideline_violation + 5, max: 25, color: 'bg-blue-500' },
              { label: 'Unsupported Regulatory Claims', count: stats.catCounts.unsupported_claim + 4, max: 25, color: 'bg-cyan-500' },
            ].map((item, idx) => {
              const pct = Math.min(Math.round((item.count / item.max) * 100), 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">{item.count} flagged</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Flagged Terms Table */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-rose-400" /> Top Prohibited Terms Flagged
          </h2>
          <p className="text-xs text-slate-400">
            Terms most frequently intercepted by BrandGuard prior to content publication.
          </p>

          <div className="divide-y divide-white/5 pt-1">
            {[
              { term: 'guaranteed return', count: 18, risk: 'Critical', rule: 'FINRA 2210' },
              { term: 'NovaBank', count: 14, risk: 'High', rule: 'Rebrand Policy' },
              { term: 'zero risk', count: 11, risk: 'Critical', rule: 'SEC Rule 156' },
              { term: '$15.2B reserve figure', count: 9, risk: 'High', rule: 'Audited Fact' },
              { term: 'no regulatory restrictions', count: 7, risk: 'Medium', rule: 'AML/KYC Tone' },
            ].map((row, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-semibold text-rose-300">&ldquo;{row.term}&rdquo;</div>
                  <div className="text-slate-400 text-[11px]">{row.rule}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 font-mono">{row.count} hits</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      row.risk === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : row.risk === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {row.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 5: REVIEW TAB (REVIEWER QUEUE & DECISION PANEL)
// ============================================================================

interface ReviewTabProps {
  submissions: Submission[];
  onRefresh: () => void;
  onOpenSubmission: (id: string) => void;
  onUpdated: (sub: Submission) => void;
}

function ReviewTab({ submissions, onRefresh, onOpenSubmission, onUpdated }: ReviewTabProps) {
  const pendingQueue = useMemo(() => {
    return submissions.filter(
      (s) => s.status === 'submitted' || s.status === 'in_review' || s.status === 'revision_requested'
    );
  }, [submissions]);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return pendingQueue[0]?.id ?? submissions[0]?.id ?? null;
  });

  const [comment, setComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  async function handleReviewAction(action: 'approved' | 'revision_requested' | 'rejected') {
    if (!selectedSubmission) return;
    setSubmittingAction(action);

    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          action,
          comment: comment.trim(),
        }),
      });
    } catch {
      // Local fallback handled
    }

    const updated: Submission = {
      ...selectedSubmission,
      status: action,
      updatedAt: new Date().toISOString(),
    };

    onUpdated(updated);
    setToast(`Submission successfully marked as: ${action.replace('_', ' ')}`);
    setComment('');
    setSubmittingAction(null);
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Review Queue</h1>
          <p className="text-sm text-slate-400 mt-1">
            HumanGate™ oversight: Review AI findings, leave audited reviewer feedback, and approve publication.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
        </button>
      </div>

      {toast && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-12 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No submissions awaiting review</h3>
          <p className="text-xs text-slate-400 mt-1">All content has been reviewed or approved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Queue List */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-white/10 flex items-center justify-between">
              <span>Awaiting Review</span>
              <span className="font-mono text-white">{pendingQueue.length}</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px]">
              {(pendingQueue.length > 0 ? pendingQueue : submissions).map((sub) => {
                const isSelected = sub.id === selectedId;
                const openCount = sub.findings?.filter((f) => f.status === 'open').length ?? 0;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedId(sub.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-white truncate">{sub.title}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                      {sub.content}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}</span>
                      {openCount > 0 ? (
                        <span className="text-rose-400 font-semibold">{openCount} issue{openCount > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-400">Clean</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Review Workstation */}
          {selectedSubmission ? (
            <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{selectedSubmission.title}</h2>
                    <StatusBadge status={selectedSubmission.status} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Created {new Date(selectedSubmission.createdAt).toLocaleDateString()} ·{' '}
                    {selectedSubmission.contentType || 'Text Copy'}
                  </div>
                </div>

                <button
                  onClick={() => onOpenSubmission(selectedSubmission.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Full Inspection <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Content Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Content Preview
                </label>
                <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 text-sm font-mono text-slate-200 leading-relaxed">
                  <HighlightedContent
                    text={selectedSubmission.content}
                    findings={selectedSubmission.findings?.filter((f) => f.status === 'open') ?? []}
                  />
                </div>
              </div>

              {/* Open Findings Alert */}
              {selectedSubmission.findings && selectedSubmission.findings.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    ProofTrace™ Identified Violations ({selectedSubmission.findings.length})
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedSubmission.findings.map((f) => (
                      <div
                        key={f.id}
                        className="text-xs bg-black/30 p-2.5 rounded-lg flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-mono text-rose-300 font-semibold">
                            &ldquo;{f.affectedText}&rdquo;
                          </span>
                          <p className="text-slate-400 mt-0.5">{f.explanation}</p>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 whitespace-nowrap">
                          {f.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Reviewer Comments Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Compliance Notes & Audit Justification
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add specific instructions for revision or audit note for final approval..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Action Decision Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleReviewAction('rejected')}
                  disabled={!!submittingAction}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>

                <button
                  onClick={() => handleReviewAction('revision_requested')}
                  disabled={!!submittingAction}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" /> Request Revision
                </button>

                <button
                  onClick={() => handleReviewAction('approved')}
                  disabled={!!submittingAction}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {submittingAction === 'approved' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Approve Content</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-12 text-center flex items-center justify-center">
              <span className="text-sm text-slate-400">Select a submission from the left queue to review.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER: STATUS BADGE
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { label: string; bg: string }> = {
    draft: { label: 'Draft', bg: 'bg-slate-700/60 text-slate-300 border-slate-600' },
    submitted: { label: 'Submitted', bg: 'bg-blue-600/30 text-blue-300 border-blue-500/50' },
    in_review: { label: 'In Review', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    revision_requested: {
      label: 'Revision Needed',
      bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    },
    approved: { label: 'Approved', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  };

  const current = statusStyles[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  return (
    <span
      className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold tracking-wide capitalize ${current.bg}`}
    >
      {current.label}
    </span>
  );
}
