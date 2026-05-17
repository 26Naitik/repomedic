import { motion } from "framer-motion";
import { Activity, Shield, Zap, GitBranch, Star, AlertTriangle } from "lucide-react";

export default function Navbar({ onReset, hasResults }) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button
          onClick={onReset}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #7c6fff 0%, #3b82f6 50%, #22d3ee 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(124, 111, 255, 0.5)",
          }}>
            <Activity size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", lineHeight: 1 }}>
              RepoMedic
            </div>
            <div style={{ fontSize: 10, color: "var(--neon-purple)", fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1.4 }}>
              AI
            </div>
          </div>
        </button>

        {/* Nav Items */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavPill icon={<Shield size={13} />} label="Security" />
          <NavPill icon={<Zap size={13} />} label="Performance" />
          <NavPill icon={<GitBranch size={13} />} label="Insights" />

          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 8px" }} />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ fontSize: 13, padding: "7px 14px" }}
          >
            <Star size={13} />
            Star on GitHub
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

function NavPill({ icon, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "6px 12px",
      borderRadius: 100,
      fontSize: 13,
      color: "var(--text-secondary)",
      cursor: "pointer",
      transition: "all 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );
}
