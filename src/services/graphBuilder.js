/**
 * RepoMedic Knowledge Graph Builder
 *
 * Constructs a structural dependency graph from GitHub repository data.
 * Uses file tree analysis and architectural pattern inference to build
 * meaningful relationships without reading individual file contents.
 *
 * All analysis is derived from: file paths, extensions, naming conventions,
 * directory structure, contributor data, and detected architectural patterns.
 */

// ── File Extension → Language/Type ───────────────────────────────────────────
const EXT_LANG_MAP = {
  js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', cts: 'TypeScript',
  py: 'Python', pyw: 'Python', pyx: 'Python',
  rb: 'Ruby', rake: 'Ruby', gemspec: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  kt: 'Kotlin', kts: 'Kotlin',
  cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++', hxx: 'C++',
  c: 'C', h: 'C',
  cs: 'C#',
  php: 'PHP',
  swift: 'Swift',
  dart: 'Dart',
  vue: 'Vue',
  svelte: 'Svelte',
  html: 'HTML', htm: 'HTML',
  css: 'CSS', less: 'CSS',
  scss: 'SCSS', sass: 'SCSS',
  json: 'JSON',
  yaml: 'YAML', yml: 'YAML',
  toml: 'TOML',
  md: 'Markdown', mdx: 'MDX',
  sh: 'Shell', bash: 'Shell', zsh: 'Shell', fish: 'Shell',
  graphql: 'GraphQL', gql: 'GraphQL',
  sql: 'SQL',
  xml: 'XML',
  tf: 'Terraform', hcl: 'Terraform',
  ex: 'Elixir', exs: 'Elixir',
  clj: 'Clojure', cljs: 'Clojure',
  hs: 'Haskell',
  lua: 'Lua',
  r: 'R',
  jl: 'Julia',
  scala: 'Scala',
};

// ── Directory Semantic Roles ──────────────────────────────────────────────────
const DIR_ROLE_MAP = {
  src: 'Source Root',      lib: 'Library',          app: 'Application',
  core: 'Core',            components: 'Components', pages: 'Pages',
  views: 'Views',          screens: 'Screens',       layouts: 'Layouts',
  templates: 'Templates',  widgets: 'Widgets',       ui: 'UI Layer',
  services: 'Services',    api: 'API Layer',         client: 'API Client',
  server: 'Server',        routes: 'Routes',         controllers: 'Controllers',
  handlers: 'Handlers',    middleware: 'Middleware',  models: 'Models',
  schemas: 'Schemas',      entities: 'Entities',     repositories: 'Repositories',
  hooks: 'Hooks',          composables: 'Composables', mixins: 'Mixins',
  utils: 'Utilities',      utility: 'Utilities',     helpers: 'Helpers',
  common: 'Common',        shared: 'Shared',         constants: 'Constants',
  store: 'State Store',    redux: 'Redux',           context: 'Context',
  state: 'State',          atoms: 'Atoms',
  styles: 'Styles',        assets: 'Assets',         static: 'Static Assets',
  public: 'Public Assets', images: 'Images',         fonts: 'Fonts',
  tests: 'Tests',          test: 'Tests',            '__tests__': 'Tests',
  spec: 'Tests',           __mocks__: 'Mocks',       mocks: 'Mocks',
  fixtures: 'Fixtures',    e2e: 'E2E Tests',
  docs: 'Documentation',   doc: 'Documentation',
  config: 'Configuration', configs: 'Configuration', scripts: 'Scripts',
  tools: 'Tools',          bin: 'Binaries',
  dist: 'Build Output',    build: 'Build',           out: 'Output',
  generated: 'Generated',  migrations: 'Migrations', seeds: 'Seeds',
  types: 'Types',          interfaces: 'Interfaces', enums: 'Enums',
  events: 'Events',        jobs: 'Jobs',             tasks: 'Tasks',
  workers: 'Workers',      queue: 'Queue',           cache: 'Cache',
  plugins: 'Plugins',      extensions: 'Extensions', modules: 'Modules',
  packages: 'Packages',    apps: 'Applications',
  graphql: 'GraphQL',      socket: 'WebSocket',
};

