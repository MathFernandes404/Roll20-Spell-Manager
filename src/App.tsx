import { useState, useMemo } from 'react';
import './App.css';
import { useCharacter } from './hooks/useCharacter';
import { AppLayout } from './components/layout/AppLayout';
import { JSONImporter } from './components/io/JSONImporter';
import { JSONExporter } from './components/io/JSONExporter';
import { SpellFilters } from './components/editor/SpellFilters';
import type { FilterState } from './components/editor/SpellFilters';
import { SpellList } from './components/editor/SpellList';
import { AddSpellModal } from './components/editor/AddSpellModal';
import { SpellPreparer } from './components/editor/SpellPreparer';
import type { Spell } from './types/character';

const INITIAL_FILTERS: FilterState = {
  search: '',
  level: 'all',
  school: 'all',
  concentration: 'all',
  ritual: 'all',
  prepared: 'all',
  sortBy: 'level',
};

function App() {
  const {
    character,
    error,
    importCharacter,
    clearCharacter,
    updateCharacterName,
    addSpell,
    removeSpell,
    updateSpell,
    togglePrepared,
    toggleRitual,
    toggleConcentration,
    exportCharacter,
    saveSpellPreparation,
  } = useCharacter();

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeView, setActiveView] = useState<'list' | 'preparer'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSavePreparation = (preparedSpellIds: Set<string>, alwaysPreparedSpellIds: Set<string>) => {
    saveSpellPreparation(preparedSpellIds, alwaysPreparedSpellIds);
    setActiveView('list');
  };

  // Filter and sort the spells based on state
  const processedSpells = useMemo(() => {
    if (!character) return [];

    let result = [...character.spells];

    // 1. Text Search (matches name or description)
    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      result = result.filter(
        (spell) =>
          spell.name.toLowerCase().includes(query) ||
          (spell.description && spell.description.toLowerCase().includes(query))
      );
    }

    // 2. Level Filter
    if (filters.level !== 'all') {
      const targetLevel = parseInt(filters.level, 10);
      result = result.filter((spell) => spell.level === targetLevel);
    }

    // 3. School Filter
    if (filters.school !== 'all') {
      result = result.filter((spell) => spell.school.toLowerCase() === filters.school.toLowerCase());
    }

    // 4. Prepared Filter
    if (filters.prepared !== 'all') {
      const isPrepared = filters.prepared === 'yes';
      result = result.filter((spell) => spell.prepared === isPrepared);
    }

    // 5. Concentration Filter
    if (filters.concentration !== 'all') {
      const isConcentration = filters.concentration === 'yes';
      result = result.filter((spell) => spell.concentration === isConcentration);
    }

    // 6. Ritual Filter
    if (filters.ritual !== 'all') {
      const isRitual = filters.ritual === 'yes';
      result = result.filter((spell) => spell.ritual === isRitual);
    }

    // 7. Sort Spells
    result.sort((a, b) => {
      if (filters.sortBy === 'level') {
        // Primary sort: level, Secondary sort: alphabetical name
        if (a.level !== b.level) {
          return a.level - b.level;
        }
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [character, filters]);

  const handleStartEditName = () => {
    if (character) {
      setTempName(character.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateCharacterName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleOpenEditSpell = (spell: Spell) => {
    setEditingSpell(spell);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingSpell(null);
  };

  return (
    <AppLayout
      characterName={character?.name}
      spellCount={character?.spells.length}
      onClearCharacter={character ? clearCharacter : undefined}
    >
      {!character ? (
        <JSONImporter onImport={importCharacter} error={error} />
      ) : (
        <div style={styles.workspace} className="fade-in">
          {/* Side Control Board */}
          <div style={styles.sidebar}>
            {/* Character Header / Edit Name */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>Character Sheet</h3>
              {isEditingName ? (
                <div style={styles.nameEditGroup}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    style={styles.nameInput}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <div style={styles.btnRow}>
                    <button onClick={handleSaveName} style={styles.saveBtn}>Save</button>
                    <button onClick={() => setIsEditingName(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={styles.nameDisplayGroup}>
                  <span style={styles.characterName}>{character.name}</span>
                  <button onClick={handleStartEditName} style={styles.editNameBtn}>
                    ✏️ Edit Name
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
              <h3 style={styles.sidebarTitle}>Actions</h3>
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={styles.primaryActionBtn}
              >
                ✨ Add New Spell
              </button>
            </div>

            {/* Export Board */}
            <JSONExporter
              characterName={character.name}
              spellCount={character.spells.length}
              onExport={exportCharacter}
            />
          </div>

          {/* Main Spell Dashboard */}
          <div style={styles.mainContent}>
            {/* View Switcher Tabs */}
            <div style={styles.viewTabs}>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                style={{
                  ...styles.viewTabBtn,
                  ...(activeView === 'list' ? styles.viewTabBtnActive : {}),
                }}
              >
                📜 Grimório (Lista de Magias)
              </button>
              <button
                type="button"
                onClick={() => setActiveView('preparer')}
                style={{
                  ...styles.viewTabBtn,
                  ...(activeView === 'preparer' ? styles.viewTabBtnActive : {}),
                }}
              >
                🧙‍♂️ Preparador de Magias
              </button>
            </div>

            {activeView === 'list' ? (
              <>
                <SpellFilters
                  filters={filters}
                  onChange={setFilters}
                  onClear={handleClearFilters}
                />

                <SpellList
                  spells={processedSpells}
                  onTogglePrepared={togglePrepared}
                  onToggleRitual={toggleRitual}
                  onToggleConcentration={toggleConcentration}
                  onRemove={removeSpell}
                  onEdit={handleOpenEditSpell}
                />
              </>
            ) : (
              <SpellPreparer
                spells={character.spells}
                onSavePreparation={handleSavePreparation}
              />
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Spell Modal Overlay */}
      {isAddModalOpen && (
        <AddSpellModal
          onClose={handleCloseModal}
          onAddSpell={addSpell}
          onUpdateSpell={updateSpell}
          editSpell={editingSpell}
          currentSpells={character?.spells || []}
        />
      )}
    </AppLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  workspace: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    width: '100%',
    flexWrap: 'wrap',
  },
  sidebar: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  mainContent: {
    flex: '3 1 600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  nameEditGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  nameInput: {
    width: '100%',
  },
  btnRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  saveBtn: {
    flex: 1,
    padding: '0.4rem',
    backgroundColor: 'var(--color-success)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.4rem',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
  },
  nameDisplayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  characterName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  editNameBtn: {
    fontSize: '0.8rem',
    color: 'var(--color-primary)',
    fontWeight: 500,
  },
  primaryActionBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    textAlign: 'center',
  },
  viewTabs: {
    display: 'flex',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    overflow: 'hidden',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  viewTabBtn: {
    flex: 1,
    padding: '0.6rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  viewTabBtnActive: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export default App;
