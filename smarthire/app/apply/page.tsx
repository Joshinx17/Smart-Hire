'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, Upload, X, Plus, CheckCircle, Loader2, FileText, AlertCircle } from 'lucide-react'

interface ApplicationForm {
  name: string
  role: string
  company: string
  salary: string
  skills: string[]
  resume: File | null
}

function SkillTag({ skill, onRemove }: { skill: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium tracking-wide">
      {skill}
      <button type="button" onClick={onRemove} className="hover:text-amber-200 transition-colors ml-0.5">
        <X size={11} />
      </button>
    </span>
  )
}

export default function ApplyPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const jobRole    = searchParams.get('role')    ?? ''
  const jobCompany = searchParams.get('company') ?? ''
  const jobSalary  = searchParams.get('salary')  ?? ''
  const jobId      = searchParams.get('jobId')   ?? ''

  const [form, setForm] = useState<ApplicationForm>({
    name: '', role: jobRole, company: jobCompany, salary: jobSalary, skills: [], resume: null,
  })
  const [skillInput, setSkillInput] = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)

  // Auto-fill name from session
  useEffect(() => {
    if (session?.user?.name) setForm(f => ({ ...f, name: session.user!.name! }))
  }, [session])

  // Skills
  const addSkill = () => {
    const t = skillInput.trim()
    if (!t || form.skills.includes(t) || form.skills.length >= 15) { setSkillInput(''); return }
    setForm(f => ({ ...f, skills: [...f.skills, t] }))
    setSkillInput('')
  }
  const removeSkill = (i: number) => setForm(f => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }))
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
    if (e.key === 'Backspace' && !skillInput && form.skills.length > 0) removeSkill(form.skills.length - 1)
  }

  // Resume
  const handleFile = (file: File | null) => {
    setResumeError(null)
    if (!file) return
    if (file.type !== 'application/pdf') { setResumeError('Only PDF files are accepted.'); return }
    if (file.size > 5 * 1024 * 1024) { setResumeError('File must be under 5 MB.'); return }
    setForm(f => ({ ...f, resume: file }))
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  // Submit: upload resume first, then submit application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim())        return setError('Please enter your name.')
    if (!form.resume)             return setError('Please attach your resume (PDF).')
    if (form.skills.length === 0) return setError('Add at least one skill.')
    if (!jobId)                   return setError('Invalid job. Please go back and try again.')

    setSubmitting(true)
    try {
      // Step 1: Upload the resume file
      const fd = new FormData()
      fd.append('resume', form.resume)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!uploadRes.ok) throw new Error('Resume upload failed. Please try again.')
      const { url: resumeUrl } = await uploadRes.json()

      // Step 2: Submit application as JSON
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          jobId,
          skills: form.skills,
          resumeUrl,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Submission failed. Please try again.')
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={28} className="text-amber-400 animate-spin" />
      </div>
    )
  }
  if (status === 'unauthenticated') { router.replace('/login'); return null }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-16 h-16 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
          <CheckCircle size={32} className="text-amber-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-light text-zinc-100 tracking-tight mb-2">Application Submitted!</h1>
          <p className="text-sm text-zinc-500">
            Your application for <span className="text-zinc-300 font-medium">{form.role}</span> at{' '}
            <span className="text-zinc-300 font-medium">{form.company}</span> is on its way.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/seeker')}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors mt-2"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top bar */}
      <header className="border-b border-zinc-800/60 px-6 h-14 flex items-center justify-between max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-amber-500/40 flex items-center justify-center">
            <Sparkles size={10} className="text-amber-400" />
          </div>
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">SmartHire AI</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            {form.role || 'Apply for Position'}
          </h1>
          {form.company && <p className="text-sm text-zinc-500 mt-1">{form.company}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Name — pre-filled but editable */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>

          {/* Role + Company — read-only from URL params */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Role</label>
              <div className="w-full bg-zinc-900/50 border border-zinc-800/60 rounded-lg px-4 py-3 text-sm text-zinc-400 cursor-not-allowed">
                {form.role || <span className="text-zinc-600 italic">Not specified</span>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Company</label>
              <div className="w-full bg-zinc-900/50 border border-zinc-800/60 rounded-lg px-4 py-3 text-sm text-zinc-400 cursor-not-allowed">
                {form.company || <span className="text-zinc-600 italic">Not specified</span>}
              </div>
            </div>
          </div>

          {/* Salary — read-only */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Offered Salary</label>
            <div className="w-full bg-zinc-900/50 border border-zinc-800/60 rounded-lg px-4 py-3 text-sm text-zinc-400 cursor-not-allowed">
              {form.salary || <span className="text-zinc-600 italic">Not disclosed</span>}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Skills <span className="text-zinc-700 normal-case tracking-normal">(Enter or comma to add)</span>
            </label>
            <div
              className="min-h-13 w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/20 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 cursor-text transition-all"
              onClick={() => document.getElementById('skill-input')?.focus()}
            >
              {form.skills.map((s, i) => <SkillTag key={i} skill={s} onRemove={() => removeSkill(i)} />)}
              {form.skills.length < 15 && (
                <input
                  id="skill-input"
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder={form.skills.length === 0 ? 'e.g. React, TypeScript…' : ''}
                  className="flex-1 min-w-35 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none py-0.5"
                />
              )}
            </div>
            {skillInput.trim() && (
              <button type="button" onClick={addSkill} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                <Plus size={12} /> Add &quot;{skillInput.trim()}&quot;
              </button>
            )}
            <p className="text-[11px] text-zinc-600">{form.skills.length}/15 skills added</p>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Resume <span className="text-zinc-700 normal-case tracking-normal">(PDF only, max 5 MB)</span>
            </label>

            {/* Hidden native file input — opens file explorer on click */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0] ?? null)}
            />

            {form.resume ? (
              <div className="flex items-center justify-between w-full bg-zinc-900 border border-amber-500/25 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{form.resume.name}</p>
                    <p className="text-[11px] text-zinc-600">{(form.resume.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, resume: null })); setResumeError(null) }}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors ml-3 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}   // ← opens file explorer
                className={`w-full border-2 border-dashed rounded-xl px-6 py-8 flex flex-col items-center gap-3 cursor-pointer transition-all
                  ${dragOver ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'}`}
              >
                <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center">
                  <Upload size={16} className="text-zinc-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-300 font-medium">
                    {dragOver ? 'Drop it here…' : 'Click to choose file or drag & drop'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">PDF files only · Max 5 MB</p>
                </div>
              </div>
            )}

            {resumeError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} /> {resumeError}
              </p>
            )}
          </div>

          {/* Global error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-zinc-950 font-semibold text-sm uppercase tracking-widest py-3.5 rounded-lg mt-2"
          >
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
              : <>Submit Application <ArrowLeft size={14} className="rotate-180" /></>
            }
          </button>
        </form>
      </main>
    </div>
  )
}