// ── Architectural Layer Hierarchy ─────────────────────────────────────────────
// Higher index → lower in dependency chain (fewer things depend on it)
const ARCH_LAYERS = [
  { name: 'pages',      dirs: ['pages', 'views', 'screens', 'app', 'routes'] },
  { name: 'components', dirs: ['components', 'widgets', 'ui', 'layouts', 'templates'] },
  { name: 'hooks',      dirs: ['hooks', 'composables', 'mixins'] },
  { name: 'state',      dirs: ['store', 'redux', 'context', 'state', 'atoms', 'zustand'] },
  { name: 'services',   dirs: ['services', 'api', 'client', 'controllers', 'handlers', 'graphql'] },
  { name: 'models',     dirs: ['models', 'schemas', 'entities', 'repositories', 'types', 'interfaces'] },
  { name: 'utils',      dirs: ['utils', 'utility', 'helpers', 'common', 'shared', 'lib', 'core', 'constants'] },
  { name: 'config',     dirs: ['config', 'configs', 'scripts', 'tools'] },
];

// ── Layer dependency rules: which layers import from which ────────────────────
const LAYER_DEPENDS_ON = {
  pages:      ['components', 'hooks', 'state', 'services', 'utils'],
  components: ['hooks', 'utils', 'services'],
  hooks:      ['services', 'utils', 'state'],
  state:      ['services', 'utils'],
  services:   ['utils', 'models'],
  models:     ['utils'],
  utils:      [],
  config:     [],
};

// ── File role colors for graph nodes ─────────────────────────────────────────
export const ROLE_COLORS = {
  component: '#F4C542',
  service:   '#D4A514',
  hook:      '#C9A94A',
  model:     '#C98B2B',
  utility:   '#8EA06D',
  test:      '#B85C5C',
  config:    '#8b8ca8',
  index:     '#C9A94A',
  style:     '#C98B2B',
  doc:       '#6b7280',
  state:     '#D4A514',
  file:      '#6b7280',
};

