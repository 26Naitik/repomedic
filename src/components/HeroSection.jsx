import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

const EXAMPLE_REPOS = [
  "https://github.com/vercel/next.js",
  "https://github.com/facebook/react",
  "https://github.com/microsoft/vscode",
  "https://github.com/tailwindlabs/tailwindcss",
];

export default function HeroSection({ onAnalyze }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError("Please enter a GitHub repository URL."); return; }
    if (!trimmed.includes("github.com")) { setError("URL must be a valid GitHub repository link."); return; }
    setError("");
    onAnalyze(trimmed);
  }

  function selectExample(exUrl) {
    setUrl(exUrl);
    setError("");
    inputRef.current?.focus();
  }

  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 100 }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow center */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        width: 700, height: 500,
        background: "radial-gradient(ellipse, rgba(124,111,255,0.12) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}
        >
          <div className="badge badge-purple" style={{ fontSize: 12, padding: "6px 16px", gap: 6 }}>
            <Sparkles size={12} />
            Smart Repository Intelligence
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontFamily: "var(--font-head)", fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 20 }}
        >
          Analyze Any{" "}
          <span className="gradient-text">GitHub Repository</span>
          <br />
          Instantly
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.6 }}
        >
          Drop any public GitHub URL or type <code style={{ color: "var(--neon-purple)" }}>owner/repo</code>. Get an instant health report — risk scores,
          vulnerabilities analysis, technology stack breakdown, and actionable diagnostics.
        </motion.p>

        {/* Input form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{ maxWidth: 680, margin: "0 auto" }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{
              display: "flex", gap: 12, alignItems: "stretch",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${error ? "rgba(255,80,120,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 16, padding: 8,
              boxShadow: error ? "0 0 0 3px rgba(255,80,120,0.1)" : "0 0 0 1px rgba(124,111,255,0.08), 0 20px 60px rgba(0,0,0,0.4)",
              transition: "all 0.3s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, paddingLeft: 12 }}>
                <Link2 size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setError(""); }}
                  placeholder="https://github.com/owner/repository"
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    fontFamily: "var(--font-mono)", fontSize: 14,
                    color: "var(--text-primary)",
                    caretColor: "var(--neon-purple)",
                    minWidth: 0,
                  }}
                  aria-label="GitHub repository URL"
                  id="repo-url-input"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: "11px 22px" }}>
                Analyze
                <ArrowRight size={16} />
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ marginTop: 10, color: "var(--neon-red)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <AlertCircle size={13} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>

          {/* Example repos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Try:</span>
            {EXAMPLE_REPOS.map(repo => {
              const name = repo.replace("https://github.com/", "");
              return (
                <button
                  key={repo}
                  onClick={() => selectExample(repo)}
                  style={{
                    background: "none", border: "1px solid var(--border)",
                    borderRadius: 100, padding: "4px 12px",
                    fontSize: 12, color: "var(--text-secondary)",
                    cursor: "pointer", fontFamily: "var(--font-mono)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--neon-purple)"; e.currentTarget.style.color = "var(--neon-purple)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {name}
                </button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 72, flexWrap: "wrap" }}
        >
          {[
            { value: "50K+",   label: "Repos Analyzed" },
            { value: "99.2%",  label: "Accuracy Rate" },
            { value: "<6s",    label: "Analysis Time" },
            { value: "12K+",   label: "Devs Trust Us" },
          ].map(stat => (
            <div key={stat.value} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
