/**
 * KnowledgeGraph — Custom React Flow Node Types
 * Renders styled nodes matching the RepoMedic dark glassmorphism design system.
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ROLE_COLORS, RISK_COLORS } from '../../services/graphBuilder';

// ── Shared handle style ───────────────────────────────────────────────────────
const HANDLE_STYLE = {
  width: 8,
  height: 8,
  background: 'rgba(244,197,66,0.45)',
  border: '1.5px solid rgba(244,197,66,0.8)',
};

// ── Role icon map ─────────────────────────────────────────────────────────────
const ROLE_ICONS = {
  component: '⬡',
  service:   '⚡',
  hook:      '🪝',
  model:     '📐',
  utility:   '🔧',
  test:      '🧪',
  config:    '⚙️',
  index:     '📦',
  style:     '🎨',
  doc:       '📄',
  state:     '🗄️',
  module:    '📎',
  file:      '📄',
};

// ── Repository Root Node ──────────────────────────────────────────────────────
export const RepoRootNode = memo(({ data, selected }) => (
  <div style={{
    background:    selected
      ? 'linear-gradient(145deg, rgba(244,197,66,0.18) 0%, rgba(212,165,20,0.12) 100%)'
      : 'linear-gradient(145deg, rgba(244,197,66,0.08) 0%, rgba(212,165,20,0.05) 100%)',
    border:        `2px solid ${selected ? 'rgba(244,197,66,0.8)' : 'rgba(244,197,66,0.35)'}`,
    borderRadius:  18,
    padding:       '18px 22px',
    minWidth:      200,
    maxWidth:      240,
    backdropFilter: 'blur(24px)',
    boxShadow:     selected
      ? '0 14px 28px rgba(0,0,0,0.42)'
      : '0 10px 22px rgba(0,0,0,0.36)',
    transition:    'all 0.2s',
    cursor:        'pointer',
    position:      'relative',
  }}>
    {/* Glow top border */}
    <div style={{
      position:   'absolute', top: 0, left: '20%', right: '20%', height: 2,
      background: 'linear-gradient(90deg, transparent, rgba(244,197,66,0.8), transparent)',
      borderRadius: '0 0 4px 4px',
    }} />

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      {data.ownerAvatar && (
        <img
          src={data.ownerAvatar}
          alt={data.owner}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(244,197,66,0.35)', flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily:  'var(--font-head)', fontSize: 13, fontWeight: 700,
          color:       '#f0f0ff', lineHeight: 1.2,
          overflow:    'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {data.repoName}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(244,197,66,0.88)', fontWeight: 600, marginTop: 2 }}>
          Repository Root
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {data.language && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100,
          background: 'rgba(244,197,66,0.12)', border: '1px solid rgba(244,197,66,0.22)',
          color: '#F4C542',
        }}>
          {data.language}
        </span>
      )}
      <span style={{
        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100,
        background: 'rgba(247,183,49,0.1)', border: '1px solid rgba(247,183,49,0.3)',
          color: '#F4C542',
      }}>
        ⭐ {data.stars >= 1000 ? (data.stars / 1000).toFixed(1) + 'k' : data.stars}
      </span>
    </div>

    <Handle type="source" position={Position.Right}  style={HANDLE_STYLE} />
    <Handle type="source" position={Position.Left}   style={HANDLE_STYLE} />
    <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    <Handle type="target" position={Position.Top}    style={HANDLE_STYLE} />
  </div>
));
RepoRootNode.displayName = 'RepoRootNode';

