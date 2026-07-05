import type { Roll20Character, Roll20Attribute } from '../types/roll20';
import type { Character } from '../types/character';
import { formatSpellLevel } from '../parser/roll20Parser';

/**
 * Generates a Roll20-compatible unique RowID (starts with '-' followed by alphanumeric characters).
 */
export function generateRoll20Id(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '-';
  // Generates an 18-character random string (standard for Roll20 RowIDs)
  for (let i = 0; i < 18; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Exports the updated Character model back to a Roll20 JSON object.
 * It removes existing repeating_spell-* attributes and recreates them
 * while preserving unmapped spell attributes and all other non-spell character attributes.
 */
export function exportToRoll20Character(character: Character): Roll20Character {
  const original = character.originalJson;
  const cloned: Roll20Character = JSON.parse(JSON.stringify(original));
  
  // Update character name if changed (checking both character.name and top-level name)
  if (cloned.character) {
    cloned.character.name = character.name;
  } else {
    cloned.name = character.name;
  }

  // Determine whether the JSON uses 'attributes' or 'attribs'
  const isAttributesFormat = Array.isArray(cloned.attributes) && !Array.isArray(cloned.attribs);
  const currentAttribsList = (isAttributesFormat ? cloned.attributes : cloned.attribs) || [];

  // Extract all existing repeating spell attributes to check for extra/custom properties
  const oldSpellAttributes: Record<string, Roll20Attribute[]> = {};
  const repeatingSpellRegex = /^repeating_spell-[a-zA-Z0-9]+_([-_a-zA-Z0-9]+)_(.+)$/;

  for (const attr of currentAttribsList) {
    if (!attr.name) continue;
    const match = attr.name.match(repeatingSpellRegex);
    if (match) {
      const [, rowId] = match;
      if (!oldSpellAttributes[rowId]) {
        oldSpellAttributes[rowId] = [];
      }
      oldSpellAttributes[rowId].push(attr);
    }
  }

  // Filter out ALL existing repeating spell attributes from the cloned attributes list
  const filteredAttribs = currentAttribsList.filter(
    (attr) => !attr.name || !attr.name.startsWith('repeating_spell-')
  );

  // Keep track of repeating spell orders for each level to update _reporder attributes
  const repOrders: Record<string, string[]> = {};

  // Rebuild repeating spell attributes from our updated spells list
  const newAttributes: Roll20Attribute[] = [];

  for (const spell of character.spells) {
    const rowId = spell.id && spell.id.startsWith('-') ? spell.id : generateRoll20Id();
    const levelStr = formatSpellLevel(spell.level);

    if (!repOrders[levelStr]) {
      repOrders[levelStr] = [];
    }
    repOrders[levelStr].push(rowId);
    
    // Check if we have original attributes for this row ID to preserve custom fields
    const originalAttrs = oldSpellAttributes[spell.id] || [];
    const customFieldsMap: Record<string, Roll20Attribute> = {};

    for (const attr of originalAttrs) {
      const match = attr.name.match(/^repeating_spell-[a-zA-Z0-9]+_[-_a-zA-Z0-9]+_(.+)$/);
      if (match) {
        const [, field] = match;
        customFieldsMap[field.toLowerCase()] = attr;
      }
    }

    // List of standard field names we manage in our model
    const managedFields = new Set([
      'spellname',
      'spellprepared',
      'spellritual',
      'spellconcentration',
      'spellschool',
      'spellcastingtime',
      'spellrange',
      'spellduration',
      'spelllevel',
      'spellsource',
      'spelldescription',
      'spellathigherlevels',
      'spellcomp_v',
      'spellcomp_s',
      'spellcomp_m',
      'spellcomp_materials',
      'spellalwaysprepared',
    ]);

    // Define function to create or update an attribute
    const addAttribute = (field: string, val: string | number) => {
      const fieldLower = field.toLowerCase();
      const existing = customFieldsMap[fieldLower];
      
      const attrName = `repeating_spell-${levelStr}_${rowId}_${field}`;
      
      if (existing) {
        newAttributes.push({
          ...existing,
          name: attrName, // Updates level prefix if spell level changed
          current: val,
        });
      } else {
        newAttributes.push({
          name: attrName,
          current: val,
          max: '',
          // VTT exports do not always require attribute ids, but standard Roll20 does
          id: generateRoll20Id(),
        });
      }
    };

    // Add managed fields
    addAttribute('spellname', spell.name);
    addAttribute('spellprepared', spell.prepared ? '1' : '0');
    addAttribute('spellritual', spell.ritual ? '{{ritual=1}}' : '0');
    addAttribute('spellconcentration', spell.concentration ? '{{concentration=1}}' : '0');
    addAttribute('spellschool', spell.school);
    addAttribute('spellcastingtime', spell.castingTime);
    addAttribute('spellrange', spell.range);
    addAttribute('spellduration', spell.duration);
    addAttribute('spelllevel', spell.level === 0 ? 'cantrip' : spell.level);
    addAttribute('spellsource', spell.source || '');
    addAttribute('spelldescription', spell.description || '');
    addAttribute('spellathigherlevels', spell.higherLevel || '');

    // Add spell component fields
    const comps = spell.components || { v: false, s: false, m: false };
    addAttribute('spellcomp_v', comps.v ? '{{v=1}}' : '0');
    addAttribute('spellcomp_s', comps.s ? '{{s=1}}' : '0');
    addAttribute('spellcomp_m', comps.m ? '{{m=1}}' : '0');
    addAttribute('spellcomp_materials', comps.material || '');

    // Add alwaysPrepared status
    addAttribute('spellalwaysprepared', spell.alwaysPrepared ? '1' : '0');

    // Copy any unmanaged (custom) fields that the user had on this spell
    for (const [fieldKey, attr] of Object.entries(customFieldsMap)) {
      if (!managedFields.has(fieldKey)) {
        // Carry over unchanged attributes, updating the level if the spell level changed
        const attrName = `repeating_spell-${levelStr}_${rowId}_${attr.name.split('_').slice(-1)[0]}`;
        newAttributes.push({
          ...attr,
          name: attrName,
        });
      }
    }
  }

  // Filter out any existing _reporder_repeating_spell- attributes from the cloned list
  const finalAttribs = filteredAttribs.filter(
    (attr) => !attr.name || !attr.name.startsWith('_reporder_repeating_spell-')
  );

  // Add the newly compiled _reporder attributes so that deletions are synced correctly on import
  for (const [levelKey, rowIds] of Object.entries(repOrders)) {
    finalAttribs.push({
      name: `_reporder_repeating_spell-${levelKey}`,
      current: rowIds.join(','),
      max: '',
      id: generateRoll20Id(),
    });
  }

  finalAttribs.push(...newAttributes);

  if (isAttributesFormat) {
    cloned.attributes = finalAttribs;
  } else {
    cloned.attribs = finalAttribs;
  }

  return cloned;
}
