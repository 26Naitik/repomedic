import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  FolderTree,
  Focus,
  GitBranch,
  Info,
  LayoutGrid,
  Layers3,
  Maximize2,
  Search,
  Sparkles,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";

import { NODE_TYPES } from "./nodeTypesMap";
import { computeImpactAnalysis, detectCircularDeps, RISK_COLORS } from "../../services/graphBuilder";

const GROUP_DEFS = [
  {
    key: "structure",
    label: "Structure",
    description: "Folders, files, and dependency paths",
    hint: "Best place to start",
    color: "#F4C542",
    icon: Layers3,
  },
  {
    key: "stack",
    label: "Stack",
    description: "Languages and runtime footprint",
    hint: "What the repo is built with",
    color: "#D4A514",
    icon: Braces,
  },
  {
    key: "architecture",
    label: "Architecture",
    description: "Patterns and system signals",
    hint: "How the repo is organized",
    color: "#C9A94A",
    icon: LayoutGrid,
  },
  {
    key: "contributors",
    label: "People",
    description: "Contributors and activity",
    hint: "Who keeps it moving",
    color: "#C98B2B",
    icon: Users,
  },
];

const GROUP_POSITIONS = {
  structure: { x: -300, y: 0 },
  stack: { x: 300, y: -160 },
  architecture: { x: 300, y: 160 },
  contributors: { x: 0, y: 330 },
};

const GROUP_KEY_BY_TYPE = {
  repoRoot: "structure",
  directory: "structure",
  file: "structure",
  language: "stack",
  pattern: "architecture",
  contributor: "contributors",
  cluster: "structure",
};

function getNodeLabel(node) {
  return node?.data?.label || node?.data?.repoName || node?.data?.name || node?.data?.login || node?.id || "";
}

function getNodeGroup(node) {
  return GROUP_KEY_BY_TYPE[node?.type] || "structure";
}

