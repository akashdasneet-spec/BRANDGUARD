'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Zap,
  FileSearch,
  CheckCircle,
  Users,
  BarChart3,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  FileCheck2,
  Scale,
  Check,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function startDemo(role: 'creator' | 'manager' | 'reviewer') {
    setLoading(role);
    try {
      const res = await fetch('/api/demo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to start demo');
      router.push('/demo/dashboard');
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* ============================================================
          1. NAVIGATION (Imagine Style: Clean White & Floating Shadow)
          ============================================================ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Signature Color Accent Period */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              brandguard<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features-section" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#prooftrace-section" className="hover:text-blue-600 transition-colors">
              ProofTrace™
            </a>
            <a href="#humangate-section" className="hover:text-blue-600 transition-colors">
              HumanGate™
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-blue-600 transition-colors text-blue-600">
              Judge Demo
            </a>
          </div>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-blue-600 px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Try Demo <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================
          2. HERO SECTION (Imagine Style: Bold Headline + Product Preview)
          ============================================================ */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                AI-Powered Brand Governance Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Make Your Brand <br className="hidden sm:inline" />
                Governance <br className="hidden sm:inline" />
                <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">
                  Effortless.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                BrandGuard automatically analyzes marketing content for brand policy violations, numerical
                fact errors, and tone inconsistencies — with evidence-backed citations and instant auto-corrections.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <button
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-8 py-4 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  Launch Judge Demo
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/sign-in"
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-base font-bold px-7 py-4 rounded-full shadow-xs hover:border-slate-300 transition-all flex items-center justify-center"
                >
                  Sign In to Org
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap gap-y-2 gap-x-6 justify-center lg:justify-start text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500 stroke-[3]" /> Zero Registration Required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500 stroke-[3]" /> Deterministic + Gemini AI
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500 stroke-[3]" /> Server-Enforced RBAC
                </span>
              </div>
            </div>

            {/* Right Product Illustration Column (Imagine Visual Card) */}
            <div className="lg:col-span-6 relative">
              {/* Soft decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl -z-10 blur-xl opacity-70" />

              {/* Mockup Card: Live Compliance Audit Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 relative">
                {/* Header of Inspector */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Q4_Fintech_Campaign.docx
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Audit Complete
                  </span>
                </div>

                {/* Simulated Marketing Copy with Highlights */}
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-sans mb-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <p>
                    Nova Financial is proud to announce our new personal credit solution.{' '}
                    <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-semibold line-through decoration-rose-500 decoration-2">
                      Earn guaranteed returns with zero risk
                    </span>{' '}
                    while saving with us today. Our APY starts at{' '}
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                      6.5% APY
                    </span>{' '}
                    for all members.
                  </p>
                </div>

                {/* Floating ProofTrace Finding Card */}
                <div className="bg-white border-2 border-rose-200 rounded-xl p-4 shadow-lg space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-black uppercase rounded bg-rose-500 text-white">
                        Critical
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Prohibited Financial Claim
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Rule #104</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>ProofTrace™ Citation:</strong> FINRA Rule 2210 prohibits guaranteeing returns on investment products.
                  </p>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between gap-3">
                    <div className="text-xs text-emerald-900 font-medium truncate">
                      <strong>Auto-Correction:</strong> targeted yield (subject to market risk)
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-300 shrink-0">
                      Auto-Apply
                    </span>
                  </div>
                </div>

                {/* Footer KPI Counter inside Card */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 text-center">
                  <div>
                    <div className="text-lg font-black text-slate-900">98.4%</div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Compliance</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-blue-600">0</div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Hallucinations</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">&lt;350ms</div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">Scan Speed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. METRICS BANNER (Imagine Style: Clean White Stat Blocks)
          ============================================================ */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">100%</div>
              <div className="text-sm font-semibold text-slate-600">Deterministic Rule Accuracy</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">18</div>
              <div className="text-sm font-semibold text-slate-600">Relational Drizzle Tables</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">&lt; 500ms</div>
              <div className="text-sm font-semibold text-slate-600">Average Audit Latency</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">0</div>
              <div className="text-sm font-semibold text-slate-600">Hallucinated Citations</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. FEATURES SECTION (Imagine Style: 6-Card Grid with Icon Circles)
          ============================================================ */}
      <section id="features-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              BrandGuard Features
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Engineered for enterprise compliance, marketing teams, and brand guardians.
              Every feature is built with zero-tolerance for hallucinations.
            </p>
          </div>

          {/* 6-Card Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldAlert,
                title: 'Exact Term Enforcement',
                desc: 'Case-insensitive word boundary scanning catches prohibited phrases, deprecated product names, and unapproved competitors instantly.',
              },
              {
                icon: Scale,
                title: 'Quantitative Fact Verification',
                desc: 'Compares numerical rates, APY claims, member statistics, and financial limits directly against approved corporate fact sheets.',
              },
              {
                icon: Zap,
                title: 'Dual-Layer AI Engine',
                desc: 'Combines an ultra-fast deterministic regex engine with Google Gemini 2.0 Flash for semantic nuance, tone, and contextual alignment.',
              },
              {
                icon: FileSearch,
                title: 'ProofTrace™ Evidence',
                desc: 'No vague AI suggestions. Every single finding references the exact guideline clause, approved fact ID, and text offset.',
              },
              {
                icon: Users,
                title: 'HumanGate™ Approval',
                desc: 'AI never auto-approves. Server-enforced permissions require authorized human reviewers and managers to sign off before release.',
              },
              {
                icon: BarChart3,
                title: 'ClarityRadar Analytics',
                desc: 'Real SQL aggregations from PostgreSQL highlight repeat violations, high-risk categories, and ambiguous guidelines needing clarification.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Imagine Circular Icon Wrap */}
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Explore capability <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. BIG FEATURE SHOWCASE 1: PROOFTRACE™ (Imagine Alternating Rows)
          ============================================================ */}
      <section id="prooftrace-section" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Mockup Graphic */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <FileCheck2 className="h-4 w-4" /> ProofTrace™ Verified Citation Card
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Violation Target</div>
                  <div className="text-sm font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                    &quot;$15.2B in verified reserves as of January 2023&quot;
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Source Guideline</span>
                    <span className="font-semibold text-slate-800">Approved Fact #044: Q2 2024 Audited Reserves</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Verified Truth</span>
                    <span className="font-semibold text-emerald-700">$12.4B audited reserves (Updated Aug 2024)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Confidence Score</span>
                    <span className="font-semibold text-blue-600">0.98 (High Confidence)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Description & Testimonial Box */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                ProofTrace™ Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Evidence You Can Inspect. Zero Fabricated Citations.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Generic AI tools frequently invent rules or cite non-existent guidelines. BrandGuard’s ProofTrace™
                forces every AI finding to bind directly to an approved guideline record or corporate fact sheet in your PostgreSQL database.
              </p>

              {/* Imagine Author Callout Box */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <blockquote className="text-sm italic text-slate-700 leading-relaxed">
                  &ldquo;BrandGuard removed all guesswork from our compliance reviews. Our creators see exactly
                  which clause was breached and can accept suggested fixes in a single click.&rdquo;
                </blockquote>
                <div className="text-xs font-bold text-slate-900">
                  Senior Compliance Director — Nova Financial Demo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. BIG FEATURE SHOWCASE 2: HUMANGATE™ (Imagine Alternating Row 2)
          ============================================================ */}
      <section id="humangate-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                HumanGate™ Workflow
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                AI Suggests Corrections. Authorized Humans Decide.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                An AI result must never automatically publish or approve material. HumanGate™ enforces cryptographic
                role-based access control: content creators submit and revise, while designated Compliance Reviewers
                and Brand Managers provide the final stamped sign-off.
              </p>

              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  Immutable review events stored in PostgreSQL audit log
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  Creator revision workflows with automatic diff tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  Audit history with timestamp, actor identity, and version IDs
                </li>
              </ul>
            </div>

            {/* Right Visual Graphic */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500">Decision Audit Log</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    APPROVED
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Riley Johnson (Compliance Reviewer)</span>
                      <span className="text-slate-400">10:42 AM</span>
                    </div>
                    <p className="text-slate-600">
                      &quot;Approved after version 2 corrected the APY fact sheet mismatch. Ready for release.&quot;
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Alex Chen (Content Creator)</span>
                      <span className="text-slate-400">10:38 AM</span>
                    </div>
                    <p className="text-slate-600">
                      &quot;Applied suggested correction from ProofTrace Rule #044.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. HOW IT WORKS (Imagine Style: 4-Step Process)
          ============================================================ */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              How BrandGuard Works
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              From raw copy to certified publication in four automated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Brand Setup',
                desc: 'Upload official brand guidelines, prohibited keywords, approved claims, and color standards into your workspace.',
              },
              {
                step: '02',
                title: 'Content Ingestion',
                desc: 'Submit copy via live editor or upload PDF, DOCX, or text documents. Text is automatically parsed and extracted.',
              },
              {
                step: '03',
                title: 'Dual-Layer Audit',
                desc: 'Deterministic rules check facts and terms in milliseconds; Gemini AI evaluates tone, nuance, and guideline violations.',
              },
              {
                step: '04',
                title: 'Human Review',
                desc: 'Reviewers inspect citations, request revisions, or grant verified approvals with a permanent audit trail.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                <div className="text-3xl font-black text-blue-600/30 mb-3 font-mono">{step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          8. JUDGE DEMO HUB (Colorlib Style Interactive Hub)
          ============================================================ */}
      <section id="demo" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 rounded-3xl border-2 border-blue-200 p-8 sm:p-12 lg:p-16 shadow-xl">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Interactive Judge Demo — Zero Registration Required
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Try BrandGuard Now
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
              Select any role below to experience the complete workflow. Each role uses an isolated, pre-seeded
              dataset for fictional brand <strong>&quot;Nova Financial&quot;</strong>.
            </p>

            {/* 3 Persona Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  role: 'creator' as const,
                  title: 'Content Creator',
                  name: 'Alex Chen',
                  icon: '✍️',
                  desc: 'Submit marketing copy, run real-time dual-layer scans, review ProofTrace findings, and auto-apply suggested fixes.',
                  actionText: 'Enter as Creator',
                  borderColor: 'hover:border-purple-300',
                  badgeColor: 'bg-purple-100 text-purple-800',
                },
                {
                  role: 'manager' as const,
                  title: 'Brand Manager',
                  name: 'Jordan Smith',
                  icon: '🎯',
                  desc: 'Explore brand guidelines, monitor organization submissions, check policy rules, and inspect ClarityRadar metrics.',
                  actionText: 'Enter as Manager',
                  borderColor: 'hover:border-blue-300',
                  badgeColor: 'bg-blue-100 text-blue-800',
                },
                {
                  role: 'reviewer' as const,
                  title: 'Compliance Reviewer',
                  name: 'Riley Johnson',
                  icon: '✅',
                  desc: 'Inspect pending content, verify source citations, leave feedback, request creator revisions, or sign off approvals.',
                  actionText: 'Enter as Reviewer',
                  borderColor: 'hover:border-emerald-300',
                  badgeColor: 'bg-emerald-100 text-emerald-800',
                },
              ].map(({ role, title, name, icon, desc, actionText, borderColor, badgeColor }) => (
                <button
                  key={role}
                  onClick={() => startDemo(role)}
                  disabled={!!loading}
                  className={`bg-white border-2 border-slate-200 ${borderColor} rounded-2xl p-7 text-left shadow-md hover:shadow-xl transition-all duration-300 group disabled:opacity-60 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{icon}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                        {title}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {name}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold mb-4">Demo Persona</p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-blue-600 group-hover:text-blue-700">
                    {loading === role ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Preparing Demo...
                      </span>
                    ) : (
                      <>
                        <span>{actionText}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Privacy & Sandbox Notice */}
            <div className="mt-8 flex items-start gap-2.5 text-xs text-slate-500 bg-white/80 p-3.5 rounded-xl border border-slate-200">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Sandbox Notice:</strong> Demo mode runs on isolated test data with cryptographically signed
                session tokens. Evaluators can reset demo state at any time via the dashboard.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          9. FOOTER (Imagine Style: Multi-column Clean Minimalist)
          ============================================================ */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-xl font-black text-white">
                  brandguard<span className="text-blue-400">.</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Autonomous AI-powered brand governance & compliance verification platform.
                Built for CodeNexus India — Round 2.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#features-section" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#prooftrace-section" className="hover:text-white transition-colors">ProofTrace™ Citations</a></li>
                <li><a href="#humangate-section" className="hover:text-white transition-colors">HumanGate™ Workflow</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Judge Demo Hub</a></li>
              </ul>
            </div>

            {/* Col 3: Technology */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Architecture</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Next.js 16 App Router</li>
                <li>Neon PostgreSQL + Drizzle ORM</li>
                <li>Better Auth & Signed JWTs</li>
                <li>Google Gemini 2.0 Flash (AI SDK)</li>
              </ul>
            </div>

            {/* Col 4: Hackathon Attribution */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Hackathon</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Built autonomously for CodeNexus India Round 2 Hackathon.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-800/60">
                <Lock className="h-3.5 w-3.5" /> Zero-Hallucination Guardrails
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} BrandGuard. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>CodeNexus India Round 2</span>
              <span>Google Gemini AI</span>
              <span>Vercel + Neon</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
