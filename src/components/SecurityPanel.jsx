import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

const SEVERITY_MAP = {
  CRITICAL: { color: "#B85C5C", bg: "rgba(184,92,92,0.1)",  border: "rgba(184,92,92,0.22)",  label: "Critical" },
  HIGH:     { color: "#C15B5B", bg: "rgba(193,91,91,0.09)", border: "rgba(193,91,91,0.2)", label: "High"     },
  MEDIUM:   { color: "#C98B2B", bg: "rgba(201,139,43,0.1)", border: "rgba(201,139,43,0.2)", label: "Medium"   },
  LOW:      { color: "#C9A94A", bg: "rgba(201,169,74,0.08)",border: "rgba(201,169,74,0.2)",  label: "Low"      },
};

export default function SecurityPanel({ vulnerabilities }) {
  const hasCritical = vulnerabilities.some(v => v.severity === "CRITICAL" || v.severity === "HIGH");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
      style={{ padding: "28px", marginBottom: 24 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: hasCritical ? "rgba(184,92,92,0.12)" : "rgba(142,160,109,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={16} color={hasCritical ? "var(--neon-red)" : "var(--neon-green)"} />
        </div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Security & Vulnerabilities</h3>
        <span className={`badge ${hasCritical ? "badge-red" : "badge-green"}`} style={{ marginLeft: "auto" }}>
          {vulnerabilities.length} CVE{vulnerabilities.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {vulnerabilities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <CheckCircle2 size={48} color="var(--neon-green)" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neon-green)", marginBottom: 6 }}>No vulnerabilities detected</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>All dependencies are up-to-date and secure.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vulnerabilities.map((vuln, i) => {
            const scheme = SEVERITY_MAP[vuln.severity] || SEVERITY_MAP.LOW;
            return (
              <motion.div
                key={vuln.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.2 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: scheme.bg,
                  border: `1px solid ${scheme.border}`,
                }}
              >
                <AlertTriangle size={18} color={scheme.color} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      color: scheme.color, background: scheme.bg, border: `1px solid ${scheme.border}`,
                      padding: "1px 8px", borderRadius: 100,
                    }}>
                      {scheme.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: scheme.color, fontWeight: 600 }}>
                      {vuln.id}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 12,
                      color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "1px 8px", borderRadius: 100,
                    }}>
                      {vuln.package}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>
                    {vuln.description}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--neon-green)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} />
                    Fixed in v{vuln.fixed}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
