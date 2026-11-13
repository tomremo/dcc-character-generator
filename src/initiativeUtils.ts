import { Character } from './dccData';
import { rollDieExpression } from './diceUtils';

export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  isEnemy: boolean;
  isDead: boolean;
  initDie: string;
  initMod: number;
  characterId?: string;
}

export function sortInitiativeEntries(entries: InitiativeEntry[]): InitiativeEntry[] {
  return [...entries].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    if (b.initMod !== a.initMod) return b.initMod - a.initMod;
    return a.name.localeCompare(b.name);
  });
}

export function rollPartyInitiative(
  party: Character[],
  rng: () => number = Math.random
): InitiativeEntry[] {
  const entries = party
    .filter((c) => !c.isDead)
    .map((char) => {
      const roll = rollDieExpression(char.initDie, char.initMod, { rng });
      return {
        id: `char-${char.id}`,
        name: char.name,
        initiative: roll.total,
        isEnemy: false,
        isDead: char.isDead,
        initDie: char.initDie,
        initMod: char.initMod,
        characterId: char.id,
      };
    });

  return sortInitiativeEntries(entries);
}

export function advanceInitiativeTurn(
  entries: InitiativeEntry[],
  currentIndex: number,
  round: number
): { nextIndex: number; nextRound: number } {
  if (entries.length === 0) return { nextIndex: 0, nextRound: round };

  const activeIndices = entries
    .map((entry, idx) => (!entry.isDead ? idx : -1))
    .filter((idx) => idx !== -1);

  if (activeIndices.length === 0) {
    return { nextIndex: 0, nextRound: round };
  }

  const nextAfterCurrent = activeIndices.find((idx) => idx > currentIndex);
  if (nextAfterCurrent !== undefined) {
    return { nextIndex: nextAfterCurrent, nextRound: round };
  }

  return { nextIndex: activeIndices[0], nextRound: round + 1 };
}
