import { useState, useCallback } from 'react';
import type { Character, Spell } from '../types/character';
import type { Roll20Character } from '../types/roll20';
import { parseRoll20Character } from '../parser/roll20Parser';
import { exportToRoll20Character, generateRoll20Id } from '../exporter/roll20Exporter';

export interface UseCharacterResult {
  character: Character | null;
  error: string | null;
  importCharacter: (json: Roll20Character) => void;
  clearCharacter: () => void;
  updateCharacterName: (name: string) => void;
  addSpell: (spell: Omit<Spell, 'id' | 'prepared'> & { prepared?: boolean }) => void;
  removeSpell: (id: string) => void;
  updateSpell: (id: string, updates: Partial<Spell>) => void;
  togglePrepared: (id: string) => void;
  toggleRitual: (id: string) => void;
  toggleConcentration: (id: string) => void;
  exportCharacter: () => Roll20Character | null;
  saveSpellPreparation: (preparedSpellIds: Set<string>, alwaysPreparedSpellIds: Set<string>) => void;
}

export function useCharacter(): UseCharacterResult {
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importCharacter = useCallback((json: Roll20Character) => {
    try {
      setError(null);
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON structure.');
      }
      if (!Array.isArray(json.attribs) && !Array.isArray(json.attributes)) {
        throw new Error('Invalid Roll20 character format: missing "attribs" or "attributes" array.');
      }
      const parsed = parseRoll20Character(json);
      setCharacter(parsed);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse character JSON');
      setCharacter(null);
    }
  }, []);

  const clearCharacter = useCallback(() => {
    setCharacter(null);
    setError(null);
  }, []);

  const updateCharacterName = useCallback((name: string) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return { ...prev, name };
    });
  }, []);

  const addSpell = useCallback((spellInput: Omit<Spell, 'id' | 'prepared'> & { prepared?: boolean }) => {
    setCharacter((prev) => {
      if (!prev) return null;
      
      const newSpell: Spell = {
        ...spellInput,
        id: generateRoll20Id(),
        prepared: spellInput.prepared ?? (spellInput.level === 0),
      };

      return {
        ...prev,
        spells: [...prev.spells, newSpell],
      };
    });
  }, []);

  const removeSpell = useCallback((id: string) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.filter((s) => s.id !== id),
      };
    });
  }, []);

  const updateSpell = useCallback((id: string, updates: Partial<Spell>) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
    });
  }, []);

  const togglePrepared = useCallback((id: string) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.map((s) => (s.id === id ? { ...s, prepared: !s.prepared } : s)),
      };
    });
  }, []);

  const toggleRitual = useCallback((id: string) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.map((s) => (s.id === id ? { ...s, ritual: !s.ritual } : s)),
      };
    });
  }, []);

  const toggleConcentration = useCallback((id: string) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.map((s) => (s.id === id ? { ...s, concentration: !s.concentration } : s)),
      };
    });
  }, []);

  const exportCharacter = useCallback(() => {
    if (!character) {
      setError('No character to export.');
      return null;
    }
    try {
      return exportToRoll20Character(character);
    } catch (err: any) {
      setError(err?.message || 'Failed to export character JSON');
      return null;
    }
  }, [character]);

  const saveSpellPreparation = useCallback((preparedIds: Set<string>, alwaysPreparedIds: Set<string>) => {
    setCharacter((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        spells: prev.spells.map((s) => ({
          ...s,
          prepared: preparedIds.has(s.id) || alwaysPreparedIds.has(s.id),
          alwaysPrepared: alwaysPreparedIds.has(s.id),
        })),
      };
    });
  }, []);

  return {
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
  };
}
