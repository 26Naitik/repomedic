# Contributing to RepoMedic

Welcome! 👋 We're excited that you're interested in contributing to RepoMedic. This guide will help you get started, whether you're fixing a bug, adding a feature, or improving documentation.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Component Development Guide](#component-development-guide)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## 🤝 Code of Conduct

This project follows a simple code of conduct:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/repomedic.git
cd repomedic

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/repomedic.git
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 19 and React DOM
- Vite (build tool)
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide React (icons)
- ESLint (linting)

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Verify Setup

1. Open `http://localhost:5173` in your browser
2. Try analyzing a repository (e.g., `facebook/react`)
3. Verify the analysis completes successfully

## 📁 Project Structure

```
repomedic/
├── public/                    # Static assets
│   ├── favicon.svg           # App icon
│   ├── icons.svg             # SVG sprite sheet
│   ├── screenshots/          # Image previews
│   └── assets/               # Branding assets
│
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Root component & state machine
│   ├── index.css             # Global styles & CSS variables
│   ├── App.css               # Component-specific styles
│   │
│   ├── components/           # React components
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   ├── HeroSection.jsx   # Landing page hero
│   │   ├── LoadingScreen.jsx # Multi-step loading animation
│   │   ├── Dashboard.jsx     # Main results container
│   │   ├── RepoHeader.jsx    # Repository metadata display
│   │   ├── ScorePanel.jsx    # Health score visualizations
│   │   ├── TechStack.jsx     # Language breakdown cards
│   │   ├── ArchitectureOverview.jsx  # Project structure analysis
│   │   ├── SmartSuggestions.jsx # Actionable recommendations
│   │   ├── SecurityPanel.jsx # Vulnerability display
│   │   ├── CommitActivity.jsx # Commit history chart
│   │   ├── OnboardingGuide.jsx # Feature walkthrough
│   │   └── ErrorScreen.jsx   # Error handling UI
│   │
│   ├── services/             # Business logic
│   │   ├── githubApi.js      # GitHub API integration
│   │   └── repoInsights.js   # Analysis algorithms
│   │
│   ├── data/
│   │   └── mockData.js       # Utility functions
│   │
│   └── assets/               # Static images
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint rules
├── index.html                # HTML entry point
├── ARCHITECTURE.md           # Architecture documentation
└── CONTRIBUTING.md           # This file
```

### Key Files Explained

