/**
 * KnowledgeGraph — Main Component
 *
 * Renders an interactive React Flow graph showing the structural
 * relationships within an analyzed GitHub repository.
 *
 * Features:
 * - Zoom, pan, minimap
 * - Node type filtering (files, dirs, languages, patterns, contributors)
 * - Search by file name / path
 * - Expand/collapse directory nodes to reveal contained files
 * - Click-to-select node with side Impact Panel
 * - Circular dependency detection badge
 * - Performance: hidden nodes by default, revealed on directory expand
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Search, X, Layers, Code2, Users,
  Cpu, ChevronDown, AlertTriangle, Info, Eye, EyeOff,
  Maximize2, RefreshCcw, Filter, GitMerge,
} from 'lucide-react';

import { NODE_TYPES } from './nodeTypes';
import ImpactPanel from './ImpactPanel';
import { computeImpactAnalysis, detectCircularDeps, RISK_COLORS } from '../../services/graphBuilder';

// ── Filter Configuration ──────────────────────────────────────────────────────
const FILTER_DEFS = [
  { key: 'file',        label: 'Files',        icon: <Code2 size={12} />,   color: '#7c6fff' },
  { key: 'directory',   label: 'Directories',  icon: <Layers size={12} />,  color: '#22d3ee' },
  { key: 'language',    label: 'Languages',    icon: <Cpu size={12} />,     color: '#3b82f6' },
  { key: 'pattern',     label: 'Patterns',     icon: <GitMerge size={12} />,color: '#00ffa3' },
  { key: 'contributor', label: 'Contributors', icon: <Users size={12} />,   color: '#ff9a3c' },
];

// ── Utility: filter nodes and related edges ───────────────────────────────────
function applyFilters(allNodes, allEdges, activeFilters, searchQuery) {
  const query = searchQuery.trim().toLowerCase();

  const visibleNodeIds = new Set();

  allNodes.forEach(n => {
    // Always show the root node
    if (n.id === 'root') { visibleNodeIds.add(n.id); return; }

    // Type filter: file nodes grouped under 'file'
    const typeKey = n.type === 'file' ? 'file' : n.type;
    if (!activeFilters.has(typeKey)) return;

    // Hidden file nodes (collapsed directories) stay hidden unless expanded
    if (n.type === 'file' && n.hidden) return;

    // Search filter
    if (query) {
      const label = (n.data.label || n.data.repoName || n.data.name || n.data.login || '').toLowerCase();
      const path  = (n.data.path || '').toLowerCase();
      if (!label.includes(query) && !path.includes(query)) return;
    }

    visibleNodeIds.add(n.id);
  });

  const visibleNodes = allNodes.map(n => ({
    ...n,
    hidden: !visibleNodeIds.has(n.id),
  }));

  const visibleEdges = allEdges.map(e => ({
    ...e,
    hidden: !visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target),
  }));

  return { visibleNodes, visibleEdges };
}

// ── Mini stats bar ────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return null;
  const items = [
    { label: 'Files',         value: stats.fileCount,        color: '#7c6fff' },
    { label: 'Directories',   value: stats.directoryCount,   color: '#22d3ee' },
    { label: 'Languages',     value: stats.languageCount,    color: '#3b82f6' },
    { label: 'Patterns',      value: stats.patternCount,     color: '#00ffa3' },
    { label: 'Total edges',   value: stats.totalEdges,       color: '#8b8ca8' },
    { label: 'High risk',     value: stats.riskDistribution?.HIGH || 0, color: '#ff5078' },
  ].filter(i => i.value > 0);

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {items.map(item => (
        <div key={item.label} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: item.color }}>
            {item.value}
          </div>
          <div style={{ fontSize: 9, color: '#4a4b65', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main KnowledgeGraph component ─────────────────────────────────────────────
function KnowledgeGraphInner({ graphData, onNodeClick, selectedNodeId }) {
  const { fitView } = useReactFlow();

  const handleNodeClick = useCallback((_, node) => {
    onNodeClick(node);
  }, [onNodeClick]);

  const handlePaneClick = useCallback(() => {
    onNodeClick(null);
  }, [onNodeClick]);

  return (
    <ReactFlow
      nodes={graphData.nodes}
      edges={graphData.edges}
      nodeTypes={NODE_TYPES}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      fitView
      fitViewOptions={{ padding: 0.15, maxZoom: 1.5 }}
      minZoom={0.05}
      maxZoom={4}
      defaultEdgeOptions={{
        type: 'smoothstep',
        style: { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1.5 },
      }}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'transparent' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="rgba(255,255,255,0.05)"
      />
      <Controls
        style={{
          background: 'rgba(15,15,26,0.9)',
          border:     '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          boxShadow:  '0 4px 16px rgba(0,0,0,0.5)',
        }}
        showInteractive={false}
      />
      <MiniMap
        style={{
          background:   'rgba(10,10,20,0.9)',
          border:       '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
        }}
        nodeColor={n => {
          if (n.type === 'repoRoot')    return '#7c6fff';
          if (n.type === 'directory')   return '#22d3ee';
          if (n.type === 'file')        return RISK_COLORS[n.data?.riskLevel] || '#4a4b65';
          if (n.type === 'language')    return n.data?.color || '#3b82f6';
          if (n.type === 'pattern')     return n.data?.color || '#00ffa3';
          if (n.type === 'contributor') return '#ff9a3c';
          return '#4a4b65';
        }}
        maskColor="rgba(0,0,0,0.6)"
      />
    </ReactFlow>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function KnowledgeGraph({ data }) {
  const { knowledgeGraph } = data || {};
  if (!knowledgeGraph) return null;

  const { nodes: rawNodes, edges: rawEdges, stats } = knowledgeGraph;

  // ── Local state ───────────────────────────────────────────────────────────
  const [activeFilters, setActiveFilters] = useState(
    new Set(['file', 'directory', 'language', 'pattern', 'contributor'])
  );
  const [searchQuery,   setSearchQuery]   = useState('');
  const [selectedNode,  setSelectedNode]  = useState(null);
  const [expandedDirs,  setExpandedDirs]  = useState(new Set());
  const [localNodes,    setLocalNodes]    = useState(rawNodes);
  const [localEdges,    setLocalEdges]    = useState(rawEdges);
  const [isMinimized,   setIsMinimized]   = useState(false);

  // Circular deps
  const circularDeps = useMemo(() => detectCircularDeps(localNodes, localEdges), [localNodes, localEdges]);

  // ── Impact analysis for selected node ─────────────────────────────────────
  const impact = useMemo(() => {
    if (!selectedNode) return null;
    return computeImpactAnalysis(selectedNode.id, localNodes, localEdges);
  }, [selectedNode, localNodes, localEdges]);

  // ── Toggle filter ─────────────────────────────────────────────────────────
  const toggleFilter = useCallback((key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  }, []);

  // ── Expand/collapse directory node ────────────────────────────────────────
  const toggleDirectory = useCallback((dirNode) => {
    const dirId = dirNode.id;
    const isExpanding = !expandedDirs.has(dirId);

    setExpandedDirs(prev => {
      const next = new Set(prev);
      isExpanding ? next.add(dirId) : next.delete(dirId);
      return next;
    });

    setLocalNodes(prev => prev.map(n => {
      if (n.id === dirId) {
        return { ...n, data: { ...n.data, collapsed: !isExpanding } };
      }
      // Show/hide files belonging to this directory
      if (n.type === 'file' && n.data.parentDirId === dirId) {
        return { ...n, hidden: !isExpanding };
      }
      return n;
    }));

    setLocalEdges(prev => prev.map(e => {
      // Show/hide containment edges from this directory
      if (e.source === dirId && e.data?.edgeType === 'contains') {
        return { ...e, hidden: !isExpanding };
      }
      // Show/hide dependency edges between files in this dir
      const srcNode = localNodes.find(n => n.id === e.source);
      const tgtNode = localNodes.find(n => n.id === e.target);
      if (
        srcNode?.data?.parentDirId === dirId || tgtNode?.data?.parentDirId === dirId
      ) {
        if (e.data?.edgeType !== 'contains') {
          return { ...e, hidden: !isExpanding };
        }
      }
      return e;
    }));
  }, [expandedDirs, localNodes]);

  // ── Node click handler ────────────────────────────────────────────────────
  const handleNodeClick = useCallback((node) => {
    if (!node) { setSelectedNode(null); return; }

    // Directory: toggle expand on click
    if (node.type === 'directory') {
      toggleDirectory(node);
      setSelectedNode(node);
      return;
    }

    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, [toggleDirectory]);

  // ── Computed visible graph ────────────────────────────────────────────────
  const { visibleNodes, visibleEdges } = useMemo(() =>
    applyFilters(localNodes, localEdges, activeFilters, searchQuery),
    [localNodes, localEdges, activeFilters, searchQuery]
  );

  // Highlight selected node and its neighbors
  const highlightedNodes = useMemo(() => {
    if (!selectedNode) return visibleNodes;
    const neighborIds = new Set([selectedNode.id]);
    localEdges.forEach(e => {
      if (e.source === selectedNode.id) neighborIds.add(e.target);
      if (e.target === selectedNode.id) neighborIds.add(e.source);
    });
    return visibleNodes.map(n => ({
      ...n,
      style: neighborIds.has(n.id)
        ? { ...n.style, opacity: 1 }
        : { ...n.style, opacity: 0.35 },
      selected: n.id === selectedNode.id,
    }));
  }, [visibleNodes, selectedNode, localEdges]);

  const highlightedEdges = useMemo(() => {
    if (!selectedNode) return visibleEdges;
    return visibleEdges.map(e => ({
      ...e,
      style: (e.source === selectedNode.id || e.target === selectedNode.id)
        ? { ...e.style, opacity: 1, strokeWidth: 2.5 }
        : { ...e.style, opacity: 0.12 },
    }));
  }, [visibleEdges, selectedNode]);

  // ── Legend items ──────────────────────────────────────────────────────────
  const legendItems = [
    { color: RISK_COLORS.HIGH,   label: 'High Risk' },
    { color: RISK_COLORS.MEDIUM, label: 'Medium Risk' },
    { color: RISK_COLORS.LOW,    label: 'Low Risk' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
      style={{ marginBottom: 24, overflow: 'hidden' }}
    >
      {/* ── Panel Header ──────────────────────────────────────────────────── */}
      <div style={{
        padding:      '24px 28px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(124,111,255,0.2), rgba(34,211,238,0.15))',
            border:     '1px solid rgba(124,111,255,0.3)',
            display:    'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={18} color="var(--neon-cyan)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              Knowledge Graph
            </h3>
            <div style={{ fontSize: 11, color: '#4a4b65', marginTop: 2 }}>
              Structural dependency map · Click nodes to explore · Click directories to expand
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {circularDeps.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                borderRadius: 100, background: 'rgba(255,80,120,0.1)', border: '1px solid rgba(255,80,120,0.3)',
                fontSize: 11, fontWeight: 600, color: '#ff5078',
              }}>
                <AlertTriangle size={11} />
                {circularDeps.length} circular dep{circularDeps.length !== 1 ? 's' : ''}
              </div>
            )}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 100, background: 'rgba(0,255,163,0.07)', border: '1px solid rgba(0,255,163,0.2)',
              fontSize: 11, fontWeight: 600, color: '#00ffa3',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ffa3', boxShadow: '0 0 6px #00ffa3' }} />
              Structural Analysis
            </span>
            <button
              onClick={() => setIsMinimized(p => !p)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                color: '#8b8ca8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#f0f0ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8b8ca8'; }}
            >
              {isMinimized ? <Eye size={13} /> : <EyeOff size={13} />}
              {isMinimized ? 'Show' : 'Minimize'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar stats={stats} />
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div style={{
              padding:      '12px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display:      'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              {/* Search */}
              <div style={{
                display:    'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '7px 12px', flex: '1 1 200px', maxWidth: 280,
                transition: 'all 0.2s',
              }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,111,255,0.5)'}
                onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <Search size={13} color="#4a4b65" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search files, paths…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'none', border: 'none', outline: 'none', flex: 1,
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: '#f0f0ff', caretColor: '#7c6fff',
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4b65', display: 'flex', padding: 0 }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#4a4b65', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Filter size={11} /> Show:
                </span>
                {FILTER_DEFS.map(f => {
                  const active = activeFilters.has(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleFilter(f.key)}
                      style={{
                        display:      'flex', alignItems: 'center', gap: 5,
                        padding:      '5px 11px', borderRadius: 100, cursor: 'pointer',
                        fontSize:     11, fontWeight: 600,
                        background:   active ? f.color + '20' : 'rgba(255,255,255,0.03)',
                        border:       `1px solid ${active ? f.color + '55' : 'rgba(255,255,255,0.08)'}`,
                        color:        active ? f.color : '#4a4b65',
                        transition:   'all 0.2s',
                      }}
                    >
                      {f.icon} {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Risk legend */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                {legendItems.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: item.color, boxShadow: `0 0 5px ${item.color}`,
                    }} />
                    <span style={{ fontSize: 10, color: '#4a4b65', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Graph canvas ───────────────────────────────────────────── */}
            <div style={{ position: 'relative', height: 600 }}>
              <ReactFlow
                nodes={highlightedNodes}
                edges={highlightedEdges}
                nodeTypes={NODE_TYPES}
                onNodeClick={(_, node) => handleNodeClick(node)}
                onPaneClick={() => handleNodeClick(null)}
                fitView
                fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
                minZoom={0.05}
                maxZoom={4}
                defaultEdgeOptions={{
                  type:  'smoothstep',
                  style: { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1.5 },
                }}
                proOptions={{ hideAttribution: true }}
                style={{ background: 'transparent' }}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={28}
                  size={1}
                  color="rgba(255,255,255,0.04)"
                />
                <Controls
                  style={{
                    background:   'rgba(15,15,26,0.9)',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    boxShadow:    '0 4px 16px rgba(0,0,0,0.5)',
                    bottom:       60,
                    left:         16,
                  }}
                  showInteractive={false}
                />
                <MiniMap
                  style={{
                    background:   'rgba(10,10,20,0.92)',
                    border:       '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                  }}
                  nodeColor={n => {
                    if (n.type === 'repoRoot')    return '#7c6fff';
                    if (n.type === 'directory')   return '#22d3ee';
                    if (n.type === 'file')        return RISK_COLORS[n.data?.riskLevel] || '#4a4b65';
                    if (n.type === 'language')    return n.data?.color || '#3b82f6';
                    if (n.type === 'pattern')     return n.data?.color || '#00ffa3';
                    if (n.type === 'contributor') return '#ff9a3c';
                    return '#4a4b65';
                  }}
                  maskColor="rgba(0,0,0,0.65)"
                />

                {/* Circular deps notice */}
                {circularDeps.length > 0 && (
                  <Panel position="top-center">
                    <div style={{
                      background:   'rgba(255,80,120,0.12)', border: '1px solid rgba(255,80,120,0.35)',
                      borderRadius: 10, padding: '8px 14px', fontSize: 11, color: '#ff5078',
                      display:      'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                      backdropFilter: 'blur(12px)',
                    }}>
                      <AlertTriangle size={12} />
                      Circular dependency detected: {circularDeps[0].nodeA.split('/').pop()} ↔ {circularDeps[0].nodeB.split('/').pop()}
                      {circularDeps.length > 1 && ` (+${circularDeps.length - 1} more)`}
                    </div>
                  </Panel>
                )}

                {/* Empty state hint */}
                {highlightedNodes.filter(n => !n.hidden).length <= 1 && (
                  <Panel position="top-center">
                    <div style={{
                      background:   'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#8b8ca8',
                      display:      'flex', alignItems: 'center', gap: 6,
                      backdropFilter: 'blur(12px)',
                    }}>
                      <Info size={13} />
                      No nodes match the current filters or search. Try adjusting filters above.
                    </div>
                  </Panel>
                )}
              </ReactFlow>

              {/* Impact panel */}
              {selectedNode && impact && (
                <ImpactPanel impact={impact} onClose={() => setSelectedNode(null)} />
              )}
            </div>

            {/* ── Footer note ────────────────────────────────────────────── */}
            <div style={{
              padding:    '10px 28px',
              borderTop:  '1px solid rgba(255,255,255,0.05)',
              display:    'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap:   'wrap', gap: 8,
            }}>
              <div style={{ fontSize: 11, color: '#4a4b65', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={11} />
                Click directories to expand · Click files for impact analysis · Scroll to zoom · Drag to pan
              </div>
              {stats?.totalFileCount > 0 && stats?.fileCount < stats?.totalFileCount && (
                <div style={{ fontSize: 10, color: '#4a4b65' }}>
                  Showing {stats.fileCount} of {stats.totalFileCount} files (top by structural importance)
                </div>
              )}
              {stats && !stats.hasFullTree && (
                <div style={{ fontSize: 10, color: '#ff9a3c' }}>
                  ⚠️ File tree not available for this repo — showing high-level structure only
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
