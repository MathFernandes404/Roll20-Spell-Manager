import type { Spell } from '../types/character';
import type { SpellProvider } from './spellProvider';

// A collection of popular D&D 5e SRD spells for offline use/mocking
const SRD_SPELLS_DATABASE: Omit<Spell, 'id' | 'prepared'>[] = [
  {
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.',
    source: 'SRD',
  },
  {
    name: 'Guidance',
    level: 0,
    school: 'divination',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.',
    source: 'SRD',
  },
  {
    name: 'Mage Hand',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '30 feet',
    duration: '1 minute',
    concentration: false,
    ritual: false,
    description: 'A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action.',
    source: 'SRD',
  },
  {
    name: 'Shield',
    level: 1,
    school: 'abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    duration: '1 round',
    concentration: false,
    ritual: false,
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
    source: 'SRD',
  },
  {
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target.',
    source: 'SRD',
  },
  {
    name: 'Cure Wounds',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.',
    source: 'SRD',
  },
  {
    name: 'Mage Armor',
    level: 1,
    school: 'abjuration',
    castingTime: '1 action',
    range: 'Touch',
    duration: '8 hours',
    concentration: false,
    ritual: false,
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier.',
    source: 'SRD',
  },
  {
    name: 'Detect Magic',
    level: 1,
    school: 'divination',
    castingTime: '1 action',
    range: 'Self',
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: true,
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic.',
    source: 'SRD',
  },
  {
    name: 'Find Familiar',
    level: 1,
    school: 'conjuration',
    castingTime: '1 hour',
    range: '10 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: true,
    description: 'You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog, hawk, lizard, octopus, owl, snake, fish, rat, raven, seahorse, spider, or weasel.',
    source: 'SRD',
  },
  {
    name: 'Misty Step',
    level: 2,
    school: 'conjuration',
    castingTime: '1 bonus action',
    range: 'Self',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
    source: 'SRD',
  },
  {
    name: 'Invisibility',
    level: 2,
    school: 'illusion',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 1 hour',
    concentration: true,
    ritual: false,
    description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person.',
    source: 'SRD',
  },
  {
    name: 'Fireball',
    level: 3,
    school: 'evocation',
    castingTime: '1 action',
    range: '150 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
    source: 'SRD',
  },
  {
    name: 'Counterspell',
    level: 3,
    school: 'abjuration',
    castingTime: '1 reaction',
    range: '60 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect.',
    source: 'SRD',
  },
  {
    name: 'Haste',
    level: 3,
    school: 'transmutation',
    castingTime: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false,
    description: 'Choose a willing creature that you can see within range. Until the spell ends, the target\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.',
    source: 'SRD',
  },
  {
    name: 'Fly',
    level: 3,
    school: 'transmutation',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: false,
    description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it has another means of keeping itself aloft.',
    source: 'SRD',
  },
  {
    name: 'Polymorph',
    level: 4,
    school: 'transmutation',
    castingTime: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 1 hour',
    concentration: true,
    ritual: false,
    description: 'This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect.',
    source: 'SRD',
  },
  {
    name: 'Dimension Door',
    level: 4,
    school: 'conjuration',
    castingTime: '1 action',
    range: '500 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction.',
    source: 'SRD',
  },
  {
    name: 'Greater Invisibility',
    level: 4,
    school: 'illusion',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false,
    description: 'You or a creature you touch becomes invisible until the spell ends. You remain invisible even if you attack or cast a spell.',
    source: 'SRD',
  },
  {
    name: 'Telekinesis',
    level: 5,
    school: 'transmutation',
    castingTime: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: false,
    description: 'You gain the ability to move or manipulate creatures or objects by sheer force of will. When you cast the spell, and as your action on each turn for the duration, you can exert your will on one creature or object.',
    source: 'SRD',
  },
  {
    name: 'Disintegrate',
    level: 6,
    school: 'transmutation',
    castingTime: '1 action',
    range: '60 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A thin green ray springs from your pointing finger to a target that you can see within range. A creature targeted by this spell must make a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated.',
    source: 'SRD',
  },
  {
    name: 'Wish',
    level: 9,
    school: 'conjuration',
    castingTime: '1 action',
    range: 'Self',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires. The basic use of this spell is to duplicate any other spell of 8th level or lower.',
    source: 'SRD',
  },
];

export class SrdProvider implements SpellProvider {
  id = 'srd';
  name = 'D&D 5e SRD (Standard)';

  async getAllSpells(): Promise<Spell[]> {
    return SRD_SPELLS_DATABASE.map((spell, index) => ({
      ...spell,
      id: `srd-spell-${index}`,
      prepared: spell.level === 0, // default cantrips to prepared, others to false
    }));
  }

  async searchSpells(
    query: string,
    filters?: {
      level?: number;
      school?: string;
      concentration?: boolean;
      ritual?: boolean;
    }
  ): Promise<Spell[]> {
    const spells = await this.getAllSpells();
    const queryClean = query.trim().toLowerCase();

    return spells.filter((spell) => {
      // 1. Text Search query
      if (
        queryClean &&
        !spell.name.toLowerCase().includes(queryClean) &&
        !spell.description?.toLowerCase().includes(queryClean)
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
      }

      return true;
    });
  }
}
