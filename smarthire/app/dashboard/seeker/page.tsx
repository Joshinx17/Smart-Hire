"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

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
  recruiter: { name: string }
}

type NavTab = "browse" | "saved" | "applications" | "profile"

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "full-time":  { bg: "#052e16", text: "#4ade80", border: "#166534" },
  "part-time":  { bg: "#1c1400", text: "#fbbf24", border: "#78350f" },
  contract:     { bg: "#0d0b2e", text: "#a5b4fc", border: "#3730a3" },
  remote:       { bg: "#0a1e26", text: "#22d3ee", border: "#164e63" },
}

const NAV_ITEMS: { icon: string; label: string; tab: NavTab }[] = [
  { icon: "", label: "Browse Jobs",   tab: "browse"       },
  { icon: "", label: "Saved Jobs",    tab: "saved"        },
  { icon: "", label: "Applications",  tab: "applications" },
  { icon: "", label: "Profile",       tab: "profile"      },
]

export default function SeekerDashboard() {
  const { data: session, status } = useSession()

  const [activeTab, setActiveTab] = useState<NavTab>("browse")
  const [jobs, setJobs] = useState<Job[]>([])
  const [filtered, setFiltered] = useState<Job[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selected, setSelected] = useState<Job | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => { setJobs(data); setFiltered(data) })
      .finally(() => setLoading(false))
  }, [status])

  // Persist saved jobs in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("savedJobIds")
    if (stored) setSavedIds(new Set(JSON.parse(stored)))
  }, [])

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem("savedJobIds", JSON.stringify([...next]))
      return next
    })
  }

  useEffect(() => {
    let result = jobs
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== "all") result = result.filter((j) => j.type === typeFilter)
    setFiltered(result)
  }, [search, typeFilter, jobs])

  const savedJobs = jobs.filter((j) => savedIds.has(j.id))

  if (status === "loading" || loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <p className="loading-text">fetching opportunities…</p>
        <style>{globalStyles}</style>
      </div>
    )
  }

  const initials = session?.user?.name?.[0]?.toUpperCase() ?? "U"

  return (
    <>
      <style>{globalStyles}</style>
      <div className="root">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg border border-amber-500/40 flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-400" />
              </div>
              <span>SMARTHIRE AI</span>
            </div>

          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.tab}
                className={`nav-item${activeTab === item.tab ? " nav-item-active" : ""}`}
                onClick={() => setActiveTab(item.tab)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.tab === "saved" && savedIds.size > 0 && (
                  <span className="nav-badge">{savedIds.size}</span>
                )}
                {activeTab === item.tab && <span className="nav-dot" />}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="user-chip">
              <div className="avatar">{initials}</div>
              <div className="user-info">
                <div className="user-name">{session?.user?.name}</div>
                <div className="user-role">Job Seeker</div>
              </div>
            </div>
            <button className="sign-out-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
              ← Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">

          {/* ── BROWSE JOBS ── */}
          {activeTab === "browse" && (
            <>
              <div className="header">
                <div>
                  <h1 className="page-title">Browse Jobs</h1>
                  <p className="page-subtitle">
                    <span className="count-badge">{filtered.length}</span>
                    {" "}open position{filtered.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                <div className="header-right">
                  <div className="greeting">
                    Good {getTimeOfDay()},{" "}
                    <strong>{session?.user?.name?.split(" ")[0]}</strong> 👋
                  </div>
                </div>
              </div>

              <div className="filter-row">
                <div className="search-wrap">
                  <span className="search-icon">⊙</span>
                  <input
                    className="search-input"
                    placeholder="Search title, company, location, skills…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="clear-btn" onClick={() => setSearch("")}>✕</button>
                  )}
                </div>
                <div className="type-filters">
                  {["all", "full-time", "part-time", "contract", "remote"].map((t) => (
                    <button
                      key={t}
                      className={`filter-chip${typeFilter === t ? " filter-chip-active" : ""}`}
                      onClick={() => setTypeFilter(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">◌</div>
                  <p className="empty-text">No jobs match your search.</p>
                  <button className="empty-reset" onClick={() => { setSearch(""); setTypeFilter("all") }}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid">
                  {filtered.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      index={i}
                      saved={savedIds.has(job.id)}
                      onSave={() => toggleSave(job.id)}
                      onClick={() => setSelected(job)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── SAVED JOBS ── */}
          {activeTab === "saved" && (
            <>
              <div className="header">
                <div>
                  <h1 className="page-title">Saved Jobs</h1>
                  <p className="page-subtitle">
                    <span className="count-badge">{savedJobs.length}</span>
                    {" "}job{savedJobs.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>

              {savedJobs.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">♡</div>
                  <p className="empty-text">No saved jobs yet.</p>
                  <button className="empty-reset" onClick={() => setActiveTab("browse")}>
                    Browse jobs
                  </button>
                </div>
              ) : (
                <div className="grid">
                  {savedJobs.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      index={i}
                      saved={true}
                      onSave={() => toggleSave(job.id)}
                      onClick={() => setSelected(job)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── APPLICATIONS ── */}
          {activeTab === "applications" && (
            <>
              <div className="header">
                <div>
                  <h1 className="page-title">My Applications</h1>
                  <p className="page-subtitle">Track the jobs you've applied to</p>
                </div>
              </div>
              <div className="placeholder-card">
                <div className="placeholder-icon">◎</div>
                <p className="placeholder-title">Applications coming soon</p>
                <p className="placeholder-desc">
                  Once you apply to jobs, you'll be able to track your application status here.
                </p>
                <button className="empty-reset" onClick={() => setActiveTab("browse")} style={{ marginTop: 8 }}>
                  Browse jobs
                </button>
              </div>
            </>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <>
              <div className="header">
                <div>
                  <h1 className="page-title">Profile</h1>
                  <p className="page-subtitle">Your account details</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-top">
                  <div className="profile-avatar">{initials}</div>
                  <div>
                    <div className="profile-name">{session?.user?.name}</div>
                    <div className="profile-role">Job Seeker</div>
                  </div>
                </div>
                <div className="profile-rows">
                  <ProfileRow label="Email" value={session?.user?.email ?? "—"} />
                  <ProfileRow label="Role" value="Job Seeker" />
                  <ProfileRow label="Saved Jobs" value={String(savedIds.size)} />
                </div>
                <p className="profile-note">Profile editing coming soon.</p>
              </div>
            </>
          )}
        </main>

        {/* ── Job Detail Drawer ── */}
        {selected && (
          <div className="overlay" onClick={() => setSelected(null)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>

              <div className="drawer-header">
                <div className="drawer-logo">{selected.company[0].toUpperCase()}</div>
                <div>
                  <h2 className="drawer-title">{selected.title}</h2>
                  <p className="drawer-company">{selected.company}</p>
                </div>
              </div>

              <div className="drawer-meta">
                <span className="meta-pill">⌖ {selected.location}</span>
                <span
                  className="meta-pill"
                  style={{
                    background: TYPE_COLORS[selected.type]?.bg,
                    color: TYPE_COLORS[selected.type]?.text,
                    border: `1px solid ${TYPE_COLORS[selected.type]?.border}`,
                  }}
                >
                  ● {selected.type}
                </span>
                {selected.salary && (
                  <span className="meta-pill salary-pill">{selected.salary} LPA</span>
                )}
              </div>

              <div className="divider" />

              <h4 className="section-label">About the Role</h4>
              <p className="drawer-desc">{selected.description}</p>

              {selected.skills.length > 0 && (
                <>
                  <h4 className="section-label">Skills Required</h4>
                  <div className="skills">
                    {selected.skills.map((s) => (
                      <span key={s} className="skill">{s}</span>
                    ))}
                  </div>
                </>
              )}

              <p className="posted-by-detail">
                Posted by{" "}
                <strong style={{ color: "#e2e8f0" }}>{selected.recruiter.name}</strong>
                {" "}·{" "}
                {new Date(selected.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>

              <div className="drawer-actions">
                <button
                  className="save-btn"
                  onClick={() => toggleSave(selected.id)}
                  style={savedIds.has(selected.id) ? { color: "#f59e0b", borderColor: "#f59e0b" } : {}}
                >
                  {savedIds.has(selected.id) ? "♥ Saved" : "♡ Save"}
                </button>
                <button className="apply-btn">Apply Now →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function JobCard({ job, index, saved, onSave, onClick }: {
  job: Job; index: number; saved: boolean; onSave: () => void; onClick: () => void
}) {
  const colors = TYPE_COLORS[job.type] ?? { bg: "#1e293b", text: "#94a3b8", border: "#334155" }
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="card-top">
        <div className="company-badge">{job.company[0].toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="save-icon-btn"
            onClick={(e) => { e.stopPropagation(); onSave() }}
            style={{ color: saved ? "#f59e0b" : undefined }}
            title={saved ? "Remove from saved" : "Save job"}
          >
            {saved ? "♥" : "♡"}
          </button>
          <span
            className="type-badge"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {job.type}
          </span>
        </div>
      </div>

      <h3 className="job-title">{job.title}</h3>
      <p className="company-name">{job.company}</p>
      <p className="location">⌖ {job.location}</p>
      {job.salary && <p className="salary"> {job.salary} LPA</p>}

      <p className="desc">{job.description.slice(0, 110)}{job.description.length > 110 ? "…" : ""}</p>

      <div className="skills">
        {job.skills.slice(0, 4).map((s) => (
          <span key={s} className="skill">{s}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="skill">+{job.skills.length - 4}</span>
        )}
      </div>

      <div className="card-footer">
        <span className="posted-by">by {job.recruiter.name}</span>
        <span className="card-date">
          {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-row">
      <span className="profile-row-label">{label}</span>
      <span className="profile-row-value">{value}</span>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #06070d;
    --surface:  #0d1117;
    --surface2: #161b24;
    --border:   #1e2738;
    --border2:  #252f40;
    --text-1:   #f0f4ff;
    --text-2:   #8896b3;
    --text-3:   #4a566e;
    --accent:   #f59e0b;
    --accent2:  #fbbf24;
    --purple:   #818cf8;
    --radius:   14px;
    --font-display: 'DM Sans', sans-serif;
    --font-body:    'DM Sans', sans-serif;
  }

  body { background: var(--bg); }

  .loading-wrap {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 100vh;
    background: var(--bg); gap: 16px;
  }
  .spinner {
    width: 44px; height: 44px;
    border: 3px solid var(--border2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  .loading-text { font-family: var(--font-body); color: var(--text-3); font-size: 15px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  .root {
    display: flex; min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-body);
    color: var(--text-1);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 248px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 28px 0;
    position: sticky; top: 0; height: 100vh;
    overflow: hidden;
  }
  .logo { display: flex; align-items: center; gap: 10px; padding: 0 24px 36px; }
  .logo-icon { font-size: 22px; color: var(--accent); }
  .logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-1); }
  .nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 12px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    cursor: pointer; color: var(--text-3);
    font-size: 15px; font-weight: 500;
    transition: all 0.15s; position: relative;
  }
  .nav-item:hover { color: var(--text-2); background: var(--surface2); }
  .nav-item-active { background: #1a1400; color: var(--accent); }
  .nav-item-active:hover { background: #1a1400; color: var(--accent); }
  .nav-icon { font-size: 17px; }
  .nav-label { font-size: 15px; }
  .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; }
  .nav-badge {
    margin-left: auto; background: var(--accent); color: #000;
    font-size: 10px; font-weight: 700; border-radius: 999px;
    padding: 1px 6px; min-width: 18px; text-align: center;
  }
  .sidebar-bottom { padding: 16px 16px 0; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
  .user-chip { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
  .avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #92400e, var(--accent));
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: #fff; flex-shrink: 0;
  }
  .user-info { display: flex; flex-direction: column; gap: 2px; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text-1); }
  .user-role { font-size: 12px; color: var(--text-3); }
  .sign-out-btn {
    background: transparent; border: 1px solid var(--border); color: var(--text-3);
    border-radius: 8px; padding: 9px 14px; font-size: 13px; cursor: pointer;
    width: 100%; font-family: var(--font-body); transition: all 0.15s; text-align: left;
  }
  .sign-out-btn:hover { border-color: var(--border2); color: var(--text-2); }

  /* ── Main ── */
  .main { flex: 1; padding: 28px 36px; overflow-y: auto; max-width: 1200px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .page-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-1); line-height: 1.1; }
  .page-subtitle { font-size: 13px; color: var(--text-3); margin-top: 5px; display: flex; align-items: center; gap: 8px; }
  .count-badge { background: #1a1400; color: var(--accent); border: 1px solid #78350f; border-radius: 6px; padding: 1px 7px; font-size: 12px; font-weight: 700; }
  .header-right { text-align: right; }
  .greeting { font-size: 13px; color: var(--text-3); background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; }
  .greeting strong { color: var(--text-1); font-weight: 600; }

  /* Filters */
  .filter-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 14px; color: var(--text-3); font-size: 14px; pointer-events: none; }
  .search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px 11px 40px; color: var(--text-1); font-size: 13px; font-family: var(--font-body); outline: none; transition: border-color 0.2s; }
  .search-input::placeholder { color: var(--text-3); }
  .search-input:focus { border-color: var(--accent); }
  .clear-btn { position: absolute; right: 12px; background: var(--border); border: none; color: var(--text-2); width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center; }
  .type-filters { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-chip { background: transparent; border: 1px solid var(--border); color: var(--text-3); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: var(--font-body); text-transform: capitalize; transition: all 0.15s; }
  .filter-chip:hover { border-color: var(--border2); color: var(--text-2); }
  .filter-chip-active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }

  /* Grid */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  /* Card */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; animation: fadeUp 0.4s ease both; }
  .card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 8px 30px #f59e0b14; }
  .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
  .company-badge { width: 36px; height: 36px; border-radius: 8px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 14px; color: var(--text-2); }
  .save-icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; color: var(--text-3); padding: 2px; transition: color 0.15s; line-height: 1; }
  .save-icon-btn:hover { color: var(--accent); }
  .type-badge { border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 600; text-transform: capitalize; letter-spacing: 0.2px; }
  .job-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-1); line-height: 1.3; }
  .company-name { font-size: 13px; color: var(--purple); font-weight: 500; }
  .location { font-size: 12px; color: var(--text-3); }
  .salary { font-size: 12px; color: #4ade80; font-weight: 500; }
  .desc { font-size: 13px; color: var(--text-2); line-height: 1.6; flex: 1; }
  .skills { display: flex; flex-wrap: wrap; gap: 5px; }
  .skill { background: var(--surface2); border: 1px solid var(--border2); color: var(--text-2); border-radius: 5px; padding: 3px 8px; font-size: 11px; font-weight: 500; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; padding-top: 12px; border-top: 1px solid var(--border); }
  .posted-by { font-size: 11px; color: var(--text-3); }
  .card-date { font-size: 11px; color: var(--text-3); }

  /* Empty */
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 12px; }
  .empty-icon { font-size: 40px; color: var(--border2); }
  .empty-text { font-size: 14px; color: var(--text-3); }
  .empty-reset { background: var(--surface2); border: 1px solid var(--border2); color: var(--text-2); border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; font-family: var(--font-body); transition: all 0.15s; }
  .empty-reset:hover { border-color: var(--accent); color: var(--accent); }

  /* Placeholder */
  .placeholder-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 60px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .placeholder-icon { font-size: 36px; color: var(--accent); }
  .placeholder-title { font-size: 16px; font-weight: 600; color: var(--text-2); }
  .placeholder-desc { font-size: 13px; color: var(--text-3); max-width: 360px; line-height: 1.6; }

  /* Profile */
  .profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 32px; max-width: 480px; }
  .profile-top { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
  .profile-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #92400e, var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 22px; color: #fff; flex-shrink: 0; }
  .profile-name { font-size: 18px; font-weight: 700; color: var(--text-1); }
  .profile-role { font-size: 13px; color: var(--text-3); margin-top: 3px; }
  .profile-rows { display: flex; flex-direction: column; }
  .profile-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .profile-row-label { color: var(--text-3); }
  .profile-row-value { color: var(--text-1); font-weight: 500; }
  .profile-note { font-size: 12px; color: var(--text-3); margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }

  /* Overlay + Drawer */
  .overlay { position: fixed; inset: 0; background: #00000070; backdrop-filter: blur(6px); z-index: 50; display: flex; justify-content: flex-end; animation: fadeUp 0.15s ease; }
  .drawer { width: 420px; max-width: 90vw; background: var(--surface); border-left: 1px solid var(--border); height: 100%; overflow-y: auto; padding: 32px 28px; position: relative; display: flex; flex-direction: column; gap: 14px; animation: slideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
  .close-btn { position: absolute; top: 18px; right: 18px; background: var(--surface2); border: 1px solid var(--border); color: var(--text-2); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 12px; transition: all 0.15s; }
  .close-btn:hover { background: var(--border2); color: var(--text-1); }
  .drawer-header { display: flex; align-items: center; gap: 14px; }
  .drawer-logo { width: 46px; height: 46px; border-radius: 11px; background: linear-gradient(135deg, #92400e, var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 18px; color: #fff; flex-shrink: 0; }
  .drawer-title { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-1); line-height: 1.2; }
  .drawer-company { font-size: 13px; color: var(--purple); margin-top: 3px; font-weight: 500; }
  .drawer-meta { display: flex; gap: 8px; flex-wrap: wrap; }
  .meta-pill { background: var(--surface2); border: 1px solid var(--border2); color: var(--text-2); border-radius: 999px; padding: 5px 12px; font-size: 12px; }
  .salary-pill { color: #4ade80; background: #052e16; border-color: #166534; }
  .divider { height: 1px; background: var(--border); }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-3); }
  .drawer-desc { font-size: 14px; color: var(--text-2); line-height: 1.75; }
  .posted-by-detail { font-size: 12px; color: var(--text-3); margin-top: 2px; }
  .drawer-actions { display: flex; gap: 10px; margin-top: auto; padding-top: 8px; }
  .save-btn { flex: 0 0 auto; background: transparent; border: 1px solid var(--border2); color: var(--text-2); border-radius: 9px; padding: 11px 16px; font-size: 13px; cursor: pointer; font-family: var(--font-body); transition: all 0.15s; }
  .save-btn:hover { border-color: var(--accent); color: var(--accent); }
  .apply-btn { flex: 1; background: var(--accent); color: #000; border: none; border-radius: 9px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font-display); letter-spacing: -0.3px; transition: all 0.15s; box-shadow: 0 4px 20px #f59e0b40; }
  .apply-btn:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 8px 28px #f59e0b50; }
`