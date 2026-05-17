import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const CATEGORY_COLORS = {
  Language:    { bg: "rgba(49,120,198,0.12)",  border: "rgba(49,120,198,0.3)",  text: "#3178c6" },
  Framework:   { bg: "rgba(97,218,251,0.1)",   border: "rgba(97,218,251,0.25)", text: "#61dafb" },
  Runtime:     { bg: "rgba(104,160,99,0.12)",  border: "rgba(104,160,99,0.3)",  text: "#68a063" },
  Bundler:     { bg: "rgba(141,214,249,0.1)",  border: "rgba(141,214,249,0.25)",text: "#8dd6f9" },
  Testing:     { bg: "rgba(194,19,37,0.1)",    border: "rgba(194,19,37,0.25)",  text: "#e74c3c" },
  Linting:     { bg: "rgba(75,50,195,0.12)",   border: "rgba(75,50,195,0.3)",   text: "#7b68ee" },
  DevOps:      { bg: "rgba(36,150,237,0.1)",   border: "rgba(36,150,237,0.25)", text: "#2496ed" },
  "CI/CD":     { bg: "rgba(124,111,255,0.1)",  border: "rgba(124,111,255,0.25)",text: "#7c6fff" },
  Monorepo:    { bg: "rgba(255,108,199,0.1)",  border: "rgba(255,108,199,0.25)",text: "#ff6ec7" },
  "Package Mgr":{ bg:"rgba(246,146,32,0.1)",  border: "rgba(246,146,32,0.25)", text: "#f69220" },
  Deployment:  { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)", text: "#ffffff" },
};

function TechCard({ tech, index }) {
  const scheme = CATEGORY_COLORS[tech.category] || CATEGORY_COLORS.Deployment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: scheme.bg,
        border: `1px solid ${scheme.border}`,
        borderRadius: 14,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "default",
        transition: "box-shadow 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 20px ${scheme.border}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Glow top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${scheme.text}80, transparent)`,
      }} />

      {/* Category badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: scheme.text,
          background: `${scheme.text}18`, border: `1px solid ${scheme.text}30`,
          padding: "2px 8px", borderRadius: 100,
        }}>
          {tech.category}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          {tech.version && tech.version !== "detected" ? `v${tech.version}` : `${tech.pct ?? tech.usage}%`}
        </span>
      </div>

      {/* Name */}
      <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
        {tech.name}
      </div>

      {/* Usage bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Usage</span>
          <span style={{ fontSize: 11, color: scheme.text, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{tech.usage}%</span>
        </div>
        <div className="progress-track" style={{ height: 4 }}>
          <motion.div
            className="progress-fill"
            style={{ background: scheme.text, width: 0 }}
            animate={{ width: `${tech.usage}%` }}
            transition={{ delay: index * 0.05 + 0.4, duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function TechStack({ techStack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{ padding: "28px", marginBottom: 24 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(124,111,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Layers size={16} color="var(--neon-purple)" />
        </div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Languages Detected</h3>
        <span className="badge badge-purple" style={{ marginLeft: "auto" }}>
          {techStack.length} {techStack.length === 1 ? "language" : "languages"}
        </span>
      </div>

      {techStack.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No language data available for this repository.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}>
          {techStack.map((tech, i) => (
            <TechCard key={tech.name} tech={tech} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