function getNodeSearchText(node) {
  const parts = [
    getNodeLabel(node),
    node?.data?.path,
    node?.data?.role,
    node?.data?.language,
    node?.data?.category,
    node?.type,
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function getNodeBreadcrumb(node) {
  if (!node) return [];

  if (node.type === "repoRoot") {
    return [{ id: node.id, label: "Overview" }];
  }

  if (node.type === "cluster") {
    return [
      { id: "root", label: "Overview" },
      { id: node.id, label: node.data?.label || "Cluster" },
    ];
  }

  if (node.type === "directory") {
    return [
      { id: "root", label: "Overview" },
      { id: node.id, label: "Structure" },
      { id: node.id, label: getNodeLabel(node) },
    ];
  }

  if (node.type === "file") {
    const dirLabel = node.data?.path ? node.data.path.split("/")[0] : "Structure";
    return [
      { id: "root", label: "Overview" },
      { id: "group-structure", label: "Structure" },
      { id: node.data?.parentDirId || node.id, label: `${dirLabel}/` },
      { id: node.id, label: getNodeLabel(node) },
    ];
  }

  if (node.type === "language") {
    return [
      { id: "root", label: "Overview" },
      { id: "group-stack", label: "Stack" },
      { id: node.id, label: getNodeLabel(node) },
    ];
  }

  if (node.type === "pattern") {
    return [
      { id: "root", label: "Overview" },
      { id: "group-architecture", label: "Architecture" },
      { id: node.id, label: getNodeLabel(node) },
    ];
  }

  if (node.type === "contributor") {
    return [
      { id: "root", label: "Overview" },
      { id: "group-contributors", label: "People" },
      { id: node.id, label: getNodeLabel(node) },
    ];
  }

  return [{ id: "root", label: "Overview" }, { id: node.id, label: getNodeLabel(node) }];
}

function buildAdjacency(edges) {
  const outgoing = new Map();
  const incoming = new Map();

  edges.forEach(edge => {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, new Set());
    if (!incoming.has(edge.target)) incoming.set(edge.target, new Set());
    outgoing.get(edge.source).add(edge.target);
    incoming.get(edge.target).add(edge.source);
  });

  return { outgoing, incoming };
}

function getFileChildren(rawNodes, dirNodeId) {
  return rawNodes.filter(node => node.type === "file" && node.data?.parentDirId === dirNodeId);
}

function createClusterNode(group, count, accent, selected, expanded) {
  const Icon = group.icon;
  return {
    id: `group-${group.key}`,
    type: "cluster",
    position: GROUP_POSITIONS[group.key],
    data: {
      groupKey: group.key,
      label: group.label,
      description: group.description,
      hint: group.hint,
      count,
      accent,
      icon: Icon,
      expanded,
      summary: group.description,
    },
    selected,
  };
}

function getGroupCount(groupKey, groupCounts) {
  if (groupKey === "structure") return groupCounts.structure.directories + groupCounts.structure.files;
  if (groupKey === "stack") return groupCounts.stack.languages;
  if (groupKey === "architecture") return groupCounts.architecture.patterns;
  if (groupKey === "contributors") return groupCounts.contributors.people;
  return 0;
}

function buildGraphView({
  rawNodes,
  rawEdges,
  collapsedGroups,
  expandedDirectories,
  searchQuery,
  selectedNodeId,
  hoveredNodeId,
}) {
  const query = searchQuery.trim().toLowerCase();
  const nodeById = new Map(rawNodes.map(node => [node.id, node]));
  const adjacency = buildAdjacency(rawEdges);

  const groupCounts = {
    structure: {
      directories: rawNodes.filter(node => node.type === "directory").length,
      files: rawNodes.filter(node => node.type === "file").length,
    },
    stack: {
      languages: rawNodes.filter(node => node.type === "language").length,
    },
    architecture: {
      patterns: rawNodes.filter(node => node.type === "pattern").length,
    },
    contributors: {
      people: rawNodes.filter(node => node.type === "contributor").length,
    },
  };

  const matchedNodeIds = new Set();
  if (query) {
    rawNodes.forEach(node => {
      if (getNodeSearchText(node).includes(query)) {
        matchedNodeIds.add(node.id);
      }
    });
  }

  const searchMode = query.length > 0;
  const searchVisibleIds = new Set(["root"]);

  if (searchMode) {
    matchedNodeIds.forEach(nodeId => {
      const node = nodeById.get(nodeId);
      if (!node) return;

      searchVisibleIds.add(nodeId);

      if (node.type === "file") {
        if (node.data?.parentDirId) searchVisibleIds.add(node.data.parentDirId);
        const parentDir = nodeById.get(node.data?.parentDirId);
        if (parentDir) searchVisibleIds.add(parentDir.id);
      }

      if (node.type === "directory") {
        getFileChildren(rawNodes, node.id).forEach(fileNode => searchVisibleIds.add(fileNode.id));
      }

      const sourceNeighbors = adjacency.outgoing.get(nodeId) || new Set();
      const targetNeighbors = adjacency.incoming.get(nodeId) || new Set();
      sourceNeighbors.forEach(id => searchVisibleIds.add(id));
      targetNeighbors.forEach(id => searchVisibleIds.add(id));
    });
  }

  const visibleNodeIds = new Set(["root"]);
  const visibleEdges = [];
  const visibleNodes = [];

  if (searchMode) {
    rawNodes.forEach(node => {
      if (!searchVisibleIds.has(node.id)) return;
      visibleNodeIds.add(node.id);
    });
  } else {
    rawNodes.forEach(node => {
      if (node.id === "root") return;
      const groupKey = getNodeGroup(node);
      if (groupKey === "structure") {
        if (node.type === "directory") {
          if (!collapsedGroups.has("structure")) visibleNodeIds.add(node.id);
          return;
        }

        if (node.type === "file") {
          const parentDirId = node.data?.parentDirId;
          const dirExpanded = parentDirId ? expandedDirectories.has(parentDirId) : false;
          const selectedFile = node.id === selectedNodeId;
          const hoveredFile = node.id === hoveredNodeId;
          if (!collapsedGroups.has("structure") && (dirExpanded || selectedFile || hoveredFile)) {
            visibleNodeIds.add(node.id);
          }
          return;
        }
      }

      if (!collapsedGroups.has(groupKey)) {
        visibleNodeIds.add(node.id);
      }
    });
  }

  const baseNodes = rawNodes
    .filter(node => node.id === "root" || visibleNodeIds.has(node.id))
    .map(node => ({ ...node }));

  const selectedNode = nodeById.get(selectedNodeId) || nodeById.get("root") || null;
  const activeNode = hoveredNodeId ? nodeById.get(hoveredNodeId) : selectedNode;

  const focusIds = new Set();
  if (activeNode) {
    focusIds.add(activeNode.id);
    const outgoing = adjacency.outgoing.get(activeNode.id) || new Set();
    const incoming = adjacency.incoming.get(activeNode.id) || new Set();
    outgoing.forEach(id => focusIds.add(id));
    incoming.forEach(id => focusIds.add(id));

    if (activeNode.type === "file" && activeNode.data?.parentDirId) {
      focusIds.add(activeNode.data.parentDirId);
      focusIds.add("root");
    }

    if (activeNode.type === "directory") {
      focusIds.add("root");
      getFileChildren(rawNodes, activeNode.id).forEach(fileNode => focusIds.add(fileNode.id));
    }
  }

  const selectedPathIds = new Set();
  if (selectedNode) {
    getNodeBreadcrumb(selectedNode).forEach(item => selectedPathIds.add(item.id));
    if (selectedNode.type === "file") {
      selectedPathIds.add("root");
      if (selectedNode.data?.parentDirId) selectedPathIds.add(selectedNode.data.parentDirId);
    }
    if (selectedNode.type === "directory") {
      selectedPathIds.add("root");
    }
  }

  const nodeStyles = new Map();
  baseNodes.forEach(node => {
    const isFocused = focusIds.size === 0 || focusIds.has(node.id);
    const isPath = selectedPathIds.has(node.id);
    const isSelected = node.id === selectedNodeId;
    const isDimmed = !isFocused && focusIds.size > 0 && !searchMode;

    nodeStyles.set(node.id, {
      opacity: isDimmed ? 0.16 : searchMode ? 0.92 : 1,
      transform: isSelected || isPath ? "scale(1.015)" : "scale(1)",
      filter: isDimmed ? "saturate(0.65) blur(0.2px)" : "none",
      zIndex: isSelected || isPath ? 10 : 1,
    });
  });

  const finalNodes = baseNodes.map(node => ({
    ...node,
    selected: node.id === selectedNodeId,
    style: {
      ...(node.style || {}),
      ...nodeStyles.get(node.id),
    },
  }));

  if (!searchMode) {
    GROUP_DEFS.forEach(group => {
      const count = getGroupCount(group.key, groupCounts);
      if (count > 0 && collapsedGroups.has(group.key)) {
        const summaryNode = createClusterNode(
          group,
          count,
          group.color,
          selectedNodeId === `group-${group.key}`,
          false
        );
        summaryNode.style = {
          opacity: focusIds.size > 0 && !focusIds.has(summaryNode.id) && !focusIds.has("root") ? 0.42 : 1,
        };
        finalNodes.push(summaryNode);
        visibleNodeIds.add(summaryNode.id);
      }
    });
  }

  const summaryEdges = [];
  if (!searchMode) {
    GROUP_DEFS.forEach(group => {
      const count = getGroupCount(group.key, groupCounts);
      if (count > 0 && collapsedGroups.has(group.key)) {
        summaryEdges.push({
          id: `e-root-group-${group.key}`,
          source: "root",
          target: `group-${group.key}`,
          type: "smoothstep",
          data: { edgeType: "summary" },
          style: {
            stroke: `${group.color}66`,
            strokeWidth: 1.5,
            strokeDasharray: "6 5",
            opacity: 0.85,
          },
          markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: `${group.color}99` },
        });
      }
    });
  }

  rawEdges.forEach(edge => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);
    const edgeVisible = sourceVisible && targetVisible;

    if (!edgeVisible) return;

    const isPath = selectedPathIds.has(edge.source) && selectedPathIds.has(edge.target);
    const isFocusEdge = focusIds.has(edge.source) || focusIds.has(edge.target);
    const edgeType = edge.data?.edgeType;
    const edgeColor = edge.style?.stroke || "rgba(255,255,255,0.16)";

    visibleEdges.push({
      ...edge,
      animated: isPath || (edgeType === "depends-on" && isFocusEdge),
      style: {
        ...(edge.style || {}),
        opacity: searchMode ? 0.85 : isFocusEdge || isPath ? 1 : 0.18,
        strokeWidth: isPath ? 2.6 : isFocusEdge ? 2 : 1.35,
        stroke: isPath ? edgeColor : edge.style?.stroke || edgeColor,
      },
      markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, width: 10, height: 10, color: edgeColor },
    });
  });

  summaryEdges.forEach(edge => visibleEdges.unshift(edge));

  const layoutKey = [
    Array.from(collapsedGroups).sort().join(","),
    Array.from(expandedDirectories).sort().join(","),
    query,
    visibleNodes.length,
    visibleEdges.length,
  ].join("|");

  const selectedNodeFinal = nodeById.get(selectedNodeId) || nodeById.get("root") || null;

  return {
    nodes: finalNodes,
    edges: visibleEdges,
    nodeById,
    selectedNode: selectedNodeFinal,
    activeNode,
    layoutKey,
    groupCounts,
    searchMode,
    matchedCount: matchedNodeIds.size,
    searchVisibleIds,
    visibleCount: finalNodes.filter(node => !node.hidden).length,
  };
}

