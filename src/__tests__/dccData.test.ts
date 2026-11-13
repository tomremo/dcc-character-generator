import { describe, expect, it } from 'vitest';
import {
  BIRTH_AUGURS,
  FIRST_NAMES,
  OCCUPATIONS,
  SHOP_ITEMS,
  SOBRIQUETS,
  WEAPON_DATA,
  buyEquipmentItem,
  formatCoins,
  formatMod,
  generateCharacter,
  generateRandomName,
  getAbilityMod,
  getShieldRestrictionReason,
  removeInventoryItem,
  swapFirstName,
  swapSobriquet,
} from '../dccData';

describe('Table 1-1 & formatting helpers', () => {
  it('computes ability modifiers per Table 1-1', () => {
    expect(getAbilityMod(3)).toBe(-3);
    expect(getAbilityMod(4)).toBe(-2);
    expect(getAbilityMod(5)).toBe(-2);
    expect(getAbilityMod(6)).toBe(-1);
    expect(getAbilityMod(8)).toBe(-1);
    expect(getAbilityMod(9)).toBe(0);
    expect(getAbilityMod(12)).toBe(0);
    expect(getAbilityMod(13)).toBe(1);
    expect(getAbilityMod(15)).toBe(1);
    expect(getAbilityMod(16)).toBe(2);
    expect(getAbilityMod(17)).toBe(2);
    expect(getAbilityMod(18)).toBe(3);
  });

  it('formats modifiers and coinage cleanly', () => {
    expect(formatMod(0)).toBe('+0');
    expect(formatMod(2)).toBe('+2');
    expect(formatMod(-2)).toBe('-2');
    expect(formatCoins(0)).toBe('0 cp');
    expect(formatCoins(35)).toBe('3 sp, 5 cp');
    expect(formatCoins(3000)).toBe('30 gp');
  });
});

describe('Mix-and-match names & sobriquets', () => {
  it('has 96 unique first names and 96 unique sobriquets', () => {
    expect(FIRST_NAMES).toHaveLength(96);
    expect(SOBRIQUETS).toHaveLength(96);
    expect(new Set(FIRST_NAMES).size).toBe(96);
    expect(new Set(SOBRIQUETS).size).toBe(96);
  });

  it('generates and swaps first names and sobriquets independently', () => {
    const full = generateRandomName();
    expect(FIRST_NAMES.some((f) => full.startsWith(`${f} `))).toBe(true);
    expect(SOBRIQUETS.some((s) => full.endsWith(` ${s}`))).toBe(true);

    const swappedFirst = swapFirstName('Agnes the Unwashed');
    expect(swappedFirst.endsWith(' the Unwashed')).toBe(true);

    const swappedSobriquet = swapSobriquet('Agnes the Unwashed');
    expect(swappedSobriquet.startsWith('Agnes ')).toBe(true);
  });
});

describe('4th Printing tables & character generation', () => {
  it('has complete Occupations (1-100), Birth Augurs (1-30), and corrected shop prices', () => {
    expect(OCCUPATIONS).toHaveLength(100);
    expect(BIRTH_AUGURS).toHaveLength(30);
    expect(WEAPON_DATA['Pick (as club)']).toEqual({ damage: '1d4', type: 'melee', range: '-' });

    const byName = Object.fromEntries(SHOP_ITEMS.map((i) => [i.name, i.cost]));
    expect(byName["Chain (10')"]).toBe(3000);
    expect(byName['Flask (empty)']).toBe(3);
    expect(byName['Flint & steel']).toBe(15);
    expect(byName["Rope (50')"]).toBe(25);
    expect(byName['Club (1d4)']).toBe(300);
  });

  it('generates valid Level 0 characters across 200 rolls', () => {
    const party = [];
    for (let i = 0; i < 200; i++) {
      const char = generateCharacter([]);
      party.push(char);
      expect(char.hp).toBeGreaterThanOrEqual(1);
      expect(char.maxHp).toBe(char.hp);
      expect(char.xp).toBe(0);
      expect(char.critDie).toBe('1d4');
      expect(char.critTable).toBe('I');
      expect(char.knownLanguages[0]).toBe('Common');

      if (char.weapon.isTwoHanded) {
        expect(char.initDie).toBe('1d16');
      } else {
        expect(char.initDie).toBe('1d20');
      }

      if (char.weapon.type === 'melee/thrown') {
        expect(char.weapon.thrownAttBonus).toBeTypeOf('number');
        expect(char.weapon.thrownDmgBonus).toBeTypeOf('number');
      }
    }
    expect(party).toHaveLength(200);
  });
});

