import { motion } from "framer-motion";
import { GitBranch, Folder, CheckCircle2, AlertTriangle, Terminal, TestTube, Container, BookOpen, Workflow } from "lucide-react";

const FEATURE_BADGES = [
  { key: "hasCI",     label: "CI/CD",     icon: <Workflow size={12} />,  color: "purple" },
  { key: "hasTests",  label: "Tests",     icon: <TestTube size={12} />,  color: "green"  },
  { key: "hasDocker", label: "Docker",    icon: <Container size={12} />, color: "blue"   },
  { key: "hasDocs",   label: "Docs",      icon: <BookOpen size={12} />,  color: "cyan"   },
  { key: "isMonorepo",label: "Monorepo",  icon: <Folder size={12} />,    color: "orange" },
];

export default function ArchitectureOverview({ architecture }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card"
      style={{ padding: "28px", marginBottom: 24 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,211,238,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GitBranch size={16} color="var(--neon-cyan)" />
        </div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Architecture Overview</h3>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="badge badge-cyan">{architecture.type}</span>
          <span className="badge badge-purple">{architecture.pattern}</span>
          {architecture.totalFiles > 0 && (
            <span className="badge badge-blue">{architecture.totalFiles.toLocaleString()} files</span>
          )}
        </div>
      </div>

      {/* Feature badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {FEATURE_BADGES.map(f => {
          const active = architecture[f.key];
          return (
            <motion.div
              key={f.key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 100,
                background: active ? `rgba(124,111,255,0.12)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(124,111,255,0.35)" : "rgba(255,255,255,0.07)"}`,
                fontSize: 12, fontWeight: 600,
                color: active ? "var(--neon-purple)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              {f.icon}
              {f.label}
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: active ? "var(--neon-green)" : "rgba(255,255,255,0.15)",
                marginLeft: 2,
              }} />
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Directory listing */}
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
            Top-Level Directories
          </div>
          {architecture.topDirs && architecture.topDirs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {architecture.topDirs.map((dir, i) => (
                <motion.div
                  key={dir}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.2s", cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.06)"; e.currentTarget.style.borderColor = "rgba(34,211,238,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <Terminal size={13} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    {dir}/
                  </span>
                </motion.div>
              ))}
              {architecture.topDirs.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                  File tree not available for this repository.
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: "20px 16px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              fontSize: 13, color: "var(--text-muted)",
              textAlign: "center",
            }}>
              Large repo — file tree not available via public API.
            </div>
          )}
        </div>

        {/* Strengths & Concerns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--neon-green)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 11, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={12} /> Strengths
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {architecture.strengths.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.3 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(0,255,163,0.05)", border: "1px solid rgba(0,255,163,0.15)" }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)", marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "var(--neon-orange)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 11, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={12} /> Areas of Concern
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {architecture.concerns.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.5 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,154,60,0.05)", border: "1px solid rgba(255,154,60,0.15)" }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-orange)", marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{c}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
