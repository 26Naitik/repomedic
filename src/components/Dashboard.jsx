import { motion } from "framer-motion";
import { RefreshCw, Download, Share2, Clock, CheckCircle2 } from "lucide-react";
import RepoHeader from "./RepoHeader";
import ScorePanel from "./ScorePanel";
import TechStack from "./TechStack";
import ArchitectureOverview from "./ArchitectureOverview";
import AISuggestions from "./AISuggestions";
import SecurityPanel from "./SecurityPanel";
import CommitActivity from "./CommitActivity";

export default function Dashboard({ data, onReset }) {
  function handleExport() {
    // Export clean version without circular refs
    const exportData = { ...data };
    delete exportData._raw;
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `repomedic-${data.repoName.replace("/", "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const analyzedAt = data.analyzedAt
    ? new Date(data.analyzedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={12} color="var(--neon-green)" />
              Analysis Complete
              {analyzedAt && <span style={{ color: "var(--text-muted)" }}>· {analyzedAt}</span>}
            </div>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, margin: 0 }}>
              Repository Dashboard
            </h1>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={handleExport} style={{ fontSize: 13 }}>
              <Download size={14} />
              Export JSON
            </button>
            <button className="btn-ghost" style={{ fontSize: 13 }}
              onClick={() => navigator.clipboard?.writeText(data.repoUrl)}
            >
              <Share2 size={14} />
              Copy URL
            </button>
            <button className="btn-primary" onClick={onReset} style={{ fontSize: 13, padding: "9px 18px" }}>
              <RefreshCw size={14} />
              New Analysis
            </button>
          </div>
        </motion.div>

        {/* Real data badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 100,
            background: "rgba(0,255,163,0.07)",
            border: "1px solid rgba(0,255,163,0.2)",
            marginBottom: 20, fontSize: 12, color: "var(--neon-green)", fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-green)", display: "inline-block", boxShadow: "0 0 6px var(--neon-green)" }} />
          Live data from GitHub API · AI insights generated
        </motion.div>

        {/* Sections */}
        <RepoHeader data={data} />
        <ScorePanel data={data} />

        {/* Two-col row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <CommitActivity commitActivity={data.commitActivity} />
          <SecurityPanel vulnerabilities={data.vulnerabilities} />
        </div>

        <TechStack techStack={data.techStack} />
        <ArchitectureOverview architecture={data.architecture} />
        <AISuggestions suggestions={data.aiSuggestions} />
      </div>
    </motion.div>
  );
}
