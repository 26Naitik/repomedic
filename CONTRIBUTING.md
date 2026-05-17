# Contributing to RepoMedic AI

Welcome! 👋 We're excited that you're interested in contributing to RepoMedic AI. This guide will help you get started, whether you're fixing a bug, adding a feature, or improving documentation.

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
git clone https://github.com/YOUR_USERNAME/repomedic-ai.git
cd repomedic-ai

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/repomedic-ai.git
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
2. Try analyzing a repository (e.g., `https://github.com/facebook/react`)
3. Verify the analysis completes successfully

## 📁 Project Structure

```
repomedic-ai/
├── public/                    # Static assets
│   ├── favicon.svg           # App icon
│   └── icons.svg             # SVG sprite sheet
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
│   │   ├── AISuggestions.jsx # AI-generated recommendations
│   │   ├── SecurityPanel.jsx # Vulnerability display
│   │   ├── CommitActivity.jsx # Commit history chart
│   │   ├── OnboardingGuide.jsx # Feature walkthrough
│   │   └── ErrorScreen.jsx   # Error handling UI
│   │
│   ├── services/             # Business logic
│   │   ├── githubApi.js      # GitHub API integration
│   │   └── aiInsights.js     # Analysis algorithms
│   │
│   ├── data/
│   │   └── mockData.js       # Utility functions
│   │
│   └── assets/               # Images & icons
│       ├── hero.png
│       ├── react.svg
│       └── vite.svg
│
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
| [`src/services/aiInsights.js`](src/services/aiInsights.js:1) | Analysis algorithms | Modifying scoring logic |
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
// ✅ Good: Use const/let, not var
const userName = "Alice";
let counter = 0;

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

// ✅ Good: Descriptive function names
function calculateHealthScore(repoData) { }
function formatCommitDate(timestamp) { }

// ❌ Bad: Vague names
function calc(d) { }
function fmt(t) { }
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

// 4. Sub-components (if needed)
function SubComponent({ item }) {
  return <div>{item.name}</div>;
}
```

### CSS/Styling Guidelines

```css
/* Use CSS variables for colors */
.my-component {
  color: var(--text-primary);
  background: var(--bg-base);
}

/* Use Tailwind utilities when possible */
<div className="flex items-center gap-4 p-6 rounded-lg">

/* Custom styles in style prop for dynamic values */
<div style={{ 
  width: `${percentage}%`,
  color: getScoreColor(score)
}}>
```

### File Naming

- Components: `PascalCase.jsx` (e.g., `ScorePanel.jsx`)
- Services: `camelCase.js` (e.g., `githubApi.js`)
- Utilities: `camelCase.js` (e.g., `mockData.js`)
- Styles: `kebab-case.css` or `PascalCase.css`

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Happy Path**: Analyze a popular repo (e.g., `facebook/react`)
- [ ] **Error Cases**:
  - Invalid URL format
  - Non-existent repository
  - Private repository (should show 404)
  - Network offline
- [ ] **Edge Cases**:
  - Very large repo (>100MB)
  - Repo with no README
  - Repo with no license
  - Fork vs original repo
- [ ] **UI/UX**:
  - Mobile responsive (test at 375px, 768px, 1024px)
  - Loading states work correctly
  - Animations are smooth
  - No console errors
- [ ] **Browser Compatibility**:
  - Chrome/Edge (latest)
  - Firefox (latest)
  - Safari (latest)

### Testing New Features

```javascript
// Example: Testing a new score calculation
function testHealthScore() {
  const mockData = {
    stars: 50000,
    pushedAt: new Date().toISOString(),
    description: "A great project",
    license: "MIT",
    topics: ["react", "vite", "tailwind"],
    openIssues: 50,
    forks: 1000
  };
  
  const score = calcHealthScore(mockData);
  console.log("Health Score:", score);
  console.assert(score >= 40 && score <= 99, "Score out of range");
}
```

## 📤 Submitting Changes

### Pull Request Process

1. **Update Documentation**: If you changed functionality, update relevant docs
2. **Self-Review**: Review your own code before submitting
3. **Write Clear PR Description**:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

4. **Request Review**: Tag maintainers or wait for automatic review assignment
5. **Address Feedback**: Respond to review comments promptly
6. **Merge**: Once approved, a maintainer will merge your PR

### PR Review Criteria

Your PR will be reviewed for:
- ✅ Code quality and readability
- ✅ Follows project conventions
- ✅ No breaking changes (or properly documented)
- ✅ Performance impact
- ✅ Accessibility considerations
- ✅ Mobile responsiveness

## 🎨 Component Development Guide

### Creating a New Component

```bash
# 1. Create the component file
touch src/components/MyNewComponent.jsx

# 2. Use this template:
```

