import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Shield, Zap, GitBranch, Star, Key, X, Lock } from "lucide-react";

export default function Navbar({ onReset }) {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState(localStorage.getItem("repomedic_pat") || "");
  const [isSaved, setIsSaved] = useState(false);

  function handleSaveToken(e) {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (cleanToken) {
      localStorage.setItem("repomedic_pat", cleanToken);
    } else {
      localStorage.removeItem("repomedic_pat");
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsTokenModalOpen(false);
    }, 800);
  }

  function handleClearToken() {
    localStorage.removeItem("repomedic_pat");
    setTokenInput("");
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsTokenModalOpen(false);
    }, 800);
  }

  return (
    <>
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
              <div style={{ fontSize: 9, color: "var(--neon-cyan)", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.4, textTransform: "uppercase" }}>
                Dashboard
              </div>
            </div>
          </button>

          {/* Nav Items */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="flex items-center" style={{ display: "flex" }}>
              <NavPill icon={<Shield size={13} />} label="Security" />
              <NavPill icon={<Zap size={13} />} label="Performance" />
              <NavPill icon={<GitBranch size={13} />} label="Insights" />
            </div>

            <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 8px" }} />

            {/* Token settings trigger button */}
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="btn-ghost"
              style={{
                fontSize: 13,
                padding: "7px 12px",
                borderColor: localStorage.getItem("repomedic_pat") ? "rgba(0,255,163,0.3)" : "var(--border)",
                background: localStorage.getItem("repomedic_pat") ? "rgba(0,255,163,0.04)" : "var(--bg-glass)",
                color: localStorage.getItem("repomedic_pat") ? "var(--neon-green)" : "var(--text-secondary)",
              }}
              title="GitHub API Authentication Settings"
            >
              <Key size={13} />
              <span className="hide-mobile">API Token</span>
            </button>

            <a
              href="https://github.com/26Naitik/repomedic-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ fontSize: 13, padding: "7px 14px" }}
            >
              <Star size={13} />
              <span className="hide-mobile">Star on GitHub</span>
            </a>
          </div>
        </div>
      </motion.nav>

      {/* API Token Settings Modal */}
      <AnimatePresence>
        {isTokenModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setIsTokenModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                maxWidth: 460,
                width: "90%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                boxShadow: "var(--shadow-glow)",
                padding: 28,
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsTokenModalOpen(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(124, 111, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={18} color="var(--neon-purple)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>GitHub API Authentication</h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Bypass default 60 requests/hour limit</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
                GitHub imposes a strict limit of 60 unauthenticated requests/hour per IP. Paste a **Personal Access Token (PAT)** to increase your limit to **5,000 requests/hour**.
              </p>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                🔒 **Privacy First:** Your token is saved completely local to your browser (`localStorage`) and is only ever sent directly to the official GitHub API (`api.github.com`).
              </div>

              <form onSubmit={handleSaveToken}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <label htmlFor="pat-token-input" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                    GitHub Personal Access Token
                  </label>
                  <input
                    id="pat-token-input"
                    type="password"
                    placeholder="github_pat_..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="input-neon"
                    style={{ fontSize: 13, letterSpacing: tokenInput ? "0.15em" : "normal" }}
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Create a token with 0 scopes (fine-grained or classic) at{" "}
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: "var(--neon-purple)", textDecoration: "none" }}>
                      github.com/settings/tokens
                    </a>.
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  {localStorage.getItem("repomedic_pat") && (
                    <button type="button" className="btn-ghost" onClick={handleClearToken} style={{ fontSize: 13, padding: "8px 16px" }}>
                      Clear Token
                    </button>
                  )}
                  <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: "8px 24px" }} disabled={isSaved}>
                    {isSaved ? "Saved! ✓" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
      <span style={{ fontWeight: 500 }} className="hide-tablet">{label}</span>
    </div>
  );
}
