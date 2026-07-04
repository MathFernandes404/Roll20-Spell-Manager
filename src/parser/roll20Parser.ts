import type { Roll20Character } from '../types/roll20';
import type { Character, Spell } from '../types/character';

const REPEATING_SPELL_REGEX = /^repeating_spell-([a-zA-Z0-9]+)_([-_a-zA-Z0-9]+)_(.+)$/;

/**
 * Converts a Roll20 spell level string to our internal number representation (0-9).
 */
export function parseSpellLevel(levelStr: string): number {
  const normalized = levelStr.toLowerCase();
  if (normalized === 'cantrip') return 0;
  const num = parseInt(normalized, 10);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, 0), 9);
}

/**
 * Converts our internal spell level number to the Roll20 level string.
 */
export function formatSpellLevel(level: number): string {
  if (level === 0) return 'cantrip';
  return String(level);
}

/**
 * Parses a Roll20 character JSON, extracting spells and preserving all other attributes.
 */
export function parseRoll20Character(json: Roll20Character): Character {
  const spellsMap: Record<string, Partial<Spell> & { rawLevelStr: string }> = {};
  const attribs = json.attribs || json.attributes || [];

  if (json && Array.isArray(attribs)) {
    for (const attr of attribs) {
      if (!attr.name) continue;
      
      const match = attr.name.match(REPEATING_SPELL_REGEX);
      if (match) {
        const [, levelStr, rowId, field] = match;
        
        if (!spellsMap[rowId]) {
          spellsMap[rowId] = {
            id: rowId,
            rawLevelStr: levelStr,
            level: parseSpellLevel(levelStr),
          };
        }

        const value = attr.current !== undefined ? String(attr.current) : '';

        switch (field.toLowerCase()) {
          case 'spellname':
            spellsMap[rowId].name = value;
            break;
          case 'spellprepared':
            // "1" or "yes" or 1 means prepared
            spellsMap[rowId].prepared = value === '1' || value.toLowerCase() === 'yes';
            break;
          case 'spellritual':
            spellsMap[rowId].ritual = value === '1' || value.toLowerCase() === 'yes' || value.includes('ritual');
            break;
          case 'spellschool':
            spellsMap[rowId].school = value;
            break;
          case 'spellcastingtime':
            spellsMap[rowId].castingTime = value;
            break;
          case 'spellrange':
            spellsMap[rowId].range = value;
            break;
          case 'spellduration':
            spellsMap[rowId].duration = value;
            break;
          case 'spellconcentration':
            spellsMap[rowId].concentration = value === '1' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'concentration' || value.includes('concentration');
            break;
          case 'spellsource':
            spellsMap[rowId].source = value;
            break;
          case 'spelldescription':
            spellsMap[rowId].description = value;
            break;
          case 'spellcomp_v':
            spellsMap[rowId].components = spellsMap[rowId].components || { v: false, s: false, m: false };
            spellsMap[rowId].components!.v = value === '{{v=1}}' || value === '1';
            break;
          case 'spellcomp_s':
            spellsMap[rowId].components = spellsMap[rowId].components || { v: false, s: false, m: false };
            spellsMap[rowId].components!.s = value === '{{s=1}}' || value === '1';
            break;
          case 'spellcomp_m':
            spellsMap[rowId].components = spellsMap[rowId].components || { v: false, s: false, m: false };
            spellsMap[rowId].components!.m = value === '{{m=1}}' || value === '1';
            break;
          case 'spellcomp_materials':
            spellsMap[rowId].components = spellsMap[rowId].components || { v: false, s: false, m: false };
            spellsMap[rowId].components!.material = value;
            break;
          case 'spellalwaysprepared':
            spellsMap[rowId].alwaysPrepared = value === '1' || value.toLowerCase() === 'yes';
            break;
          default:
            // Custom or extra fields under repeating_spell are ignored but could be extended
            break;
        }
      }
    }
  }

  const spells: Spell[] = Object.values(spellsMap).map((item) => {
    const isCantrip = item.level === 0;
    return {
      id: item.id || '',
      name: item.name || 'Unnamed Spell',
      level: item.level ?? 0,
      school: item.school || '',
      castingTime: item.castingTime || '',
      range: item.range || '',
      duration: item.duration || '',
      concentration: !!item.concentration,
      ritual: !!item.ritual,
      // Cantrips are usually implicitly prepared, but we honor the parsed state or default to true for cantrips
      prepared: item.prepared ?? isCantrip,
      description: item.description || '',
      source: item.source || '',
      components: item.components || { v: false, s: false, m: false },
      alwaysPrepared: !!item.alwaysPrepared,
    };
  });

  return {
    name: json.name || json.character?.name || 'Unnamed Character',
    spells,
    originalJson: json,
  };
}