```javascript
import { motion } from "framer-motion";
import { Icon } from "lucide-react";

/**
 * MyNewComponent - Brief description
 * @param {Object} props
 * @param {Array} props.data - Description of data prop
 * @param {Function} props.onAction - Description of callback
 */
export default function MyNewComponent({ data, onAction }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: 24, marginBottom: 24 }}
    >
      <h2 style={{ 
        fontFamily: "var(--font-head)", 
        fontSize: 20, 
        fontWeight: 700,
        marginBottom: 16 
      }}>
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

### Adding to Dashboard

```javascript
// In src/components/Dashboard.jsx
import MyNewComponent from "./MyNewComponent";

export default function Dashboard({ data, onReset }) {
  return (
    <div>
      {/* Existing components */}
      <RepoHeader data={data} />
      <ScorePanel data={data} />
      
      {/* Add your new component */}
      <MyNewComponent 
        data={data.myNewData} 
        onAction={handleAction}
      />
    </div>
  );
}
```

### Styling Best Practices

```javascript
// Use inline styles for dynamic values
<div style={{ 
  width: `${percentage}%`,
  background: getColor(value)
}} />

// Use className for static styles
<div className="glass-card" />

// Combine both when needed
<div 
  className="glass-card"
  style={{ marginTop: index * 8 }}
/>

// Use CSS variables for theme colors
<div style={{ 
  color: "var(--text-primary)",
  background: "var(--bg-base)"
}} />
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
    // existing fields...
    newData, // Add to return object
  };
}
```

### Adding a New Score Metric

```javascript
// In src/services/aiInsights.js

function calcMyNewScore(data) {
  let score = 75; // baseline
  
  // Add scoring logic
  if (data.someMetric > 1000) score += 10;
  if (data.anotherMetric < 50) score -= 5;
  
  // Add seeded randomness for consistency
  score += seededInt(data.repoName + "mynew", -3, 3);
  
  // Clamp to valid range
  return Math.max(30, Math.min(99, score));
}

// Add to buildAnalysis function
export function buildAnalysis(rawData) {
  const myNewScore = calcMyNewScore(rawData);
  
  return {
    // existing fields...
    myNewScore, // Add to return object
  };
}
```

### Adding a New AI Suggestion

```javascript
// In src/services/aiInsights.js, in generateSuggestions()

export function generateSuggestions(data, arch) {
  const suggestions = [];
  
  // Add your new suggestion logic
  if (/* your condition */) {
    suggestions.push({
      priority: "HIGH", // HIGH | MEDIUM | LOW
      category: "Quality", // Quality | DevOps | Documentation | etc.
      icon: "🎯",
      title: "Your suggestion title",
      description: "Detailed explanation of the suggestion and why it matters.",
      effort: "Medium", // Low | Medium | High
      impact: "High",   // Low | Medium | High
    });
  }
  
  return suggestions.slice(0, 8);
}
```

### Modifying the Color Scheme

```css
/* In src/index.css */

:root {
  /* Change these values */
  --bg-base: #0a0a0f;
  --text-primary: #f0f0f5;
  --neon-purple: #7c6fff;
  --neon-cyan: #00d4ff;
  --neon-green: #00ffa3;
  
  /* Gradients will update automatically */
  --gradient-primary: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
}
```

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Module not found" error

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Vite dev server won't start

```bash
# Solution: Check if port 5173 is in use
# Kill the process or change port in vite.config.js
export default defineConfig({
  server: { port: 3000 }
});
```

#### Issue: GitHub API rate limit

```bash
# Solution: Wait 1 hour or use GitHub token
# Add to .env.local (not committed):
VITE_GITHUB_TOKEN=your_token_here

# Update githubApi.js:
headers: {
  Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`
}
```

#### Issue: Styles not updating

```bash
# Solution: Hard refresh browser
# Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear Vite cache:
rm -rf node_modules/.vite
npm run dev
```

#### Issue: ESLint errors

```bash
# Solution: Auto-fix most issues
npm run lint -- --fix

# Or disable specific rules in eslint.config.js
```

### Getting Help

- **GitHub Issues**: [Create an issue](https://github.com/OWNER/repomedic-ai/issues)
- **Discussions**: [Join discussions](https://github.com/OWNER/repomedic-ai/discussions)
- **Documentation**: Check [`ARCHITECTURE.md`](ARCHITECTURE.md:1) for technical details

## 📚 Additional Resources

### Learning Resources

- **React**: [Official React Docs](https://react.dev/)
- **Vite**: [Vite Guide](https://vitejs.dev/guide/)
- **Tailwind CSS**: [Tailwind Docs](https://tailwindcss.com/docs)
- **Framer Motion**: [Motion Docs](https://www.framer.com/motion/)
- **GitHub API**: [REST API Docs](https://docs.github.com/en/rest)

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint -- --fix    # Auto-fix linting issues

# Git
git status               # Check current changes
git log --oneline        # View commit history
git diff                 # View unstaged changes
git stash                # Temporarily save changes
git stash pop            # Restore stashed changes

# Debugging
console.log()            # Basic logging
console.table()          # Table format for objects/arrays
debugger;                # Breakpoint in browser DevTools
```

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in commit history

Thank you for contributing to RepoMedic AI! 🚀

---

**Questions?** Open an issue or start a discussion. We're here to help!

**Last Updated:** 2026-05-17