import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Wifi, Lock, Search, Server } from "lucide-react";

const ERROR_CONFIG = {
  not_found: {
    icon: <Search size={36} color="#ff9a3c" />,
    color: "var(--neon-orange)",
    title: "Repository Not Found",
    hint: "Make sure the repository exists and is public. Private repos require authentication (coming soon).",
  },
  rate_limit: {
    icon: <Lock size={36} color="#ff5078" />,
    color: "var(--neon-red)",
    title: "API Rate Limit Reached",
    hint: "GitHub allows 60 unauthenticated requests per hour. Wait a minute and try again.",
  },
  invalid_url: {
    icon: <AlertTriangle size={36} color="#ff9a3c" />,
    color: "var(--neon-orange)",
    title: "Invalid GitHub URL",
    hint: 'The URL must point to a GitHub repository. Example: https://github.com/facebook/react',
  },
  offline: {
    icon: <Wifi size={36} color="#ff5078" />,
    color: "var(--neon-red)",
    title: "No Internet Connection",
    hint: "Check your network connection and try again.",
  },
  server_error: {
    icon: <Server size={36} color="#ff5078" />,
    color: "var(--neon-red)",
    title: "GitHub Server Error",
    hint: "GitHub's API is having issues. Try again in a few moments.",
  },
  unknown: {
    icon: <AlertTriangle size={36} color="#ff9a3c" />,
    color: "var(--neon-orange)",
    title: "Something Went Wrong",
    hint: "An unexpected error occurred. Check the console for details.",
  },
};

export default function ErrorScreen({ error, onReset, lastUrl }) {
  const cfg = ERROR_CONFIG[error?.type] || ERROR_CONFIG.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        {/* Error mascot */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
        >
          <img
            src="/sad_medic.png"
            alt="Sad Mascot"
            style={{
              width: "100%",
              maxWidth: 150,
              height: "auto",
              filter: "drop-shadow(0 0 24px rgba(255, 80, 120, 0.2))",
              borderRadius: 16,
              border: "1px solid rgba(255, 80, 120, 0.15)",
            }}
          />
        </motion.div>

        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 12, color: cfg.color }}>
          {cfg.title}
        </h2>

        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12, maxWidth: 400, margin: "0 auto 16px" }}>
          {error?.message || cfg.hint}
        </p>

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
          {cfg.hint}
        </p>

        {/* Last URL attempted */}
        {lastUrl && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 16px", marginBottom: 28,
            display: "inline-block", wordBreak: "break-all",
          }}>
            {lastUrl}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onReset} style={{ gap: 8 }}>
            <RefreshCw size={15} />
            Try Another Repo
          </button>
        </div>

        {/* Example repos */}
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Try one of these popular repos:
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["facebook/react", "vercel/next.js", "microsoft/vscode", "tailwindlabs/tailwindcss"].map(r => (
              <button key={r}
                onClick={() => { onReset(); }}
                style={{
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: 100, padding: "5px 14px",
                  fontSize: 12, color: "var(--text-secondary)",
                  cursor: "pointer", fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--neon-purple)"; e.currentTarget.style.color = "var(--neon-purple)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
