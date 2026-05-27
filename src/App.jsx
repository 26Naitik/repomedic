import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./components/Dashboard";
import OnboardingGuide from "./components/OnboardingGuide";
import ErrorScreen from "./components/ErrorScreen";
import { parseGitHubUrl, analyzeRepo, GHError } from "./services/githubApi";
import { buildAnalysis } from "./services/aiInsights";

// App state machine: "idle" | "loading" | "results" | "error"
export default function App() {
  const [state, setState]       = useState("idle");
  const [repoUrl, setRepoUrl]   = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError]       = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  async function handleAnalyze(url) {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError({ type: "invalid_url", message: "Could not parse a GitHub repository from that URL. Make sure it looks like: https://github.com/owner/repo" });
      setState("error");
      return;
    }

    setRepoUrl(url);
    setState("loading");
    setLoadingStep(0);
    setError(null);

    try {
      // Simulate step progression while real fetch runs
      const stepTimers = [400, 1000, 1800, 2600, 3400].map((delay, i) =>
        setTimeout(() => setLoadingStep(i + 1), delay)
      );

      const raw = await analyzeRepo(parsed.owner, parsed.repo);

      // Clear pending step timers
      stepTimers.forEach(clearTimeout);
      setLoadingStep(6);

      // Short pause so final "AI insights" step shows
      await new Promise(r => setTimeout(r, 600));
      setLoadingStep(7);
      await new Promise(r => setTimeout(r, 400));

      const result = buildAnalysis(raw);
      setAnalysis(result);
      setState("results");

    } catch (err) {
      let type = "unknown";
      let message = "An unexpected error occurred. Please try again.";

      if (err instanceof GHError) {
        if (err.status === 404) {
          type = "not_found";
          message = `Repository not found. Double-check the URL — it must be a public repository.`;
        } else if (err.status === 403 || err.status === 429) {
          type = "rate_limit";
          message = `GitHub API rate limit reached. You can make 60 requests/hour without authentication. Please wait a minute and try again.`;
        } else if (err.status >= 500) {
          type = "server_error";
          message = `GitHub's servers returned an error (${err.status}). Try again in a moment.`;
        } else {
          message = `GitHub API error: ${err.message}`;
        }
      } else if (!navigator.onLine) {
        type = "offline";
        message = "You appear to be offline. Check your internet connection and try again.";
      }

      setError({ type, message, raw: err.message });
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setRepoUrl("");
    setAnalysis(null);
    setError(null);
    setLoadingStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative" }}>
      {/* Background glow orbs */}
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      {state !== "idle" && <div className="orb orb-cyan" />}

      <Navbar onReset={handleReset} hasResults={state === "results"} />

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
          >
            <HeroSection onAnalyze={handleAnalyze} />
            <div className="container" style={{ paddingBottom: 80 }}>
              <OnboardingGuide />
              <FeatureGrid />
            </div>
          </motion.div>
        )}

        {state === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <LoadingScreen repoUrl={repoUrl} currentStep={loadingStep} />
          </motion.div>
        )}

        {state === "results" && analysis && (
          <motion.div key="results"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Dashboard data={analysis} onReset={handleReset} />
          </motion.div>
        )}

        {state === "error" && (
          <motion.div key="error"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <ErrorScreen error={error} onReset={handleReset} lastUrl={repoUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// ── Feature grid ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🔬", title: "Real GitHub Data",       desc: "Fetches live repo metadata, languages, contributors, commit history, and file tree via the GitHub public API." },
  { icon: "🛡️", title: "Security Scan",          desc: "Analyzes repository structure, files, and dependencies to detect potential security vulnerabilities." },
  { icon: "⚡", title: "Smart Diagnostics",       desc: "Context-aware suggestions powered by real code signals — test coverage, CI/CD pipelines, documentation, and activity." },
  { icon: "📐", title: "Architecture Map",        desc: "Detects monorepos, test suites, CI pipelines, Docker configs, and directory patterns automatically." },
  { icon: "❤️", title: "Health Score",           desc: "Composite score calculated from stars, recency, license, issues, topics, and community activity signals." },
  { icon: "📦", title: "Instant Analysis",        desc: "Parallel API calls and client-side processing mean you get a full diagnosis in seconds, no backend needed." },
];

function FeatureGrid() {
  return (
    <section style={{ marginTop: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 12 }}>
          Everything you need to ship{" "}
          <span className="gradient-text">healthier code</span>
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto" }}>
          Real GitHub data. Smart diagnostic metrics. Beautifully packaged for open-source analysis.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card"
            style={{ padding: "24px" }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(124,111,255,0.1)",
              border: "1px solid rgba(124,111,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, marginBottom: 14,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 0", background: "rgba(0,0,0,0.3)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, background: "var(--gradient-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RepoMedic
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>— Repository Health Dashboard</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Uses GitHub REST API · Rate limits can be expanded via Personal Access Token · © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
