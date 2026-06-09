<div align="center">

# 🩺 RepoMedic

### Repository Insights & Client-Side Health Diagnostics Dashboard

[![MIT License](https://img.shields.io/github/license/26Naitik/repomedic?color=f5c518&style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/26Naitik/repomedic?color=f5c518&style=flat-square)](https://github.com/26Naitik/repomedic/stargazers)
[![GitHub Contributors](https://img.shields.io/github/contributors/26Naitik/repomedic?color=f5c518&style=flat-square)](https://github.com/26Naitik/repomedic/graphs/contributors)
[![Vercel Deployment](https://img.shields.io/badge/deployed%20on-vercel-f5c518?logo=vercel&logoColor=black&style=flat-square)](https://repomedic-ai-omega.vercel.app)
[![Live Demo](https://img.shields.io/badge/live%20demo-repomedic--ai--omega.vercel.app-111111?style=flat-square&logo=vercel&logoColor=f5c518)](https://repomedic-ai-omega.vercel.app)

**RepoMedic** is a beautiful, premium, and zero-setup repository health dashboard. Paste any public GitHub URL or shorthand `owner/repo` to instantly generate composite risk scores, technology stack fingerprints, structural architecture maps, commit activity metrics, and prioritized diagnostic recommendations — all calculated client-side in under 10 seconds.

**[→ Explore the Live Demo](https://repomedic-ai-omega.vercel.app)**

</div>

---

## ❓ Why RepoMedic?

Developers, open-source maintainers, and security engineers constantly need to evaluate the health, risk, and structural pattern of repositories before using them in production. Typical tools require tedious local setup, command-line runs, or expensive subscription models.

**RepoMedic solves this by putting everything inside your browser:**

- **Instant Verification** — Know if a dependency has critical CVEs, bad maintainability, or stalling commit activity before you `npm install`.
- **Zero Server Latency** — No databases or external processing servers. The entire diagnostic analysis runs directly in your local browser sandbox.
- **Open-Source Ready** — Beautiful design to embed in team dashboards or run locally in offline environments.

---

## ⚡ Key Features

RepoMedic compiles data from 7 parallel GitHub REST API endpoints and runs a sophisticated, deterministic analysis engine client-side.

### 📊 Composite Health Scoring
- **Health Score (40–99)** — Overall trust score from community traction, update recency, open issue ratios, and file patterns.
- **Risk Score (5–85)** — Gauges maintenance risk, staleness, and issue backlog pressure.
- **Maintainability & Security** — Benchmarks file sizing, language density, license compliance, and update frequency.

### 📐 Structural & Architecture Map
- **Pattern Detection** — Identifies *Monorepo*, *Component-driven*, *Feature-based*, or *Flat/Minimal* architecture automatically.
- **Feature Audit** — Scans the file tree for CI/CD pipelines, test suites, Docker configurations, and docs directories.
- **Strengths & Concerns** — Highlights structural wins and potential backlog pressure with clear labels.

### 💡 Actionable Diagnostic Recommendations
- **Prioritized Tasks** — Actions labeled **HIGH**, **MEDIUM**, or **LOW** priority.
- **Effort vs. Impact Matrix** — Each recommendation shows effort-to-impact ratio so maintainers know what to tackle first.
- **Interactive Filtering** — Filter suggestions on the fly to focus on what matters most.

### 🛡️ Dependency Security Exposure
- **CVE Checks** — Cross-references dependency schemas against vulnerability advisory lists.
- **Package-Level Detail** — Flags package names, severity ratings, and specific fixed versions.

### 📦 Tech Stack Fingerprinting & Commit Activity
- **Language Breakdown** — Visual cards with exact percentage shares of up to 12 detected languages.
- **Commit Activity** — Custom interactive bar chart visualizing weekly development velocity over the trailing 12 weeks.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Core UI | React 19 + Vite 8 |
| Styling | Tailwind CSS 4.0 + custom glassmorphism utilities |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Analysis Engine | Deterministic seed-hash diagnostics (`repoInsights.js`) |

---

## 🔒 Bypassing Rate Limits (API Personal Access Tokens)

By default, the GitHub REST API limits unauthenticated requests to **60 requests/hour** per IP. To increase this:

1. Click the **API Token** button in the Navbar.
2. Paste a **Personal Access Token (PAT)** with **zero scopes** — create one at [github.com/settings/tokens](https://github.com/settings/tokens).
3. The token is stored only in your browser's `localStorage` and sent exclusively as an `Authorization` header to `api.github.com`.
4. For local development, set `VITE_GITHUB_TOKEN` in your `.env` file.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18.0.0 or higher
- npm / yarn / pnpm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/26Naitik/repomedic.git
cd repomedic

# 2. Configure environment
cp .env.example .env
# Add your optional GitHub PAT to .env

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
# Open http://localhost:5173

# 5. Build for production
npm run build
# Output: /dist (deployable to Vercel, Netlify, or GitHub Pages)
```

---

## 🗺️ Roadmap

### Phase 1 — Local Diagnostics & PAT ✅ (Current)
- [x] Client-side repository health & risk scoring
- [x] Automated architecture pattern detection
- [x] Actionable diagnostics panel with Effort vs. Impact matrix
- [x] In-app PAT configuration for high-frequency requests
- [x] Full mobile-first responsive grid layouts

### Phase 2 — Live Advisory & Deep Audits 🚀 (Q3 2026)
- [ ] Real-time CVE validation via NVD & GitHub Advisory REST endpoints
- [ ] Live dependency tree map visualization
- [ ] Historical trend logging (compare scores over time)
- [ ] Configurable grading weights (custom scoring metrics for teams)

### Phase 3 — Teams & Integrations 🤝 (Q4 2026)
- [ ] OAuth-based private repository analysis
- [ ] CI/CD status integration (embed health badges in PRs)
- [ ] PDF & Markdown report export
- [ ] Slack & Discord webhook alerts for scheduled health audits

---

## 🤝 Contributing

Contributions are welcome! Whether you're fixing a CSS bug, adding language support, or proposing a new metric:

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>If RepoMedic saved you time, consider giving it a ⭐ — it helps others discover it too.</sub>
</div>
