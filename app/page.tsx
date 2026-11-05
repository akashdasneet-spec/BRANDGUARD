'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Zap, FileSearch, CheckCircle, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-400" />
            <span className="text-xl font-bold tracking-tight">BrandGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</a>
            <a href="/sign-up" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap className="h-3.5 w-3.5" />
          AI-Powered Brand Compliance
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          Your Brand,{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Protected</span>
        </h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto mb-10">
          BrandGuard automatically analyzes marketing content for brand violations, fact errors, and tone inconsistencies — with evidence-backed findings and AI-suggested corrections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            Try Demo <ArrowRight className="h-4 w-4" />
          </button>
          <a href="/sign-in" className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            Sign In
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileSearch, title: 'ProofTrace™ Evidence', desc: 'Every finding includes the exact source guideline, approved fact reference, and affected text. No invented citations.' },
            { icon: Zap, title: 'Dual-Layer Analysis', desc: 'Deterministic engine for exact term checks and fact verification. AI engine for tone, context, and semantic compliance.' },
            { icon: CheckCircle, title: 'HumanGate™ Approval', desc: 'AI never auto-approves. Every submission goes through a human review workflow with comments and audit history.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="h-10 w-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 sm:p-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400 font-medium">LIVE DEMO — No registration required</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Try BrandGuard Now</h2>
          <p className="text-white/60 mb-8 max-w-2xl">
            Select a role to experience the full BrandGuard workflow. Each role gets a restricted demo identity with pre-loaded brand data for &quot;Nova Financial&quot; — a fictional company.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { role: 'creator' as const, title: 'Content Creator', desc: 'Submit marketing copy, run analysis, apply suggestions, and send for review.', icon: '✍️' },
              { role: 'manager' as const, title: 'Brand Manager', desc: 'View brand guidelines, monitor submissions, and manage brand rules.', icon: '🎯' },
              { role: 'reviewer' as const, title: 'Compliance Reviewer', desc: 'Review submissions, leave comments, request revisions, and approve content.', icon: '✅' },
            ].map(({ role, title, desc, icon }) => (
              <button
                key={role}
                onClick={() => startDemo(role)}
                disabled={!!loading}
                className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-blue-400/50 rounded-2xl p-6 text-left transition-all disabled:opacity-50 group"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-300 transition-colors">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  {loading === role ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Starting...</>
                  ) : (
                    <>Continue as {title.split(' ')[0]} <ArrowRight className="h-4 w-4" /></>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-white/40">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            Demo mode uses isolated fictional data. Demo sessions expire in 4 hours. Content submitted in demo mode is not stored permanently.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">BrandGuard</span>
          </div>
          <p className="text-sm text-white/40">Built for CodeNexus India Round 2 · AI content processed by Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}
