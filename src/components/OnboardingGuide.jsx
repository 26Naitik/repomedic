import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, CheckCircle2, X } from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Paste any GitHub URL",
    description: "Copy the full URL of any public GitHub repository — e.g. https://github.com/facebook/react. Private repos require OAuth (coming soon).",
    icon: "🔗",
  },
  {
    step: 2,
    title: "Click 'Analyze'",
    description: "RepoMedic AI clones metadata, parses the file tree, detects dependencies, and runs our vulnerability scanner — all in under 10 seconds.",
    icon: "⚡",
  },
  {
    step: 3,
    title: "Review your dashboard",
    description: "Your results dashboard shows a Risk Score, Health Metrics, Tech Stack fingerprint, Architecture map, and prioritized AI Suggestions.",
    icon: "📊",
  },
  {
    step: 4,
    title: "Act on AI recommendations",
    description: "Each suggestion includes effort vs. impact ratings and a detailed description. Filter by priority to focus on what matters most.",
    icon: "🚀",
  },
];

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(124,111,255,0.08) 0%, rgba(59,130,246,0.06) 50%, rgba(34,211,238,0.05) 100%)",
          border: "1px solid rgba(124,111,255,0.2)",
          padding: "28px 32px",
          marginBottom: 40,
        }}
      >
        {/* BG glow */}
        <div style={{
          position: "absolute", right: -60, top: -60,
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-muted)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          aria-label="Dismiss onboarding guide"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(124,111,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={16} color="var(--neon-purple)" />
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, lineHeight: 1 }}>
              Getting Started with RepoMedic AI
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>4-step quick guide</p>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveStep(i)}
              style={{
                padding: "16px",
                borderRadius: 14,
                background: activeStep === i ? "rgba(124,111,255,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeStep === i ? "rgba(124,111,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, fontSize: 14,
                  background: activeStep === i ? "rgba(124,111,255,0.2)" : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {s.icon}
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                  background: activeStep === i ? "var(--neon-purple)" : "rgba(255,255,255,0.08)",
                  color: activeStep === i ? "#fff" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginLeft: "auto",
                }}>
                  {s.step}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 600, color: activeStep === i ? "var(--text-primary)" : "var(--text-secondary)", marginBottom: 6, lineHeight: 1.3 }}>
                {s.title}
              </div>
              <AnimatePresence>
                {activeStep === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}
                  >
                    {s.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
