import { describe, expect, it } from 'vitest';
import {
  BIRTH_AUGURS,
  FIRST_NAMES,
  OCCUPATIONS,
  SHOP_ITEMS,
  SOBRIQUETS,
  STARTER_ITEM_SUGGESTIONS,
  WEAPON_DATA,
  addInventoryItem,
  adjustAbilityScore,
  adjustCoins,
  adjustXp,
  buyEquipmentItem,
  formatCoins,
  formatMod,
  generateCharacter,
  generateRandomName,
  getAbilityMod,
  getShieldRestrictionReason,
  removeInventoryItem,
  resetAbilityOverrides,
  setCoinsFromDenominations,
  splitCoins,
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

  it('adds starter/custom items, ignores blanks, and recomputes AC for armor/shields', () => {
    expect(STARTER_ITEM_SUGGESTIONS).toContain('Iron helmet');
    expect(STARTER_ITEM_SUGGESTIONS).toContain('Steel helmet');

    const base = {
      ...generateCharacter([]),
      baseAC: 10,
      augurACBonus: 0,
      armor: 'Unarmored',
      armorBonus: 0,
      armorCheckPenalty: 0,
      armorFumbleDie: '1d4',
      hasShield: false,
      ac: 10,
      checkPenalty: 0,
      fumbleDie: '1d4',
      inventory: ['Torch (1)'],
    };

    expect(addInventoryItem(base, '   ')).toBe(base);

    const withHelmet = addInventoryItem(base, '  Iron helmet  ');
    expect(withHelmet.inventory).toEqual(['Torch (1)', 'Iron helmet']);
    expect(withHelmet.ac).toBe(10);

    const withShield = addInventoryItem(withHelmet, 'Shield');
    expect(withShield.hasShield).toBe(true);
    expect(withShield.ac).toBe(11);
    expect(withShield.checkPenalty).toBe(-1);
    expect(withShield.fumbleDie).toBe('1d8');

    const withStack = addInventoryItem(base, '  Iron spike ', 5);
    expect(withStack.inventory).toEqual(['Torch (1)', 'Iron spike (x5)']);

    const withSingle = addInventoryItem(base, 'Silver key', 1);
    expect(withSingle.inventory).toEqual(['Torch (1)', 'Silver key']);
  });

  it('splits, adjusts, and sets coinage by gp/sp/cp denominations', () => {
    expect(splitCoins(0)).toEqual({ gp: 0, sp: 0, cp: 0 });
    expect(splitCoins(345)).toEqual({ gp: 3, sp: 4, cp: 5 });
    expect(splitCoins(-10)).toEqual({ gp: 0, sp: 0, cp: 0 });

    const base = { ...generateCharacter([]), coins: 35 };
    expect(adjustCoins(base, 100).coins).toBe(135);
    expect(adjustCoins(base, -20).coins).toBe(15);
    expect(adjustCoins(base, -999).coins).toBe(0);

    expect(setCoinsFromDenominations(base, 2, 5, 7).coins).toBe(257);
    expect(setCoinsFromDenominations(base, -1, 0, -5).coins).toBe(0);
  });

  it('applies temporary ability score overrides, recomputes derived stats, and resets cleanly', () => {
    const base = {
      ...generateCharacter([]),
      race: 'Human' as const,
      augur: { id: 1, name: 'Harsh winter', desc: 'All attack rolls', affect: 'all_att' },
      baseAbilities: { str: 10, agi: 10, sta: 10, per: 10, int: 10, lck: 10 },
      abilities: { str: 10, agi: 10, sta: 10, per: 10, int: 10, lck: 10 },
      abilityMods: { strMod: 0, agiMod: 0, staMod: 0, perMod: 0, intMod: 0, luckMod: 0 },
      baseAC: 10,
      augurACBonus: 0,
      armorBonus: 0,
      hasShield: false,
      ac: 10,
      initMod: 0,
      saves: { fort: 0, ref: 0, will: 0 },
      weapon: {
        name: 'Club',
        type: 'melee' as const,
        damage: '1d4',
        range: '-',
        isTwoHanded: false,
        attBonus: 0,
        dmgBonus: 0,
        ammo: '',
      },
    };

    const boostedAgi = adjustAbilityScore(base, 'agi', 6);
    expect(boostedAgi.abilities.agi).toBe(16);
    expect(boostedAgi.baseAbilities?.agi).toBe(10);
    expect(boostedAgi.abilityMods.agiMod).toBe(2);
    expect(boostedAgi.ac).toBe(12);
    expect(boostedAgi.initMod).toBe(2);
    expect(boostedAgi.saves.ref).toBe(2);

    const drainedStr = adjustAbilityScore(boostedAgi, 'str', -15);
    expect(drainedStr.abilities.str).toBe(0);
    expect(drainedStr.abilityMods.strMod).toBe(-3);
    expect(drainedStr.weapon.attBonus).toBe(-3);
    expect(drainedStr.weapon.dmgBonus).toBe(-3);

    const reset = resetAbilityOverrides(drainedStr);
    expect(reset.abilities).toEqual({ str: 10, agi: 10, sta: 10, per: 10, int: 10, lck: 10 });
    expect(reset.ac).toBe(10);
    expect(reset.weapon.attBonus).toBe(0);
  });

  it('adjusts XP and clamps at 0', () => {
    const base = { ...generateCharacter([]), xp: 0 };
    expect(adjustXp(base, 3).xp).toBe(3);
    expect(adjustXp(adjustXp(base, 12), -2).xp).toBe(10);
    expect(adjustXp(base, -5).xp).toBe(0);
  });
});
