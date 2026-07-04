import type { Spell } from '../types/character';
import type { SpellProvider } from './spellProvider';

/**
 * Maps 5etools school abbreviations to full school names.
 */
const SCHOOL_MAP: Record<string, string> = {
  A: 'abjuration',
  C: 'conjuration',
  D: 'divination',
  EN: 'enchantment',
  EV: 'evocation',
  I: 'illusion',
  N: 'necromancy',
  T: 'transmutation',
};

/**
 * Cleans GiddyLimit markdown tags like {@spell Fire Bolt|PHB} or {@damage 1d10} into readable text.
 */
function cleanTags(text: string): string {
  if (!text) return '';
  // Replaces {@tag spell_name|source} or {@tag value} with just spell_name/value
  return text.replace(/\{@\w+\s+([^}|]+)(?:\|[^}]+)?\}/g, '$1');
}

/**
 * Formats 5etools casting time array into a human-readable string.
 */
function formatCastingTime(timeArr: any[]): string {
  if (!timeArr || timeArr.length === 0) return '1 action';
  return timeArr
    .map((t) => {
      const unit = t.unit === 'bonus' ? 'bonus action' : t.unit;
      return `${t.number} ${unit}`;
    })
    .join(' or ');
}

/**
 * Formats 5etools range object into a human-readable string.
 */
function formatRange(range: any): string {
  if (!range) return 'Self';
  const type = String(range.type || '').toLowerCase();
  
  if (type === 'self') return 'Self';
  if (type === 'touch') return 'Touch';
  if (type === 'sight') return 'Sight';
  if (type === 'special') return 'Special';

  if (range.distance) {
    const dist = range.distance;
    const amount = dist.amount;
    const unit = String(dist.type || '');
    if (amount === undefined) {
      return unit.charAt(0).toUpperCase() + unit.slice(1);
    }
    return `${amount} ${amount > 1 ? `${unit}s` : unit}`;
  }

  return range.type ? range.type.charAt(0).toUpperCase() + range.type.slice(1) : '';
}

/**
 * Formats 5etools duration array into a human-readable string and detects concentration.
 */
function formatDuration(durationArr: any[]): { durationStr: string; concentration: boolean } {
  if (!durationArr || durationArr.length === 0) {
    return { durationStr: 'Instantaneous', concentration: false };
  }

  let concentration = false;
  const parts = durationArr.map((d) => {
    if (d.concentration) concentration = true;
    const type = String(d.type || '').toLowerCase();

    if (type === 'instant') return 'Instantaneous';
    if (type === 'permanent') return 'Permanent';
    if (type === 'special') return 'Special';
    
    if (type === 'timed' && d.duration) {
      const amount = d.duration.amount;
      const unit = d.duration.type;
      const pluralUnit = amount > 1 ? `${unit}s` : unit;
      return `${amount} ${pluralUnit}`;
    }
    return d.type || '';
  });

  let durationStr = parts.join(' or ');
  if (concentration) {
    durationStr = `Concentration, up to ${durationStr}`;
  }

  return { durationStr, concentration };
}

/**
 * Recursively formats 5etools description entries into a clean string.
 */
function formatEntries(entries: any[]): string {
  if (!entries) return '';
  return entries
    .map((entry) => {
      if (typeof entry === 'string') {
        return cleanTags(entry);
      }
      
      if (entry.type === 'entries' && entry.entries) {
        return `**${entry.name}**: ` + formatEntries(entry.entries);
      }
      
      if (entry.type === 'list' && entry.items) {
        return entry.items
          .map((item: any) => `• ${typeof item === 'string' ? cleanTags(item) : formatEntries([item])}`)
          .join('\n');
      }

      if (entry.type === 'table' && entry.rows) {
        // Simple fallback formatting for tables
        let tableStr = `**${entry.caption || 'Table'}**\n`;
        if (entry.colHeaders) {
          tableStr += `| ${entry.colHeaders.join(' | ')} |\n`;
        }
        entry.rows.forEach((row: any[]) => {
          const cleanRow = row.map((cell) => {
            if (typeof cell === 'string') return cleanTags(cell);
            if (cell.roll) return cell.roll.entry || JSON.stringify(cell);
            return JSON.stringify(cell);
          });
          tableStr += `| ${cleanRow.join(' | ')} |\n`;
        });
        return tableStr;
      }

      return '';
    })
    .join('\n\n');
}

export class FiveEToolsProvider implements SpellProvider {
  id: string;
  name: string;
  edition: '2014' | '2024';
  private baseUrl: string;
  private cachedSpells: Spell[] = [];
  private loadingPromise: Promise<Spell[]> | null = null;

  constructor(edition: '2014' | '2024') {
    this.edition = edition;
    this.id = `5etools-${edition}`;
    this.name = edition === '2014' ? '5etools 2014 (Legacy)' : '5etools 2024 (Modern)';
    
    // Remote URLs hosted on official community git repositories
    this.baseUrl = edition === '2014'
      ? 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-2014-src/master/data/spells/'
      : 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells/';
  }

