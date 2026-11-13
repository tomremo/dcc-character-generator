import { Character } from './dccData';

export type PartyMode = 'single' | 'funnel';

export interface SavedPartyState {
  mode: PartyMode;
  party: Character[];
  savedAt: string;
}

const STORAGE_KEY = 'dcc-level0-generator-state-v1';

function isValidCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<Character>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.race === 'string' &&
    typeof c.hp === 'number' &&
    typeof c.maxHp === 'number' &&
    typeof c.ac === 'number' &&
    typeof c.coins === 'number' &&
    Boolean(c.abilities && typeof c.abilities.str === 'number') &&
    Boolean(c.abilityMods && typeof c.abilityMods.strMod === 'number') &&
    Boolean(c.saves && typeof c.saves.fort === 'number') &&
    Boolean(c.weapon && typeof c.weapon.name === 'string') &&
    Boolean(c.augur && typeof c.augur.id === 'number') &&
    Array.isArray(c.inventory) &&
    Array.isArray(c.knownLanguages) &&
    Array.isArray(c.diceLog)
  );
}

export function loadSavedPartyState(): SavedPartyState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedPartyState>;
    if (
      (parsed.mode !== 'single' && parsed.mode !== 'funnel') ||
      !Array.isArray(parsed.party) ||
      parsed.party.length === 0 ||
      !parsed.party.every(isValidCharacter)
    ) {
      return null;
    }
    return {
      mode: parsed.mode,
      party: parsed.party,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function savePartyState(mode: PartyMode, party: Character[]): boolean {
  try {
    const payload: SavedPartyState = {
      mode,
      party,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function parseImportedPartyJSON(rawJson: string): Character[] | null {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    let list: unknown[] | null = null;
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as { characters?: unknown; party?: unknown };
      if (Array.isArray(obj.characters)) {
        list = obj.characters;
      } else if (Array.isArray(obj.party)) {
        list = obj.party;
      }
    }

    if (!list || list.length === 0 || !list.every(isValidCharacter)) {
      return null;
    }
    return list;
  } catch {
    return null;
  }
}
