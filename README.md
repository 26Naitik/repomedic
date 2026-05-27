<div align="center">

# 🩺 RepoMedic

### Smart GitHub Repository Analysis & Health Dashboard

[![MIT License](https://img.shields.io/github/license/26Naitik/repomedic-ai?color=7c6fff&style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/26Naitik/repomedic-ai?color=22d3ee&style=flat-square)](https://github.com/26Naitik/repomedic-ai/stargazers)
[![GitHub Contributors](https://img.shields.io/github/contributors/26Naitik/repomedic-ai?color=00ffa3&style=flat-square)](https://github.com/26Naitik/repomedic-ai/graphs/contributors)
[![Vercel Deployment](https://img.shields.io/badge/deployed-on_vercel-black?logo=vercel&style=flat-square)](https://repomedic-ai.vercel.app)

**RepoMedic** is a beautiful, professional, and zero-setup repository health dashboard. Drop any public GitHub URL or type `owner/repo` to instantly compile detailed risk scores, technology fingerprints, architecture maps, commit activity metrics, and prioritized diagnostic recommendations — all calculated client-side in under 10 seconds.

[**Explore the Live Demo »**](https://repomedic-ai.vercel.app)

---

### 🎨 Preview & Aesthetics

<div align="center">
  <img src="public/banner_mockup.png" alt="RepoMedic Dashboard Mockup" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />
</div>

> **Note**: Placeholder location for the official product dashboard screenshot or animated demo GIF (`/public/demo.gif`). See [Assets section](#-generating-assets) for mock details.

### 👾 Meet Our Diagnostic Mascots

To make our dashboard experience more engaging, we designed custom developer medical robot mascots that float through the interface:

<div align="center">
  <table border="0">
    <tr>
      <td align="center" width="50%">
        <img src="public/medic_robot.png" alt="RepoMedic Smart Doctor Mascot" width="160" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); filter: drop-shadow(0 0 16px rgba(124,111,255,0.25));" />
        <br />
        <sub><b>Dr. RepoMedic</b><br />Active analysis guide on the Hero landing page</sub>
      </td>
      <td align="center" width="50%">
        <img src="public/sad_medic.png" alt="RepoMedic Sad Doctor Mascot" width="160" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); filter: drop-shadow(0 0 16px rgba(255,80,120,0.2));" />
        <br />
        <sub><b>Stale / Error Medic</b><br />Friendly helper resolving exceptions on error states</sub>
      </td>
    </tr>
  </table>
</div>

</div>

---

## ⚡ Key Features

RepoMedic compiles data from 7 parallel GitHub REST API endpoints and runs a sophisticated, deterministic analysis engine client-side.

### 📊 1. Composite Health Scoring
* **Health Score (40-99)**: Baseline trust score calculated from community traction, update recency, open issues ratios, and file patterns.
* **Risk Score (5-85)**: Gauges maintenance risks, staleness, and issue backlog pressure.
* **Maintainability & Security**: Benchmarks file sizing, language density, license compliance, and update frequency.

### 📐 2. Structural & Architecture Map
* **Pattern Detection**: Automatically identifies if the repository matches a *Monorepo*, *Component-driven*, *Feature-based*, or *Flat/Minimal* architecture.
* **Feature Audit**: Scans the file tree to confirm the presence of **CI/CD pipelines**, **Test suites**, **Docker configurations**, and **Dedicated docs** directories.
* **Strengths & Concerns**: Automatically highlights structural wins (e.g. CI pipeline detected) and potential backlog pressure (e.g. 200+ open issues).

### 💡 3. Actionable Diagnostic Recommendations
* **Prioritized Tasks**: Provides actions labeled as **HIGH**, **MEDIUM**, or **LOW** priority.
* **Effort vs. Impact**: Each recommendation features an effort-to-impact matrix (e.g. *Low Effort / High Impact* for adding an open-source license) so maintainers know what to prioritize.
* **Interactive Filtering**: Filter suggestions on the fly to focus on what matters most.

### 🛡️ 4. Dependency Security Exposure
* **CVE Checks**: Simulates and cross-references dependency schemas against vulnerability advisory lists.
* **Package-Level Detail**: Flags package names, severity ratings (e.g. *High* or *Medium*), and specific fixed versions (e.g. *Fixed in v3.0.5*).

### 📦 5. Tech Stack Fingerprinting & Commit Activity
* **Language breakdown**: Interactive visual cards with exact percentage shares of up to 12 detected languages.
* **Commit Activity**: A custom interactive bar chart visualizing weekly development velocity over the trailing 12 weeks.

---

## 🔒 Bypassing Rate Limits (API Personal Access Tokens)

By default, the GitHub REST API limits unauthenticated requests to **60 requests per hour** per IP address. If you run into a rate limit:

1. **In-App configuration**: Click the **API Token** key button in the Navbar.
2. **Local and secure**: Paste a **Personal Access Token (PAT)**. Create a token with **zero scopes** (highly secure fine-grained or classic token) at [github.com/settings/tokens](https://github.com/settings/tokens).
3. **No Backend**: The token is stored purely local to your browser (`localStorage`) and is only ever sent directly as an `Authorization` header to `api.github.com`.
4. **Development environment**: Developers can configure a token inside a local `.env` file using the key `VITE_GITHUB_TOKEN`.

---

## 🛠️ Tech Stack & Architecture

RepoMedic is built on a highly performant, client-side React architecture:

* **Core UI**: [React 19](https://react.dev) + [Vite 8](https://vite.dev) (Blazing-fast hot module reloading & builds)
* **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com) + custom CSS glassmorphism & responsive utilities
* **Animations**: [Framer Motion 12](https://www.framer.com/motion/) (Smooth transitions, state changes, and progress steps)
* **Icons**: [Lucide React](https://lucide.dev)
* **Analysis**: Deterministic seed-hash diagnostics (`aiInsights.js`) that require zero costly or slow external server wrappers.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org) (v18.0.0 or higher)
* [npm](https://www.npmjs.com) (or yarn / pnpm)

### Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/26Naitik/repomedic-ai.git
   cd repomedic-ai
   ```

2. **Configure Environment Variables**:
   Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and input your optional [GitHub Personal Access Token](#-bypassing-rate-limits-api-personal-access-tokens) to prevent rate limits during development.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```
   This generates a highly optimized static bundle in the `/dist` folder, which can be deployed to Vercel, Netlify, or GitHub Pages.

---

## 🗺️ Roadmap & Future Vision

### Phase 1: Local Diagnostics & PAT 🌟 (Current)
* [x] Client-side repository health & risk scoring
* [x] Automated architecture pattern detection
* [x] Actionable diagnostics panel with Effort vs. Impact matrix
* [x] In-app Personal Access Token configuration for high-frequency requests
* [x] Full mobile-first responsive grid layouts

### Phase 2: Live Advisory & Deep Audits 🚀 (Q3 2026)
* [ ] Real-time CVE validation via live NVD & GitHub Advisory REST endpoints
* [ ] Live dependency tree map visualization
* [ ] Historical trend logging (compare scores over time)
* [ ] Configurable grading weights (custom scoring metrics for teams)

### Phase 3: Teams & Integrations 🤝 (Q4 2026)
* [ ] OAuth-based Private Repository analysis support
* [ ] CI/CD Status integration (embed health badges in PRs)
* [ ] PDF & Markdown report export formats
* [ ] Slack & Discord webhook alerts for scheduled health audits

---

## 🤝 Contributing

We love contributions! Whether you are fixing a CSS bug, adding support for a new language, or proposing a new metric scoring weight, please feel free to open a Pull Request.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please review our [Contributing Guidelines](CONTRIBUTING.md) for more details.

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <h3>Show some love! ⭐</h3>
  If you find RepoMedic useful, please consider giving it a star to support open-source developer health tooling!
</div>