function GroupChip({ group, expanded, count, onToggle, searchActive, searchMatch }) {
  const Icon = group.icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 16,
        border: `1px solid ${expanded ? `${group.color}50` : "rgba(255,255,255,0.08)"}`,
        background: expanded ? `${group.color}14` : "rgba(255,255,255,0.03)",
        color: expanded || searchMatch ? group.color : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: expanded ? `0 0 24px ${group.color}12` : "none",
      }}
    >
      <Icon size={14} />
      <span style={{ fontSize: 12, fontWeight: 700 }}>{group.label}</span>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 999,
        background: expanded ? `${group.color}18` : "rgba(255,255,255,0.05)",
        color: expanded || searchMatch ? group.color : "var(--text-muted)",
      }}>
        {count}
      </span>
      <span style={{ fontSize: 10, opacity: 0.85 }}>
        {searchActive && searchMatch ? "match" : expanded ? "open" : "closed"}
      </span>
    </button>
  );
}

function GraphCanvas({ graphState, onNodeClick, onNodeHover, onNodeLeave, onRegisterApi, onPaneClick }) {
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();
  const fitRef = useRef(false);

  useEffect(() => {
    onRegisterApi?.({ fitView, zoomIn, zoomOut, setViewport });
  }, [fitView, zoomIn, zoomOut, setViewport, onRegisterApi]);

  useEffect(() => {
    if (graphState.nodes.length === 0 || fitRef.current) return;
    fitRef.current = true;
    fitView({ padding: 0.18, maxZoom: 1.45, duration: 300 });
  }, [fitView, graphState.layoutKey, graphState.nodes.length]);

  useEffect(() => {
    if (!graphState.layoutKey) return;
    fitView({ padding: 0.18, maxZoom: 1.5, duration: 220 });
  }, [fitView, graphState.layoutKey]);

  return (
    <ReactFlow
      nodes={graphState.nodes}
      edges={graphState.edges}
      nodeTypes={{ ...NODE_TYPES, cluster: ClusterNode }}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={(_, node) => onNodeHover(node)}
      onNodeMouseLeave={onNodeLeave}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.18, maxZoom: 1.5 }}
      minZoom={0.08}
      maxZoom={2.8}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnDoubleClick={false}
      panOnScroll
      panOnDrag
      onlyRenderVisibleElements
      defaultEdgeOptions={{
        type: "smoothstep",
        style: { stroke: "rgba(255,255,255,0.16)", strokeWidth: 1.35 },
      }}
      proOptions={{ hideAttribution: true }}
      style={{ background: "transparent" }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="rgba(244,197,66,0.05)"
      />
      <Controls
        showInteractive={false}
        style={{
          background: "rgba(17,17,17,0.9)",
          border: "1px solid rgba(244,197,66,0.12)",
          borderRadius: 14,
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        }}
      />
      <MiniMap
        zoomable
        pannable
        style={{
          background: "rgba(17,17,17,0.92)",
          border: "1px solid rgba(244,197,66,0.12)",
          borderRadius: 14,
        }}
        nodeColor={node => {
          if (node.type === "repoRoot") return "#F4C542";
          if (node.type === "cluster") return node.data?.accent || "#F4C542";
          if (node.type === "directory") return "#C9A94A";
          if (node.type === "file") return RISK_COLORS[node.data?.riskLevel] || "#4a4b65";
          if (node.type === "language") return node.data?.color || "#D4A514";
          if (node.type === "pattern") return node.data?.color || "#8EA06D";
          if (node.type === "contributor") return "#C98B2B";
          return "#4a4b65";
        }}
        maskColor="rgba(0,0,0,0.55)"
      />
      {graphState.searchMode && graphState.matchedCount === 0 && (
        <Panel position="top-center">
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 999,
            background: "rgba(201,139,43,0.09)",
            border: "1px solid rgba(201,139,43,0.22)",
            color: "#C98B2B",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
            fontSize: 12,
            fontWeight: 600,
          }}>
            <Info size={13} />
            No matches found. Try a directory, file name, language, or contributor.
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}