describe('Equipment purchase & removal', () => {
  it('preserves Charmed house AC bonus and Soldier shield when buying armor', () => {
    const base = generateCharacter([]);
    const soldierWithAugur = {
      ...base,
      abilities: { ...base.abilities, str: 12 },
      baseAC: 11,
      augurACBonus: 2,
      armor: 'Shield',
      armorBonus: 0,
      armorCheckPenalty: 0,
      armorFumbleDie: '1d4',
      hasShield: true,
      ac: 14,
      coins: 5000,
      inventory: ['Torch (1)', 'Shield'],
      weapon: { ...base.weapon, isTwoHanded: false },
    };

    const leather = SHOP_ITEMS.find((i) => i.name === 'Leather Armor (+2 AC)')!;
    const afterArmor = buyEquipmentItem(soldierWithAugur, leather);

    expect(afterArmor.ac).toBe(11 + 2 + 1 + 2); // base + leather + shield + augur
    expect(afterArmor.coins).toBe(3000);
    expect(afterArmor.hasShield).toBe(true);
  });

  it('enforces shield restrictions (already carrying, STR <= 5, two-handed weapon)', () => {
    const base = generateCharacter([]);
    const shieldItem = SHOP_ITEMS.find((i) => i.name === 'Shield (+1 AC)')!;

    const weakChar = {
      ...base,
      abilities: { ...base.abilities, str: 5 },
      hasShield: false,
      coins: 5000,
      weapon: { ...base.weapon, isTwoHanded: false },
    };
    expect(getShieldRestrictionReason(weakChar)).toContain('STR');
    expect(buyEquipmentItem(weakChar, shieldItem)).toBe(weakChar);

    const archerChar = {
      ...base,
      abilities: { ...base.abilities, str: 12 },
      hasShield: false,
      coins: 5000,
      weapon: { ...base.weapon, name: 'Shortbow', isTwoHanded: true },
    };
    expect(getShieldRestrictionReason(archerChar)).toContain('Two-handed');
    expect(buyEquipmentItem(archerChar, shieldItem)).toBe(archerChar);
  });

  it('removes starting and purchased gear and recomputes AC/penalties', () => {
    const base = generateCharacter([]);
    const armoredChar = {
      ...base,
      baseAC: 10,
      augurACBonus: 1,
      armor: 'Leather armor + Shield',
      armorBonus: 2,
      armorCheckPenalty: -1,
      armorFumbleDie: '1d8',
      hasShield: true,
      ac: 14,
      checkPenalty: -2,
      fumbleDie: '1d8',
      inventory: ['Torch (1)', 'Leather Armor (+2 AC)', 'Shield (+1 AC)'],
    };

    const afterRemoveShield = removeInventoryItem(armoredChar, 2);
    expect(afterRemoveShield.inventory).toEqual(['Torch (1)', 'Leather Armor (+2 AC)']);
    expect(afterRemoveShield.hasShield).toBe(false);
    expect(afterRemoveShield.ac).toBe(13); // 10 + 2 + 1
    expect(afterRemoveShield.checkPenalty).toBe(-1);

    const afterRemoveArmor = removeInventoryItem(afterRemoveShield, 1);
    expect(afterRemoveArmor.inventory).toEqual(['Torch (1)']);
    expect(afterRemoveArmor.armor).toBe('Unarmored');
    expect(afterRemoveArmor.ac).toBe(11); // 10 + 0 + 1
    expect(afterRemoveArmor.checkPenalty).toBe(0);
    expect(afterRemoveArmor.fumbleDie).toBe('1d4');
  });
});
