import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Connecting to GitHub API…"           },
  { id: 2, label: "Fetching repository metadata…"       },
  { id: 3, label: "Detecting languages & tech stack…"   },
  { id: 4, label: "Analysing contributors & activity…"  },
  { id: 5, label: "Scanning file tree & architecture…"  },
  { id: 6, label: "Running vulnerability checks…"       },
  { id: 7, label: "Generating AI insights…"             },
  { id: 8, label: "Compiling final report…"             },
];

export default function LoadingScreen({ repoUrl, currentStep = 0 }) {
  const repoName = repoUrl.replace("https://github.com/", "");
  const progress = Math.min(Math.round((currentStep / STEPS.length) * 100), 98);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 540, width: "100%", textAlign: "center" }}>

        {/* Pulsing icon */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 80, height: 80, borderRadius: 24,
            background: "linear-gradient(135deg, #7c6fff 0%, #3b82f6 50%, #22d3ee 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 0 40px rgba(124,111,255,0.5)",
            position: "relative",
          }}
        >
          <Activity size={36} color="#fff" strokeWidth={2} />
          {[0, 1].map(i => (
            <motion.div key={i}
              style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(124,111,255,0.4)" }}
              animate={{ scale: [1, 2.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
            />
          ))}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}
        >
          Analysing Repository
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--neon-purple)", marginBottom: 40, wordBreak: "break-all" }}
        >
          {repoName}
        </motion.p>

        {/* Progress bar */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Processing</span>
            <span style={{ fontSize: 12, color: "var(--neon-purple)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              style={{ background: "var(--gradient-primary)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11, textAlign: "left" }}>
          {STEPS.map((step) => {
            const isDone    = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.4, delay: step.id * 0.05 }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ flexShrink: 0, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDone ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                      <CheckCircle2 size={22} color="var(--neon-green)" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={20} color="var(--neon-purple)" />
                    </motion.div>
                  ) : (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
                  )}
                </div>

                <span style={{
                  fontSize: 14, fontFamily: "var(--font-mono)",
                  color: isDone ? "var(--text-secondary)" : isCurrent ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  {step.label}
                </span>

                {isCurrent && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center", marginLeft: "auto" }}>
                    {[0, 1, 2].map(dot => (
                      <motion.span key={dot}
                        style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--neon-purple)", display: "block" }}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Real API note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: 36, padding: "12px 16px",
            background: "rgba(124,111,255,0.06)",
            border: "1px solid rgba(124,111,255,0.15)",
            borderRadius: 12, fontSize: 13, color: "var(--text-secondary)",
          }}
        >
          🌐 <strong style={{ color: "var(--neon-purple)" }}>Live fetch:</strong> Pulling real data from the GitHub public API — no backend, no proxy, all client-side.
        </motion.div>
      </div>
    </motion.div>
  );
}
