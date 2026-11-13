import { describe, expect, it } from 'vitest';
import { generateCharacter } from '../dccData';
import {
  InitiativeEntry,
  advanceInitiativeTurn,
  rollPartyInitiative,
  sortInitiativeEntries,
} from '../initiativeUtils';

describe('Initiative tracker utilities', () => {
  it('sorts initiative descending and breaks ties by initMod then name', () => {
    const entries: InitiativeEntry[] = [
      { id: '1', name: 'Zed', initiative: 12, isEnemy: false, isDead: false, initDie: '1d20', initMod: 0 },
      { id: '2', name: 'Amy', initiative: 12, isEnemy: false, isDead: false, initDie: '1d20', initMod: 2 },
      { id: '3', name: 'Orc', initiative: 18, isEnemy: true, isDead: false, initDie: '1d20', initMod: 0 },
    ];
    const sorted = sortInitiativeEntries(entries);
    expect(sorted.map((e) => e.id)).toEqual(['3', '2', '1']);
  });

  it('rolls initiative for living party members only', () => {
    const alive = { ...generateCharacter([]), id: 'a1', isDead: false, initDie: '1d20' as const, initMod: 1 };
    const dead = { ...generateCharacter([]), id: 'd1', isDead: true };
    const rolled = rollPartyInitiative([alive, dead], () => 0.5);
    expect(rolled).toHaveLength(1);
    expect(rolled[0].characterId).toBe('a1');
    expect(rolled[0].initiative).toBe(12); // floor(0.5*20)+1 + 1 = 12
  });

  it('advances turns skipping dead combatants and increments round on wrap', () => {
    const entries: InitiativeEntry[] = [
      { id: '1', name: 'A', initiative: 15, isEnemy: false, isDead: false, initDie: '1d20', initMod: 0 },
      { id: '2', name: 'B', initiative: 12, isEnemy: false, isDead: true, initDie: '1d20', initMod: 0 },
      { id: '3', name: 'C', initiative: 9, isEnemy: true, isDead: false, initDie: '1d20', initMod: 0 },
    ];

    const step1 = advanceInitiativeTurn(entries, 0, 1);
    expect(step1).toEqual({ nextIndex: 2, nextRound: 1 });

    const step2 = advanceInitiativeTurn(entries, 2, 1);
    expect(step2).toEqual({ nextIndex: 0, nextRound: 2 });
  });
});