// ── Directory Node ────────────────────────────────────────────────────────────
export const DirectoryNode = memo(({ data, selected }) => (
  <div style={{
    background:    selected
      ? 'linear-gradient(145deg, rgba(244,197,66,0.14) 0%, rgba(201,169,74,0.1) 100%)'
      : 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    border:        `1.5px solid ${selected ? 'rgba(244,197,66,0.65)' : 'rgba(244,197,66,0.12)'}`,
    borderRadius:  14,
    padding:       '14px 16px',
    minWidth:      160,
    maxWidth:      200,
    backdropFilter: 'blur(20px)',
    boxShadow:     selected ? '0 12px 22px rgba(0,0,0,0.34)' : '0 2px 14px rgba(0,0,0,0.32)',
    transition:    'all 0.2s',
    cursor:        'pointer',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 16 }}>📁</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily:  'var(--font-mono)', fontSize: 12, fontWeight: 600,
          color:       '#f0f0ff', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace:  'nowrap',
        }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(244,197,66,0.78)', fontWeight: 500, marginTop: 1 }}>
          {data.role}
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{
        fontSize: 10, color: '#8b8ca8', fontWeight: 500,
      }}>
        {data.fileCount} file{data.fileCount !== 1 ? 's' : ''}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
        background: data.collapsed ? 'rgba(244,197,66,0.1)' : 'rgba(142,160,109,0.1)',
        border:     data.collapsed ? '1px solid rgba(244,197,66,0.24)' : '1px solid rgba(142,160,109,0.24)',
        color:      data.collapsed ? '#F4C542' : '#8EA06D',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {data.collapsed ? 'Click to expand' : 'Expanded'}
      </span>
    </div>

    <Handle type="target" position={Position.Left}   style={HANDLE_STYLE} />
    <Handle type="target" position={Position.Right}  style={HANDLE_STYLE} />
    <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    <Handle type="source" position={Position.Right}  id="right-src" style={{ ...HANDLE_STYLE, bottom: 20, top: 'auto' }} />
  </div>
));
DirectoryNode.displayName = 'DirectoryNode';

