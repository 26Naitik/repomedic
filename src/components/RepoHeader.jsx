import { motion } from "framer-motion";
import { Star, GitFork, AlertCircle, Eye, ExternalLink, GitBranch, Calendar, HardDrive } from "lucide-react";

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export default function RepoHeader({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{ padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}
    >
      {/* Corner glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 320, height: 220,
        background: "radial-gradient(ellipse at top right, rgba(124,111,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top row: avatar + name */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Owner avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={data.ownerAvatar}
            alt={data.ownerLogin}
            style={{
              width: 56, height: 56, borderRadius: 14,
              border: "2px solid rgba(124,111,255,0.4)",
              objectFit: "cover",
              boxShadow: "0 0 16px rgba(124,111,255,0.25)",
            }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <div style={{
            position: "absolute", bottom: -3, right: -3,
            width: 18, height: 18, borderRadius: "50%",
            background: data.ownerType === "Organization" ? "var(--neon-blue)" : "var(--neon-green)",
            border: "2px solid var(--bg-surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9,
          }}>
            {data.ownerType === "Organization" ? "🏢" : "👤"}
          </div>
        </div>

        {/* Name + description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, margin: 0 }}>
              {data.repoName}
            </h2>
            <a
              href={data.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--neon-purple)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              aria-label="Open on GitHub"
            >
              <ExternalLink size={15} />
            </a>
          </div>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12, maxWidth: 620 }}>
            {data.description}
          </p>

          {/* Tags row */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            {data.language && <span className="badge badge-blue">{data.language}</span>}
            {data.license && data.license !== "None" && <span className="badge badge-green">{data.license}</span>}
            <span className="badge badge-purple">Since {data.createdAt}</span>
            {data.isFork && <span className="badge badge-orange">Fork</span>}
            {data.topics.slice(0, 5).map(t => (
              <span key={t} className="badge badge-cyan" style={{ fontSize: 10 }}>{t}</span>
            ))}
            {data.topics.length > 5 && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{data.topics.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Homepage link */}
        {data.homepage && (
          <a
            href={data.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ fontSize: 12, flexShrink: 0 }}
          >
            <ExternalLink size={12} />
            Website
          </a>
        )}
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "0 0 20px" }} />

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {[
          { icon: <Star size={14} />,        value: fmt(data.stars),       label: "Stars",       color: "#f7b731" },
          { icon: <GitFork size={14} />,     value: fmt(data.forks),       label: "Forks",       color: "var(--neon-cyan)" },
          { icon: <Eye size={14} />,         value: fmt(data.watchers),    label: "Watchers",    color: "var(--neon-blue)" },
          { icon: <AlertCircle size={14} />, value: fmt(data.openIssues),  label: "Open Issues", color: "var(--neon-orange)" },
          { icon: <GitBranch size={14} />,   value: data.defaultBranch,    label: "Branch",      color: "var(--neon-purple)" },
          { icon: <Calendar size={14} />,    value: data.lastCommit,       label: "Last Push",   color: "var(--neon-green)" },
          { icon: <HardDrive size={14} />,   value: data.size > 1024 ? (data.size / 1024).toFixed(1) + " MB" : data.size + " KB", label: "Repo Size", color: "var(--text-secondary)" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: "1 1 110px",
              padding: "14px 16px",
              borderRight: i < 6 ? "1px solid rgba(255,255,255,0.05)" : "none",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 5, color: stat.color }}>
              {stat.icon}
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 3 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Smart summary strip */}
      {data.readmeSummary && (
        <div style={{
          marginTop: 18,
          padding: "14px 18px",
          background: "rgba(124,111,255,0.05)",
          border: "1px solid rgba(124,111,255,0.15)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--neon-purple)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            ✨ Smart Summary
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
            {data.readmeSummary}
          </p>
        </div>
      )}
    </motion.div>
  );
}
