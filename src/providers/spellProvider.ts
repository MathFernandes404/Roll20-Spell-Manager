import type { Spell } from '../types/character';

export interface SpellProvider {
  id: string;
  name: string;
  searchSpells(
    query: string,
    filters?: {
      level?: number;
      school?: string;
      concentration?: boolean;
      ritual?: boolean;
    }
  ): Promise<Spell[]>;
  getAllSpells(): Promise<Spell[]>;
}
