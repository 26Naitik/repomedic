import { motion } from "framer-motion";

function getScoreColor(score) {
  if (score >= 80) return "var(--neon-green)";
  if (score >= 60) return "var(--neon-orange)";
  return "var(--neon-red)";
}

function getRiskColor(score) {
  if (score < 30) return "var(--neon-green)";
  if (score < 60) return "var(--neon-orange)";
  return "var(--neon-red)";
}

function getRiskLabel(score) {
  if (score < 30) return "Low Risk";
  if (score < 60) return "Medium Risk";
  return "High Risk";
}

// ── SVG Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, subtitle, size = 118, strokeWidth = 8, delay = 0 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.3, duration: 1.4, ease: "easeOut" }}
            filter={`drop-shadow(0 0 8px ${color})`}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
            style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, color, lineHeight: 1, filter: `drop-shadow(0 0 6px ${color})` }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </motion.div>
  );
}

// ── Onboarding Complexity ────────────────────────────────────────────────────
function ComplexityDots({ level }) {
  const labels = ["", "Very Easy", "Easy", "Moderate", "Complex", "Very Complex"];
  const colors = ["", "var(--neon-green)", "var(--neon-green)", "var(--neon-orange)", "var(--neon-orange)", "var(--neon-red)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i <= level ? colors[level] : "rgba(255,255,255,0.1)",
              boxShadow: i <= level ? `0 0 6px ${colors[level]}` : "none",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors[level] }}>{labels[level]}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Onboarding Complexity</div>
    </div>
  );
}

// ── Risk Gauge ───────────────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", overflow: "hidden", borderColor: color + "33" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Risk Score
      </div>

      {/* Big number highlight */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        style={{
          fontFamily: "var(--font-head)", fontSize: 64, fontWeight: 900, lineHeight: 1,
          color, filter: `drop-shadow(0 0 16px ${color})`,
        }}
      >
        {score}
      </motion.div>

      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>out of 100</div>

      <div style={{ padding: "5px 14px", borderRadius: 100, background: color + "18", border: `1px solid ${color}40`, fontSize: 12, fontWeight: 700, color }}>
        {label}
      </div>

      {/* Mini bar */}
      <div style={{ width: "100%", marginTop: 8 }}>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            style={{ background: color, width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: "var(--neon-green)" }}>Safe</span>
          <span style={{ fontSize: 10, color: "var(--neon-red)" }}>Critical</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ScorePanel ──────────────────────────────────────────────────────────
export default function ScorePanel({ data }) {
  return (
    <div className="score-grid">
      <RiskGauge score={data.riskScore} />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card"
        style={{ padding: "28px" }}
      >
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Health Metrics
        </h3>

        {/* Score rings */}
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
          <ScoreRing score={data.healthScore}          label="Overall Health"  subtitle="Composite"    delay={0.1} />
          <ScoreRing score={data.maintainabilityScore} label="Maintainability" subtitle="Code quality"  delay={0.2} />
          <ScoreRing score={data.securityScore}        label="Security"        subtitle="CVE analysis"  delay={0.3} />
          <ScoreRing score={data.performanceScore}     label="Performance"     subtitle="Runtime perf"  delay={0.4} />

          {/* Onboarding complexity dots */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <ComplexityDots level={data.onboardingComplexity} />
          </motion.div>
        </div>

        {/* Code metric bars */}
        <div className="grid-2" style={{ gap: "14px 32px" }}>
          {[
            { label: "Test Coverage",  value: data.codeMetrics.testCoverage,  max: 100, suffix: "%",    goodHigh: true  },
            { label: "Code Duplication", value: data.codeMetrics.duplication, max: 20,  suffix: "%",    goodHigh: false },
            { label: "Complexity",     value: data.codeMetrics.complexity,    max: 15,  suffix: " / 15",goodHigh: false },
            { label: "Lint Errors",    value: data.codeMetrics.lintErrors,    max: 50,  suffix: "",     goodHigh: false },
          ].map(m => {
            const pct = Math.min((m.value / m.max) * 100, 100);
            const barColor = m.goodHigh
              ? getScoreColor(pct)
              : pct < 30 ? "var(--neon-green)" : pct < 60 ? "var(--neon-orange)" : "var(--neon-red)";
            return (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {m.value}{m.suffix}
                  </span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    style={{ background: barColor, width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Code stats footer */}
        <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap" }}>
          {[
            { label: "Total Files",  value: data.codeMetrics.totalFiles.toLocaleString() },
            { label: "Est. Lines",   value: data.codeMetrics.totalLines },
            { label: "Tech Debt",    value: data.codeMetrics.techDebt },
            { label: "Avg File",     value: data.codeMetrics.avgFileSize },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
