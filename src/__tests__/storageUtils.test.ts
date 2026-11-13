import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateCharacter } from '../dccData';
import {
  loadSavedPartyState,
  parseImportedPartyJSON,
  savePartyState,
} from '../storageUtils';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
}

describe('Storage & import utilities', () => {
  let memoryStorage: Storage;

  beforeEach(() => {
    memoryStorage = createMemoryStorage();
    vi.stubGlobal('window', { localStorage: memoryStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and restores party state from localStorage', () => {
    const party = [generateCharacter([]), generateCharacter([])];
    expect(savePartyState('funnel', party)).toBe(true);

    const loaded = loadSavedPartyState();
    expect(loaded).not.toBeNull();
    expect(loaded?.mode).toBe('funnel');
    expect(loaded?.party).toHaveLength(2);
    expect(loaded?.party[0].id).toBe(party[0].id);
  });

  it('returns null for missing or corrupted localStorage data', () => {
    expect(loadSavedPartyState()).toBeNull();
    memoryStorage.setItem('dcc-level0-generator-state-v1', '{bad json');
    expect(loadSavedPartyState()).toBeNull();
  });

  it('parses valid imported party JSON and rejects invalid payloads', () => {
    const party = [generateCharacter([])];
    expect(parseImportedPartyJSON(JSON.stringify(party))).toHaveLength(1);
    expect(parseImportedPartyJSON(JSON.stringify({ party }))).toHaveLength(1);
    expect(parseImportedPartyJSON(JSON.stringify({ characters: party }))).toHaveLength(1);
    expect(parseImportedPartyJSON('[]')).toBeNull();
    expect(parseImportedPartyJSON('{"foo": 1}')).toBeNull();
  });
});