// ── Risk level colors ─────────────────────────────────────────────────────────
export const RISK_COLORS = {
  HIGH:    '#B85C5C',
  MEDIUM:  '#C98B2B',
  LOW:     '#8EA06D',
  UNKNOWN: '#4a4b65',
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function getFileExt(path) {
  const filename = path.split('/').pop() || '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function getFileName(path) {
  return path.split('/').pop() || path;
}

export function getLanguage(path) {
  const filename = getFileName(path).toLowerCase();
  if (filename === 'dockerfile') return 'Docker';
  if (filename === 'makefile')   return 'Makefile';
  if (filename === 'gemfile')    return 'Ruby';
  if (filename === 'procfile')   return 'Config';
  return EXT_LANG_MAP[getFileExt(path)] || null;
}

export function isTestFile(path) {
  const lower = path.toLowerCase();
  return (
    lower.includes('.test.') || lower.includes('.spec.') ||
    lower.includes('__tests__/') || lower.includes('/tests/') ||
    lower.includes('/test/') || lower.includes('/spec/') ||
    lower.includes('/e2e/')
  );
}

export function isIndexFile(path) {
  const filename = getFileName(path).toLowerCase();
  return filename.startsWith('index.') || filename === 'index';
}

export function isConfigFile(path) {
  const lower = path.toLowerCase();
  const filename = getFileName(lower);
  return (
    filename.endsWith('.config.js') || filename.endsWith('.config.ts') ||
    filename.endsWith('.config.mjs') || filename.includes('.rc.') ||
    filename.startsWith('.') || filename === 'package.json' ||
    filename === 'tsconfig.json' || filename === 'vite.config.js' ||
    filename === 'vite.config.ts' || filename === 'webpack.config.js' ||
    filename === 'jest.config.js' || filename === 'jest.config.ts' ||
    filename === 'babel.config.js' || filename === 'rollup.config.js' ||
    filename === 'tailwind.config.js' || filename === 'postcss.config.js' ||
    filename === 'next.config.js' || filename === 'next.config.mjs' ||
    filename === 'dockerfile' || filename === 'docker-compose.yml' ||
    filename === '.env' || filename === '.env.example' ||
    filename === '.eslintrc.js' || filename === '.prettierrc'
  );
}

export function getFileRole(path) {
  if (isTestFile(path))  return 'test';
  if (isIndexFile(path)) return 'index';
  if (isConfigFile(path)) return 'config';

  const ext  = getFileExt(path);
  const lower = path.toLowerCase();

  if (['jsx', 'tsx', 'vue', 'svelte'].includes(ext)) return 'component';
  if (['css', 'scss', 'sass', 'less'].includes(ext)) return 'style';
  if (['md', 'mdx', 'rst', 'txt'].includes(ext))     return 'doc';
  if (['json', 'yaml', 'yml', 'toml', 'ini'].includes(ext)) return 'config';

  if (['js', 'ts', 'mjs', 'mts'].includes(ext)) {
    if (/\/(service|services|api|client)\//i.test(lower)) return 'service';
    if (/\/(hook|hooks)\//i.test(lower) || getFileName(lower).startsWith('use')) return 'hook';
    if (/\/(util|utils|helper|helpers|lib|common|shared|core)\//i.test(lower)) return 'utility';
    if (/\/(model|models|schema|schemas|entity|entities|type|types|interface)\//i.test(lower)) return 'model';
    if (/\/(store|redux|context|state|atom)\//i.test(lower)) return 'state';
  }

  if (['py', 'rb', 'go', 'rs', 'java', 'cs', 'kt', 'swift', 'php', 'dart', 'ex', 'hs', 'scala', 'lua', 'jl', 'r'].includes(ext)) {
    if (/\/(service|services)\//i.test(lower)) return 'service';
    if (/\/(model|models|entity|entities|schema)\//i.test(lower)) return 'model';
    if (/\/(util|utils|helper|helpers|lib)\//i.test(lower)) return 'utility';
    if (/\/(handler|controller|route|router)\//i.test(lower)) return 'service';
    return 'module';
  }

  return 'file';
}

function getDirRole(dirPath) {
  const parts = dirPath.split('/');
  for (let i = parts.length - 1; i >= 0; i--) {
    const role = DIR_ROLE_MAP[parts[i].toLowerCase()];
    if (role) return role;
  }
  return 'Module';
}

function getArchLayer(path) {
  const parts = path.toLowerCase().split('/');
  for (const layer of ARCH_LAYERS) {
    for (const dir of layer.dirs) {
      if (parts.some(p => p === dir || p.startsWith(dir + '_') || p.endsWith('_' + dir))) {
        return layer.name;
      }
    }
  }
  return 'other';
}

function sanitizeId(path) {
  return 'n-' + path.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
}

// ── File Importance Scorer ────────────────────────────────────────────────────

function scoreFileImportance(blob) {
  let score = 0;
  const lower  = blob.path.toLowerCase();
  const fname  = getFileName(lower);
  const ext    = getFileExt(blob.path);
  const depth  = blob.path.split('/').length;
  const role   = getFileRole(blob.path);

  // Entry points are critical
  if (['app.jsx', 'app.tsx', 'app.js', 'app.ts'].includes(fname)) score += 50;
  if (['main.jsx', 'main.tsx', 'main.js', 'main.ts'].includes(fname)) score += 45;
  if (['index.jsx', 'index.tsx', 'index.js', 'index.ts'].includes(fname)) score += 30;
  if (isConfigFile(blob.path)) score += 20;

  // Source code files over assets
  const codeLangs = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'cs', 'kt', 'swift', 'php', 'dart', 'vue', 'svelte', 'ex'];
  if (codeLangs.includes(ext)) score += 12;

  // Core roles
  if (role === 'service') score += 18;
  if (role === 'component') score += 14;
  if (role === 'hook') score += 12;
  if (role === 'state') score += 12;
  if (role === 'model') score += 10;
  if (role === 'test') score -= 8;
  if (role === 'style') score -= 5;
  if (role === 'doc') score -= 3;

  // Shallow files are more important
  score -= depth * 4;

  return score;
}

// ── Dependency Inference ──────────────────────────────────────────────────────

function inferDependencies(files) {
  const result = [];

  files.forEach(file => {
    const role  = getFileRole(file.path);
    const layer = getArchLayer(file.path);

    // ── Test → Source ──────────────────────────────────────────────────────
    if (role === 'test') {
      // Remove test qualifiers to find the source filename
      const fname  = getFileName(file.path);
      const fparts = fname.split('.');
      // e.g. "Button.test.tsx" → base "Button", ext "tsx"
      const baseNames = [];
      if (fparts.length >= 3) {
        // Remove the "test" or "spec" segment
        const filtered = fparts.filter(p => !['test', 'spec'].includes(p));
        baseNames.push(filtered.join('.'));
      }
      baseNames.push(fname.replace(/\.(test|spec)\.[a-z]+$/i, '.$1').replace(/\.(test|spec)$/i, ''));

      const sourceFile = files.find(f => {
        if (f.path === file.path || isTestFile(f.path)) return false;
        const sfname = getFileName(f.path);
        return baseNames.some(bn => sfname === bn || sfname.startsWith(bn.split('.')[0] + '.'));
      });

      if (sourceFile) {
        result.push({
          sourcePath: file.path,
          targetPath: sourceFile.path,
          type: 'tests',
          color: RISK_COLORS.LOW,
          animated: true,
        });
      }
      return;
    }

    // ── Index (barrel) → Siblings ──────────────────────────────────────────
    if (role === 'index') {
      const dir = file.path.split('/').slice(0, -1).join('/');
      const siblings = files
        .filter(f => {
          const fDir = f.path.split('/').slice(0, -1).join('/');
          return fDir === dir && f.path !== file.path && !isTestFile(f.path) && !isIndexFile(f.path);
        })
        .slice(0, 4);

      siblings.forEach(sibling => {
        result.push({
          sourcePath: file.path,
          targetPath: sibling.path,
          type: 'aggregates',
          color: 'rgba(168,85,247,0.4)',
          animated: false,
        });
      });
      return;
    }

    // ── Layer-based architectural dependency ───────────────────────────────
    const targetLayerNames = LAYER_DEPENDS_ON[layer] || [];
    if (targetLayerNames.length === 0) return;

    let targetsAdded = 0;
    for (const targetLayer of targetLayerNames) {
      if (targetsAdded >= 2) break;

      // Prefer index files or entry-point files in the target layer
      const candidates = files.filter(f =>
        getArchLayer(f.path) === targetLayer &&
        !isTestFile(f.path) &&
        (isIndexFile(f.path) || getFileRole(f.path) === 'service' || getFileRole(f.path) === 'utility')
      );

      const target = candidates[0];
      if (target && target.path !== file.path) {
        result.push({
          sourcePath: file.path,
          targetPath: target.path,
          type: 'depends-on',
          color: 'rgba(244,197,66,0.35)',
          animated: false,
        });
        targetsAdded++;
      }
    }
  });

  return result;
}

// ── Risk Score Computation ────────────────────────────────────────────────────

function computeRiskScores(fileNodes, allEdges) {
  const dependentCounts  = new Map();
  const dependencyCounts = new Map();

  allEdges.forEach(e => {
    if (e.data?.edgeType === 'depends-on' || e.data?.edgeType === 'tests') {
      dependentCounts.set(e.target,  (dependentCounts.get(e.target)  || 0) + 1);
      dependencyCounts.set(e.source, (dependencyCounts.get(e.source) || 0) + 1);
    }
    if (e.data?.edgeType === 'aggregates') {
      dependentCounts.set(e.target, (dependentCounts.get(e.target) || 0) + 1);
    }
  });

  fileNodes.forEach(node => {
    const deps    = dependentCounts.get(node.id)  || 0;
    const imports = dependencyCounts.get(node.id) || 0;
    const role    = node.data.role;
    const path    = node.data.path;

    node.data.dependentsCount  = deps;
    node.data.dependenciesCount = imports;

    let risk = 'LOW';
    if (deps >= 3 || role === 'service' || role === 'state') risk = 'HIGH';
    else if (deps >= 1 || role === 'hook' || role === 'model' || role === 'component') risk = 'MEDIUM';

    if (isIndexFile(path) && deps > 0) risk = 'HIGH';
    if (isConfigFile(path))            risk = 'MEDIUM';
    if (role === 'test')               risk = 'LOW';
    if (role === 'doc' || role === 'style') risk = 'LOW';

    node.data.riskLevel = risk;
  });
}

// ── Circular Dependency Detection ─────────────────────────────────────────────

export function detectCircularDeps(nodes, edges) {
  const depEdges = edges.filter(e =>
    e.data?.edgeType === 'depends-on' || e.data?.edgeType === 'aggregates'
  );

  const adjacency = new Map();
  depEdges.forEach(e => {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    adjacency.get(e.source).push(e.target);
  });

  const cycles   = [];
  const visited  = new Set();
  const inStack  = new Set();

  function dfs(nodeId, path) {
    visited.add(nodeId);
    inStack.add(nodeId);
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, nodeId]);
      } else if (inStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          const nodeA = nodes.find(n => n.id === nodeId);
          const nodeB = nodes.find(n => n.id === neighbor);
          if (nodeA && nodeB) {
            cycles.push({
              nodeA: nodeA.data.path || nodeA.data.label,
              nodeB: nodeB.data.path || nodeB.data.label,
            });
          }
        }
      }
    }
    inStack.delete(nodeId);
  }

  nodes.filter(n => n.type === 'file').forEach(n => {
    if (!visited.has(n.id)) dfs(n.id, []);
  });

  return cycles.slice(0, 10);
}

// ── Impact Analysis ───────────────────────────────────────────────────────────

export function computeImpactAnalysis(selectedNodeId, nodes, edges) {
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const relevantTypes = new Set(['depends-on', 'tests', 'aggregates']);

  const dependents = edges
    .filter(e => e.target === selectedNodeId && relevantTypes.has(e.data?.edgeType))
    .map(e => {
      const n = nodes.find(x => x.id === e.source);
      return n ? { id: n.id, label: n.data.path || n.data.label || n.id, type: e.data.edgeType, nodeType: n.type } : null;
    })
    .filter(Boolean);

  const dependencies = edges
    .filter(e => e.source === selectedNodeId && relevantTypes.has(e.data?.edgeType))
    .map(e => {
      const n = nodes.find(x => x.id === e.target);
      return n ? { id: n.id, label: n.data.path || n.data.label || n.id, type: e.data.edgeType, nodeType: n.type } : null;
    })
    .filter(Boolean);

  const role      = selectedNode.data.role || selectedNode.type;
  const riskLevel = selectedNode.data.riskLevel || 'LOW';

  // Coupling score: 0-100
  const couplingScore = Math.min(100, dependents.length * 15 + dependencies.length * 8);
  const couplingLabel =
    couplingScore >= 60 ? 'Tightly Coupled' :
    couplingScore >= 30 ? 'Moderately Coupled' :
    'Loosely Coupled';

  const impactPrediction = generateImpactPrediction(selectedNode, dependents);

  return {
    node:         selectedNode,
    dependents,
    dependencies,
    riskLevel,
    role,
    impactPrediction,
    couplingScore,
    couplingLabel,
  };
}

function generateImpactPrediction(node, dependents) {
  const path     = node.data.path || '';
  const fname    = getFileName(path) || node.data.label || 'this file';
  const role     = node.data.role || node.type;
  const depCount = dependents.length;

  const IMPACT_MESSAGES = {
    service: depCount > 0
      ? `Modifying \`${fname}\` will directly affect ${depCount} dependent module${depCount !== 1 ? 's' : ''}. As a service layer file, changes to its API surface or data contracts can cascade through all callers. Ensure backward compatibility or update all callers atomically.`
      : `\`${fname}\` is a standalone service with no detected structural dependents. Changes carry minimal cascade risk, but verify all integration paths are tested.`,

    component: depCount > 0
      ? `\`${fname}\` is consumed across ${depCount} location${depCount !== 1 ? 's' : ''}. Changes to its props interface or rendered output will require updates in all consumer components. Add prop deprecation warnings before removing existing props.`
      : `\`${fname}\` appears to be a leaf component with no detected consumers. Changes are low-risk — standard testing is sufficient.`,

    hook: depCount > 0
      ? `This hook is consumed by ${depCount} component${depCount !== 1 ? 's' : ''}. Changes to its return type or parameter signature will break all consumers. Consider a migration strategy before modifying the hook API.`
      : `This hook has no detected consumers. Safe to refactor with standard unit testing.`,

    state: `State management files coordinate data flow across the entire application. Changes to state shape, selectors, or action types require updates to all consumers and often require a coordinated migration.`,

    model: depCount > 0
      ? `Data model changes in \`${fname}\` propagate to ${depCount} dependent module${depCount !== 1 ? 's' : ''}. Schema modifications may require data migrations and updates to all serializers, validators, and consumers.`
      : `This model has no detected dependents in the shown graph. Changes are relatively isolated — verify against ORM queries and serialization logic separately.`,

    utility: depCount > 0
      ? `This utility function is referenced by ${depCount} module${depCount !== 1 ? 's' : ''}. Changing function signatures without backward compatibility will cause widespread build failures. Prefer additive changes or use a deprecation pattern.`
      : `Standalone utility — changes are low-risk, but ensure thorough unit test coverage before deploying.`,

    config: `Configuration files affect the entire build and runtime environment. Changes to \`${fname}\` may alter behavior across all environments. Always test in a staging environment before pushing to production.`,

    index: `Barrel/index files aggregate and re-export module members. Every consumer importing from this module path depends on this file. Removing or renaming exports is a breaking change for all importers.`,

    test: `Test files have no impact on production code. Modifications are safe but ensure tests remain comprehensive and reflect the actual behavior under test.`,

    style: `Style files affect visual presentation only. Changes are low-risk but review across multiple viewport sizes and themes.`,

    module: depCount > 0
      ? `This module has ${depCount} structural dependent${depCount !== 1 ? 's' : ''}. Review all dependents before making interface-breaking changes.`
      : `No structural dependents detected. Changes are isolated — standard testing applies.`,

    file: depCount > 0
      ? `This file is referenced by ${depCount} other module${depCount !== 1 ? 's' : ''}. Review all dependents before making breaking changes.`
      : `No direct dependents detected. Changes carry minimal cascade risk.`,
  };

  return IMPACT_MESSAGES[role] || IMPACT_MESSAGES.file;
}

// ── Layout Algorithm ──────────────────────────────────────────────────────────

function computeLayout(nodes) {
  const dirNodes     = nodes.filter(n => n.type === 'directory');
  const langNodes    = nodes.filter(n => n.type === 'language');
  const patternNodes = nodes.filter(n => n.type === 'pattern');
  const contribNodes = nodes.filter(n => n.type === 'contributor');
  const fileNodes    = nodes.filter(n => n.type === 'file');

  const directorySpacingX = 180;
  const directorySpacingY = 150;
  const languageSpacingX = 180;
  const languageSpacingY = 118;
  const patternSpacingX = 180;
  const patternSpacingY = 118;
  const contributorSpacingX = 180;

  // Root at center
  const rootNode = nodes.find(n => n.id === 'root');
  if (rootNode) rootNode.position = { x: 0, y: 0 };

  // Directories: compact left-side lattice
  dirNodes.forEach((node, i) => {
    const cols = 2;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const totalRows = Math.ceil(dirNodes.length / cols);
    node.position = {
      x: -300 + col * directorySpacingX,
      y: (row - (totalRows - 1) / 2) * directorySpacingY,
    };
  });

  // Files: cluster tightly around parent directory (hidden by default)
  const filesByParent = new Map();
  fileNodes.forEach(n => {
    const pid = n.data.parentDirId || 'root';
    if (!filesByParent.has(pid)) filesByParent.set(pid, []);
    filesByParent.get(pid).push(n);
  });

  filesByParent.forEach((children, parentId) => {
    const parentNode = nodes.find(n => n.id === parentId);
    const px = parentNode?.position?.x || 0;
    const py = parentNode?.position?.y || 0;
    const cols = 3;
    children.forEach((n, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      n.position = {
        x: px + (col - 1) * 120,
        y: py + (parentId === 'root' ? 180 : 120) + row * 82,
      };
    });
  });

  // Languages: top-right cluster
  langNodes.forEach((n, i) => {
    const cols = 2;
    n.position = {
      x: 280 + (i % cols) * languageSpacingX,
      y: -240 + Math.floor(i / cols) * languageSpacingY,
    };
  });

  // Patterns: top-left cluster
  patternNodes.forEach((n, i) => {
    const cols = 2;
    n.position = {
      x: -300 + (i % cols) * patternSpacingX,
      y: -240 + Math.floor(i / cols) * patternSpacingY,
    };
  });

  // Contributors: bottom cluster
  contribNodes.forEach((n, index) => {
    const total = contribNodes.length;
    n.position = {
      x: (index - (total - 1) / 2) * contributorSpacingX,
      y: 320,
    };
  });
}

// ── Stats Summary ─────────────────────────────────────────────────────────────

function computeStats(nodes, edges, rawData) {
  const fileNodes = nodes.filter(n => n.type === 'file');
  const riskDist  = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  fileNodes.forEach(n => { if (n.data.riskLevel in riskDist) riskDist[n.data.riskLevel]++; });

  const highRiskPaths = fileNodes
    .filter(n => n.data.riskLevel === 'HIGH')
    .map(n => n.data.path)
    .slice(0, 5);

  const totalBlobs = (rawData.fileTree || []).filter(f => f.type === 'blob').length;

  return {
    totalNodes:      nodes.length,
    fileCount:       fileNodes.length,
    directoryCount:  nodes.filter(n => n.type === 'directory').length,
    languageCount:   nodes.filter(n => n.type === 'language').length,
    patternCount:    nodes.filter(n => n.type === 'pattern').length,
    contributorCount: nodes.filter(n => n.type === 'contributor').length,
    totalEdges:      edges.length,
    riskDistribution: riskDist,
    highRiskFiles:   highRiskPaths,
    totalFileCount:  totalBlobs,
    hasFullTree:     totalBlobs > 0,
  };
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function buildGraphData(rawData) {
  const {
    fileTree       = [],
    techStack      = [],
    contributorList = [],
    architecture   = {},
    repoName       = '',
    owner          = '',
    repo           = '',
    stars          = 0,
    language       = 'Unknown',
    description    = '',
    topics         = [],
    ownerAvatar    = '',
  } = rawData;

  const nodes = [];
  const edges = [];

  // ── Root node ────────────────────────────────────────────────────────────
  nodes.push({
    id:       'root',
    type:     'repoRoot',
    position: { x: 0, y: 0 },
    data: {
      repoName:    repoName || `${owner}/${repo}`,
      owner,
      repo,
      stars,
      language,
      description,
      topics:      topics.slice(0, 4),
      ownerAvatar,
    },
  });

  // ── File tree ─────────────────────────────────────────────────────────────
  const allBlobs = fileTree.filter(f => f.type === 'blob');

  if (allBlobs.length > 0) {
    // Select top-level directories (max 10)
    const topDirSet = new Set(
      allBlobs.map(f => f.path.split('/')[0]).filter(Boolean)
    );
    const dirFileCounts = new Map();
    allBlobs.forEach(b => {
      const d = b.path.split('/')[0];
      if (topDirSet.has(d)) dirFileCounts.set(d, (dirFileCounts.get(d) || 0) + 1);
    });
    const topDirs = [...topDirSet]
      .sort((a, b) => (dirFileCounts.get(b) || 0) - (dirFileCounts.get(a) || 0))
      .slice(0, 10);

    // Create directory nodes
    const dirIdMap = new Map(); // dirPath → nodeId
    topDirs.forEach(dirPath => {
      const id = sanitizeId(`dir-${dirPath}`);
      dirIdMap.set(dirPath, id);
      nodes.push({
        id,
        type: 'directory',
        position: { x: 0, y: 0 },
        data: {
          label:     dirPath + '/',
          path:      dirPath,
          role:      getDirRole(dirPath),
          fileCount: dirFileCounts.get(dirPath) || 0,
          collapsed: true,
        },
      });
      edges.push({
        id:     `e-root-${id}`,
        source: 'root',
        target: id,
        type:   'smoothstep',
        data:   { edgeType: 'contains' },
        style:  { stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1.5 },
        markerEnd: { type: 'arrowclosed', width: 10, height: 10, color: 'rgba(255,255,255,0.2)' },
      });
    });

    // Select important files (max 80 for performance)
    const MAX_FILES = 80;
    const scoredBlobs = allBlobs.map(b => ({ ...b, _score: scoreFileImportance(b) }));
    const chosenBlobs = scoredBlobs.sort((a, b) => b._score - a._score).slice(0, MAX_FILES);

    // Create file nodes
    const filePathToId = new Map();
    chosenBlobs.forEach(blob => {
      const id     = sanitizeId(`file-${blob.path}`);
      const role   = getFileRole(blob.path);
      const lang   = getLanguage(blob.path);
      const topDir = blob.path.split('/')[0];
      const dirId  = dirIdMap.get(topDir) || 'root';

      filePathToId.set(blob.path, id);
      nodes.push({
        id,
        type:     'file',
        position: { x: 0, y: 0 },
        hidden:   true, // collapsed by default
        data: {
          label:              getFileName(blob.path),
          path:               blob.path,
          language:           lang,
          extension:          getFileExt(blob.path),
          role,
          archLayer:          getArchLayer(blob.path),
          parentDirId:        dirId,
          riskLevel:          'UNKNOWN',
          dependentsCount:    0,
          dependenciesCount:  0,
          sha:                blob.sha,
        },
      });
      edges.push({
        id:     `e-${dirId}-${id}`,
        source: dirId,
        target: id,
        type:   'smoothstep',
        hidden: true,
        data:   { edgeType: 'contains' },
        style:  { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 },
      });
    });

    // Infer structural dependencies
    const filePathObjects = chosenBlobs.map(b => ({ path: b.path, sha: b.sha }));
    const inferredDeps    = inferDependencies(filePathObjects);

    inferredDeps.forEach((dep, i) => {
      const srcId = filePathToId.get(dep.sourcePath);
      const tgtId = filePathToId.get(dep.targetPath);
      if (srcId && tgtId && srcId !== tgtId) {
        edges.push({
          id:       `e-dep-${i}`,
          source:   srcId,
          target:   tgtId,
          type:     'smoothstep',
          hidden:   true,
          animated: dep.animated,
          data:     { edgeType: dep.type, label: dep.type === 'tests' ? 'tests' : dep.type === 'aggregates' ? 'exports' : 'uses' },
          markerEnd: { type: 'arrowclosed', width: 12, height: 12, color: dep.color },
          style:    {
            stroke:          dep.color,
            strokeWidth:     1.5,
            strokeDasharray: dep.type === 'tests' ? '5 3' : dep.type === 'aggregates' ? '3 3' : undefined,
          },
        });
      }
    });

    // Compute risk scores on file nodes
    const fileNodes = nodes.filter(n => n.type === 'file');
    computeRiskScores(fileNodes, edges);
  }

  // ── Language nodes ────────────────────────────────────────────────────────
  techStack.slice(0, 7).forEach((lang) => {
    const id = `lang-${lang.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    nodes.push({
      id,
      type:     'language',
      position: { x: 0, y: 0 },
      data: {
        name:       lang.name,
        percentage: lang.pct,
        color:      lang.color || '#F4C542',
        category:   lang.category || 'Language',
        bytes:      lang.bytes,
      },
    });
    edges.push({
      id:     `e-root-${id}`,
      source: 'root',
      target: id,
      type:   'straight',
      data:   { edgeType: 'uses-language' },
      style:  { stroke: (lang.color || '#F4C542') + '55', strokeWidth: 2, strokeDasharray: '6 4' },
    });
  });

  // ── Pattern nodes ─────────────────────────────────────────────────────────
  const PATTERNS = [
    { key: 'hasCI',      label: 'CI/CD Pipeline', icon: '⚙️',  color: '#F4C542' },
    { key: 'hasTests',   label: 'Test Suite',      icon: '🧪',  color: '#00ffa3' },
    { key: 'hasDocker',  label: 'Docker',          icon: '🐳',  color: '#D4A514' },
    { key: 'hasDocs',    label: 'Documentation',   icon: '📚',  color: '#C9A94A' },
    { key: 'isMonorepo', label: 'Monorepo',        icon: '📦',  color: '#C98B2B' },
  ];

  PATTERNS.filter(p => architecture[p.key]).forEach(pattern => {
    const id = `pattern-${pattern.key}`;
    nodes.push({
      id,
      type:     'pattern',
      position: { x: 0, y: 0 },
      data:     { label: pattern.label, icon: pattern.icon, color: pattern.color, key: pattern.key },
    });
    edges.push({
      id:     `e-root-${id}`,
      source: 'root',
      target: id,
      type:   'straight',
      data:   { edgeType: 'has-pattern' },
      style:  { stroke: pattern.color + '45', strokeWidth: 1.5 },
    });
  });

  // ── Contributor nodes ─────────────────────────────────────────────────────
  contributorList
    .filter(c => c.login)
    .slice(0, 5)
    .forEach((contrib) => {
      const id = `contrib-${contrib.login}`;
      nodes.push({
        id,
        type:     'contributor',
        position: { x: 0, y: 0 },
        data: {
          login:         contrib.login,
          contributions: contrib.contributions || 0,
          avatarUrl:     contrib.avatar_url || `https://avatars.githubusercontent.com/${contrib.login}`,
        },
      });
      edges.push({
        id:     `e-${id}-root`,
        source: id,
        target: 'root',
        type:   'straight',
        data:   { edgeType: 'contributed-to' },
        style:  { stroke: 'rgba(201,139,43,0.3)', strokeWidth: 1, strokeDasharray: '4 4' },
        markerEnd: { type: 'arrowclosed', width: 10, height: 10, color: 'rgba(201,139,43,0.4)' },
      });
    });

  // ── Layout ────────────────────────────────────────────────────────────────
  computeLayout(nodes);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = computeStats(nodes, edges, rawData);

  return { nodes, edges, stats };
}
