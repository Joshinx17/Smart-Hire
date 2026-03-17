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
  recruiter: { name: string }
}

const TYPE_COLORS: Record<string, string> = {
  "full-time": "#22c55e",
  "part-time": "#f59e0b",
  contract: "#6366f1",
  remote: "#06b6d4",
}

export default function SeekerDashboard() {
  const { data: session, status } = useSession()

  const [jobs, setJobs] = useState<Job[]>([])
  const [filtered, setFiltered] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selected, setSelected] = useState<Job | null>(null)

  // Fetch jobs once authenticated
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data)
        setFiltered(data)
      })
      .finally(() => setLoading(false))
  }, [status])

  // Filter logic
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
    if (typeFilter !== "all") {
      result = result.filter((j) => j.type === typeFilter)
    }
    setFiltered(result)
  }, [search, typeFilter, jobs])

  if (status === "loading" || loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: "#94a3b8", marginTop: 16, fontFamily: "monospace" }}>
          fetching opportunities...
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
          <NavItem icon="◈" label="Browse Jobs" active />
          <NavItem icon="◉" label="Saved Jobs" />
          <NavItem icon="◎" label="Applications" />
          <NavItem icon="◌" label="Profile" />
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div style={styles.userName}>{session?.user?.name}</div>
              <div style={styles.userRole}>Job Seeker</div>
            </div>
          </div>
          <button
            style={styles.signOutBtn}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Browse Jobs</h1>
            <p style={styles.pageSubtitle}>
              {filtered.length} open position{filtered.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <input
            style={styles.searchInput}
            placeholder="Search title, company, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={styles.typeFilters}>
            {["all", "full-time", "part-time", "contract", "remote"].map(
              (t) => (
                <button
                  key={t}
                  style={{
                    ...styles.filterChip,
                    ...(typeFilter === t ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              )
            )}
          </div>
        </div>

        {/* Job Grid */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 48 }}>◌</div>
            <p>No jobs match your search.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((job) => (
              <div
                key={job.id}
                style={styles.card}
                onClick={() => setSelected(job)}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)"
                  ;(e.currentTarget as HTMLDivElement).style.borderColor =
                    "#6366f1"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)"
                  ;(e.currentTarget as HTMLDivElement).style.borderColor =
                    "#1e293b"
                }}
              >
                <div style={styles.cardTop}>
                  <div style={styles.companyBadge}>
                    {job.company[0].toUpperCase()}
                  </div>
                  <span
                    style={{
                      ...styles.typeBadge,
                      background: TYPE_COLORS[job.type] + "22",
                      color: TYPE_COLORS[job.type],
                      border: `1px solid ${TYPE_COLORS[job.type]}44`,
                    }}
                  >
                    {job.type}
                  </span>
                </div>

                <h3 style={styles.jobTitle}>{job.title}</h3>
                <p style={styles.company}>{job.company}</p>
                <p style={styles.location}>⌖ {job.location}</p>

                {job.salary && <p style={styles.salary}>💰 {job.salary}</p>}

                <p style={styles.desc}>
                  {job.description.slice(0, 120)}
                  {job.description.length > 120 ? "…" : ""}
                </p>

                <div style={styles.skills}>
                  {job.skills.slice(0, 4).map((s) => (
                    <span key={s} style={styles.skill}>
                      {s}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span style={styles.skill}>+{job.skills.length - 4}</span>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.postedBy}>by {job.recruiter.name}</span>
                  <span style={styles.date}>
                    {new Date(job.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Job Detail Drawer ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              ✕
            </button>

            <div style={styles.drawerHeader}>
              <div style={styles.drawerLogo}>
                {selected.company[0].toUpperCase()}
              </div>
              <div>
                <h2 style={styles.drawerTitle}>{selected.title}</h2>
                <p style={styles.drawerCompany}>{selected.company}</p>
              </div>
            </div>

            <div style={styles.drawerMeta}>
              <span>⌖ {selected.location}</span>
              <span style={{ color: TYPE_COLORS[selected.type] }}>
                ● {selected.type}
              </span>
              {selected.salary && <span>💰 {selected.salary}</span>}
            </div>

            <h4 style={styles.sectionLabel}>Description</h4>
            <p style={styles.drawerDesc}>{selected.description}</p>

            {selected.skills.length > 0 && (
              <>
                <h4 style={styles.sectionLabel}>Skills Required</h4>
                <div style={styles.skills}>
                  {selected.skills.map((s) => (
                    <span key={s} style={styles.skill}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            <p style={styles.postedByDetail}>
              Posted by{" "}
              <strong style={{ color: "#e2e8f0" }}>
                {selected.recruiter.name}
              </strong>{" "}
              on{" "}
              {new Date(selected.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <button style={styles.applyBtn}>Apply Now →</button>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <div
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {}),
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#020817",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e2e8f0",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#020817",
    color: "#e2e8f0",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  sidebar: {
    width: 240,
    background: "#0f172a",
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    padding: "28px 0",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#6366f1",
    padding: "0 24px 32px",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "0 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "#6366f115",
    color: "#818cf8",
  },
  sidebarBottom: {
    padding: "16px 16px 0",
    borderTop: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    color: "#fff",
    flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 600, color: "#cbd5e1" },
  userRole: { fontSize: 11, color: "#475569", marginTop: 1 },
  signOutBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    borderRadius: 7,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    width: "100%",
    transition: "all 0.15s",
  },
  main: { flex: 1, padding: "36px 40px", overflowY: "auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    margin: 0,
    color: "#f1f5f9",
  },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 28,
  },
  searchInput: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  typeFilters: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterChip: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "capitalize",
    transition: "all 0.15s",
  },
  filterChipActive: {
    background: "#6366f1",
    border: "1px solid #6366f1",
    color: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 14,
    padding: "22px",
    cursor: "pointer",
    transition: "transform 0.2s, border-color 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  companyBadge: {
    width: 38,
    height: 38,
    borderRadius: 9,
    background: "linear-gradient(135deg, #1e293b, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    color: "#94a3b8",
  },
  typeBadge: {
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  jobTitle: { fontSize: 16, fontWeight: 700, margin: 0, color: "#f1f5f9" },
  company: { fontSize: 13, color: "#818cf8", margin: 0, fontWeight: 500 },
  location: { fontSize: 12, color: "#64748b", margin: 0 },
  salary: { fontSize: 12, color: "#22c55e", margin: 0, fontWeight: 500 },
  desc: { fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0, flex: 1 },
  skills: { display: "flex", flexWrap: "wrap", gap: 6 },
  skill: {
    background: "#1e293b",
    color: "#94a3b8",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 500,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 12,
    borderTop: "1px solid #1e293b",
  },
  postedBy: { fontSize: 11, color: "#475569" },
  date: { fontSize: 11, color: "#475569" },
  empty: {
    textAlign: "center",
    color: "#475569",
    padding: "80px 0",
    fontSize: 16,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#00000088",
    backdropFilter: "blur(4px)",
    zIndex: 50,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: 440,
    background: "#0f172a",
    borderLeft: "1px solid #1e293b",
    height: "100%",
    overflowY: "auto",
    padding: "36px 32px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "#1e293b",
    border: "none",
    color: "#94a3b8",
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 13,
  },
  drawerHeader: { display: "flex", alignItems: "center", gap: 16 },
  drawerLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 20,
    color: "#fff",
    flexShrink: 0,
  },
  drawerTitle: { fontSize: 20, fontWeight: 700, margin: 0, color: "#f1f5f9" },
  drawerCompany: { fontSize: 14, color: "#818cf8", margin: "4px 0 0" },
  drawerMeta: {
    display: "flex",
    gap: 20,
    fontSize: 13,
    color: "#64748b",
    flexWrap: "wrap",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#475569",
    margin: 0,
  },
  drawerDesc: { fontSize: 14, color: "#94a3b8", lineHeight: 1.8, margin: 0 },
  postedByDetail: { fontSize: 12, color: "#475569", marginTop: 8 },
  applyBtn: {
    marginTop: "auto",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    letterSpacing: "-0.3px",
  },
}