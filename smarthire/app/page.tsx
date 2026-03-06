'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, ArrowRight, Brain, Search, FileText,
  TrendingUp, Users, Building2, ChevronDown,
  Zap, Shield, BarChart3, CheckCircle, Menu, X
} from 'lucide-react'

const NAV_LINKS = ['Features', 'How It Works', 'Pricing']

const STATS = [
  { num: '50K+', label: 'Job Listings' },
  { num: '94%', label: 'Match Rate' },
  { num: '12K+', label: 'Hired' },
  { num: '3.2K+', label: 'Companies' },
]

const SEEKER_FEATURES = [
  {
    icon: Brain,
    title: 'AI Resume Analysis',
    desc: 'Get instant feedback on your resume with actionable improvements to stand out.',
  },
  {
    icon: Search,
    title: 'Smart Job Matching',
    desc: 'Our AI surfaces roles that align with your skills, experience, and career goals.',
  },
  {
    icon: TrendingUp,
    title: 'Career Path Insights',
    desc: 'Understand the trajectory of your career and what skills to build next.',
  },
  {
    icon: Zap,
    title: 'One-Click Apply',
    desc: 'Apply to multiple jobs with a tailored cover letter generated in seconds.',
  },
]

const RECRUITER_FEATURES = [
  {
    icon: Users,
    title: 'Talent Sourcing',
    desc: 'Find pre-screened, AI-ranked candidates that match your exact job requirements.',
  },
  {
    icon: FileText,
    title: 'Resume Screening',
    desc: 'Automatically rank hundreds of applicants by fit score so you focus on the best.',
  },
  {
    icon: BarChart3,
    title: 'Hiring Analytics',
    desc: 'Real-time dashboards on pipeline health, time-to-hire, and sourcing ROI.',
  },
  {
    icon: Shield,
    title: 'Bias-Free Hiring',
    desc: 'AI models trained to surface merit-based matches, reducing unconscious bias.',
  },
]

