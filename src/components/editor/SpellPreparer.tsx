import React, { useState, useEffect } from 'react';
import type { Spell } from '../../types/character';

interface SpellPreparerProps {
  spells: Spell[];
  onSavePreparation: (preparedSpellIds: Set<string>, alwaysPreparedSpellIds: Set<string>) => void;
}

export const SpellPreparer: React.FC<SpellPreparerProps> = ({
  spells,
  onSavePreparation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [draftPrepared, setDraftPrepared] = useState<Record<string, boolean>>({});
  const [draftAlwaysPrepared, setDraftAlwaysPrepared] = useState<Record<string, boolean>>({});
  const [maxPrepared, setMaxPrepared] = useState<number>(() => {
    const saved = localStorage.getItem('spellmanager_max_prepared');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Sync draft state with spells list whenever spells load or change
  useEffect(() => {
    const initialPrepared: Record<string, boolean> = {};
    const initialAlways: Record<string, boolean> = {};
    for (const s of spells) {
      initialPrepared[s.id] = s.prepared || !!s.alwaysPrepared;
      initialAlways[s.id] = !!s.alwaysPrepared;
    }
    setDraftPrepared(initialPrepared);
    setDraftAlwaysPrepared(initialAlways);
  }, [spells]);

  const handleMaxPreparedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const clamped = isNaN(val) ? 0 : Math.max(0, val);
    setMaxPrepared(clamped);
    localStorage.setItem('spellmanager_max_prepared', String(clamped));
  };

  const handleToggle = (spellId: string) => {
    // Spells marked as always prepared are locked to prepared status!
    if (draftAlwaysPrepared[spellId]) return;

    setDraftPrepared((prev) => ({
      ...prev,
      [spellId]: !prev[spellId],
    }));
  };

  const handleToggleAlwaysPrepared = (e: React.MouseEvent, spellId: string) => {
    e.stopPropagation(); // prevent triggering standard toggle on the card
    setDraftAlwaysPrepared((prev) => {
      const isNowAlways = !prev[spellId];
      if (isNowAlways) {
        // If set to always prepared, standard prepared status must be forced to true
        setDraftPrepared((p) => ({ ...p, [spellId]: true }));
      }
      return {
        ...prev,
        [spellId]: isNowAlways,
      };
    });
  };

  const handleUnprepareAll = () => {
    const cleared: Record<string, boolean> = {};
    for (const s of spells) {
      // Cantrips and Always Prepared spells are always prepared.
      // Standard spells of levels 1-9 are set to false.
      const isAlways = draftAlwaysPrepared[s.id];
      cleared[s.id] = (s.level === 0 || isAlways) ? draftPrepared[s.id] : false;
    }
    setDraftPrepared(cleared);
  };

  const handleSave = () => {
    const preparedIds = new Set<string>();
    const alwaysPreparedIds = new Set<string>();

    for (const [id, isPrepared] of Object.entries(draftPrepared)) {
      if (isPrepared) {
        preparedIds.add(id);
      }
    }
    for (const [id, isAlways] of Object.entries(draftAlwaysPrepared)) {
      if (isAlways) {
        alwaysPreparedIds.add(id);
      }
    }
    onSavePreparation(preparedIds, alwaysPreparedIds);
  };

  const handleReset = () => {
    const initialPrepared: Record<string, boolean> = {};
    const initialAlways: Record<string, boolean> = {};
    for (const s of spells) {
      initialPrepared[s.id] = s.prepared || !!s.alwaysPrepared;
      initialAlways[s.id] = !!s.alwaysPrepared;
    }
    setDraftPrepared(initialPrepared);
    setDraftAlwaysPrepared(initialAlways);
  };

  // Filter spells by query
  const filteredSpells = spells.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group spells by level
  const groupedSpells: Record<number, Spell[]> = {};
  for (const s of filteredSpells) {
    if (!groupedSpells[s.level]) {
      groupedSpells[s.level] = [];
    }
    groupedSpells[s.level].push(s);
  }

  // Sort levels keys
  const sortedLevels = Object.keys(groupedSpells)
    .map(Number)
    .sort((a, b) => a - b);

  // Check if draft matches actual saved state to toggle modified state
  const isModified = spells.some((s) => {
    const origPrepared = s.prepared;
    const origAlways = !!s.alwaysPrepared;
    const currentPrep = draftPrepared[s.id] ?? origPrepared;
    const currentAlways = draftAlwaysPrepared[s.id] ?? origAlways;
    return currentPrep !== origPrepared || currentAlways !== origAlways;
  });

  const getLevelLabel = (lvl: number) => {
    if (lvl === 0) return 'Cantrips (Level 0)';
    if (lvl === 1) return '1st Level';
    if (lvl === 2) return '2nd Level';
    if (lvl === 3) return '3rd Level';
    return `${lvl}th Level`;
  };

  // Spells of level >= 1 that are prepared, excluding those that are marked as always prepared
  const level1to9PreparedCount = spells.filter((s) => {
    if (s.level === 0) return false;
    const isPrep = draftPrepared[s.id] ?? s.prepared;
    const isAlways = draftAlwaysPrepared[s.id] ?? !!s.alwaysPrepared;
    return isPrep && !isAlways;
  }).length;

  return (
    <div style={styles.container} className="fade-in">
      <header style={styles.header}>
        <div style={styles.titleArea}>
          <h2 style={styles.title}>🧙‍♂️ Preparador de Magias</h2>
          <p style={styles.subtitle}>
            Organize e ative a preparação de suas magias. Cantrips e magias marcadas com ⭐ não contam no limite.
          </p>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.limitInputContainer}>
            <label style={styles.limitLabel}>Limite Máx.:</label>
            <input
              type="number"
              value={maxPrepared}
              onChange={handleMaxPreparedChange}
              style={styles.limitInput}
              min="0"
            />
          </div>
          <div style={styles.statsBadge}>
            <span style={styles.statsIcon}>✨</span>
            <span>
              Preparadas: {level1to9PreparedCount} de {maxPrepared} (Nível 1+)
            </span>
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.actionButtons}>
          <button
            type="button"
            onClick={handleUnprepareAll}
            style={styles.unprepareBtn}
            title="Despreparar magias de nível 1 a 9 (exceto as 'Sempre Preparadas')"
          >
            ❌ Despreparar Tudo
          </button>
          
          {isModified && (
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetBtn}
            >
              Desfazer
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isModified}
            style={{
              ...styles.saveBtn,
              ...(!isModified ? styles.saveBtnDisabled : {}),
            }}
          >
            💾 Salvar Preparação
          </button>
        </div>
      </div>

      {/* Level Group Lists */}
      {sortedLevels.length === 0 ? (
        <div style={styles.noSpellsBox}>
          <p style={styles.noSpellsText}>
            {searchQuery ? 'Nenhuma magia corresponde ao seu filtro.' : 'Você não possui magias no seu grimório para preparar. Adicione magias primeiro!'}
          </p>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {sortedLevels.map((lvl) => {
            const levelSpells = groupedSpells[lvl].sort((a, b) =>
              a.name.localeCompare(b.name)
            );

            return (
              <section key={lvl} style={styles.levelSection}>
                <h3 style={styles.levelHeader}>{getLevelLabel(lvl)}</h3>
                <div style={styles.grid}>
                  {levelSpells.map((spell) => {
                    const isPrepared = !!draftPrepared[spell.id];
                    const isAlways = !!draftAlwaysPrepared[spell.id];
                    const hasChanged = isPrepared !== spell.prepared || isAlways !== !!spell.alwaysPrepared;

                    return (
                      <div
                        key={spell.id}
                        onClick={() => handleToggle(spell.id)}
                        style={{
                          ...styles.spellItem,
                          ...(isPrepared ? styles.spellItemPrepared : {}),
                          ...(isAlways ? styles.spellItemAlwaysPrepared : {}),
                          ...(hasChanged ? styles.spellItemChanged : {}),
                          ...(isAlways ? { cursor: 'default' } : {}),
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isPrepared}
                          disabled={isAlways} // always prepared is locked to active
                          onChange={() => {}} // toggled on container click
                          style={styles.checkbox}
                        />
                        <div style={styles.spellInfo}>
                          <strong style={styles.spellName}>
                            {spell.name}
                            {hasChanged && <span style={styles.changedIndicator}>*</span>}
                          </strong>
                          <span style={styles.spellSchool}>
                            {spell.school} {spell.edition ? `[5e ${spell.edition}]` : ''}
                          </span>
                        </div>
                        {/* Always Prepared Toggle Star */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleAlwaysPrepared(e, spell.id)}
                          style={{
                            ...styles.starBtn,
                            ...(isAlways ? styles.starBtnActive : {}),
                          }}
                          title={isAlways ? "Remover de 'Sempre Preparada'" : "Marcar como 'Sempre Preparada' (não conta no limite)"}
                        >
                          ★
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--border-muted)',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-muted)',
    paddingBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  titleArea: {
    textAlign: 'left',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '0.25rem 0 0 0',
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  limitInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  limitLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  limitInput: {
    width: '60px',
    padding: '0.35rem',
    fontSize: '0.8rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  statsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: 'var(--color-primary)',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-full)',
  },
  statsIcon: {
    fontSize: '1rem',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '0.5rem 0.85rem',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  unprepareBtn: {
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 650,
    backgroundColor: 'transparent',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease',
  },
  resetBtn: {
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
  },
  saveBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 650,
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  noSpellsBox: {
    padding: '3rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dotted var(--border-muted)',
    textAlign: 'center',
  },
  noSpellsText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  levelSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    textAlign: 'left',
  },
  levelHeader: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    borderLeft: '3px solid var(--color-primary)',
    paddingLeft: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.6rem',
  },
  spellItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  spellItemPrepared: {
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  spellItemAlwaysPrepared: {
    backgroundColor: 'rgba(241, 196, 15, 0.04)',
    borderColor: 'rgba(241, 196, 15, 0.4)',
  },
  spellItemChanged: {
    borderStyle: 'dashed',
    borderColor: 'var(--color-secondary)',
  },
  checkbox: {
    cursor: 'pointer',
    width: '15px',
    height: '15px',
  },
  spellInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    overflow: 'hidden',
    flex: 1,
  },
  spellName: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  changedIndicator: {
    color: 'var(--color-secondary)',
    marginLeft: '0.2rem',
    fontWeight: 'bold',
  },
  spellSchool: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    opacity: 0.35,
    padding: '0.25rem',
    transition: 'all 0.15s ease',
  },
  starBtnActive: {
    color: '#f1c40f',
    opacity: 1,
  },
};