function ClusterNode({ data, selected }) {
  const Icon = data.icon || Layers3;
  return (
    <div style={{
      minWidth: 220,
      maxWidth: 250,
      padding: "18px 18px 16px",
      borderRadius: 22,
      background: selected
        ? `linear-gradient(160deg, ${data.accent}18 0%, rgba(17,17,17,0.9) 100%)`
        : "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      border: `1px solid ${selected ? `${data.accent}55` : "rgba(244,197,66,0.1)"}`,
      boxShadow: selected ? `0 18px 34px rgba(0,0,0,0.36)` : "0 18px 34px rgba(0,0,0,0.32)",
      backdropFilter: "blur(24px)",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s ease",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 20% 15%, ${data.accent}14 0%, transparent 35%)`,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${data.accent}14`,
            border: `1px solid ${data.accent}30`,
            color: data.accent,
            flexShrink: 0,
          }}>
            <Icon size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-head)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}>
              {data.label}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.35 }}>
              {data.description}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontFamily: "var(--font-head)",
            fontSize: 24,
            fontWeight: 800,
            color: data.accent,
            lineHeight: 1,
          }}>
            {data.count}
          </div>
          <div style={{ fontSize: 10, color: data.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
            nodes
          </div>
        </div>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 14,
        color: data.accent,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        position: "relative",
      }}>
        <ChevronRight size={12} />
        {selected ? "Selected" : data.expanded ? "Expanded" : data.hint}
      </div>
    </div>
  );
}

