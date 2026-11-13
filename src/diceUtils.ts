import type { Character } from './dccData';
import { lookupCritTableI, lookupFumbleTable } from './critFumbleTables';

export const DCC_DICE_CHAIN = [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30] as const;

export type DccDieSides = (typeof DCC_DICE_CHAIN)[number];

export function shiftDieOnChain(sides: number, steps: number): DccDieSides {
  const exactIdx = DCC_DICE_CHAIN.indexOf(sides as DccDieSides);
  let baseIdx = exactIdx;
  if (baseIdx === -1) {
    baseIdx = DCC_DICE_CHAIN.reduce(
      (bestIdx, val, idx) =>
        Math.abs(val - sides) < Math.abs(DCC_DICE_CHAIN[bestIdx] - sides) ? idx : bestIdx,
      0
    );
  }
  const nextIdx = Math.max(0, Math.min(DCC_DICE_CHAIN.length - 1, baseIdx + Math.trunc(steps)));
  return DCC_DICE_CHAIN[nextIdx];
}

export interface DiceRollResult {
  id: string;
  timestamp: number;
  characterId?: string;
  characterName?: string;
  label: string;
  formula: string;
  sides: number;
  count: number;
  rolls: number[];
  modifier: number;
  luckBurned: number;
  total: number;
  isNat20: boolean;
  isNat1: boolean;
  luckCheckPassed?: boolean;
  followUpType?: 'crit' | 'fumble';
  tableKind?: 'crit' | 'fumble';
  tableOutcome?: string;
}

export interface RollMeta {
  characterId?: string;
  characterName?: string;
  label?: string;
  isAttack?: boolean;
  tableKind?: 'crit' | 'fumble';
  rng?: () => number;
}

const createRollId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `roll-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const formatFormula = (count: number, sides: number, modifier: number): string => {
  const base = `${count}d${sides}`;
  if (modifier === 0) return base;
  return modifier > 0 ? `${base}+${modifier}` : `${base}${modifier}`;
};

const parseDieExpression = (
  expr: string
): { count: number; sides: number; inlineModifier: number } => {
  const trimmed = expr.trim();
  const match = /^(\d*)d(\d+)\s*([+-]\s*\d+)?$/i.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid dice expression: "${expr}"`);
  }

  const count = match[1] ? Number.parseInt(match[1], 10) : 1;
  const sides = Number.parseInt(match[2], 10);
  const inlineModifier = match[3]
    ? Number.parseInt(match[3].replace(/\s+/g, ''), 10)
    : 0;

  if (!Number.isFinite(count) || count < 1) {
    throw new Error(`Invalid dice count in expression: "${expr}"`);
  }
  if (!Number.isFinite(sides) || sides < 1) {
    throw new Error(`Invalid die sides in expression: "${expr}"`);
  }

  return { count, sides, inlineModifier };
};

export const rollDieExpression = (
  expr: string,
  modifier = 0,
  meta: RollMeta = {}
): DiceRollResult => {
  const { count, sides, inlineModifier } = parseDieExpression(expr);
  const totalModifier = Math.trunc(modifier) + inlineModifier;
  const rng = meta.rng ?? Math.random;

  const rolls: number[] = [];
  for (let i = 0; i < count; i += 1) {
    rolls.push(Math.floor(rng() * sides) + 1);
  }

  const rawSum = rolls.reduce((sum, val) => sum + val, 0);
  const total = rawSum + totalModifier;
  const formula = formatFormula(count, sides, totalModifier);

  const isNat20 = count === 1 && sides === 20 && rolls[0] === 20;
  const isNat1 = count === 1 && sides === 20 && rolls[0] === 1;

  let followUpType: 'crit' | 'fumble' | undefined;
  if (meta.isAttack) {
    if (isNat20) followUpType = 'crit';
    else if (isNat1) followUpType = 'fumble';
  }

  let tableOutcome: string | undefined;
  if (meta.tableKind === 'crit') {
    tableOutcome = lookupCritTableI(total).text;
  } else if (meta.tableKind === 'fumble') {
    tableOutcome = lookupFumbleTable(total).text;
  }

  return {
    id: createRollId(),
    timestamp: Date.now(),
    characterId: meta.characterId,
    characterName: meta.characterName,
    label: meta.label ?? formula,
    formula,
    sides,
    count,
    rolls,
    modifier: totalModifier,
    luckBurned: 0,
    total,
    isNat20,
    isNat1,
    followUpType,
    tableKind: meta.tableKind,
    tableOutcome,
  };
};

export const rollLuckCheck = (
  char: Character,
  rng?: () => number
): DiceRollResult => {
  const result = rollDieExpression('1d20', 0, {
    characterId: char.id,
    characterName: char.name,
    label: 'Luck Check',
    isAttack: false,
    rng,
  });

  const raw = result.rolls[0];
  return {
    ...result,
    luckCheckPassed: raw <= char.abilities.lck,
  };
};

export const applyLuckBurnToRoll = (
  roll: DiceRollResult,
  isHalfling: boolean
): DiceRollResult => {
  const bonus = isHalfling ? 2 : 1;
  const nextTotal = roll.total + bonus;
  let tableOutcome = roll.tableOutcome;
  if (roll.tableKind === 'crit') {
    tableOutcome = lookupCritTableI(nextTotal).text;
  } else if (roll.tableKind === 'fumble') {
    tableOutcome = lookupFumbleTable(nextTotal).text;
  }
  return {
    ...roll,
    luckBurned: roll.luckBurned + 1,
    total: nextTotal,
    tableOutcome,
  };
};
