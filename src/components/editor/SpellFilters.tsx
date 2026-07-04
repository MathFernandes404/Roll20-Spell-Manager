import React from 'react';

export interface FilterState {
  search: string;
  level: string; // 'all', '0', '1', ..., '9'
  school: string;
  concentration: string; // 'all', 'yes', 'no'
  ritual: string; // 'all', 'yes', 'no'
  prepared: string; // 'all', 'yes', 'no'
  sortBy: 'name' | 'level';
}

interface SpellFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export const SpellFilters: React.FC<SpellFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.level !== 'all' ||
    filters.school !== 'all' ||
    filters.concentration !== 'all' ||
    filters.ritual !== 'all' ||
    filters.prepared !== 'all';

  return (
    <div style={styles.container}>
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="🔍 Search spell by name or description..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          style={styles.searchInput}
        />
        {hasActiveFilters && (
          <button onClick={onClear} style={styles.clearBtn}>
            Reset Filters
          </button>
        )}
      </div>

      <div style={styles.filtersGrid}>
        {/* Level Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>Level</label>
          <select
            value={filters.level}
            onChange={(e) => updateFilter('level', e.target.value)}
            style={styles.select}
          >
            <option value="all">All Levels</option>
            <option value="0">Cantrips</option>
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

        {/* School Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>School</label>
          <select
            value={filters.school}
            onChange={(e) => updateFilter('school', e.target.value)}
            style={styles.select}
          >
            <option value="all">All Schools</option>
            {SCHOOLS.map((school) => (
              <option key={school} value={school.toLowerCase()}>
                {school}
              </option>
            ))}
          </select>
        </div>

        {/* Prepared Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>Prepared</label>
          <select
            value={filters.prepared}
            onChange={(e) => updateFilter('prepared', e.target.value)}
            style={styles.select}
          >
            <option value="all">All States</option>
            <option value="yes">Prepared</option>
            <option value="no">Unprepared</option>
          </select>
        </div>

        {/* Concentration Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>Concentration</label>
          <select
            value={filters.concentration}
            onChange={(e) => updateFilter('concentration', e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Ritual Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>Ritual</label>
          <select
            value={filters.ritual}
            onChange={(e) => updateFilter('ritual', e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div style={styles.filterCol}>
          <label style={styles.label}>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            style={styles.select}
          >
            <option value="name">Name</option>
            <option value="level">Level</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchRow: {
    display: 'flex',
    gap: '0.75rem',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    padding: '0.6rem 1rem',
    fontSize: '0.9rem',
  },
  clearBtn: {
    padding: '0.6rem 1.25rem',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem',
  },
  filterCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '0.4rem 0.5rem',
    fontSize: '0.85rem',
    backgroundColor: 'var(--bg-tertiary)',
  },
};
