import React, { useState } from 'react';
import type { Spell } from '../../types/character';

interface SpellCardProps {
  spell: Spell;
  onTogglePrepared: (id: string) => void;
  onToggleRitual: (id: string) => void;
  onToggleConcentration: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit?: (spell: Spell) => void;
}

export const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  onTogglePrepared,
  onToggleRitual,
  onToggleConcentration,
  onRemove,
  onEdit,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getSchoolColor = (school: string) => {
    const s = school.toLowerCase();
    if (s.includes('abjure') || s === 'abjuration') return '#3b82f6'; // Blue
    if (s.includes('evoc') || s === 'evocation') return '#ef4444'; // Red
    if (s.includes('conjur') || s === 'conjuration') return '#eab308'; // Gold/Yellow
    if (s.includes('divin') || s === 'divination') return '#a855f7'; // Purple
    if (s.includes('transmut') || s === 'transmutation') return '#10b981'; // Green
    if (s.includes('necrom') || s === 'necromancy') return '#64748b'; // Slate/Deathly
    if (s.includes('illus') || s === 'illusion') return '#ec4899'; // Pink
    if (s.includes('enchant') || s === 'enchantment') return '#f97316'; // Orange
    return 'var(--text-muted)';
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(spell.prepared ? styles.cardPrepared : {}),
      }}
      className="fade-in"
    >
      <div style={styles.mainRow}>
        {/* Prepared checkbox toggle */}
        {spell.level > 0 && (
          <label style={styles.checkboxContainer} title={spell.prepared ? 'Prepared' : 'Unprepared'}>
            <input
              type="checkbox"
              checked={spell.prepared}
              onChange={() => onTogglePrepared(spell.id)}
              style={styles.checkbox}
            />
          </label>
        )}

        <div style={styles.infoCol} onClick={() => setExpanded(!expanded)}>
          <div style={styles.nameRow}>
            <h3 style={styles.spellName}>{spell.name}</h3>
            {spell.edition && (
              <span
                style={{
                  ...styles.editionTag,
                  ...(spell.edition === '2024' ? styles.editionTag2024 : {}),
                }}
              >
                5e {spell.edition}
              </span>
            )}
            {spell.source && <span style={styles.sourceTag}>{spell.source}</span>}
          </div>
          
          <div style={styles.badgeRow}>
            <span style={{ ...styles.schoolTag, borderLeft: `3px solid ${getSchoolColor(spell.school)}` }}>
              {spell.school || 'Unknown School'}
            </span>
            
            {spell.ritual && (
              <span 
                style={{ ...styles.tag, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--color-info)' }}
                onClick={(e) => { e.stopPropagation(); onToggleRitual(spell.id); }}
                title="Ritual (Click to toggle)"
              >
                Ritual
              </span>
            )}
            {!spell.ritual && (
              <span 
                style={{ ...styles.tag, ...styles.tagMuted }}
                onClick={(e) => { e.stopPropagation(); onToggleRitual(spell.id); }}
                title="Not a Ritual (Click to toggle)"
              >
                +Ritual
              </span>
            )}

            {spell.concentration && (
              <span 
                style={{ ...styles.tag, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}
                onClick={(e) => { e.stopPropagation(); onToggleConcentration(spell.id); }}
                title="Concentration (Click to toggle)"
              >
                Conc.
              </span>
            )}
            {!spell.concentration && (
              <span 
                style={{ ...styles.tag, ...styles.tagMuted }}
                onClick={(e) => { e.stopPropagation(); onToggleConcentration(spell.id); }}
                title="No Concentration (Click to toggle)"
              >
                +Conc.
              </span>
            )}
          </div>
        </div>

        <div style={styles.actionsCol}>
          {onEdit && (
            <button onClick={() => onEdit(spell)} style={styles.actionBtn} title="Edit Spell">
              ✏️
            </button>
          )}
          <button onClick={() => onRemove(spell.id)} style={styles.deleteBtn} title="Remove Spell">
            🗑️
          </button>
        </div>
      </div>

      {/* Meta Grid details */}
      <div style={styles.metaGrid} onClick={() => setExpanded(!expanded)}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Casting Time</span>
          <span style={styles.metaVal}>{spell.castingTime || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Range</span>
          <span style={styles.metaVal}>{spell.range || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Duration</span>
          <span style={styles.metaVal}>{spell.duration || '—'}</span>
        </div>
      </div>

      {/* Expanded description panel */}
      {expanded && (
        <div style={styles.descriptionBlock}>
          <p style={styles.descriptionText}>
            {spell.description || 'No description provided.'}
          </p>
        </div>
      )}
      
      <div style={styles.expandBar} onClick={() => setExpanded(!expanded)}>
        <span style={styles.expandArrow}>{expanded ? '▲ Hide Details' : '▼ Show Details'}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardPrepared: {
    borderColor: 'var(--color-success)',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.15)',
    backgroundColor: 'hsl(222, 18%, 13%)',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--color-success)',
    cursor: 'pointer',
  },
  infoCol: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  spellName: {
    fontSize: '1rem',
    fontWeight: 650,
    color: 'var(--text-primary)',
  },
  sourceTag: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '0.1rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
  },
  editionTag: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '0.1rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    textTransform: 'uppercase',
  },
  editionTag2024: {
    borderColor: 'var(--color-secondary)',
    color: 'var(--color-secondary)',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
  },
  badgeRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  schoolTag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '0.1rem 0.5rem 0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
  },
  tag: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tagMuted: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    opacity: 0.6,
  },
  actionsCol: {
    display: 'flex',
    gap: '0.35rem',
  },
  actionBtn: {
    padding: '0.35rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '0.35rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    fontSize: '0.85rem',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  metaLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
  },
  metaVal: {
    color: 'var(--text-primary)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  descriptionBlock: {
    borderTop: '1px solid var(--border-muted)',
    paddingTop: '0.75rem',
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  descriptionText: {
    margin: 0,
    whiteSpace: 'pre-line',
  },
  expandBar: {
    textAlign: 'center',
    cursor: 'pointer',
    paddingTop: '0.25rem',
  },
  expandArrow: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
};
