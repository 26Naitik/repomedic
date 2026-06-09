import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";

export default function CommitActivity({ commitActivity }) {
  if (!commitActivity || commitActivity.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: "28px", marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220 }}
      >
        <BarChart2 size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Commit activity not available</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>GitHub Stats API may still be computing…</div>
      </motion.div>
    );
  }

  const maxCommits = Math.max(...commitActivity.map(d => d.commits), 1);
  const total = commitActivity.reduce((a, b) => a + b.commits, 0);
  const avg   = Math.round(total / commitActivity.length);
  const peak  = maxCommits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card"
      style={{ padding: "28px", marginBottom: 0 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(244,197,66,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={16} color="var(--neon-blue)" />
        </div>
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>Commit Activity</h3>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Last 12 weeks</span>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, padding: "0 2px" }}>
        {commitActivity.map((week, i) => {
          const heightPct = maxCommits > 0 ? (week.commits / maxCommits) * 100 : 0;
          const isLatest  = i === commitActivity.length - 1;

          return (
            <div key={week.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}
              title={`${week.week}: ${week.commits} commits`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ delay: i * 0.04 + 0.3, duration: 0.7, ease: "easeOut" }}
                style={{
                  width: "100%",
                  borderRadius: "4px 4px 2px 2px",
                  background: isLatest
                    ? "linear-gradient(180deg, #F4C542 0%, #D4A514 100%)"
                    : week.commits > avg * 1.3
                    ? "linear-gradient(180deg, rgba(244,197,66,0.78) 0%, rgba(212,165,20,0.5) 100%)"
                    : "linear-gradient(180deg, rgba(244,197,66,0.34) 0%, rgba(212,165,20,0.16) 100%)",
                  boxShadow: isLatest ? "0 10px 18px rgba(0,0,0,0.28)" : "none",
                  minHeight: week.commits > 0 ? 4 : 2,
                  cursor: "default",
                  transition: "filter 0.2s",
                }}
              />
              <span style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.02em", fontWeight: 500 }}>
                {week.week}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 24, marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { label: "Avg / week", value: avg },
          { label: "Peak",       value: peak },
          { label: "Total",      value: total },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800, color: "var(--neon-blue)" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
