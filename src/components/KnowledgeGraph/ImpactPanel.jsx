/**
 * ImpactPanel — Side panel showing detailed impact analysis for a selected graph node.
 * Slides in from the right when a node is clicked.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownLeft, GitMerge, Zap,
  Code2, Layers, Link,
} from 'lucide-react';
import { RISK_COLORS, ROLE_COLORS } from '../../services/graphBuilder';

const ROLE_LABELS = {
  component: 'UI Component',
  service:   'Service',
  hook:      'Hook',
  model:     'Data Model',
  utility:   'Utility',
  test:      'Test File',
  config:    'Configuration',
  index:     'Barrel Index',
  style:     'Stylesheet',
  doc:       'Documentation',
  state:     'State Management',
  module:    'Module',
  file:      'File',
  directory: 'Directory',
  language:  'Language',
  pattern:   'Pattern',
  contributor: 'Contributor',
  repoRoot:  'Repository Root',
};

function RiskBadge({ level }) {
  const color = RISK_COLORS[level] || RISK_COLORS.UNKNOWN;
  const icons = {
    HIGH:    <AlertTriangle size={12} />,
    MEDIUM:  <AlertCircle size={12} />,
    LOW:     <CheckCircle2 size={12} />,
    UNKNOWN: <Layers size={12} />,
  };
  return (
    <span style={{
      display:    'inline-flex', alignItems: 'center', gap: 4,
      padding:    '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
      background: color + '18', border: `1px solid ${color}45`, color,
    }}>
      {icons[level]}
      {level} RISK
    </span>
  );
}

function CouplingMeter({ score, label }) {
  const color = score >= 60 ? '#ff5078' : score >= 30 ? '#ff9a3c' : '#00ffa3';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#8b8ca8', fontWeight: 600 }}>Coupling Score</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
          {score}/100
        </span>
      </div>
      <div style={{
        width: '100%', height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 100, overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 100 }}
        />
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}

function DependencyList({ items, title, icon, emptyText, color }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: 8,
      }}>
        {icon} {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <div style={{
          fontSize: 12, color: '#4a4b65', padding: '8px 12px',
          background: 'rgba(255,255,255,0.02)', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.slice(0, 8).map((dep, i) => (
            <motion.div
              key={dep.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display:    'flex', alignItems: 'center', gap: 8,
                padding:    '7px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                fontSize:   11,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{
                fontFamily:  'var(--font-mono)', color: '#d0d0f0', flex: 1,
                overflow:    'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize:    10,
              }}>
                {dep.label.split('/').pop()}
              </span>
              <span style={{
                fontSize: 9, color: '#4a4b65', background: 'rgba(255,255,255,0.04)',
                padding: '1px 5px', borderRadius: 4, flexShrink: 0,
              }}>
                {dep.type}
              </span>
            </motion.div>
          ))}
          {items.length > 8 && (
            <div style={{ fontSize: 10, color: '#4a4b65', textAlign: 'center', padding: '4px 0' }}>
              + {items.length - 8} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImpactPanel({ impact, onClose }) {
  if (!impact) return null;

  const { node, dependents, dependencies, riskLevel, role, impactPrediction, couplingScore, couplingLabel } = impact;

  const nodeLabel  = node.data.label || node.data.repoName || node.data.name || node.data.login || node.id;
  const roleLabel  = ROLE_LABELS[node.type === 'file' ? role : node.type] || 'Node';
  const roleColor  = node.type === 'file' ? (ROLE_COLORS[role] || '#7c6fff') : '#7c6fff';

  const isFileNode = node.type === 'file';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        style={{
          position:   'absolute', top: 0, right: 0, bottom: 0,
          width:      360, zIndex: 20,
          background: 'rgba(10,10,20,0.95)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          overflowY:  'auto',
          display:    'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding:      '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position:     'sticky', top: 0, zIndex: 1,
          background:   'rgba(10,10,20,0.98)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: roleColor, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
                {roleLabel}
              </div>
              <div style={{
                fontFamily:  'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color:       '#f0f0ff', wordBreak: 'break-all', lineHeight: 1.4,
              }}>
                {nodeLabel}
              </div>
              {node.data.path && node.data.path !== nodeLabel && (
                <div style={{ fontSize: 9, color: '#4a4b65', marginTop: 3, wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {node.data.path}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#8b8ca8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f0f0ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8b8ca8'; }}
            >
              <X size={14} />
            </button>
          </div>

          {isFileNode && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <RiskBadge level={riskLevel} />
              {node.data.language && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6',
                }}>
                  <Code2 size={11} /> {node.data.language}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Coupling meter — file nodes only */}
          {isFileNode && (
            <CouplingMeter score={couplingScore} label={couplingLabel} />
          )}

          {/* Impact prediction */}
          {isFileNode && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: '#ff9a3c',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
              }}>
                <Zap size={12} /> AI Impact Prediction
              </div>
              <div style={{
                fontSize:   12.5, color: '#a0a0c0', lineHeight: 1.7,
                padding:    '12px 14px', borderRadius: 10,
                background: 'rgba(255,154,60,0.05)', border: '1px solid rgba(255,154,60,0.15)',
              }}>
                {impactPrediction}
              </div>
            </div>
          )}

          {/* Dependency lists — file nodes only */}
          {isFileNode && (
            <>
              <DependencyList
                items={dependents}
                title="Files that depend on this"
                icon={<ArrowUpRight size={12} />}
                emptyText="No structural dependents detected in this graph."
                color="#ff5078"
              />
              <DependencyList
                items={dependencies}
                title="Files this depends on"
                icon={<ArrowDownLeft size={12} />}
                emptyText="No structural dependencies detected."
                color="#22d3ee"
              />
            </>
          )}

          {/* Language node extra info */}
          {node.type === 'language' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                padding: '14px', borderRadius: 10,
                background: `${node.data.color}10`, border: `1px solid ${node.data.color}30`,
              }}>
                <div style={{ fontSize: 11, color: '#8b8ca8', fontWeight: 600, marginBottom: 6 }}>Usage Share</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800, color: node.data.color }}>
                  {node.data.percentage}%
                </div>
                <div style={{ fontSize: 11, color: '#8b8ca8', marginTop: 4 }}>
                  {node.data.category} · {node.data.bytes >= 1024 ? (node.data.bytes / 1024).toFixed(0) + ' KB' : node.data.bytes + ' bytes'}
                </div>
              </div>
            </div>
          )}

          {/* Contributor node extra info */}
          {node.type === 'contributor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                padding: '14px', borderRadius: 10,
                background: 'rgba(255,154,60,0.06)', border: '1px solid rgba(255,154,60,0.2)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <img
                  src={node.data.avatarUrl}
                  alt={node.data.login}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(255,154,60,0.4)' }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${node.data.login}&background=1a1a2e&color=ff9a3c&size=48`; }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>
                    @{node.data.login}
                  </div>
                  <div style={{ fontSize: 12, color: '#ff9a3c', fontWeight: 600, marginTop: 3 }}>
                    {node.data.contributions.toLocaleString()} contributions
                  </div>
                  <a
                    href={`https://github.com/${node.data.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: '#7c6fff', display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, textDecoration: 'none' }}
                  >
                    <Link size={10} /> View on GitHub
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Pattern node info */}
          {node.type === 'pattern' && (
            <div style={{
              padding: '14px', borderRadius: 10,
              background: `${node.data.color}08`, border: `1px solid ${node.data.color}25`,
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{node.data.icon}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 6 }}>
                {node.data.label} Detected
              </div>
              <div style={{ fontSize: 12, color: '#8b8ca8', lineHeight: 1.6 }}>
                This repository includes a {node.data.label.toLowerCase()} configuration, indicating a structured
                development workflow with this practice in place.
              </div>
            </div>
          )}

          {/* Directory info */}
          {node.type === 'directory' && (
            <div style={{
              padding: '14px', borderRadius: 10,
              background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)',
            }}>
              <div style={{ fontSize: 11, color: '#8b8ca8', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Directory Info
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#8b8ca8' }}>Role</span>
                  <span style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600 }}>{node.data.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#8b8ca8' }}>Files</span>
                  <span style={{ fontSize: 12, color: '#f0f0ff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {node.data.fileCount}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#8b8ca8' }}>Path</span>
                  <span style={{ fontSize: 11, color: '#f0f0ff', fontFamily: 'var(--font-mono)' }}>
                    {node.data.path}/
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#8b8ca8', lineHeight: 1.6 }}>
                Click the directory node in the graph to expand and see individual files.
              </div>
            </div>
          )}

          {/* Disclaimer footer */}
          <div style={{
            fontSize:   10.5, color: '#4a4b65', lineHeight: 1.6,
            padding:    '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            marginTop:  'auto',
          }}>
            ℹ️ Dependency analysis is derived from file structure, naming conventions, and architectural patterns.
            Actual import statements are not parsed. Results reflect structural inference.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
