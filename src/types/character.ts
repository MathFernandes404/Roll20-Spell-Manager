import type { Roll20Character } from './roll20';

export interface Spell {
  id: string;            // Roll20 RowID or a newly generated random ID
  name: string;
  level: number;         // 0 for Cantrip, 1 to 9 for spell levels
  school: string;        // e.g. "evocation", "abjuration"
  castingTime: string;   // e.g. "1 action", "1 bonus action"
  range: string;         // e.g. "60 feet", "Self"
  duration: string;      // e.g. "Instantaneous", "Concentration, up to 1 minute"
  concentration: boolean;
  ritual: boolean;
  prepared: boolean;
  description?: string;
  higherLevel?: string;  // Text details for upcasting (At Higher Levels / Using a Higher-Level Spell Slot)
  source?: string;       // e.g. "SRD", "5etools"
  edition?: '2014' | '2024'; // Separates legacy D&D 5e 2014 and modern 5e 2024
  classes?: string[];    // e.g. ["Wizard", "Sorcerer"]
  components?: {
    v: boolean;
    s: boolean;
    m: boolean;
    material?: string;
  };
  alwaysPrepared?: boolean;
}

export interface Character {
  name: string;
  spells: Spell[];
  originalJson: Roll20Character; // Kept intact to allow lossless export
}
