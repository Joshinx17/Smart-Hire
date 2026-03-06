'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Sparkles, ArrowRight, Briefcase, Search } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const setRole = (role: string) => {
    setFormData({ ...formData, role })
  }

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('All fields are required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch {
      setError('Network error')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-zinc-950">

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">

        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Top: Brand + Headline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg border border-amber-500/40 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <span className="text-zinc-200 text-sm font-semibold tracking-widest uppercase">
              SmartHire AI
            </span>
          </div>

          <h1 className="text-5xl font-light text-zinc-100 leading-tight tracking-tight">
            Start your<br />
            <span className="italic text-amber-400">journey</span><br />
            today.
          </h1>

          <p className="mt-6 text-sm text-zinc-500 leading-relaxed max-w-xs">
            Join thousands of professionals who found their next opportunity — or their next great hire — with SmartHire.
          </p>

          {/* Role cards */}
          <div className="mt-10 space-y-3">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <div className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <Search size={14} className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200 mb-1">Job Seekers</div>
                <div className="text-xs text-zinc-500 leading-relaxed">
                  Get AI-matched to roles that fit your skills. Apply in seconds.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <div className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase size={14} className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200 mb-1">Recruiters</div>
                <div className="text-xs text-zinc-500 leading-relaxed">
                  Source, screen, and hire top talent faster with AI ranking.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 border-t border-zinc-800 pt-8 flex gap-10">
          {[
            { num: '50K+', label: 'Job Listings' },
            { num: '94%', label: 'Match Rate' },
            { num: '12K+', label: 'Hired' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="text-2xl font-light text-amber-400">{num}</div>
              <div className="text-xs text-zinc-600 uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex items-center justify-center px-6 py-16 bg-zinc-950 relative">

        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg border border-amber-500/40 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-400" />
            </div>
            <span className="text-zinc-200 text-sm font-semibold tracking-widest uppercase">
              SmartHire AI
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-500 mb-2">Get started</p>
            <h2 className="text-3xl font-light text-zinc-100 tracking-tight">
              Create your <span className="italic text-zinc-400">account</span>
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'seeker', label: 'Job Seeker', icon: Search },
                  { value: 'recruiter', label: 'Recruiter', icon: Briefcase },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm transition-all ${
                      formData.role === value
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="text-xs font-medium tracking-wide">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-3 rounded-lg outline-none focus:border-amber-500/50 focus:bg-zinc-800/80 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-3 rounded-lg outline-none focus:border-amber-500/50 focus:bg-zinc-800/80 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm px-4 py-3 pr-11 rounded-lg outline-none focus:border-amber-500/50 focus:bg-zinc-800/80 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm py-3 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-zinc-600">
            Already have an account?{' '}
            <a href="/login" className="text-amber-500 hover:text-amber-400 transition-colors font-medium">
              Sign in
            </a>
          </p>

        </div>
      </div>

    </main>
  )
}