const STEPS = [
  { step: '01', title: 'Create your profile', desc: 'Sign up and let our AI parse your resume or job description in seconds.' },
  { step: '02', title: 'Get matched instantly', desc: 'Our model analyzes thousands of signals to surface the best fits — for both sides.' },
  { step: '03', title: 'Connect & close', desc: 'Chat, schedule interviews, and hire — all within SmartHire.' },
]

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'seeker' | 'recruiter'>('seeker')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-amber-500/40 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-400" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-zinc-200">
              SmartHire AI
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors">
                {l}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login"
              className="text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors px-4 py-2">
              Sign In
            </a>
            <a href="/register"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg">
              Get Started <ArrowRight size={13} />
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-6 py-6 space-y-4">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors py-1">
                {l}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <a href="/login" className="text-center border border-zinc-700 text-zinc-300 text-sm py-2.5 rounded-lg">
                Sign In
              </a>
              <a href="/register" className="text-center bg-amber-500 text-zinc-950 font-semibold text-sm py-2.5 rounded-lg">
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-150 h-150 bg-amber-500/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-amber-500/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-amber-500/25 bg-amber-500/5 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 tracking-widest uppercase">AI-Powered Recruiting · Now in Beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-zinc-100 leading-[1.05] tracking-tight mb-6">
            Hiring, reimagined<br />
            <span className="italic text-amber-400">by intelligence.</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10">
            SmartHire connects job seekers with their ideal role and recruiters with their perfect candidate — powered by AI that understands context, not just keywords.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/register?role=seeker"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-semibold text-sm px-8 py-3.5 rounded-lg">
              Find a Job <ArrowRight size={15} />
            </a>
            <a href="/register?role=recruiter"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-zinc-300 text-sm px-8 py-3.5 rounded-lg">
              <Building2 size={15} /> Hire Talent
            </a>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {['Resume Analysis', 'Smart Matching', 'AI Recruiter', 'One-Click Apply', 'Bias-Free Hiring'].map((f) => (
              <span key={f}
                className="px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-500 text-base tracking-wide">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-light text-amber-400 mb-1">{num}</div>
              <div className="text-base uppercase tracking-widest text-zinc-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-125 h-125 bg-amber-500/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex flex-col items-center text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-3">Features</p>
            <h2 className="text-4xl font-light text-zinc-100 tracking-tight">
              Built for both sides of the table
            </h2>
            <p className="mt-4 text-sm text-zinc-500 max-w-sm">
              Whether you're looking for a role or filling one, SmartHire has tools that give you the edge.
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              {(['seeker', 'recruiter'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors ${
                    activeTab === tab
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}>
                  {tab === 'seeker' ? 'Job Seekers' : 'Recruiters'}
                </button>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(activeTab === 'seeker' ? SEEKER_FEATURES : RECRUITER_FEATURES).map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="group p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-amber-500/30 hover:bg-zinc-900/80 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg border border-zinc-800 group-hover:border-amber-500/30 flex items-center justify-center mb-4 transition-colors">
                  <Icon size={18} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-2 tracking-wide">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-6 border-t border-zinc-800 bg-zinc-900/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-3">How It Works</p>
            <h2 className="text-4xl font-light text-zinc-100 tracking-tight">Three steps to your next chapter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />

            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center mb-5 relative z-10">
                  <span className="text-lg font-light text-amber-400">{step}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-2 tracking-wide">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6 border-t border-zinc-800 bg-zinc-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-100 h-100 bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-3">Pricing</p>
            <h2 className="text-4xl font-light text-zinc-100 tracking-tight">Simple, transparent pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Seeker */}
            <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Job Seekers</p>
                <div className="text-4xl font-light text-zinc-100">Free <span className="text-lg text-zinc-600">forever</span></div>
              </div>
              <ul className="space-y-3">
                {['AI resume feedback', 'Smart job matching', 'Unlimited applications', 'Career path insights', 'Interview prep tools'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <CheckCircle size={14} className="text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/register?role=seeker"
                className="mt-auto flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 transition-colors text-sm font-semibold py-3 rounded-lg">
                Get Started Free <ArrowRight size={14} />
              </a>
            </div>

            {/* Recruiter */}
            <div className="p-8 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] uppercase tracking-widest">
                Most Popular
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">Recruiters</p>
                <div className="text-4xl font-light text-zinc-100">$99 <span className="text-lg text-zinc-500">/ mo</span></div>
              </div>
              <ul className="space-y-3">
                {['AI candidate ranking', 'Automated resume screening', 'Unlimited job postings', 'Hiring analytics dashboard', 'Bias-reduction scoring', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle size={14} className="text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/register?role=recruiter"
                className="mt-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-semibold text-sm py-3 rounded-lg">
                Start Hiring <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="py-24 px-6 border-t border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight mb-6">
            Your next opportunity<br />
            <span className="italic text-amber-400">starts here.</span>
          </h2>
          <p className="text-sm text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Join thousands of job seekers and top companies already using SmartHire to build better careers and stronger teams.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href="/register?role=seeker"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 font-semibold text-sm px-8 py-3.5 rounded-lg">
              Find Jobs <ArrowRight size={15} />
            </a>
            <a href="/register?role=recruiter"
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors text-zinc-300 text-sm px-8 py-3.5 rounded-lg">
              <Building2 size={15} /> Post a Role
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg border border-amber-500/40 flex items-center justify-center">
              <Sparkles size={12} className="text-amber-400" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">SmartHire AI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {['Privacy', 'Terms', 'Contact', 'Blog'].map((l) => (
              <a key={l} href="#"
                className="text-xs uppercase tracking-widest text-white hover:text-zinc-400 transition-colors">
                {l}
              </a>
            ))}
          </div>

          <p className="text-xs text-white">© 2026 SmartHire AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}