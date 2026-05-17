import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, Clock, Zap } from "lucide-react";
import { getPriorityColor } from "../data/mockData";

const EFFORT_COLORS = {
  Low:    "var(--neon-green)",
  Medium: "var(--neon-orange)",
  High:   "var(--neon-red)",
};

const IMPACT_COLORS = {
  Low:    "var(--neon-cyan)",
  Medium: "var(--neon-orange)",
  High:   "var(--neon-purple)",
};

function SuggestionCard({ suggestion, index }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColor = getPriorityColor(suggestion.priority);

  const colorMap = { red: "var(--neon-red)", orange: "var(--neon-orange)", cyan: "var(--neon-cyan)", purple: "var(--neon-purple)" };
  const color = colorMap[priorityColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      style={{
        borderRadius: 14,
        border: `1px solid ${color}25`,
        background: `${color}08`,
        overflow: "hidden",
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ borderColor: `${color}45` }}
    >
      {/* Card header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Emoji icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {suggestion.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
              color, background: `${color}15`, border: `1px solid ${color}30`,
              padding: "2px 8px", borderRadius: 100,
            }}>
              {suggestion.priority}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{suggestion.category}</span>
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {suggestion.title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Effort / Impact pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: EFFORT_COLORS[suggestion.effort] || "var(--text-muted)", fontWeight: 600 }}>
                {suggestion.effort} effort
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Zap size={11} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: IMPACT_COLORS[suggestion.impact] || "var(--text-muted)", fontWeight: 600 }}>
                {suggestion.impact} impact
              </span>
            </div>
          </div>

          <div style={{ color: "var(--text-muted)", transition: "transform 0.2s", transform: expanded ? "rotate(0deg)" : "rotate(0deg)" }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 20px 18px",
              paddingLeft: 74,
              borderTop: `1px solid ${color}18`,
              paddingTop: 14,
              fontSize: 13.5,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}>
              {suggestion.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AISuggestions({ suggestions }) {
  const [filter, setFilter] = useState("ALL");
  const priorities = ["ALL", "HIGH", "MEDIUM", "LOW"];

  const filtered = filter === "ALL" ? suggestions : suggestions.filter(s => s.priority === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card"
      style={{ padding: "28px", marginBottom: 24 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(124,111,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={16} color="var(--neon-purple)" />
          </div>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>AI Suggestions</h3>
          <span className="badge badge-purple">{suggestions.length} actions</span>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 100, padding: 4 }}>
          {priorities.map(p => (
            <button
              key={p}
              onClick={e => { e.stopPropagation(); setFilter(p); }}
              style={{
                padding: "5px 14px", borderRadius: 100, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: filter === p ? "rgba(124,111,255,0.25)" : "transparent",
                color: filter === p ? "var(--neon-purple)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence mode="wait">
          {filtered.map((s, i) => (
            <SuggestionCard key={s.title} suggestion={s} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