| File | Purpose | When to Edit |
|------|---------|--------------|
| [`src/App.jsx`](src/App.jsx:1) | State machine & routing | Adding new app states |
| [`src/services/githubApi.js`](src/services/githubApi.js:1) | GitHub API calls | Adding new API endpoints |
| [`src/services/repoInsights.js`](src/services/repoInsights.js:1) | Analysis algorithms | Modifying scoring logic |
| [`src/components/Dashboard.jsx`](src/components/Dashboard.jsx:1) | Results layout | Adding new dashboard sections |
| [`src/index.css`](src/index.css:1) | Global styles | Changing design system |

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features (e.g., `feature/add-comparison-mode`)
- `fix/` - Bug fixes (e.g., `fix/loading-spinner-alignment`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-score-logic`)
- `style/` - UI/styling changes (e.g., `style/improve-mobile-layout`)

### 2. Make Your Changes

Follow these guidelines:
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Test in browser
npm run dev

# Build for production (verify no errors)
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add repository comparison feature"
```

**Commit Message Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve rate limit error handling"
git commit -m "docs: update installation instructions"
git commit -m "refactor: extract score calculation to separate function"
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 📝 Coding Standards

### JavaScript/JSX Style

```javascript
// ✅ Good: Destructure props
export default function MyComponent({ data, onReset }) {
  // component code
}

// ❌ Bad: Props as single object
export default function MyComponent(props) {
  const data = props.data;
  // ...
}

// ✅ Good: Early returns
function processData(data) {
  if (!data) return null;
  if (data.length === 0) return [];
  // process data
}
```

### Component Structure

```javascript
import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "lucide-react";

// 1. Constants at the top
const MAX_ITEMS = 10;
const DEFAULT_COLOR = "#7c6fff";

// 2. Helper functions
function formatNumber(n) {
  return n.toLocaleString();
}

// 3. Main component
export default function MyComponent({ data, onAction }) {
  // 3a. State hooks
  const [isOpen, setIsOpen] = useState(false);
  
  // 3b. Event handlers
  function handleClick() {
    setIsOpen(!isOpen);
    onAction?.();
  }
  
  // 3c. Derived values
  const displayValue = formatNumber(data.value);
  
  // 3d. Render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card"
    >
      <h2>{data.title}</h2>
      <p>{displayValue}</p>
      <button onClick={handleClick}>
        <Icon size={16} />
        Toggle
      </button>
    </motion.div>
  );
}
```

### CSS/Styling Guidelines

```javascript
// Use inline styles for dynamic values
<div style={{ width: `${percentage}%`, color: getScoreColor(score) }} />

// Use className for static styles
<div className="glass-card" />

// Use CSS variables for theme colors
<div style={{ color: "var(--text-primary)", background: "var(--bg-base)" }} />
```

### File Naming

- Components: `PascalCase.jsx` (e.g., `ScorePanel.jsx`)
- Services: `camelCase.js` (e.g., `githubApi.js`)
- Utilities: `camelCase.js` (e.g., `mockData.js`)

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Happy Path**: Analyze a popular repo (e.g., `facebook/react`)
- [ ] **Error Cases**:
  - Invalid URL format
  - Non-existent repository
  - Private repository
  - Network offline
- [ ] **Edge Cases**:
  - Very large repo (>100MB)
  - Repo with no README
  - Repo with no license
  - Fork vs original repo
- [ ] **UI/UX**:
  - Mobile responsive (test at 320px, 768px, 1024px)
  - Loading states work correctly
  - Animations are smooth
  - No console errors

## 📤 Submitting Changes

### Pull Request Process

1. **Update Documentation**: If you changed functionality, update relevant docs
2. **Self-Review**: Review your own code before submitting
3. **Write Clear PR Description**

## 🎨 Component Development Guide

### Creating a New Component

```javascript
import { motion } from "framer-motion";
import { Icon } from "lucide-react";

export default function MyNewComponent({ data, onAction }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: 24, marginBottom: 24 }}
    >
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Section Title
      </h2>
      
      {/* Component content */}
      <div>
        {data.map((item, i) => (
          <div key={item.id || i}>
            {item.name}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
```

## 🛠️ Common Tasks

### Adding a New GitHub API Endpoint

```javascript
// In src/services/githubApi.js

export async function analyzeRepo(owner, repo) {
  const [info, languages, /* add new endpoint */] = 
    await Promise.allSettled([
      ghFetch(`/repos/${owner}/${repo}`),
      ghFetch(`/repos/${owner}/${repo}/languages`),
      // Add your new endpoint here
      ghFetch(`/repos/${owner}/${repo}/your-endpoint`),
    ]);
  
  // Process the new data
  const newData = newEndpoint.status === "fulfilled" 
    ? newEndpoint.value 
    : null;
  
  return {
    ...existingFields,
    newData, 
  };
}
```

### Adding a New Score Metric

```javascript
// In src/services/repoInsights.js

function calcMyNewScore(data) {
  let score = 75; // baseline
  
  // Add scoring logic
  if (data.someMetric > 1000) score += 10;
  
  // Add seeded randomness for consistency
  score += seededInt(data.repoName + "mynew", -3, 3);
  
  return Math.max(30, Math.min(99, score));
}
```

### Adding a New Smart Suggestion

```javascript
// In src/services/repoInsights.js, in generateSuggestions()

export function generateSuggestions(data, arch) {
  const suggestions = [];
  
  // Add your new suggestion logic
  if (/* your condition */) {
    suggestions.push({
      priority: "HIGH", 
      category: "Quality", 
      icon: "🎯",
      title: "Your suggestion title",
      description: "Detailed explanation of the suggestion and why it matters.",
      effort: "Medium", 
      impact: "High",   
    });
  }
  
  return suggestions.slice(0, 8);
}
```

## 🐛 Troubleshooting

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/OWNER/repomedic/issues)
- **Discussions**: [Join discussions](https://github.com/OWNER/repomedic/discussions)
- **Documentation**: Check [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for technical details

Thank you for contributing to RepoMedic! 🚀

---

**Last Updated:** 2026-05-27