  /**
   * Initializes loading by fetching the spell index and pre-fetching the main sourcebooks.
   */
  async loadSpells(): Promise<Spell[]> {
    if (this.cachedSpells.length > 0) return this.cachedSpells;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        // 1. Fetch index.json and sources.json concurrently
        const [indexRes, sourcesRes] = await Promise.all([
          fetch(`${this.baseUrl}index.json`),
          fetch(`${this.baseUrl}sources.json`)
        ]);

        if (!indexRes.ok) {
          throw new Error(`Failed to load spell index for ${this.name}`);
        }
        const indexMap: Record<string, string> = await indexRes.json();
        const sourcesMap: Record<string, any> = sourcesRes.ok ? await sourcesRes.json() : {};

        // 2. Fetch all sourcebook files in parallel
        const targetSources = Object.keys(indexMap);
        const fetchPromises: Promise<{ source: string; data: any } | null>[] = [];

        for (const source of targetSources) {
          const fileName = indexMap[source];
          if (fileName) {
            fetchPromises.push(
              fetch(`${this.baseUrl}${fileName}`)
                .then(async (res) => {
                  if (res.ok) {
                    const data = await res.json();
                    return { source, data };
                  }
                  return null;
                })
                .catch(() => null)
            );
          }
        }

        const results = await Promise.all(fetchPromises);
        const compiledSpells: Spell[] = [];
        let counter = 0;

        for (const result of results) {
          if (result && result.data && Array.isArray(result.data.spell)) {
            for (const s of result.data.spell) {
              // Convert 5etools spell schema to internal Spell schema
              const { durationStr, concentration } = formatDuration(s.duration);
              
              // Extract class mappings using sources.json
              const sourceKey = String(s.source || result.source || 'PHB').toUpperCase();
              const spellSourceMap = sourcesMap[sourceKey] || {};
              const spellClassData = spellSourceMap[s.name] || {};
              const classesList = (spellClassData.class || []).map((c: any) => c.name);

              // Extract components from 5etools spell object
              let materialStr: string | undefined = undefined;
              if (s.components?.m) {
                if (typeof s.components.m === 'string') {
                  materialStr = s.components.m;
                } else if (typeof s.components.m === 'object') {
                  materialStr = s.components.m.text || undefined;
                }
              }

              const spellObj: Spell = {
                id: `5e-${this.edition}-${counter++}`,
                name: s.name,
                level: s.level,
                school: SCHOOL_MAP[s.school] || s.school || 'evocation',
                castingTime: formatCastingTime(s.time),
                range: formatRange(s.range),
                duration: durationStr,
                concentration,
                ritual: !!(s.meta && s.meta.ritual),
                prepared: s.level === 0, // default cantrips to prepared
                description: formatEntries(s.entries),
                source: s.source || result.source || 'PHB',
                edition: this.edition,
                classes: classesList.length > 0 ? classesList : undefined,
                components: s.components ? {
                  v: !!s.components.v,
                  s: !!s.components.s,
                  m: !!s.components.m,
                  material: materialStr,
                } : { v: false, s: false, m: false },
              };
              compiledSpells.push(spellObj);
            }
          }
        }

        this.cachedSpells = compiledSpells;
        return compiledSpells;
      } catch (err) {
        console.error(err);
        this.loadingPromise = null; // Reset to allow retry
        return [];
      }
    })();

    return this.loadingPromise;
  }

  async getAllSpells(): Promise<Spell[]> {
    return this.loadSpells();
  }

  getLoadedSources(): string[] {
    const sources = new Set<string>();
    for (const spell of this.cachedSpells) {
      if (spell.source) sources.add(spell.source.toUpperCase());
    }
    return Array.from(sources).sort();
  }

  async searchSpells(
    query: string,
    filters?: {
      level?: number;
      school?: string;
      concentration?: boolean;
      ritual?: boolean;
      className?: string;
      sources?: string[];
    }
  ): Promise<Spell[]> {
    const spells = await this.getAllSpells();
    const cleanQuery = query.trim().toLowerCase();

    return spells.filter((spell) => {
      // 1. Text Query matches name or description
      if (
        cleanQuery &&
        !spell.name.toLowerCase().includes(cleanQuery) &&
        !spell.description?.toLowerCase().includes(cleanQuery)
      ) {
        return false;
      }

      // 2. Filters
      if (filters) {
        if (filters.level !== undefined && spell.level !== filters.level) {
          return false;
        }
        if (filters.school && spell.school.toLowerCase() !== filters.school.toLowerCase()) {
          return false;
        }
        if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
          return false;
        }
        if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
          return false;
        }
        if (filters.className) {
          const matchClass = (spell.classes || []).some(
            (c) => c.toLowerCase() === filters.className!.toLowerCase()
          );
          if (!matchClass) return false;
        }
        if (filters.sources && filters.sources.length > 0) {
          const matchSource = filters.sources.some(
            (src) => (spell.source || '').toUpperCase() === src.toUpperCase()
          );
          if (!matchSource) return false;
        }
      }

      return true;
    });
  }
}
