import React from 'react';
import type { Spell } from '../../types/character';
import { SpellCard } from './SpellCard';

interface SpellListProps {
  spells: Spell[];
  onTogglePrepared: (id: string) => void;
  onToggleRitual: (id: string) => void;
  onToggleConcentration: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit?: (spell: Spell) => void;
}

export const SpellList: React.FC<SpellListProps> = ({
  spells,
  onTogglePrepared,
  onToggleRitual,
  onToggleConcentration,
  onRemove,
  onEdit,
}) => {
  // Group spells by level
  const spellsByLevel: Record<number, Spell[]> = {};
  
  // Initialize levels 0 through 9
  for (let i = 0; i <= 9; i++) {
    spellsByLevel[i] = [];
  }

  // Populate groups
  for (const spell of spells) {
    if (spell.level >= 0 && spell.level <= 9) {
      spellsByLevel[spell.level].push(spell);
    }
  }

  const getLevelHeader = (level: number, groupSpells: Spell[]) => {
    const total = groupSpells.length;
    if (total === 0) return null;

    const preparedCount = groupSpells.filter((s) => s.prepared).length;
    const name = level === 0 ? 'Cantrips' : `Level ${level}`;
    const prepLabel = level === 0 ? '' : ` — ${preparedCount}/${total} Prepared`;

    return (
      <div style={styles.groupHeader}>
        <div style={styles.groupInfo}>
          <span style={styles.levelMarker}>{level === 0 ? 'C' : level}</span>
          <h3 style={styles.groupTitle}>{name}</h3>
        </div>
        <span style={styles.groupStats}>
          {total} spell{total !== 1 ? 's' : ''}
          {prepLabel}
        </span>
      </div>
    );
  };

  const hasAnySpells = spells.length > 0;

  return (
    <div style={styles.container}>
      {!hasAnySpells ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🔮</span>
          <h3 style={styles.emptyTitle}>No Spells Found</h3>
          <p style={styles.emptySubtitle}>
            Try adjusting your search queries, filters, or add a new spell from the database.
          </p>
        </div>
      ) : (
        Object.entries(spellsByLevel).map(([levelStr, groupSpells]) => {
          const level = parseInt(levelStr, 10);
          if (groupSpells.length === 0) return null;

          return (
            <div key={level} style={styles.levelGroup} className="fade-in">
              {getLevelHeader(level, groupSpells)}
              <div style={styles.grid}>
                {groupSpells.map((spell) => (
                  <SpellCard
                    key={spell.id}
                    spell={spell}
                    onTogglePrepared={onTogglePrepared}
                    onToggleRitual={onToggleRitual}
                    onToggleConcentration={onToggleConcentration}
                    onRemove={onRemove}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  levelGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-muted)',
    paddingBottom: '0.5rem',
    marginTop: '0.5rem',
  },
  groupInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  levelMarker: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  groupTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  groupStats: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px dashed var(--border-muted)',
    borderRadius: 'var(--radius-xl)',
    textAlign: 'center',
    maxWidth: '480px',
    margin: '2rem auto',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  emptySubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
};