// ── File Node ─────────────────────────────────────────────────────────────────
export const FileNode = memo(({ data, selected }) => {
  const roleColor = ROLE_COLORS[data.role] || ROLE_COLORS.file;
  const riskColor = RISK_COLORS[data.riskLevel] || RISK_COLORS.UNKNOWN;
  const icon      = ROLE_ICONS[data.role] || '📄';

  return (
    <div style={{
      background:    selected
        ? `linear-gradient(145deg, ${roleColor}22 0%, rgba(0,0,0,0.4) 100%)`
          : `linear-gradient(145deg, ${roleColor}10 0%, rgba(0,0,0,0.4) 100%)`,
      border:        `1.5px solid ${selected ? roleColor + 'cc' : roleColor + '40'}`,
      borderRadius:  10,
      padding:       '10px 13px',
      minWidth:      140,
      maxWidth:      180,
      backdropFilter: 'blur(20px)',
      boxShadow:     selected ? '0 12px 20px rgba(0,0,0,0.34)' : '0 2px 12px rgba(0,0,0,0.36)',
      transition:    'all 0.2s',
      cursor:        'pointer',
      position:      'relative',
    }}>
      {/* Risk indicator dot */}
      <div style={{
        position:     'absolute', top: 8, right: 8,
        width:        7, height: 7, borderRadius: '50%',
        background:   riskColor,
        boxShadow:    `0 0 6px ${riskColor}`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
        <span style={{ fontSize: 13, lineHeight: 1.2, flexShrink: 0 }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily:  'var(--font-mono)', fontSize: 11, fontWeight: 600,
            color:       '#f0f0ff', lineHeight: 1.3,
            overflow:    'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            paddingRight: 12,
          }}>
            {data.label}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
          background: roleColor + '18', border: `1px solid ${roleColor}32`,
          color: roleColor, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {data.role}
        </span>
        {data.language && (
          <span style={{ fontSize: 9, color: '#4a4b65', fontWeight: 500 }}>
            {data.language}
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Left}   style={{ ...HANDLE_STYLE, width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right}  style={{ ...HANDLE_STYLE, width: 6, height: 6 }} />
      <Handle type="target" position={Position.Top}    style={{ ...HANDLE_STYLE, width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ ...HANDLE_STYLE, width: 6, height: 6 }} />
    </div>
  );
});
FileNode.displayName = 'FileNode';

// ── Language Node ─────────────────────────────────────────────────────────────
export const LanguageNode = memo(({ data, selected }) => (
  <div style={{
    background:    selected
      ? `${data.color}20`
      : `${data.color}10`,
    border:        `1.5px solid ${selected ? data.color + 'c0' : data.color + '40'}`,
    borderRadius:  12,
    padding:       '12px 16px',
    minWidth:      140,
    backdropFilter: 'blur(20px)',
    boxShadow:     selected ? '0 12px 20px rgba(0,0,0,0.34)' : '0 2px 12px rgba(0,0,0,0.36)',
    transition:    'all 0.2s',
    cursor:        'pointer',
    textAlign:     'center',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: data.color + '20', border: `2px solid ${data.color}45`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 8px', fontSize: 14, fontWeight: 800,
      color: data.color, fontFamily: 'var(--font-head)',
    }}>
      {data.name.slice(0, 2)}
    </div>
    <div style={{
      fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700,
      color: '#f0f0ff', marginBottom: 4,
    }}>
      {data.name}
    </div>
    <div style={{
      fontSize: 11, fontWeight: 700, color: data.color,
    }}>
      {data.percentage}%
    </div>
    <div style={{ fontSize: 9, color: '#4a4b65', marginTop: 2 }}>
      {data.category}
    </div>

    <Handle type="target" position={Position.Left}  style={HANDLE_STYLE} />
    <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
  </div>
));
LanguageNode.displayName = 'LanguageNode';

// ── Pattern Node ──────────────────────────────────────────────────────────────
export const PatternNode = memo(({ data, selected }) => (
  <div style={{
    background:    selected ? `${data.color}20` : `${data.color}10`,
    border:        `1.5px solid ${selected ? data.color + 'cc' : data.color + '40'}`,
    borderRadius:  12,
    padding:       '12px 15px',
    minWidth:      140,
    backdropFilter: 'blur(20px)',
    boxShadow:     selected ? `0 0 18px ${data.color}30` : '0 2px 12px rgba(0,0,0,0.4)',
    transition:    'all 0.2s',
    cursor:        'pointer',
    display:       'flex',
    alignItems:    'center',
    gap:           10,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: data.color + '20', border: `1.5px solid ${data.color}45`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18,
    }}>
      {data.icon}
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: '#f0f0ff', marginBottom: 2 }}>
        {data.label}
      </div>
      <div style={{ fontSize: 9, fontWeight: 600, color: data.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Detected
      </div>
    </div>

    <Handle type="target" position={Position.Right}  style={HANDLE_STYLE} />
    <Handle type="target" position={Position.Bottom} style={HANDLE_STYLE} />
  </div>
));
PatternNode.displayName = 'PatternNode';

// ── Contributor Node ──────────────────────────────────────────────────────────
export const ContributorNode = memo(({ data, selected }) => (
  <div style={{
    background:    selected ? 'rgba(201,139,43,0.18)' : 'rgba(201,139,43,0.08)',
    border:        `1.5px solid ${selected ? 'rgba(201,139,43,0.8)' : 'rgba(201,139,43,0.3)'}`,
    borderRadius:  12,
    padding:       '11px 14px',
    minWidth:      140,
    backdropFilter: 'blur(20px)',
    boxShadow:     selected ? '0 12px 20px rgba(0,0,0,0.34)' : '0 2px 12px rgba(0,0,0,0.36)',
    transition:    'all 0.2s',
    cursor:        'pointer',
    display:       'flex',
    alignItems:    'center',
    gap:           9,
  }}>
    <img
      src={data.avatarUrl}
      alt={data.login}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '1.5px solid rgba(201,139,43,0.45)',
        flexShrink: 0, objectFit: 'cover',
      }}
      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${data.login}&background=1a1a2e&color=ff9a3c&size=32`; }}
    />
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        color: '#f0f0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        @{data.login}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(201,139,43,0.8)', fontWeight: 500 }}>
        {data.contributions} commits
      </div>
    </div>

    <Handle type="source" position={Position.Top} style={HANDLE_STYLE} />
  </div>
));
ContributorNode.displayName = 'ContributorNode';

export const NODE_TYPES = {
  repoRoot: RepoRootNode,
  directory: DirectoryNode,
  file: FileNode,
  language: LanguageNode,
  pattern: PatternNode,
  contributor: ContributorNode,
};