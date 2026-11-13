import { describe, expect, it } from 'vitest';
import { generateCharacter } from '../dccData';
import {
  DCC_DICE_CHAIN,
  applyLuckBurnToRoll,
  rollDieExpression,
  rollLuckCheck,
  shiftDieOnChain,
} from '../diceUtils';

const sequenceRng = (values: number[]) => {
  let index = 0;
  return () => {
    const val = values[index % values.length];
    index += 1;
    return val;
  };
};

describe('DCC Dice Engine (diceUtils)', () => {
  it('exports the complete 13-die DCC_DICE_CHAIN', () => {
    expect(DCC_DICE_CHAIN).toEqual([3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30]);
    expect(DCC_DICE_CHAIN).toHaveLength(13);
  });

  describe('rollDieExpression', () => {
    it('parses single and multi-die expressions with positive and negative modifiers', () => {
      const d20 = rollDieExpression('1d20', 3, {
        characterId: 'c1',
        characterName: 'Aldous',
        label: 'Melee Atk',
        rng: sequenceRng([0.5]), // floor(0.5 * 20) + 1 = 11
      });
      expect(d20.count).toBe(1);
      expect(d20.sides).toBe(20);
      expect(d20.rolls).toEqual([11]);
      expect(d20.modifier).toBe(3);
      expect(d20.total).toBe(14);
      expect(d20.formula).toBe('1d20+3');
      expect(d20.label).toBe('Melee Atk');
      expect(d20.characterId).toBe('c1');
      expect(d20.characterName).toBe('Aldous');
      expect(d20.luckBurned).toBe(0);
      expect(d20.isNat20).toBe(false);
      expect(d20.isNat1).toBe(false);
      expect(d20.followUpType).toBeUndefined();
      expect(typeof d20.id).toBe('string');
      expect(d20.id.length).toBeGreaterThan(0);
      expect(typeof d20.timestamp).toBe('number');

      const d16 = rollDieExpression('1d16', -1, {
        rng: sequenceRng([0.999]), // 16
      });
      expect(d16.rolls).toEqual([16]);
      expect(d16.modifier).toBe(-1);
      expect(d16.total).toBe(15);
      expect(d16.formula).toBe('1d16-1');
      expect(d16.label).toBe('1d16-1');

      const twoD6 = rollDieExpression('2d6', 0, {
        rng: sequenceRng([0.0, 0.999]), // 1 and 6
      });
      expect(twoD6.count).toBe(2);
      expect(twoD6.sides).toBe(6);
      expect(twoD6.rolls).toEqual([1, 6]);
      expect(twoD6.total).toBe(7);
      expect(twoD6.formula).toBe('2d6');

      const shorthand = rollDieExpression('d8+2', 1, {
        rng: sequenceRng([0.5]), // floor(0.5 * 8) + 1 = 5
      });
      expect(shorthand.count).toBe(1);
      expect(shorthand.sides).toBe(8);
      expect(shorthand.rolls).toEqual([5]);
      expect(shorthand.modifier).toBe(3);
      expect(shorthand.total).toBe(8);
      expect(shorthand.formula).toBe('1d8+3');
    });

    it('detects Nat 20 and Nat 1 only when count === 1 and sides === 20', () => {
      const nat20 = rollDieExpression('1d20', 0, {
        rng: sequenceRng([0.999]),
      });
      expect(nat20.rolls).toEqual([20]);
      expect(nat20.isNat20).toBe(true);
      expect(nat20.isNat1).toBe(false);
      expect(nat20.followUpType).toBeUndefined();

      const nat1 = rollDieExpression('1d20', 0, {
        rng: sequenceRng([0.0]),
      });
      expect(nat1.rolls).toEqual([1]);
      expect(nat1.isNat1).toBe(true);
      expect(nat1.isNat20).toBe(false);
      expect(nat1.followUpType).toBeUndefined();

      const d24Rolled1 = rollDieExpression('1d24', 0, {
        rng: sequenceRng([0.0]),
      });
      expect(d24Rolled1.rolls).toEqual([1]);
      expect(d24Rolled1.isNat1).toBe(false);

      const twoD20 = rollDieExpression('2d20', 0, {
        rng: sequenceRng([0.999, 0.0]),
      });
      expect(twoD20.rolls).toEqual([20, 1]);
      expect(twoD20.isNat20).toBe(false);
      expect(twoD20.isNat1).toBe(false);
    });

    it('sets followUpType on Nat 20 / Nat 1 attack rolls only', () => {
      const critAtk = rollDieExpression('1d20', 2, {
        isAttack: true,
        label: 'Spear Atk',
        rng: sequenceRng([0.999]),
      });
      expect(critAtk.isNat20).toBe(true);
      expect(critAtk.followUpType).toBe('crit');

      const fumbleAtk = rollDieExpression('1d20', 2, {
        isAttack: true,
        label: 'Spear Atk',
        rng: sequenceRng([0.0]),
      });
      expect(fumbleAtk.isNat1).toBe(true);
      expect(fumbleAtk.followUpType).toBe('fumble');

      const normalAtk = rollDieExpression('1d20', 2, {
        isAttack: true,
        label: 'Spear Atk',
        rng: sequenceRng([0.5]),
      });
      expect(normalAtk.isNat20).toBe(false);
      expect(normalAtk.isNat1).toBe(false);
      expect(normalAtk.followUpType).toBeUndefined();

      const nonAttackNat20 = rollDieExpression('1d20', 1, {
        isAttack: false,
        label: 'Fort Save',
        rng: sequenceRng([0.999]),
      });
      expect(nonAttackNat20.isNat20).toBe(true);
      expect(nonAttackNat20.followUpType).toBeUndefined();
    });

    it('throws on invalid dice expressions', () => {
      expect(() => rollDieExpression('invalid')).toThrow();
      expect(() => rollDieExpression('0d6')).toThrow();
      expect(() => rollDieExpression('1d0')).toThrow();
    });
  });

  describe('rollLuckCheck', () => {
    it('passes when raw 1d20 roll is less than or equal to LCK, and fails when greater', () => {
      const char = generateCharacter([]);
      char.name = 'Berylla';
      char.abilities.lck = 10;

      // Roll 1 (<= 10) -> pass
      const lowRoll = rollLuckCheck(char, sequenceRng([0.0]));
      expect(lowRoll.rolls).toEqual([1]);
      expect(lowRoll.luckCheckPassed).toBe(true);
      expect(lowRoll.label).toBe('Luck Check');
      expect(lowRoll.characterId).toBe(char.id);
      expect(lowRoll.characterName).toBe('Berylla');

      // Roll 10 (=== 10) -> pass (<= LCK)
      const exactRoll = rollLuckCheck(char, sequenceRng([9 / 20]));
      expect(exactRoll.rolls).toEqual([10]);
      expect(exactRoll.luckCheckPassed).toBe(true);

      // Roll 11 (> 10) -> fail
      const highRoll = rollLuckCheck(char, sequenceRng([10 / 20]));
      expect(highRoll.rolls).toEqual([11]);
      expect(highRoll.luckCheckPassed).toBe(false);
    });
  });

  describe('applyLuckBurnToRoll', () => {
    it('adds +1 per Luck burned for non-Halflings and +2 for Halflings without mutating input', () => {
      const baseRoll = rollDieExpression('1d20', 1, {
        label: 'Ref Save',
        rng: sequenceRng([0.5]), // 11 + 1 = 12
      });

      const humanBurn1 = applyLuckBurnToRoll(baseRoll, false);
      expect(humanBurn1.luckBurned).toBe(1);
      expect(humanBurn1.total).toBe(13);
      expect(baseRoll.luckBurned).toBe(0);
      expect(baseRoll.total).toBe(12);

      const humanBurn2 = applyLuckBurnToRoll(humanBurn1, false);
      expect(humanBurn2.luckBurned).toBe(2);
      expect(humanBurn2.total).toBe(14);

      const halflingBurn1 = applyLuckBurnToRoll(baseRoll, true);
      expect(halflingBurn1.luckBurned).toBe(1);
      expect(halflingBurn1.total).toBe(14);

      const halflingBurn2 = applyLuckBurnToRoll(halflingBurn1, true);
      expect(halflingBurn2.luckBurned).toBe(2);
      expect(halflingBurn2.total).toBe(16);
    });

    it('recomputes tableOutcome when burning Luck on a crit or fumble roll', () => {
      const critRoll = rollDieExpression('1d4', 0, {
        label: 'Crit Table I',
        tableKind: 'crit',
        rng: sequenceRng([0.0]), // 1
      });
      expect(critRoll.total).toBe(1);
      expect(critRoll.tableOutcome).toContain('Opportunistic strike');

      const boostedCrit = applyLuckBurnToRoll(critRoll, true); // +2 => total 3
      expect(boostedCrit.total).toBe(3);
      expect(boostedCrit.tableOutcome).toContain('Stunning crack to forehead');
    });
  });

  describe('shiftDieOnChain', () => {
    it('steps up and down DCC_DICE_CHAIN and clamps at boundaries', () => {
      expect(shiftDieOnChain(20, 0)).toBe(20);
      expect(shiftDieOnChain(20, 1)).toBe(24);
      expect(shiftDieOnChain(20, -1)).toBe(16);
      expect(shiftDieOnChain(3, -1)).toBe(3);
      expect(shiftDieOnChain(30, 1)).toBe(30);
    });

    it('snaps non-chain die sizes to nearest chain step before shifting', () => {
      expect(shiftDieOnChain(2, -1)).toBe(3);
      expect(shiftDieOnChain(9, 1)).toBe(10);
    });
  });
});
