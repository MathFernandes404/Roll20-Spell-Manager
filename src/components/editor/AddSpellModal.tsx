import React, { useState, useEffect, useMemo } from 'react';
import type { Spell } from '../../types/character';
import { FiveEToolsProvider } from '../../providers/fiveEToolsProvider';

const globalProviders = {
  '2014': new FiveEToolsProvider('2014'),
  '2024': new FiveEToolsProvider('2024'),
};

interface AddSpellModalProps {
  onClose: () => void;
  onAddSpell: (spell: Omit<Spell, 'id' | 'prepared'> & { prepared?: boolean }) => void;
  onUpdateSpell?: (id: string, updates: Partial<Spell>) => void;
  editSpell?: Spell | null; // If provided, the modal acts in "Edit Mode"
  currentSpells: Spell[];
}

export const AddSpellModal: React.FC<AddSpellModalProps> = ({
  onClose,
  onAddSpell,
  onUpdateSpell,
  editSpell,
  currentSpells,
}) => {
  const [activeTab, setActiveTab] = useState<'srd' | 'custom'>(editSpell ? 'custom' : 'srd');
  const [edition, setEdition] = useState<'2014' | '2024'>('2014');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom spell form state
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [school, setSchool] = useState('evocation');
  const [castingTime, setCastingTime] = useState('1 action');
  const [range, setRange] = useState('60 feet');
  const [duration, setDuration] = useState('Instantaneous');
  const [concentration, setConcentration] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Homebrew');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [srdMatches, setSrdMatches] = useState<Spell[]>([]);

  // Advanced Filters State
  const [filterClass, setFilterClass] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'level-asc' | 'level-desc'>('name-asc');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Bulk Selection State
  const [bulkSelection, setBulkSelection] = useState<Record<string, Spell>>({});

  // Custom Spell Components State
  const [compV, setCompV] = useState(false);
  const [compS, setCompS] = useState(false);
  const [compM, setCompM] = useState(false);
  const [compMaterialText, setCompMaterialText] = useState('');

  // Load editSpell details if in edit mode
  useEffect(() => {
    if (editSpell) {
      setName(editSpell.name);
      setLevel(editSpell.level);
      setSchool(editSpell.school);
      setCastingTime(editSpell.castingTime);
      setRange(editSpell.range);
      setDuration(editSpell.duration);
      setConcentration(editSpell.concentration);
      setRitual(editSpell.ritual);
      setPrepared(editSpell.prepared);
      setDescription(editSpell.description || '');
      setSource(editSpell.source || 'Custom');
      if (editSpell.edition) {
        setEdition(editSpell.edition);
      }
      setCompV(!!editSpell.components?.v);
      setCompS(!!editSpell.components?.s);
      setCompM(!!editSpell.components?.m);
      setCompMaterialText(editSpell.components?.material || '');
    }
  }, [editSpell]);

  // Handle 5etools search with filters
  useEffect(() => {
    if (activeTab === 'srd') {
      setIsLoading(true);
      const provider = globalProviders[edition];

      const filtersObj: any = {};
      if (filterClass) filtersObj.className = filterClass;
      if (filterLevel !== '') filtersObj.level = Number(filterLevel);
      if (selectedSources.length > 0) filtersObj.sources = selectedSources;

      provider.searchSpells(searchQuery, filtersObj).then((results) => {
        setSrdMatches(results);
        provider.getAllSpells().then(() => {
          setAvailableSources(provider.getLoadedSources());
        });
        setIsLoading(false);
      }).catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [searchQuery, edition, activeTab, filterClass, filterLevel, selectedSources]);

  // Sort matches based on user's preference (A-Z by default)
  const sortedMatches = useMemo(() => {
    return [...srdMatches].sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'level-asc') {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'level-desc') {
        if (a.level !== b.level) return b.level - a.level;
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [srdMatches, sortBy]);

  const toggleBulkSelect = (spell: Spell) => {
    setBulkSelection((prev) => {
      const next = { ...prev };
      if (next[spell.id]) {
        delete next[spell.id];
      } else {
        next[spell.id] = spell;
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    setBulkSelection((prev) => {
      const next = { ...prev };
      sortedMatches.forEach((spell) => {
        const known = isSpellAlreadyKnown(spell.name, spell.edition);
        if (!known) {
          next[spell.id] = spell;
        }
      });
      return next;
    });
  };

  const handleClearBulk = () => {
    setBulkSelection({});
  };

  const handleBulkAdd = () => {
    Object.values(bulkSelection).forEach((spell) => {
      onAddSpell({
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        duration: spell.duration,
        concentration: spell.concentration,
        ritual: spell.ritual,
        prepared: spell.level === 0, // cantrips start prepared
        description: spell.description,
        source: spell.source || '5etools',
        edition: spell.edition,
        components: spell.components,
      });
    });
    onClose();
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const spellData = {
      name,
      level,
      school,
      castingTime,
      range,
      duration,
      concentration,
      ritual,
      prepared,
      description,
      source,
      edition, // custom spells are created under current edition scope
      components: {
        v: compV,
        s: compS,
        m: compM,
        material: compM ? compMaterialText : '',
      },
      alwaysPrepared: editSpell?.alwaysPrepared,
    };

    if (editSpell && onUpdateSpell) {
      onUpdateSpell(editSpell.id, spellData);
    } else {
      onAddSpell(spellData);
    }
    onClose();
  };

  const handleAddSrd = (spell: Spell) => {
    onAddSpell({
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      duration: spell.duration,
      concentration: spell.concentration,
      ritual: spell.ritual,
      prepared: spell.level === 0, // cantrips start prepared
      description: spell.description,
      source: spell.source || '5etools',
      edition: spell.edition, // copy selected edition
      components: spell.components,
    });
    onClose();
  };

  const isSpellAlreadyKnown = (spellName: string, spellEdition?: string) => {
    return currentSpells.some(
      (s) => s.name.toLowerCase() === spellName.toLowerCase() && s.edition === spellEdition
    );
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="fade-in">
        <header style={styles.header}>
          <h2 style={styles.title}>
            {editSpell ? 'Edit Spell Details' : 'Add Spell to Character'}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </header>

        {/* Tab switcher - hidden in edit mode */}
        {!editSpell && (
          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'srd' ? styles.activeTabBtn : {}),
              }}
              onClick={() => setActiveTab('srd')}
            >
              📖 Search 5etools Database
            </button>
            <button
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'custom' ? styles.activeTabBtn : {}),
              }}
              onClick={() => setActiveTab('custom')}
            >
              ✍️ Create Custom Spell
            </button>
          </div>
        )}

        <div style={styles.content}>
          {activeTab === 'srd' ? (
            <div style={styles.srdTab}>
              {/* Ruleset Edition selector */}
              <div style={styles.editionSelectorContainer}>
                <span style={styles.selectorLabel}>Spell Ruleset:</span>
                <div style={styles.toggleButtonGroup}>
                  <button
                    type="button"
                    onClick={() => {
                      setEdition('2014');
                      setSelectedSources([]); // Reset selected sources on edition toggle
                      setBulkSelection({});
                    }}
                    style={{
                      ...styles.toggleButton,
                      ...(edition === '2014' ? styles.toggleButtonActive2014 : {}),
                    }}
                  >
                    D&D 5e 2014 (Legacy)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEdition('2024');
                      setSelectedSources([]); // Reset selected sources on edition toggle
                      setBulkSelection({});
                    }}
                    style={{
                      ...styles.toggleButton,
                      ...(edition === '2024' ? styles.toggleButtonActive2024 : {}),
                    }}
                  >
                    D&D 5e 2024 (Modern)
                  </button>
                </div>
              </div>

              {/* Advanced Filters (Class, Level, Sort) */}
              <div style={styles.searchFilterRow}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Class Filter</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">All Classes</option>
                    <option value="Artificer">Artificer</option>
                    <option value="Bard">Bard</option>
                    <option value="Cleric">Cleric</option>
                    <option value="Druid">Druid</option>
                    <option value="Paladin">Paladin</option>
                    <option value="Ranger">Ranger</option>
                    <option value="Sorcerer">Sorcerer</option>
                    <option value="Warlock">Warlock</option>
                    <option value="Wizard">Wizard</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Level Filter</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">All Levels</option>
                    <option value="0">Cantrip</option>
                    <option value="1">1st Level</option>
                    <option value="2">2nd Level</option>
                    <option value="3">3rd Level</option>
                    <option value="4">4th Level</option>
                    <option value="5">5th Level</option>
                    <option value="6">6th Level</option>
                    <option value="7">7th Level</option>
                    <option value="8">8th Level</option>
                    <option value="9">9th Level</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Sort Order</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={styles.filterSelect}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="level-asc">Level (0 to 9)</option>
                    <option value="level-desc">Level (9 to 0)</option>
                  </select>
                </div>
              </div>

              {/* Source Books filtering checklist / tags */}
              {availableSources.length > 0 && (
                <div style={styles.sourcesFilterContainer}>
                  <label style={styles.filterLabel}>Filter by Book (Click to Toggle):</label>
                  <div style={styles.sourcesList}>
                    {availableSources.map((src) => {
                      const active = selectedSources.includes(src);
                      return (
                        <span
                          key={src}
                          onClick={() => {
                            setSelectedSources((prev) =>
                              prev.includes(src)
                                ? prev.filter((s) => s !== src)
                                : [...prev, src]
                            );
                          }}
                          style={{
                            ...styles.sourcePill,
                            ...(active ? styles.sourcePillActive : {}),
                          }}
                        >
                          {src}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Type to search spell name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
                autoFocus
              />

              {/* Select All Page Helper */}
              {!isLoading && sortedMatches.length > 0 && (
                <div style={styles.pageHelperBar}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Available spells: {sortedMatches.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllOnPage}
                    style={styles.selectAllBtn}
                  >
                    Select All on Page
                  </button>
                </div>
              )}
              
              {isLoading ? (
                <div style={styles.loadingState}>
                  <span style={styles.loadingIcon}>⏳</span>
                  <p style={styles.loadingText}>Fetching D&D {edition} database from 5etools CDNs...</p>
                </div>
              ) : (
                <div style={styles.srdList}>
                  {sortedMatches.length === 0 ? (
                    <p style={styles.noResults}>No matching spells found.</p>
                  ) : (
                    sortedMatches.map((spell) => {
                      const known = isSpellAlreadyKnown(spell.name, spell.edition);
                      const isSelected = !!bulkSelection[spell.id];
                      return (
                        <div key={spell.id} style={styles.srdItem}>
                          {!known && (
                            <label style={styles.bulkSelectLabel} title="Select for bulk import">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleBulkSelect(spell)}
                                style={styles.bulkCheckbox}
                              />
                            </label>
                          )}
                          <div style={styles.srdInfo}>
                            <div style={styles.srdNameRow}>
                              <strong style={styles.srdName}>{spell.name}</strong>
                              <span style={styles.srdMeta}>
                                {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`} • {spell.school} • {spell.source || 'PHB'}
                              </span>
                            </div>
                            <p style={styles.srdDesc}>{spell.description}</p>
                          </div>
                          <button
                            onClick={() => handleAddSrd(spell)}
                            disabled={known}
                            style={{
                              ...styles.addBtn,
                              ...(known ? styles.disabledAddBtn : {}),
                            }}
                          >
                            {known ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Bulk Action Panel */}
              {Object.keys(bulkSelection).length > 0 && (
                <div style={styles.bulkActionBar} className="fade-in">
                  <span style={styles.bulkCount}>
                    {Object.keys(bulkSelection).length} spell(s) selected
                  </span>
                  <div style={styles.bulkButtons}>
                    <button
                      type="button"
                      onClick={handleClearBulk}
                      style={styles.bulkClearBtn}
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkAdd}
                      style={styles.bulkAddBtn}
                    >
                      Add Selected Spells
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitCustom} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Spell Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Scorching Ray"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Source Book</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. PHB, Tasha's"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Spell Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value, 10))}
                    style={styles.select}
                  >
                    <option value={0}>Cantrip</option>
                    <option value={1}>1st Level</option>
                    <option value={2}>2nd Level</option>
                    <option value={3}>3rd Level</option>
                    <option value={4}>4th Level</option>
                    <option value={5}>5th Level</option>
                    <option value={6}>6th Level</option>
                    <option value={7}>7th Level</option>
                    <option value={8}>8th Level</option>
                    <option value={9}>9th Level</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>School of Magic</label>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    style={styles.select}
                  >
                    <option value="abjuration">Abjuration</option>
                    <option value="conjuration">Conjuration</option>
                    <option value="divination">Divination</option>
                    <option value="enchantment">Enchantment</option>
                    <option value="evocation">Evocation</option>
                    <option value="illusion">Illusion</option>
                    <option value="necromancy">Necromancy</option>
                    <option value="transmutation">Transmutation</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Casting Time</label>
                  <input
                    type="text"
                    value={castingTime}
                    onChange={(e) => setCastingTime(e.target.value)}
                    placeholder="1 action, 1 bonus action..."
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Range</label>
                  <input
                    type="text"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    placeholder="Self, 60 feet, Touch..."
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Instantaneous, 1 minute..."
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div style={styles.togglesRow}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={concentration}
                    onChange={(e) => setConcentration(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Concentration Required</span>
                </label>

                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={ritual}
                    onChange={(e) => setRitual(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Ritual Spell</span>
                </label>

                {level > 0 && (
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={prepared}
                      onChange={(e) => setPrepared(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>Prepared Spell</span>
                  </label>
                )}
              </div>

              {/* Component Checkboxes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Spell Components</label>
                <div style={styles.togglesRow}>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={compV}
                      onChange={(e) => setCompV(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>V (Verbal)</span>
                  </label>

                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={compS}
                      onChange={(e) => setCompS(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>S (Somatic)</span>
                  </label>

                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={compM}
                      onChange={(e) => setCompM(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>M (Material)</span>
                  </label>
                </div>
              </div>

              {compM && (
                <div style={styles.formGroup} className="fade-in">
                  <label style={styles.label}>Material Component Description</label>
                  <input
                    type="text"
                    value={compMaterialText}
                    onChange={(e) => setCompMaterialText(e.target.value)}
                    placeholder="e.g. a tiny pinch of sand, a piece of copper wire..."
                    style={styles.input}
                  />
                </div>
              )}

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Spell Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details of the spell's effects..."
                  style={styles.textarea}
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                {editSpell ? 'Save Spell Changes' : 'Add Spell to Character'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '1.5rem',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-muted)',
  },
  title: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeBtn: {
    fontSize: '1.25rem',
    color: 'var(--text-muted)',
    padding: '0.25rem',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-primary)',
  },
  tabBtn: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    textAlign: 'center',
  },
  activeTabBtn: {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '2px solid var(--color-primary)',
  },
  content: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  srdTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '0.6rem 1rem',
    fontSize: '0.9rem',
  },
  srdList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '350px',
    overflowY: 'auto',
    paddingRight: '0.25rem',
  },
  noResults: {
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '2rem',
    fontSize: '0.9rem',
  },
  srdItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    gap: '1rem',
  },
  srdInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
    overflow: 'hidden',
  },
  srdNameRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  srdName: {
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
  },
  srdMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  srdDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  addBtn: {
    padding: '0.4rem 0.85rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  disabledAddBtn: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-muted)',
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
  },
  select: {
    width: '100%',
  },
  togglesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem 1.5rem',
    margin: '0.25rem 0',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  textarea: {
    height: '100px',
    resize: 'vertical',
    fontSize: '0.85rem',
  },
  submitBtn: {
    padding: '0.75rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    marginTop: '0.5rem',
    boxShadow: 'var(--shadow-md)',
  },
  editionSelectorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  selectorLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  toggleButtonGroup: {
    display: 'flex',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-primary)',
  },
  toggleButton: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  toggleButtonActive2014: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderBottom: '2px solid var(--text-muted)',
  },
  toggleButtonActive2024: {
    backgroundColor: 'var(--bg-card)',
    color: 'var(--color-secondary)',
    borderBottom: '2px solid var(--color-secondary)',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 2rem',
    gap: '0.75rem',
  },
  loadingIcon: {
    fontSize: '2rem',
  },
  loadingText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  searchFilterRow: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  filterSelect: {
    width: '100%',
    padding: '0.4rem 0.75rem',
    fontSize: '0.825rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  },
  sourcesFilterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  sourcesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    maxHeight: '80px',
    overflowY: 'auto',
    padding: '0.25rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
  },
  sourcePill: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-primary)',
    padding: '0.15rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease',
  },
  sourcePillActive: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderColor: 'var(--color-primary)',
  },
  pageHelperBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 0.25rem',
  },
  selectAllBtn: {
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  bulkSelectLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  bulkCheckbox: {
    cursor: 'pointer',
    width: '15px',
    height: '15px',
  },
  bulkActionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-muted)',
    padding: '0.75rem 1rem',
    margin: '0.5rem -1.5rem -1.5rem -1.5rem',
    borderBottomLeftRadius: 'var(--radius-lg)',
    borderBottomRightRadius: 'var(--radius-lg)',
    gap: '1rem',
    boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
  },
  bulkCount: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  bulkButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  bulkClearBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  bulkAddBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.8rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
  },
};
