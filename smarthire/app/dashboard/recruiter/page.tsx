"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"

type Job = {
    id: string
    title: string
    company: string
    location: string
    type: string
    description: string
    salary?: string
    skills: string[]
    isOpen: boolean
    createdAt: string
}

type NavTab = "postings" | "applications" | "analytics" | "profile"

const TYPE_COLORS: Record<string, string> = {
    "full-time": "#22c55e",
    "part-time": "#f59e0b",
    contract: "#6366f1",
    remote: "#06b6d4",
}

const EMPTY_FORM = {
    title: "",
    company: "",
    location: "",
    type: "full-time",
    description: "",
    salary: "",
    skills: "",
}

export default function RecruiterDashboard() {
    const { data: session, status } = useSession()

    const [activeTab, setActiveTab] = useState<NavTab>("postings")
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const fetchJobs = () => {
        fetch("/api/recruiter/jobs")
            .then((r) => r.json())
            .then(setJobs)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (status === "authenticated") fetchJobs()
    }, [status])

    const toggleJob = async (id: string, isOpen: boolean) => {
        await fetch(`/api/recruiter/jobs/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isOpen: !isOpen }),
        })
        fetchJobs()
    }

    const deleteJob = async (id: string) => {
        if (!confirm("Delete this job posting?")) return
        await fetch(`/api/recruiter/jobs/${id}`, { method: "DELETE" })
        fetchJobs()
    }

    const handleSubmit = async () => {
        setError("")
        if (!form.title || !form.company || !form.location || !form.description) {
            setError("Please fill in all required fields.")
            return
        }
        setSubmitting(true)
        const res = await fetch("/api/recruiter/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            }),
        })
        setSubmitting(false)
        if (res.ok) {
            setShowModal(false)
            setForm(EMPTY_FORM)
            fetchJobs()
        } else {
            setError("Something went wrong. Please try again.")
        }
    }

    const openCount = jobs.filter((j) => j.isOpen).length
    const closedCount = jobs.filter((j) => !j.isOpen).length

    if (status === "loading" || loading) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.spinner} />
                <p style={{ color: "#94a3b8", marginTop: 16, fontFamily: "monospace" }}>
                    loading your dashboard...
                </p>
            </div>
        )
    }

    return (
        <div style={styles.root}>
            {/* ── Sidebar ── */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>⌖ JobBoard</div>
                <nav style={styles.nav}>
                    <NavItem icon="◈" label="My Postings"   tab="postings"     active={activeTab} onClick={setActiveTab} />
                    <NavItem icon="◉" label="Applications"  tab="applications" active={activeTab} onClick={setActiveTab} />
                    <NavItem icon="◎" label="Analytics"     tab="analytics"    active={activeTab} onClick={setActiveTab} />
                    <NavItem icon="◌" label="Profile"        tab="profile"      active={activeTab} onClick={setActiveTab} />
                </nav>
                <div style={styles.sidebarBottom}>
                    <div style={styles.userChip}>
                        <div style={styles.avatar}>
                            {session?.user?.name?.[0]?.toUpperCase() ?? "R"}
                        </div>
                        <div>
                            <div style={styles.userName}>{session?.user?.name}</div>
                            <div style={styles.userRole}>Recruiter</div>
                        </div>
                    </div>
                    <button style={styles.signOutBtn} onClick={() => signOut({ callbackUrl: "/login" })}>
                        Sign out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main style={styles.main}>

                {/* ── MY POSTINGS ── */}
                {activeTab === "postings" && (
                    <>
                        <div style={styles.header}>
                            <div>
                                <h1 style={styles.pageTitle}>My Job Postings</h1>
                                <p style={styles.pageSubtitle}>Manage everything you've published</p>
                            </div>
                            <button style={styles.newJobBtn} onClick={() => setShowModal(true)}>
                                + Post a Job
                            </button>
                        </div>

                        <div style={styles.statsRow}>
                            <StatCard label="Total Postings" value={jobs.length} color="#6366f1" />
                            <StatCard label="Open" value={openCount} color="#22c55e" />
                            <StatCard label="Closed" value={closedCount} color="#ef4444" />
                        </div>

                        {jobs.length === 0 ? (
                            <div style={styles.empty}>
                                <div style={{ fontSize: 48 }}>◌</div>
                                <p>No jobs posted yet.</p>
                                <button style={styles.newJobBtn} onClick={() => setShowModal(true)}>
                                    Post your first job
                                </button>
                            </div>
                        ) : (
                            <div style={styles.tableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {["Job Title", "Company", "Location", "Type", "Salary", "Status", "Posted", "Actions"].map(
                                                (h) => <th key={h} style={styles.th}>{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map((job, i) => (
                                            <tr key={job.id} style={{ ...styles.tr, background: i % 2 === 0 ? "#0f172a" : "#0a1120" }}>
                                                <td style={styles.td}>
                                                    <div style={styles.titleCell}>
                                                        <div style={styles.titleIcon}>{job.title[0].toUpperCase()}</div>
                                                        <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{job.title}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>{job.company}</td>
                                                <td style={styles.td}>{job.location}</td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.typePill, background: TYPE_COLORS[job.type] + "20", color: TYPE_COLORS[job.type] }}>
                                                        {job.type}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {job.salary
                                                        ? <span style={{ color: "#22c55e" }}>{job.salary}</span>
                                                        : <span style={{ color: "#334155" }}>—</span>}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.statusPill, background: job.isOpen ? "#22c55e20" : "#ef444420", color: job.isOpen ? "#22c55e" : "#ef4444" }}>
                                                        {job.isOpen ? "● Open" : "● Closed"}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.td, color: "#475569", fontSize: 12 }}>
                                                    {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        <button style={styles.actionBtn} onClick={() => toggleJob(job.id, job.isOpen)}>
                                                            {job.isOpen ? "Close" : "Open"}
                                                        </button>
                                                        <button style={{ ...styles.actionBtn, ...styles.deleteBtn }} onClick={() => deleteJob(job.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── APPLICATIONS ── */}
                {activeTab === "applications" && (
                    <>
                        <div style={styles.header}>
                            <div>
                                <h1 style={styles.pageTitle}>Applications</h1>
                                <p style={styles.pageSubtitle}>Review candidates who applied to your postings</p>
                            </div>
                        </div>
                        <PlaceholderCard
                            icon="◉"
                            title="Applications coming soon"
                            desc="Once candidates apply to your job postings, you'll be able to review, filter, and manage them here."
                            color="#6366f1"
                        />
                    </>
                )}

                {/* ── ANALYTICS ── */}
                {activeTab === "analytics" && (
                    <>
                        <div style={styles.header}>
                            <div>
                                <h1 style={styles.pageTitle}>Analytics</h1>
                                <p style={styles.pageSubtitle}>Performance overview of your job postings</p>
                            </div>
                        </div>

                        {/* Quick stats from real data */}
                        <div style={styles.statsRow}>
                            <StatCard label="Total Postings" value={jobs.length} color="#6366f1" />
                            <StatCard label="Open" value={openCount} color="#22c55e" />
                            <StatCard label="Closed" value={closedCount} color="#ef4444" />
                        </div>

                        {/* Job type breakdown */}
                        {jobs.length > 0 && (
                            <div style={{ ...styles.tableWrap, padding: 24, marginBottom: 20 }}>
                                <p style={{ ...styles.pageSubtitle, marginBottom: 16 }}>Postings by Type</p>
                                {(["full-time", "part-time", "contract", "remote"] as const).map((type) => {
                                    const count = jobs.filter((j) => j.type === type).length
                                    const pct = jobs.length ? Math.round((count / jobs.length) * 100) : 0
                                    return (
                                        <div key={type} style={{ marginBottom: 14 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                                                <span style={{ textTransform: "capitalize" }}>{type}</span>
                                                <span>{count} job{count !== 1 ? "s" : ""} ({pct}%)</span>
                                            </div>
                                            <div style={{ background: "#1e293b", borderRadius: 999, height: 6 }}>
                                                <div style={{ background: TYPE_COLORS[type] ?? "#6366f1", width: `${pct}%`, height: 6, borderRadius: 999, transition: "width 0.5s ease" }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <PlaceholderCard
                            icon="◎"
                            title="Detailed analytics coming soon"
                            desc="Views, click-through rates, and applicant funnel metrics will appear here."
                            color="#f59e0b"
                        />
                    </>
                )}

                {/* ── PROFILE ── */}
                {activeTab === "profile" && (
                    <>
                        <div style={styles.header}>
                            <div>
                                <h1 style={styles.pageTitle}>Profile</h1>
                                <p style={styles.pageSubtitle}>Your recruiter account details</p>
                            </div>
                        </div>
                        <div style={{ ...styles.tableWrap, padding: 32, maxWidth: 500 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
                                <div style={{ ...styles.avatar, width: 56, height: 56, fontSize: 22 }}>
                                    {session?.user?.name?.[0]?.toUpperCase() ?? "R"}
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{session?.user?.name}</div>
                                    <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>Recruiter</div>
                                </div>
                            </div>
                            <ProfileRow label="Email" value={session?.user?.email ?? "—"} />
                            <ProfileRow label="Role" value="Recruiter" />
                            <ProfileRow label="Total Postings" value={String(jobs.length)} />
                            <ProfileRow label="Open Postings" value={String(openCount)} />
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
                                <p style={{ fontSize: 12, color: "#334155" }}>Profile editing coming soon.</p>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ── Create Job Modal ── */}
            {showModal && (
                <div style={styles.overlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Post a New Job</h2>
                            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div style={styles.formGrid}>
                            <Field label="Job Title *" value={form.title} placeholder="e.g. Senior Frontend Developer" onChange={(v) => setForm({ ...form, title: v })} />
                            <Field label="Company *" value={form.company} placeholder="e.g. Acme Corp" onChange={(v) => setForm({ ...form, company: v })} />
                            <Field label="Location *" value={form.location} placeholder="e.g. Bangalore, India" onChange={(v) => setForm({ ...form, location: v })} />
                            <div>
                                <label style={styles.label}>Job Type *</label>
                                <select style={styles.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                            <Field label="Salary (optional)" value={form.salary} placeholder="e.g. ₹18–24 LPA" onChange={(v) => setForm({ ...form, salary: v })} />
                            <Field label="Skills (comma separated)" value={form.skills} placeholder="React, TypeScript, Node.js" onChange={(v) => setForm({ ...form, skills: v })} />
                        </div>

                        <div>
                            <label style={styles.label}>Description *</label>
                            <textarea
                                style={{ ...styles.input, height: 120, resize: "vertical" }}
                                value={form.description}
                                placeholder="Describe the role, responsibilities, requirements..."
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        {error && <p style={styles.errorText}>{error}</p>}

                        <div style={styles.modalFooter}>
                            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                            <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                                {submitting ? "Posting…" : "Post Job →"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b", fontSize: 13 }}>
            <span style={{ color: "#475569" }}>{label}</span>
            <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{value}</span>
        </div>
    )
}

function PlaceholderCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
    return (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: "60px 40px", textAlign: "center", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 16, color }}>{icon}</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 13, color: "#334155", maxWidth: 360, margin: "0 auto" }}>{desc}</p>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
            <div style={{ ...styles.statValue, color }}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    )
}

function NavItem({ icon, label, tab, active, onClick }: {
    icon: string; label: string; tab: NavTab; active: NavTab; onClick: (t: NavTab) => void
}) {
    const isActive = tab === active
    return (
        <div
            style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}
            onClick={() => onClick(tab)}
        >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{label}</span>
        </div>
    )
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label style={styles.label}>{label}</label>
            <input style={styles.input} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: { display: "flex", minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0" },
    loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#020817", color: "#e2e8f0" },
    spinner: { width: 40, height: 40, border: "3px solid #1e293b", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    sidebar: { width: 240, background: "#0f172a", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh" },
    logo: { fontSize: 20, fontWeight: 700, color: "#f59e0b", padding: "0 24px 32px" },
    nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" },
    navItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, cursor: "pointer", color: "#64748b", fontSize: 14, fontWeight: 500 },
    navItemActive: { background: "#f59e0b15", color: "#fbbf24" },
    sidebarBottom: { padding: "16px 16px 0", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 12 },
    userChip: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0" },
    avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 },
    userName: { fontSize: 13, fontWeight: 600, color: "#cbd5e1" },
    userRole: { fontSize: 11, color: "#475569", marginTop: 1 },
    signOutBtn: { background: "transparent", border: "1px solid #1e293b", color: "#64748b", borderRadius: 7, padding: "8px 12px", fontSize: 12, cursor: "pointer", width: "100%" },
    main: { flex: 1, padding: "36px 40px", overflowY: "auto" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
    pageTitle: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", margin: 0, color: "#f1f5f9" },
    pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
    newJobBtn: { background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.3px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 },
    statCard: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" },
    statValue: { fontSize: 32, fontWeight: 800, letterSpacing: "-1px" },
    statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 },
    tableWrap: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { padding: "14px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" as const, color: "#475569", background: "#0a1120", borderBottom: "1px solid #1e293b" },
    tr: { borderBottom: "1px solid #1e293b" },
    td: { padding: "14px 16px", color: "#94a3b8", verticalAlign: "middle" },
    titleCell: { display: "flex", alignItems: "center", gap: 10 },
    titleIcon: { width: 30, height: 30, borderRadius: 7, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#64748b", flexShrink: 0 },
    typePill: { borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, textTransform: "capitalize" as const },
    statusPill: { borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
    actions: { display: "flex", gap: 6 },
    actionBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
    deleteBtn: { color: "#ef4444" },
    empty: { textAlign: "center" as const, color: "#475569", padding: "80px 0", fontSize: 16, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 },
    overlay: { position: "fixed" as const, inset: 0, background: "#00000088", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
    modal: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "32px", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 16 },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    modalTitle: { fontSize: 20, fontWeight: 700, margin: 0, color: "#f1f5f9" },
    closeBtn: { background: "#1e293b", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 13 },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    label: { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" as const, color: "#475569", marginBottom: 6 },
    input: { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" },
    errorText: { color: "#ef4444", fontSize: 13, margin: 0 },
    modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end" },
    cancelBtn: { background: "transparent", border: "1px solid #1e293b", color: "#64748b", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
    submitBtn: { background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
}