function NodeDetailsPanel({
  selectedNode,
  knowledgeGraph,
  impact,
  onSelectNode,
  onToggleGroup,
  onExpandAll,
  onCollapseAll,
  onFitView,
}) {
  const isRoot = selectedNode?.type === "repoRoot";
  const isFile = selectedNode?.type === "file";
  const isDirectory = selectedNode?.type === "directory";
  const isCluster = selectedNode?.type === "cluster";

  const breadcrumb = getNodeBreadcrumb(selectedNode);

  const relatedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const edges = knowledgeGraph?.edges || [];
    const nodes = knowledgeGraph?.nodes || [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    if (selectedNode.type === "repoRoot") {
      return GROUP_DEFS.map(group => ({
        id: `group-${group.key}`,
        label: group.label,
        meta: group.description,
      }));
    }

    if (selectedNode.type === "cluster") {
      const groupKey = selectedNode.data?.groupKey;
      const members = nodes.filter(node => getNodeGroup(node) === groupKey && node.id !== "root");
      return members.slice(0, 6).map(node => ({
        id: node.id,
        label: getNodeLabel(node),
        meta: node.data?.path || node.data?.language || node.data?.role || node.type,
      }));
    }

    if (isFile && impact) {
      const dependents = impact.dependents.slice(0, 4).map(item => ({ id: item.id, label: item.label, meta: item.type }));
      const dependencies = impact.dependencies.slice(0, 4).map(item => ({ id: item.id, label: item.label, meta: item.type }));
      return [...dependents, ...dependencies];
    }

    const connected = [];
    edges.forEach(edge => {
      if (edge.source === selectedNode.id) {
        const node = nodeMap.get(edge.target);
        if (node) connected.push({ id: node.id, label: getNodeLabel(node), meta: edge.data?.edgeType || node.type });
      }
      if (edge.target === selectedNode.id) {
        const node = nodeMap.get(edge.source);
        if (node) connected.push({ id: node.id, label: getNodeLabel(node), meta: edge.data?.edgeType || node.type });
      }
    });
    return connected.slice(0, 6);
  }, [impact, isFile, knowledgeGraph?.edges, knowledgeGraph?.nodes, selectedNode]);

  const rootSummary = knowledgeGraph?.stats || {};
  const summaryCards = [
    { label: "Nodes", value: rootSummary.totalNodes || 0, color: "#F4C542" },
    { label: "Edges", value: rootSummary.totalEdges || 0, color: "#C9A94A" },
    { label: "Files", value: rootSummary.fileCount || 0, color: "#D4A514" },
    { label: "Risk", value: rootSummary.riskDistribution?.HIGH || 0, color: "#B85C5C" },
  ];

  const typeLabel = isRoot
    ? "Overview"
    : isCluster
      ? selectedNode.data?.label
      : isDirectory
        ? "Directory"
        : isFile
          ? "File"
          : selectedNode?.type || "Node";

  const subtitle = isRoot
    ? knowledgeGraph?.repoName || "Repository overview"
    : isCluster
      ? selectedNode.data?.description
      : selectedNode?.data?.path || selectedNode?.data?.language || selectedNode?.data?.role || "Graph node";

  return (
    <div style={{
      flex: "0 0 360px",
      minWidth: 0,
      borderLeft: "1px solid rgba(244,197,66,0.12)",
      background: "linear-gradient(180deg, rgba(17,17,17,0.92) 0%, rgba(10,10,10,0.97) 100%)",
      backdropFilter: "blur(24px)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        padding: 20,
        borderBottom: "1px solid rgba(244,197,66,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: "rgba(17,17,17,0.92)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 999,
              background: isRoot ? "rgba(244,197,66,0.12)" : isCluster ? `${selectedNode?.data?.accent || "#F4C542"}16` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isRoot ? "rgba(244,197,66,0.26)" : isCluster ? `${selectedNode?.data?.accent || "#F4C542"}30` : "rgba(244,197,66,0.09)"}`,
              color: isRoot ? "#F4C542" : isCluster ? selectedNode?.data?.accent || "#F4C542" : "var(--text-secondary)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {typeLabel}
            </div>
            <h3 style={{
              margin: "12px 0 4px",
              fontFamily: "var(--font-head)",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}>
              {isRoot ? knowledgeGraph?.repoName || "RepoMedic Knowledge Graph" : getNodeLabel(selectedNode)}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {subtitle}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onFitView}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(244,197,66,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Fit graph"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={onCollapseAll}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Collapse all groups"
            >
              <EyeOff size={14} />
            </button>
          </div>
        </div>

        {breadcrumb.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
            {breadcrumb.map((crumb, index) => (
              <button
                key={`${crumb.id}-${index}`}
                type="button"
                onClick={() => onSelectNode?.(crumb.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: index === breadcrumb.length - 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  color: index === breadcrumb.length - 1 ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {crumb.label}
                {index < breadcrumb.length - 1 && <ArrowRight size={10} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, maxHeight: "calc(100% - 100px)", overflowY: "auto" }}>
        {isRoot && (
          <div style={{
            padding: 16,
            borderRadius: 18,
            background: "linear-gradient(135deg, rgba(244,197,66,0.1), rgba(201,169,74,0.06))",
            border: "1px solid rgba(244,197,66,0.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Sparkles size={14} color="#F4C542" />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F4C542" }}>
                Guided starting point
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              The graph is collapsed into four clear clusters by default. Open a cluster to reveal its contents, or use search to jump straight to a file, language, or contributor.
            </div>
          </div>
        )}

        {isFile && impact && (
          <div style={{
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(244,197,66,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C98B2B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Impact
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#C98B2B", fontWeight: 700 }}>
                {impact.couplingScore}/100
              </div>
            </div>
              <div style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              marginBottom: 8,
            }}>
              <div style={{
                width: `${impact.couplingScore}%`,
                height: "100%",
                borderRadius: 999,
                background: impact.couplingScore >= 60 ? "#B85C5C" : impact.couplingScore >= 30 ? "#C98B2B" : "#8EA06D",
              }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {impact.impactPrediction}
            </div>
          </div>
        )}

        {selectedNode?.type === "directory" && (
          <div style={{
            padding: 16,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C9A94A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Directory focus
              </div>
              <button
                type="button"
                onClick={() => onToggleGroup?.("structure")}
                style={{
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-secondary)",
                  borderRadius: 10,
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FolderTree size={13} />
                Toggle structure
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Expand this folder to reveal its files. The graph intentionally hides file detail until you ask for it, which keeps large repos readable.
            </div>
          </div>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Related nodes
            </div>
            <button
              type="button"
              onClick={onExpandAll}
              style={{
                border: "none",
                background: "none",
                color: "#F4C542",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Expand all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedNodes.length === 0 ? (
              <div style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--text-secondary)",
                fontSize: 12,
              }}>
                No related nodes visible in the current graph state.
              </div>
            ) : relatedNodes.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNode?.(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "11px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.meta}
                  </div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Graph summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {summaryCards.map(card => (
              <div key={card.label} style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800, color: card.color }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onExpandAll}
            style={{
              flex: "1 1 140px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(244,197,66,0.22)",
              background: "rgba(244,197,66,0.10)",
              color: "#F4C542",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Eye size={14} />
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            style={{
              flex: "1 1 140px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <EyeOff size={14} />
            Collapse all
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeGraphPremium({ data }) {
  const knowledgeGraph = data?.knowledgeGraph;
  const graphApiRef = useRef(null);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set(GROUP_DEFS.map(group => group.key)));
  const [expandedDirectories, setExpandedDirectories] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("repomedic-kg-guide-dismissed") !== "1";
  });
  const deferredQuery = useDeferredValue(searchQuery);

  const graphState = useMemo(() => {
    if (!knowledgeGraph) return null;
    return buildGraphView({
      rawNodes: knowledgeGraph.nodes || [],
      rawEdges: knowledgeGraph.edges || [],
      stats: knowledgeGraph.stats || {},
      collapsedGroups,
      expandedDirectories,
      searchQuery: deferredQuery,
      selectedNodeId,
      hoveredNodeId: hoveredNode?.id || null,
    });
  }, [knowledgeGraph, collapsedGroups, expandedDirectories, deferredQuery, selectedNodeId, hoveredNode?.id]);

  const activeNode = graphState?.nodeById.get(selectedNodeId) || graphState?.selectedNode || null;
  const impact = useMemo(() => {
    if (!knowledgeGraph || !activeNode || activeNode.type !== "file") return null;
    return computeImpactAnalysis(activeNode.id, knowledgeGraph.nodes || [], knowledgeGraph.edges || []);
  }, [activeNode, knowledgeGraph]);

  const circularDeps = useMemo(() => {
    if (!knowledgeGraph) return [];
    return detectCircularDeps(knowledgeGraph.nodes || [], knowledgeGraph.edges || []);
  }, [knowledgeGraph]);

  const searchStats = useMemo(() => {
    const query = deferredQuery.trim();
    if (!query) return null;
    return {
      matches: graphState?.matchedCount || 0,
      visible: graphState?.visibleCount || 0,
    };
  }, [deferredQuery, graphState?.matchedCount, graphState?.visibleCount]);

  const setGraphApi = useCallback(api => {
    graphApiRef.current = api;
  }, []);

  const fitGraph = useCallback(() => {
    graphApiRef.current?.fitView?.({ padding: 0.18, maxZoom: 1.5, duration: 260 });
  }, []);

  const layoutKey = graphState?.layoutKey;

  useEffect(() => {
    if (!layoutKey || !graphApiRef.current?.fitView) return;
    graphApiRef.current.fitView({ padding: 0.18, maxZoom: 1.5, duration: 220 });
  }, [layoutKey]);

  const toggleGroup = useCallback((groupKey) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const toggleDirectory = useCallback((dirNode) => {
    setExpandedDirectories(prev => {
      const next = new Set(prev);
      if (next.has(dirNode.id)) next.delete(dirNode.id);
      else next.add(dirNode.id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedGroups(new Set());
    setExpandedDirectories(new Set((knowledgeGraph?.nodes || []).filter(node => node.type === "directory").map(node => node.id)));
  }, [knowledgeGraph?.nodes]);

  const collapseAll = useCallback(() => {
    setCollapsedGroups(new Set(GROUP_DEFS.map(group => group.key)));
    setExpandedDirectories(new Set());
  }, []);

  const resetSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId("root");
    setHoveredNode(null);
  }, []);

  const handleNodeClick = useCallback((_, node) => {
    if (!node) return;

    if (node.type === "cluster") {
      toggleGroup(node.data?.groupKey);
      setSelectedNodeId(node.id);
      return;
    }

    if (node.type === "directory") {
      toggleDirectory(node);
      setSelectedNodeId(node.id);
      return;
    }

    if (node.type === "repoRoot") {
      setSelectedNodeId(node.id);
      return;
    }

    setSelectedNodeId(node.id);
  }, [toggleDirectory, toggleGroup]);

  const handleHover = useCallback((node) => {
    setHoveredNode(node || null);
  }, []);

  if (!knowledgeGraph || !graphState) return null;

  const groupMatchSet = new Set();
  if (searchQuery.trim()) {
    graphState.searchVisibleIds.forEach(nodeId => {
      const node = graphState.nodeById.get(nodeId);
      if (node) groupMatchSet.add(getNodeGroup(node));
    });
  }

  const graphIntro = circularDeps.length > 0
    ? `${circularDeps.length} circular dependency${circularDeps.length !== 1 ? "ies" : ""} detected`
    : "Smoothly clustered overview with progressive disclosure";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card"
      style={{
        marginBottom: 24,
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
      }}
    >
      <div style={{
        padding: "22px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(135deg, rgba(244,197,66,0.08), rgba(201,169,74,0.04))",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(244,197,66,0.22), rgba(201,169,74,0.16))",
                border: "1px solid rgba(244,197,66,0.22)",
                color: "#C9A94A",
                flexShrink: 0,
              }}>
                <GitBranch size={18} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.15 }}>
                  Knowledge Graph
                </h3>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  {graphIntro}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(142,160,109,0.07)",
                border: "1px solid rgba(142,160,109,0.16)",
                color: "#00ffa3",
                fontSize: 12,
                fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ffa3", boxShadow: "0 0 8px #00ffa3" }} />
                Live structural map
              </div>
              {circularDeps.length > 0 && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(184,92,92,0.08)",
                  border: "1px solid rgba(184,92,92,0.22)",
                  color: "#B85C5C",
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  <AlertTriangle size={12} />
                  {circularDeps.length} circular dependency{circularDeps.length !== 1 ? "ies" : ""}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(72px, 1fr))", gap: 10, minWidth: 280 }}>
            {[
              { label: "Nodes", value: knowledgeGraph.stats?.totalNodes || 0, color: "#F4C542" },
              { label: "Edges", value: knowledgeGraph.stats?.totalEdges || 0, color: "#C9A94A" },
              { label: "Files", value: knowledgeGraph.stats?.fileCount || 0, color: "#D4A514" },
              { label: "Risk", value: knowledgeGraph.stats?.riskDistribution?.HIGH || 0, color: "#B85C5C" },
            ].map(item => (
              <div key={item.label} style={{
                padding: "12px 10px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: item.color, lineHeight: 1.1 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        padding: 16,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: "1 1 280px",
            padding: "10px 12px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search files, folders, languages, people..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={resetSearch}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fitGraph}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Focus size={14} />
            Fit view
          </button>
          <button
            type="button"
            onClick={expandAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(244,197,66,0.22)",
              background: "rgba(244,197,66,0.10)",
              color: "#F4C542",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Eye size={14} />
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <EyeOff size={14} />
            Collapse all
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
            <Filter size={14} />
            Clusters
          </div>
          {GROUP_DEFS.map(group => {
            const expanded = !collapsedGroups.has(group.key);
            const count = group.key === "structure"
              ? (graphState.groupCounts.structure.directories + graphState.groupCounts.structure.files)
              : group.key === "stack"
                ? graphState.groupCounts.stack.languages
                : group.key === "architecture"
                  ? graphState.groupCounts.architecture.patterns
                  : graphState.groupCounts.contributors.people;
            const searchMatch = groupMatchSet.has(group.key);
            return (
              <GroupChip
                key={group.key}
                group={group}
                expanded={expanded}
                count={count}
                searchActive={graphState.searchMode}
                searchMatch={searchMatch}
                onToggle={() => toggleGroup(group.key)}
              />
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap", minHeight: 620 }}>
        <div style={{
          flex: "1 1 640px",
          minWidth: 0,
          position: "relative",
          height: 620,
          background: "radial-gradient(circle at 20% 20%, rgba(244,197,66,0.08), transparent 28%), radial-gradient(circle at 80% 20%, rgba(201,169,74,0.06), transparent 24%), linear-gradient(180deg, rgba(10,10,10,0.92), rgba(8,8,8,0.96))",
        }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <ReactFlowProvider>
              <GraphCanvas
                graphState={graphState}
                onNodeClick={handleNodeClick}
                onNodeHover={handleHover}
                onNodeLeave={() => handleHover(null)}
                onRegisterApi={setGraphApi}
                onPaneClick={handlePaneClick}
              />
            </ReactFlowProvider>
          </div>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  left: 16,
                  top: 16,
                  zIndex: 8,
                  width: 280,
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(10,10,18,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 18px 34px rgba(0,0,0,0.32)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Info size={14} color="#C9A94A" />
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                      Quick guide
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuide(false);
                      window.localStorage.setItem("repomedic-kg-guide-dismissed", "1");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: "grid", gap: 8, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  <div>1. Open a cluster to reveal its nodes.</div>
                  <div>2. Search narrows the graph to relevant context.</div>
                  <div>3. Hover nodes to highlight relationships instantly.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NodeDetailsPanel
          selectedNode={activeNode}
          knowledgeGraph={knowledgeGraph}
          impact={impact}
          onSelectNode={setSelectedNodeId}
          onToggleGroup={toggleGroup}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onFitView={fitGraph}
        />
      </div>

      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        color: "var(--text-secondary)",
        fontSize: 11,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={12} />
          Hover to preview relationships · Click a cluster to expand it · Use search to jump directly
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {searchStats && (
            <span>
              {searchStats.matches} match{searchStats.matches !== 1 ? "es" : ""} · {searchStats.visible} visible nodes
            </span>
          )}
          {knowledgeGraph.stats?.hasFullTree ? null : (
            <span style={{ color: "#C98B2B" }}>
              File tree is partial for this repo, so the graph is intentionally summarized.
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
}
