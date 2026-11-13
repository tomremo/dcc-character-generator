// ==========================================
// DCC RPG TABLES & CONSTANTS (4th Printing)
// ==========================================

export type Alignment = 'Lawful' | 'Neutral' | 'Chaotic';
export type Race = 'Human' | 'Dwarf' | 'Elf' | 'Halfling';

export interface BirthAugur {
  id: number;
  name: string;
  desc: string;
  affect: string;
}

export interface WeaponDef {
  damage: string;
  type: 'melee' | 'melee/thrown' | 'missile';
  range: string;
  isTwoHanded?: boolean;
}

export interface OccupationDef {
  id: number;
  title: string;
  race: Race;
  weapon: string;
  item: string;
  animalType?: string;
  hasAmmo?: boolean;
  isFarmer?: boolean;
  isWainwright?: boolean;
  extraCoins?: number;
  armor?: string;
  armorBonus?: number;
  checkPenalty?: number;
  fumbleDie?: string;
  isShield?: boolean;
}

export interface ShopItem {
  name: string;
  cost: number; // in cp
  category: 'Adventuring Gear' | 'Weapons' | 'Armor';
  bonus?: number;
  checkPen?: number;
  fumble?: string;
  type?: 'armor' | 'shield';
}

export type AbilityKey = 'str' | 'agi' | 'sta' | 'per' | 'int' | 'lck';

export interface Character {
  id: string;
  name: string;
  title: string;
  race: Race;
  alignment: Alignment;
  xp: number;
  isDead: boolean;
  baseAbilities?: Record<AbilityKey, number>;
  abilities: Record<AbilityKey, number>;
  abilityMods: {
    strMod: number;
    agiMod: number;
    staMod: number;
    perMod: number;
    intMod: number;
    luckMod: number;
  };
  hp: number;
  maxHp: number;
  ac: number;
  baseAC: number;
  augurACBonus: number;
  armor: string;
  armorBonus: number;
  armorCheckPenalty: number;
  armorFumbleDie: string;
  hasShield: boolean;
  checkPenalty: number;
  fumbleDie: string;
  fumbleMod: number;
  critDie: string;
  critTable: string;
  critBonus: number;
  saves: {
    fort: number;
    ref: number;
    will: number;
  };
  initMod: number;
  initDie: '1d20' | '1d16';
  speed: number;
  augur: BirthAugur;
  augurRoll: number;
  weapon: {
    name: string;
    type: 'melee' | 'melee/thrown' | 'missile';
    damage: string;
    range: string;
    isTwoHanded: boolean;
    attBonus: number;
    dmgBonus: number;
    thrownAttBonus?: number;
    thrownDmgBonus?: number;
    ammo: string;
  };
  tradeItem: string;
  startingGear: string;
  inventory: string[];
  coins: number;
  specialNotes: string[];
  knownLanguages: string[];
  diceLog: string[];
  isFarmer?: boolean;
  animalType?: string;
}

export const formatMod = (val: number): string => (val >= 0 ? `+${val}` : `${val}`);

// Table 1-1: Ability Score Modifiers
export const getAbilityMod = (score: number): number => {
  if (score <= 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
};

// Appendix S: Mix-and-Match First Names & Sobriquets (96 x 96 = 9,216 combinations)
export const FIRST_NAMES: string[] = [
  'Agnes', 'Aldous', 'Bartholomew', 'Berylla', 'Bridget', 'Corvin', 'Cuthbert', 'Dagr',
  'Dorothy', 'Eldrin', 'Eustace', 'Fiona', 'Giles', 'Gunnar', 'Hildy', 'Ignatius',
  'Joram', 'Katla', 'Lysandra', 'Milo', 'Nesta', 'Orlo', 'Pippa', 'Quentin',
  'Rorik', 'Sibyl', 'Tristan', 'Ulf', 'Valeria', 'Willem', 'Yara', 'Zephyr',
  'Aelfric', 'Alaric', 'Anselm', 'Astrid', 'Balthazar', 'Beatrix', 'Bram', 'Brunhild',
  'Cedric', 'Clara', 'Clovis', 'Cordelia', 'Dagmar', 'Dorian', 'Dunstan', 'Edith',
  'Egbert', 'Elspeth', 'Emrys', 'Ermentrude', 'Fenris', 'Freya', 'Gareth', 'Gertrude',
  'Godfrey', 'Griselda', 'Hadrian', 'Helga', 'Hubert', 'Ida', 'Ivor', 'Jocelyn',
  'Kendrick', 'Leif', 'Lothar', 'Mabel', 'Magnus', 'Margery', 'Matilda', 'Morwenna',
  'Ned', 'Nigel', 'Odo', 'Olga', 'Osric', 'Oswald', 'Petra', 'Prudence',
  'Radulf', 'Ragna', 'Reginald', 'Rowan', 'Sabine', 'Sigmund', 'Sigrid', 'Simeon',
  'Sylvan', 'Thaddeus', 'Theodora', 'Tobias', 'Ursula', 'Vance', 'Waldo', 'Wulfric',
];

export const SOBRIQUETS: string[] = [
  'the Unwashed', 'Turnip-Biter', 'the Clumsy', 'the Stout', 'Mud-Foot', 'the Simple',
  'of the Mire', 'the Blind', 'Pig-Tender', 'the Coward', 'Slop-Bucket', 'Fish-Breath',
  'the Pale', 'Butter-Fingers', 'the Silent', 'Wood-Chopper', 'Cabbage-Ear', 'the Drunk',
  'Iron-Lack', 'the Scabrous', 'No-Nails', 'the Half-Minded', 'the Weeping', 'Ditch-Digger',
  'the Toothless', 'the Ragged', 'Rat-Catcher', 'Leech-Gatherer', 'Snot-Nose', 'Scraps',
  'Charcoal-Burner', 'Stone-Fist', 'the Warted', 'Ash-Cheek', 'the Bent', 'Bog-Trotter',
  'Bone-Picker', 'the Blear-Eyed', 'Bran-Belly', 'the Broken', 'Cinder-Toe', 'Clod-Hopper',
  'the Crooked', 'Crow-Bait', 'Damp-Cloak', 'the Dim', 'Dung-Cart', 'the Earless',
  'Flea-Bitten', 'the Forsaken', 'Frog-Eye', 'Gallows-Luck', 'the Gaunt', 'Gnat-Swarm',
  'Grave-Spade', 'Grease-Thumb', 'the Grim', 'Grub-Eater', 'Half-Tooth', 'Hay-Seed',
  'the Hoarse', 'Hog-Caller', 'the Hollow', 'the Hunchbacked', 'Kettle-Black', 'the Lame',
  'Lard-Barrel', 'Lice-Ridden', 'the Limping', 'Maggot-Pie', 'Mire-Born', 'the Moldy',
  'Moss-Beard', 'Muck-Rake', 'the Mumbling', 'Nettle-Rash', 'the Nine-Fingered', 'Oat-Chaff',
  'Onion-Skin', 'the Pockmarked', 'Puddle-Jumper', 'the Queasy', 'Rag-and-Bone', 'the Rheumy',
  'Rot-Tooth', 'Rust-Bucket', 'Salt-Crusted', 'Scum-Skimmer', 'the Shivering', 'Soot-Snout',
  'the Squinting', 'Stump-Leg', 'Tallow-Face', 'the Twitching', 'Worm-Bait', 'the Wretched',
];

const pickRandom = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

export const generateRandomName = (): string => `${pickRandom(FIRST_NAMES)} ${pickRandom(SOBRIQUETS)}`;

export const swapFirstName = (currentName: string): string => {
  const matchedSobriquet = SOBRIQUETS.find((s) => currentName.endsWith(` ${s}`));
  const sobriquet = matchedSobriquet ?? pickRandom(SOBRIQUETS);
  return `${pickRandom(FIRST_NAMES)} ${sobriquet}`;
};

export const swapSobriquet = (currentName: string): string => {
  const matchedFirst = FIRST_NAMES.find((f) => currentName.startsWith(`${f} `));
  const first = matchedFirst ?? pickRandom(FIRST_NAMES);
  return `${first} ${pickRandom(SOBRIQUETS)}`;
};

// Table 1-2: Lucky Sign / Birth Augur (1-30)
export const BIRTH_AUGURS: BirthAugur[] = [
  { id: 1, name: 'Harsh winter', desc: 'All attack rolls', affect: 'all_att' },
  { id: 2, name: 'The bull', desc: 'Melee attack rolls', affect: 'melee_att' },
  { id: 3, name: 'Fortunate date', desc: 'Missile fire attack rolls', affect: 'missile_att' },
  { id: 4, name: 'Raised by wolves', desc: 'Unarmed attack rolls', affect: 'unarmed_att' },
  { id: 5, name: 'Conceived on horseback', desc: 'Mounted attack rolls', affect: 'mounted_att' },
  { id: 6, name: 'Born on the battlefield', desc: 'Damage rolls', affect: 'all_dmg' },
  { id: 7, name: 'Path of the bear', desc: 'Melee damage rolls', affect: 'melee_dmg' },
  { id: 8, name: 'Hawkeye', desc: 'Missile fire damage rolls', affect: 'missile_dmg' },
  { id: 9, name: 'Pack hunter', desc: 'Attack and damage rolls for 0-level starting weapon', affect: 'starting_att_dmg' },
  { id: 10, name: 'Born under the loom', desc: 'Skill checks (including thief skills)', affect: 'skills' },
  { id: 11, name: "Fox's cunning", desc: 'Find/disable traps', affect: 'traps' },
  { id: 12, name: 'Four-leafed clover', desc: 'Find secret doors', affect: 'secret_doors' },
  { id: 13, name: 'Seventh son', desc: 'Spell checks', affect: 'spell_checks' },
  { id: 14, name: 'The raging storm', desc: 'Spell damage', affect: 'spell_dmg' },
  { id: 15, name: 'Righteous heart', desc: 'Turn unholy checks', affect: 'turn_unholy' },
  { id: 16, name: 'Survived the plague', desc: 'Magical healing (received)', affect: 'magical_healing' },
  { id: 17, name: 'Lucky sign', desc: 'Saving throws', affect: 'all_saves' },
  { id: 18, name: 'Guardian angel', desc: 'Saving throws to escape traps', affect: 'trap_saves' },
  { id: 19, name: 'Survived a spider bite', desc: 'Saving throws against poison', affect: 'poison_saves' },
  { id: 20, name: 'Struck by lightning', desc: 'Reflex saving throws', affect: 'ref_saves' },
  { id: 21, name: 'Lived through famine', desc: 'Fortitude saving throws', affect: 'fort_saves' },
  { id: 22, name: 'Resisted temptation', desc: 'Willpower saving throws', affect: 'will_saves' },
  { id: 23, name: 'Charmed house', desc: 'Armor Class', affect: 'ac' },
  { id: 24, name: 'Speed of the cobra', desc: 'Initiative', affect: 'init' },
  { id: 25, name: 'Bountiful harvest', desc: 'Hit points (applies at each level)', affect: 'hp' },
  { id: 26, name: "Warrior's arm", desc: 'Critical hit tables (luck mod is doubled)', affect: 'crit' },
  { id: 27, name: 'Unholy house', desc: 'Corruption rolls', affect: 'corruption' },
  { id: 28, name: 'The Broken Star', desc: 'Fumbles (luck mod is doubled)', affect: 'fumble' },
  { id: 29, name: 'Birdsong', desc: 'Number of languages', affect: 'languages' },
  { id: 30, name: 'Wild child', desc: "Speed (each +1/-1 = +5'/-5')", affect: 'speed' },
];

// Weapon Stats Definition (Table 3-1)
export const WEAPON_DATA: Record<string, WeaponDef> = {
  Staff: { damage: '1d4', type: 'melee', range: '-' },
  Club: { damage: '1d4', type: 'melee', range: '-' },
  'Hammer (as club)': { damage: '1d4', type: 'melee', range: '-' },
  'Pick (as club)': { damage: '1d4', type: 'melee', range: '-' },
  'Cudgel (as staff)': { damage: '1d4', type: 'melee', range: '-' },
  'Crowbar (as club)': { damage: '1d4', type: 'melee', range: '-' },
  'Shovel (as staff)': { damage: '1d4', type: 'melee', range: '-' },
  'Pole (as staff)': { damage: '1d4', type: 'melee', range: '-' },
  'Stick (as club)': { damage: '1d4', type: 'melee', range: '-' },
  Dagger: { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Razor (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Awl (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Knife (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Chisel (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Scissors (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  'Trowel (as dagger)': { damage: '1d4', type: 'melee/thrown', range: '10/20/30' },
  Dart: { damage: '1d4', type: 'missile', range: '20/40/60' },
  'Quill (as dart)': { damage: '1d4', type: 'missile', range: '20/40/60' },
  'Hand axe': { damage: '1d6', type: 'melee/thrown', range: '10/20/30' },
  'Cleaver (as axe)': { damage: '1d6', type: 'melee/thrown', range: '10/20/30' },
  'Short sword': { damage: '1d6', type: 'melee', range: '-' },
  Longsword: { damage: '1d8', type: 'melee', range: '-' },
  Mace: { damage: '1d6', type: 'melee', range: '-' },
  Shortbow: { damage: '1d6', type: 'missile', range: '50/100/150', isTwoHanded: true },
  Sling: { damage: '1d4', type: 'missile', range: '40/80/160' },
  Spear: { damage: '1d8', type: 'melee', range: '-' },
  'Pitchfork (as spear)': { damage: '1d8', type: 'melee', range: '-' },
  Hammer: { damage: '1d4', type: 'melee', range: '-' },
};

// Table 1-3: Occupations (1-100)
export const OCCUPATIONS: OccupationDef[] = [
  { id: 1, title: 'Alchemist', race: 'Human', weapon: 'Staff', item: 'Oil, 1 flask' },
  { id: 2, title: 'Animal trainer', race: 'Human', weapon: 'Club', item: 'Pony' },
  { id: 3, title: 'Armorer', race: 'Human', weapon: 'Hammer (as club)', item: 'Iron helmet' },
  { id: 4, title: 'Astrologer', race: 'Human', weapon: 'Dagger', item: 'Spyglass' },
  { id: 5, title: 'Barber', race: 'Human', weapon: 'Razor (as dagger)', item: 'Scissors' },
  { id: 6, title: 'Beadle', race: 'Human', weapon: 'Staff', item: 'Holy symbol' },
  { id: 7, title: 'Beekeeper', race: 'Human', weapon: 'Staff', item: 'Jar of honey' },
  { id: 8, title: 'Blacksmith', race: 'Human', weapon: 'Hammer (as club)', item: 'Steel tongs' },
  { id: 9, title: 'Butcher', race: 'Human', weapon: 'Cleaver (as axe)', item: 'Side of beef' },
  { id: 10, title: 'Caravan guard', race: 'Human', weapon: 'Short sword', item: 'Linen, 1 yard' },
  { id: 11, title: 'Cheesemaker', race: 'Human', weapon: 'Cudgel (as staff)', item: 'Stinky cheese' },
  { id: 12, title: 'Cobbler', race: 'Human', weapon: 'Awl (as dagger)', item: 'Shoehorn' },
  { id: 13, title: 'Confidence artist', race: 'Human', weapon: 'Dagger', item: 'Quality cloak' },
  { id: 14, title: 'Cooper', race: 'Human', weapon: 'Crowbar (as club)', item: 'Barrel' },
  { id: 15, title: 'Costermonger', race: 'Human', weapon: 'Knife (as dagger)', item: 'Fruit' },
  { id: 16, title: 'Cutpurse', race: 'Human', weapon: 'Dagger', item: 'Small chest' },
  { id: 17, title: 'Ditch digger', race: 'Human', weapon: 'Shovel (as staff)', item: 'Fine dirt, 1 lb.' },
  { id: 18, title: 'Dock worker', race: 'Human', weapon: 'Pole (as staff)', item: '1 late RPG book' },
  { id: 19, title: 'Dwarven apothecarist', race: 'Dwarf', weapon: 'Cudgel (as staff)', item: 'Steel vial' },
  { id: 20, title: 'Dwarven blacksmith', race: 'Dwarf', weapon: 'Hammer (as club)', item: 'Mithril, 1 oz.' },
  { id: 21, title: 'Dwarven chest-maker', race: 'Dwarf', weapon: 'Chisel (as dagger)', item: 'Wood, 10 lbs.' },
  { id: 22, title: 'Dwarven herder', race: 'Dwarf', weapon: 'Staff', item: 'Sow', animalType: 'dwarven_herder' },
  { id: 23, title: 'Dwarven miner', race: 'Dwarf', weapon: 'Pick (as club)', item: 'Lantern' },
  { id: 24, title: 'Dwarven miner', race: 'Dwarf', weapon: 'Pick (as club)', item: 'Lantern' },
  { id: 25, title: 'Dwarven mushroom-farmer', race: 'Dwarf', weapon: 'Shovel (as staff)', item: 'Sack' },
  { id: 26, title: 'Dwarven rat-catcher', race: 'Dwarf', weapon: 'Club', item: 'Net' },
  { id: 27, title: 'Dwarven stonemason', race: 'Dwarf', weapon: 'Hammer', item: 'Fine stone, 10 lbs.' },
  { id: 28, title: 'Dwarven stonemason', race: 'Dwarf', weapon: 'Hammer', item: 'Fine stone, 10 lbs.' },
  { id: 29, title: 'Elven artisan', race: 'Elf', weapon: 'Staff', item: 'Clay, 1 lb.' },
  { id: 30, title: 'Elven barrister', race: 'Elf', weapon: 'Quill (as dart)', item: 'Book', hasAmmo: true },
  { id: 31, title: 'Elven chandler', race: 'Elf', weapon: 'Scissors (as dagger)', item: 'Candles, 20' },
  { id: 32, title: 'Elven falconer', race: 'Elf', weapon: 'Dagger', item: 'Falcon' },
  { id: 33, title: 'Elven forester', race: 'Elf', weapon: 'Staff', item: 'Herbs, 1 lb.' },
  { id: 34, title: 'Elven forester', race: 'Elf', weapon: 'Staff', item: 'Herbs, 1 lb.' },
  { id: 35, title: 'Elven glassblower', race: 'Elf', weapon: 'Hammer (as club)', item: 'Glass beads' },
  { id: 36, title: 'Elven navigator', race: 'Elf', weapon: 'Shortbow', item: 'Spyglass', hasAmmo: true },
  { id: 37, title: 'Elven sage', race: 'Elf', weapon: 'Dagger', item: 'Parchment and quill pen' },
  { id: 38, title: 'Elven sage', race: 'Elf', weapon: 'Dagger', item: 'Parchment and quill pen' },
  { id: 39, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 40, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 41, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 42, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 43, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 44, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 45, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 46, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 47, title: 'Farmer', race: 'Human', weapon: 'Pitchfork (as spear)', item: 'Hen', isFarmer: true },
  { id: 48, title: 'Fortune-teller', race: 'Human', weapon: 'Dagger', item: 'Tarot deck' },
  { id: 49, title: 'Gambler', race: 'Human', weapon: 'Club', item: 'Dice' },
  { id: 50, title: 'Gongfarmer', race: 'Human', weapon: 'Trowel (as dagger)', item: 'Sack of night soil' },
  { id: 51, title: 'Grave digger', race: 'Human', weapon: 'Shovel (as staff)', item: 'Trowel' },
  { id: 52, title: 'Grave digger', race: 'Human', weapon: 'Shovel (as staff)', item: 'Trowel' },
  { id: 53, title: 'Guild beggar', race: 'Human', weapon: 'Sling', item: 'Crutches', hasAmmo: true },
  { id: 54, title: 'Guild beggar', race: 'Human', weapon: 'Sling', item: 'Crutches', hasAmmo: true },
  { id: 55, title: 'Halfling chicken butcher', race: 'Halfling', weapon: 'Hand axe', item: 'Chicken meat, 5 lbs.' },
  { id: 56, title: 'Halfling dyer', race: 'Halfling', weapon: 'Staff', item: 'Fabric, 3 yards' },
  { id: 57, title: 'Halfling dyer', race: 'Halfling', weapon: 'Staff', item: 'Fabric, 3 yards' },
  { id: 58, title: 'Halfling glovemaker', race: 'Halfling', weapon: 'Awl (as dagger)', item: 'Gloves, 4 pairs' },
  { id: 59, title: 'Halfling gypsy', race: 'Halfling', weapon: 'Sling', item: 'Hex doll', hasAmmo: true },
  { id: 60, title: 'Halfling haberdasher', race: 'Halfling', weapon: 'Scissors (as dagger)', item: 'Fine suits, 3 sets' },
  { id: 61, title: 'Halfling mariner', race: 'Halfling', weapon: 'Knife (as dagger)', item: 'Sailcloth, 2 yards' },
  { id: 62, title: 'Halfling moneylender', race: 'Halfling', weapon: 'Short sword', item: '5 gp, 10 sp, 200 cp', extraCoins: 800 },
  { id: 63, title: 'Halfling trader', race: 'Halfling', weapon: 'Short sword', item: '20 sp', extraCoins: 200 },
  { id: 64, title: 'Halfling vagrant', race: 'Halfling', weapon: 'Club', item: 'Begging bowl' },
  { id: 65, title: 'Healer', race: 'Human', weapon: 'Club', item: 'Holy water, 1 vial' },
  { id: 66, title: 'Herbalist', race: 'Human', weapon: 'Club', item: 'Herbs, 1 lb.' },
  { id: 67, title: 'Herder', race: 'Human', weapon: 'Staff', item: 'Herding dog', animalType: 'herder' },
  { id: 68, title: 'Hunter', race: 'Human', weapon: 'Shortbow', item: 'Deer pelt', hasAmmo: true },
  { id: 69, title: 'Hunter', race: 'Human', weapon: 'Shortbow', item: 'Deer pelt', hasAmmo: true },
  { id: 70, title: 'Indentured servant', race: 'Human', weapon: 'Staff', item: 'Locket' },
  { id: 71, title: 'Jester', race: 'Human', weapon: 'Dart', item: 'Silk clothes', hasAmmo: true },
  { id: 72, title: 'Jeweler', race: 'Human', weapon: 'Dagger', item: 'Gem worth 20 gp' },
  { id: 73, title: 'Locksmith', race: 'Human', weapon: 'Dagger', item: 'Fine tools' },
  { id: 74, title: 'Mendicant', race: 'Human', weapon: 'Club', item: 'Cheese dip' },
  { id: 75, title: 'Mercenary', race: 'Human', weapon: 'Longsword', item: 'Hide armor', armor: 'Hide armor', armorBonus: 3, checkPenalty: -3, fumbleDie: '1d12' },
  { id: 76, title: 'Merchant', race: 'Human', weapon: 'Dagger', item: '4 gp, 14 sp, 27 cp', extraCoins: 567 },
  { id: 77, title: 'Miller/baker', race: 'Human', weapon: 'Club', item: 'Flour, 1 lb.' },
  { id: 78, title: 'Minstrel', race: 'Human', weapon: 'Dagger', item: 'Ukulele' },
  { id: 79, title: 'Noble', race: 'Human', weapon: 'Longsword', item: 'Gold ring worth 10 gp' },
  { id: 80, title: 'Orphan', race: 'Human', weapon: 'Club', item: 'Rag doll' },
  { id: 81, title: 'Ostler', race: 'Human', weapon: 'Staff', item: 'Bridle' },
  { id: 82, title: 'Outlaw', race: 'Human', weapon: 'Short sword', item: 'Leather armor', armor: 'Leather armor', armorBonus: 2, checkPenalty: -1, fumbleDie: '1d8' },
  { id: 83, title: 'Rope maker', race: 'Human', weapon: 'Knife (as dagger)', item: "Rope, 100'" },
  { id: 84, title: 'Scribe', race: 'Human', weapon: 'Dart', item: 'Parchment, 10 sheets', hasAmmo: true },
  { id: 85, title: 'Shaman', race: 'Human', weapon: 'Mace', item: 'Herbs, 1 lb.' },
  { id: 86, title: 'Slave', race: 'Human', weapon: 'Club', item: 'Strange-looking rock' },
  { id: 87, title: 'Smuggler', race: 'Human', weapon: 'Sling', item: 'Waterproof sack', hasAmmo: true },
  { id: 88, title: 'Soldier', race: 'Human', weapon: 'Spear', item: 'Shield', armor: 'Shield', armorBonus: 0, checkPenalty: -1, fumbleDie: '1d8', isShield: true },
  { id: 89, title: 'Squire', race: 'Human', weapon: 'Longsword', item: 'Steel helmet' },
  { id: 90, title: 'Squire', race: 'Human', weapon: 'Longsword', item: 'Steel helmet' },
  { id: 91, title: 'Tax collector', race: 'Human', weapon: 'Longsword', item: '100 cp', extraCoins: 100 },
  { id: 92, title: 'Trapper', race: 'Human', weapon: 'Sling', item: 'Badger pelt', hasAmmo: true },
  { id: 93, title: 'Trapper', race: 'Human', weapon: 'Sling', item: 'Badger pelt', hasAmmo: true },
  { id: 94, title: 'Urchin', race: 'Human', weapon: 'Stick (as club)', item: 'Begging bowl' },
  { id: 95, title: 'Wainwright', race: 'Human', weapon: 'Club', item: 'Pushcart', isWainwright: true },
  { id: 96, title: 'Weaver', race: 'Human', weapon: 'Dagger', item: 'Fine suit of clothes' },
  { id: 97, title: "Wizard's apprentice", race: 'Human', weapon: 'Dagger', item: 'Black grimoire' },
  { id: 98, title: 'Woodcutter', race: 'Human', weapon: 'Hand axe', item: 'Bundle of wood' },
  { id: 99, title: 'Woodcutter', race: 'Human', weapon: 'Hand axe', item: 'Bundle of wood' },
  { id: 100, title: 'Woodcutter', race: 'Human', weapon: 'Hand axe', item: 'Bundle of wood' },
];

// Table 3-4: Starting Equipment (1-24)
export const STARTING_EQUIPMENT: string[] = [
  'Backpack', 'Candle', "Chain (10')", 'Chalk (1 piece)', 'Chest (empty)', 'Crowbar',
  'Flask (empty)', 'Flint & steel', 'Grappling hook', 'Hammer (small)', 'Holy symbol', 'Holy water (1 vial)',
  'Iron spikes (1)', 'Lantern', 'Mirror (hand-sized)', 'Oil (1 flask)', 'Pole (10-foot)', 'Rations (1 day)',
  "Rope (50')", 'Sack (large)', 'Sack (small)', "Thieves' tools", 'Torch (1)', 'Waterskin',
];

// Shop Catalog Items (Prices in cp, verified against 4th Printing Table 3-1 & Table 3-4)
export const SHOP_ITEMS: ShopItem[] = [
  { name: 'Backpack', cost: 200, category: 'Adventuring Gear' },
  { name: 'Candle', cost: 1, category: 'Adventuring Gear' },
  { name: "Chain (10')", cost: 3000, category: 'Adventuring Gear' },
  { name: 'Chalk (1 piece)', cost: 1, category: 'Adventuring Gear' },
  { name: 'Chest (empty)', cost: 200, category: 'Adventuring Gear' },
  { name: 'Crowbar', cost: 200, category: 'Adventuring Gear' },
  { name: 'Flask (empty)', cost: 3, category: 'Adventuring Gear' },
  { name: 'Flint & steel', cost: 15, category: 'Adventuring Gear' },
  { name: 'Grappling hook', cost: 100, category: 'Adventuring Gear' },
  { name: 'Hammer (small)', cost: 50, category: 'Adventuring Gear' },
  { name: 'Holy symbol', cost: 2500, category: 'Adventuring Gear' },
  { name: 'Holy water (1 vial)', cost: 2500, category: 'Adventuring Gear' },
  { name: 'Iron spike', cost: 10, category: 'Adventuring Gear' },
  { name: 'Lantern', cost: 1000, category: 'Adventuring Gear' },
  { name: 'Mirror (hand-sized)', cost: 1000, category: 'Adventuring Gear' },
  { name: 'Oil (1 flask)', cost: 20, category: 'Adventuring Gear' },
  { name: 'Pole (10-foot)', cost: 15, category: 'Adventuring Gear' },
  { name: 'Rations (1 day)', cost: 5, category: 'Adventuring Gear' },
  { name: "Rope (50')", cost: 25, category: 'Adventuring Gear' },
  { name: 'Sack (large)', cost: 12, category: 'Adventuring Gear' },
  { name: 'Sack (small)', cost: 8, category: 'Adventuring Gear' },
  { name: "Thieves' tools", cost: 2500, category: 'Adventuring Gear' },
  { name: 'Torch', cost: 1, category: 'Adventuring Gear' },
  { name: 'Waterskin', cost: 50, category: 'Adventuring Gear' },
  { name: 'Leather Armor (+2 AC)', cost: 2000, category: 'Armor', bonus: 2, checkPen: -1, fumble: '1d8', type: 'armor' },
  { name: 'Hide Armor (+3 AC)', cost: 3000, category: 'Armor', bonus: 3, checkPen: -3, fumble: '1d12', type: 'armor' },
  { name: 'Shield (+1 AC)', cost: 1000, category: 'Armor', bonus: 1, checkPen: -1, fumble: '1d8', type: 'shield' },
  { name: 'Dagger (1d4)', cost: 300, category: 'Weapons' },
  { name: 'Club (1d4)', cost: 300, category: 'Weapons' },
  { name: 'Shortbow (1d6)', cost: 2500, category: 'Weapons' },
  { name: 'Short sword (1d6)', cost: 700, category: 'Weapons' },
  { name: 'Longsword (1d8)', cost: 1000, category: 'Weapons' },
  { name: 'Spear (1d8)', cost: 300, category: 'Weapons' },
];

// Appendix L: Languages Roll Resolution (4th Printing, pp. 440-441)
export const rollLanguage = (race: Race, alignment: Alignment): string => {
  const roll = Math.floor(Math.random() * 100) + 1;
  const alignTongue = `${alignment} Alignment Tongue`;

  if (race === 'Dwarf') {
    if (roll <= 20) return alignTongue;
    if (roll <= 25) return 'Elf';
    if (roll <= 35) return 'Halfling';
    if (roll <= 40) return 'Gnome';
    if (roll <= 45) return 'Bugbear';
    if (roll <= 55) return 'Goblin';
    if (roll <= 60) return 'Gnoll';
    if (roll <= 65) return 'Hobgoblin';
    if (roll <= 75) return 'Kobold';
    if (roll === 76) return 'Minotaur';
    if (roll <= 81) return 'Ogre';
    if (roll <= 86) return 'Orc';
    if (roll <= 91) return 'Troglodyte';
    if (roll <= 93) return 'Dragon';
    if (roll <= 97) return 'Giant';
    if (roll === 98) return 'Bear';
    return 'Undercommon';
  }

  if (race === 'Elf') {
    if (roll <= 20) return alignTongue;
    if (roll <= 25) return alignment === 'Chaotic' ? alignTongue : 'Chaos';
    if (roll <= 30) return alignment === 'Lawful' ? alignTongue : 'Law';
    if (roll <= 35) return alignment === 'Neutral' ? alignTongue : 'Neutrality';
    if (roll <= 40) return 'Dwarf';
    if (roll <= 45) return 'Halfling';
    if (roll <= 48) return 'Goblin';
    if (roll <= 50) return 'Gnoll';
    if (roll <= 52) return 'Harpy';
    if (roll <= 54) return 'Hobgoblin';
    if (roll <= 57) return 'Kobold';
    if (roll === 58) return 'Lizard man';
    if (roll === 59) return 'Minotaur';
    if (roll === 60) return 'Ogre';
    if (roll <= 63) return 'Orc';
    if (roll === 64) return 'Serpent-man';
    if (roll === 65) return 'Troglodyte';
    if (roll <= 70) return 'Angelic (Celestial)';
    if (roll <= 75) return 'Centaur';
    if (roll <= 80) return 'Demonic (Infernal/Abyssal)';
    if (roll <= 85) return 'Dragon';
    if (roll <= 90) return 'Pixie';
    if (roll <= 92) return 'Naga';
    if (roll <= 94) return 'Eagle';
    if (roll <= 96) return 'Horse';
    return 'Undercommon';
  }

  if (race === 'Halfling') {
    if (roll <= 25) return alignTongue;
    if (roll <= 35) return 'Dwarf';
    if (roll <= 40) return 'Elf';
    if (roll <= 50) return 'Gnome';
    if (roll <= 55) return 'Bugbear';
    if (roll <= 70) return 'Goblin';
    if (roll <= 80) return 'Hobgoblin';
    if (roll <= 90) return 'Kobold';
    if (roll <= 93) return 'Pixie';
    if (roll <= 98) return 'Ferret';
    return 'Undercommon';
  }

  // 0-Level Human
  if (roll <= 20) return alignTongue;
  if (roll <= 30) return 'Dwarf';
  if (roll <= 35) return 'Elf';
  if (roll <= 40) return 'Halfling';
  if (roll <= 45) return 'Gnome';
  if (roll <= 47) return 'Bugbear';
  if (roll <= 57) return 'Goblin';
  if (roll <= 60) return 'Gnoll';
  if (roll <= 65) return 'Hobgoblin';
  if (roll <= 75) return 'Kobold';
  if (roll <= 80) return 'Lizard man';
  if (roll === 81) return 'Minotaur';
  if (roll <= 83) return 'Ogre';
  if (roll <= 93) return 'Orc';
  if (roll <= 99) return 'Troglodyte';
  return 'Giant';
};

export const rollDice = (count: number, sides: number): { total: number; rolls: number[] } => {
  let total = 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = Math.floor(Math.random() * sides) + 1;
    rolls.push(val);
    total += val;
  }
  return { total, rolls };
};

export const splitCoins = (totalCp: number): { gp: number; sp: number; cp: number } => {
  const safeTotal = Math.max(0, Math.trunc(totalCp));
  const gp = Math.floor(safeTotal / 100);
  const remCp = safeTotal % 100;
  const sp = Math.floor(remCp / 10);
  const cp = remCp % 10;
  return { gp, sp, cp };
};

export const formatCoins = (totalCp: number): string => {
  const { gp, sp, cp } = splitCoins(totalCp);

  const parts: string[] = [];
  if (gp > 0) parts.push(`${gp} gp`);
  if (sp > 0) parts.push(`${sp} sp`);
  if (cp > 0 || parts.length === 0) parts.push(`${cp} cp`);
  return parts.join(', ');
};

export const adjustCoins = (char: Character, deltaCp: number): Character => ({
  ...char,
  coins: Math.max(0, char.coins + Math.trunc(deltaCp)),
});

export const adjustXp = (char: Character, deltaXp: number): Character => ({
  ...char,
  xp: Math.max(0, char.xp + Math.trunc(deltaXp)),
});

export const setCoinsFromDenominations = (
  char: Character,
  gp: number,
  sp: number,
  cp: number
): Character => {
  const safeGp = Math.max(0, Math.trunc(gp) || 0);
  const safeSp = Math.max(0, Math.trunc(sp) || 0);
  const safeCp = Math.max(0, Math.trunc(cp) || 0);
  return {
    ...char,
    coins: safeGp * 100 + safeSp * 10 + safeCp,
  };
};

const FUMBLE_ORDER = ['1d4', '1d8', '1d12', '1d16'] as const;
const worseFumbleDie = (a: string, b: string): string => {
  const ia = FUMBLE_ORDER.indexOf(a as (typeof FUMBLE_ORDER)[number]);
  const ib = FUMBLE_ORDER.indexOf(b as (typeof FUMBLE_ORDER)[number]);
  return ia >= ib ? a : b;
};

export const getShieldRestrictionReason = (char: Character): string | null => {
  if (char.hasShield) return 'Already carrying a shield';
  if (char.abilities.str <= 5) return 'STR ≤ 5: can carry weapon OR shield, not both';
  if (char.weapon.isTwoHanded) return `Two-handed weapon (${char.weapon.name}) prevents shield use`;
  return null;
};

export const buyEquipmentItem = (char: Character, item: ShopItem): Character => {
  if (char.coins < item.cost) return char;
  if (item.type === 'shield' && getShieldRestrictionReason(char)) return char;

  const updatedCoins = char.coins - item.cost;
  const updatedInventory = [...char.inventory, item.name];

  let armor = char.armor;
  let armorBonus = char.armorBonus;
  let armorCheckPenalty = char.armorCheckPenalty;
  let armorFumbleDie = char.armorFumbleDie;
  let hasShield = char.hasShield;

  if (item.type === 'armor') {
    armor = item.name.replace(/\s*\(\+\d+ AC\)$/, '');
    armorBonus = item.bonus ?? 0;
    armorCheckPenalty = item.checkPen ?? 0;
    armorFumbleDie = item.fumble ?? '1d4';
  } else if (item.type === 'shield') {
    hasShield = true;
    if (armor === 'Unarmored') {
      armor = 'Shield';
    } else if (!armor.includes('Shield')) {
      armor = `${armor} + Shield`;
    }
  }

  const ac = char.baseAC + armorBonus + (hasShield ? 1 : 0) + char.augurACBonus;
  const checkPenalty = armorCheckPenalty + (hasShield ? -1 : 0);
  const fumbleDie = hasShield ? worseFumbleDie(armorFumbleDie, '1d8') : armorFumbleDie;

  return {
    ...char,
    coins: updatedCoins,
    inventory: updatedInventory,
    ac,
    armor,
    armorBonus,
    armorCheckPenalty,
    armorFumbleDie,
    hasShield,
    checkPenalty,
    fumbleDie,
  };
};

const ARMOR_CATALOG: ReadonlyArray<{
  match: string[];
  label: string;
  bonus: number;
  checkPen: number;
  fumble: string;
}> = [
  { match: ['Hide Armor (+3 AC)', 'Hide armor'], label: 'Hide armor', bonus: 3, checkPen: -3, fumble: '1d12' },
  { match: ['Leather Armor (+2 AC)', 'Leather armor'], label: 'Leather armor', bonus: 2, checkPen: -1, fumble: '1d8' },
];

export const STARTER_ITEM_SUGGESTIONS: string[] = Array.from(
  new Set([
    ...STARTING_EQUIPMENT,
    'Iron helmet',
    'Steel helmet',
    'Shield',
    'Leather armor',
    'Hide armor',
    'Fine tools',
    'Tarot deck',
    'Spyglass',
    'Net',
    'Pushcart',
    'Bag of night soil',
  ])
).sort((a, b) => a.localeCompare(b));

const recomputeEquipmentStats = (char: Character, updatedInventory: string[]): Character => {
  const hasShield = updatedInventory.some((item) => item === 'Shield' || item === 'Shield (+1 AC)');

  const bestArmor = ARMOR_CATALOG.find((entry) =>
    updatedInventory.some((item) => entry.match.includes(item))
  );

  const baseArmorLabel = bestArmor ? bestArmor.label : 'Unarmored';
  const armorBonus = bestArmor ? bestArmor.bonus : 0;
  const armorCheckPenalty = bestArmor ? bestArmor.checkPen : 0;
  const armorFumbleDie = bestArmor ? bestArmor.fumble : '1d4';

  const armor = hasShield
    ? baseArmorLabel === 'Unarmored'
      ? 'Shield'
      : `${baseArmorLabel} + Shield`
    : baseArmorLabel;

  const ac = char.baseAC + armorBonus + (hasShield ? 1 : 0) + char.augurACBonus;
  const checkPenalty = armorCheckPenalty + (hasShield ? -1 : 0);
  const fumbleDie = hasShield ? worseFumbleDie(armorFumbleDie, '1d8') : armorFumbleDie;

  return {
    ...char,
    inventory: updatedInventory,
    ac,
    armor,
    armorBonus,
    armorCheckPenalty,
    armorFumbleDie,
    hasShield,
    checkPenalty,
    fumbleDie,
  };
};

export const addInventoryItem = (char: Character, itemName: string): Character => {
  const trimmed = itemName.trim();
  if (!trimmed) return char;
  return recomputeEquipmentStats(char, [...char.inventory, trimmed]);
};

export const removeInventoryItem = (char: Character, index: number): Character => {
  if (index < 0 || index >= char.inventory.length) return char;
  return recomputeEquipmentStats(
    char,
    char.inventory.filter((_, idx) => idx !== index)
  );
};

const recomputeCharacterFromAbilities = (
  char: Character,
  nextAbilities: Record<AbilityKey, number>
): Character => {
  const strMod = getAbilityMod(nextAbilities.str);
  const agiMod = getAbilityMod(nextAbilities.agi);
  const staMod = getAbilityMod(nextAbilities.sta);
  const perMod = getAbilityMod(nextAbilities.per);
  const intMod = getAbilityMod(nextAbilities.int);
  const luckMod = getAbilityMod(nextAbilities.lck);
  const augurId = char.augur.id;

  const baseAC = 10 + agiMod;
  const augurACBonus = augurId === 23 ? luckMod : 0;
  const ac = baseAC + char.armorBonus + (char.hasShield ? 1 : 0) + augurACBonus;

  const saves = {
    fort: staMod + (augurId === 17 || augurId === 21 ? luckMod : 0),
    ref: agiMod + (augurId === 17 || augurId === 20 ? luckMod : 0),
    will: perMod + (augurId === 17 || augurId === 22 ? luckMod : 0),
  };

  const initMod = agiMod + (augurId === 24 ? luckMod : 0);

  let speed = char.race === 'Dwarf' || char.race === 'Halfling' ? 20 : 30;
  if (augurId === 30) speed += luckMod * 5;
  speed = Math.max(5, speed);

  const critBonus = augurId === 26 ? luckMod * 2 : luckMod;
  const fumbleMod = augurId === 28 ? -luckMod * 2 : -luckMod;

  const isMissile = char.weapon.type === 'missile';
  const isMeleeOrThrown = char.weapon.type === 'melee' || char.weapon.type === 'melee/thrown';

  let attBonus = isMissile ? agiMod : strMod;
  if (augurId === 1) attBonus += luckMod;
  if (augurId === 2 && isMeleeOrThrown) attBonus += luckMod;
  if (augurId === 3 && isMissile) attBonus += luckMod;
  if (augurId === 9) attBonus += luckMod;

  let dmgBonus = isMissile ? 0 : strMod;
  if (augurId === 6) dmgBonus += luckMod;
  if (augurId === 7 && isMeleeOrThrown) dmgBonus += luckMod;
  if (augurId === 8 && isMissile) dmgBonus += luckMod;
  if (augurId === 9) dmgBonus += luckMod;

  let thrownAttBonus = char.weapon.thrownAttBonus;
  let thrownDmgBonus = char.weapon.thrownDmgBonus;
  if (char.weapon.type === 'melee/thrown') {
    thrownAttBonus = agiMod;
    if (augurId === 1) thrownAttBonus += luckMod;
    if (augurId === 3) thrownAttBonus += luckMod;
    if (augurId === 9) thrownAttBonus += luckMod;

    thrownDmgBonus = 0;
    if (augurId === 6) thrownDmgBonus += luckMod;
    if (augurId === 8) thrownDmgBonus += luckMod;
    if (augurId === 9) thrownDmgBonus += luckMod;
  }

  return {
    ...char,
    baseAbilities: char.baseAbilities ?? { ...char.abilities },
    abilities: nextAbilities,
    abilityMods: { strMod, agiMod, staMod, perMod, intMod, luckMod },
    baseAC,
    augurACBonus,
    ac,
    saves,
    initMod,
    speed,
    critBonus,
    fumbleMod,
    weapon: {
      ...char.weapon,
      attBonus,
      dmgBonus,
      thrownAttBonus,
      thrownDmgBonus,
    },
  };
};

export const adjustAbilityScore = (
  char: Character,
  stat: AbilityKey,
  delta: number
): Character => {
  const baseAbilities = char.baseAbilities ?? { ...char.abilities };
  const nextVal = Math.max(0, Math.min(25, char.abilities[stat] + Math.trunc(delta)));
  if (nextVal === char.abilities[stat] && char.baseAbilities) return char;
  return recomputeCharacterFromAbilities(
    { ...char, baseAbilities },
    { ...char.abilities, [stat]: nextVal }
  );
};

export const resetAbilityOverrides = (char: Character): Character => {
  if (!char.baseAbilities) return char;
  return recomputeCharacterFromAbilities(char, { ...char.baseAbilities });
};

// ==========================================
// CHARACTER GENERATION LOGIC
// ==========================================

export const generateCharacter = (partyContext: Character[] = []): Character => {
  const diceLog: string[] = [];

  // 1. Ability Scores (3d6 in order)
  const strRoll = rollDice(3, 6);
  const agiRoll = rollDice(3, 6);
  const staRoll = rollDice(3, 6);
  const perRoll = rollDice(3, 6);
  const intRoll = rollDice(3, 6);
  const lckRoll = rollDice(3, 6);

  diceLog.push(`STR Roll: 3d6 -> [${strRoll.rolls.join(',')}] = ${strRoll.total}`);
  diceLog.push(`AGI Roll: 3d6 -> [${agiRoll.rolls.join(',')}] = ${agiRoll.total}`);
  diceLog.push(`STA Roll: 3d6 -> [${staRoll.rolls.join(',')}] = ${staRoll.total}`);
  diceLog.push(`PER Roll: 3d6 -> [${perRoll.rolls.join(',')}] = ${perRoll.total}`);
  diceLog.push(`INT Roll: 3d6 -> [${intRoll.rolls.join(',')}] = ${intRoll.total}`);
  diceLog.push(`LCK Roll: 3d6 -> [${lckRoll.rolls.join(',')}] = ${lckRoll.total}`);

  const str = strRoll.total;
  const agi = agiRoll.total;
  const sta = staRoll.total;
  const per = perRoll.total;
  const intSc = intRoll.total;
  const lck = lckRoll.total;

  const strMod = getAbilityMod(str);
  const agiMod = getAbilityMod(agi);
  const staMod = getAbilityMod(sta);
  const perMod = getAbilityMod(per);
  const intMod = getAbilityMod(intSc);
  const luckMod = getAbilityMod(lck);

  // 2. Birth Augur (1d30)
  const augurRoll = rollDice(1, 30);
  const augurObj = BIRTH_AUGURS[augurRoll.total - 1];
  diceLog.push(`Birth Augur Roll: 1d30 -> ${augurRoll.total} (${augurObj.name})`);

  // 3. Occupation (d%)
  const occRoll = rollDice(1, 100);
  const occData = { ...OCCUPATIONS[occRoll.total - 1] };
  diceLog.push(`Occupation Roll: d% -> ${occRoll.total} (${occData.title})`);

  // Footnote details
  let tradeItem = occData.item;
  if (occData.isFarmer) {
    const cropRoll = rollDice(1, 8);
    const crops = ['Potato', 'Wheat', 'Turnip', 'Corn', 'Rice', 'Parsnip', 'Radish', 'Rutabaga'];
    const cropName = crops[cropRoll.total - 1];
    occData.title = `${cropName} farmer`;
    diceLog.push(`Farmer Crop Roll: 1d8 -> ${cropRoll.total} (${cropName})`);
  }

  // Handle duplicate animals in party
  const isHerderOrFarmer = Boolean(occData.isFarmer || occData.animalType);
  if (isHerderOrFarmer) {
    const existingAnimals = partyContext.filter((c) => c.isFarmer || c.animalType).length;
    if (existingAnimals >= 1) {
      const animalRoll = rollDice(1, 6);
      const animals = ['Sheep', 'Goat', 'Cow', 'Duck', 'Goose', 'Mule'];
      const animalName = animals[animalRoll.total - 1];
      tradeItem = animalName;
      diceLog.push(`Duplicate Animal Roll: 1d6 -> ${animalRoll.total} (${animalName})`);
    }
  }

  if (occData.isWainwright) {
    const cartRoll = rollDice(1, 6);
    const cartContents = ['Tomatoes', 'Nothing', 'Straw', 'Your dead', 'Dirt', 'Rocks'];
    const content = cartContents[cartRoll.total - 1];
    tradeItem = `Pushcart containing ${content.toLowerCase()}`;
    diceLog.push(`Pushcart Roll: 1d6 -> ${cartRoll.total} (${content})`);
  }

  let ammoText = '';
  if (occData.hasAmmo) {
    const ammoRoll = rollDice(1, 6);
    if (occData.weapon.includes('Shortbow')) ammoText = `${ammoRoll.total} arrows`;
    else if (occData.weapon.includes('Sling')) ammoText = `${ammoRoll.total} sling stones`;
    else if (occData.weapon.includes('Dart') || occData.weapon.includes('Quill')) ammoText = `${ammoRoll.total} darts/quills`;
    diceLog.push(`Starting Ammo Roll: 1d6 -> ${ammoRoll.total} (${ammoText})`);
  }

  // 4. Starting Wealth (5d12 cp + bonus coins)
  const wealthRoll = rollDice(5, 12);
  const totalCp = wealthRoll.total + (occData.extraCoins || 0);
  diceLog.push(
    `Starting Wealth: 5d12 -> [${wealthRoll.rolls.join(',')}] = ${wealthRoll.total} cp${
      occData.extraCoins ? ` + ${occData.extraCoins} bonus cp` : ''
    }`
  );

  // 5. Starting Equipment (1d24)
  const gearRoll = rollDice(1, 24);
  const gearItem = STARTING_EQUIPMENT[gearRoll.total - 1];
  diceLog.push(`Starting Gear Roll: 1d24 -> ${gearRoll.total} (${gearItem})`);

  // 6. Alignment
  const alignments: Alignment[] = ['Lawful', 'Neutral', 'Chaotic'];
  const alignment = alignments[Math.floor(Math.random() * alignments.length)];

  // 7. HP (1d4 + staMod + (Augur #25 Bountiful harvest))
  const hpRoll = rollDice(1, 4);
  const hpBonus = staMod + (augurObj.id === 25 ? luckMod : 0);
  const hp = Math.max(1, hpRoll.total + hpBonus);
  diceLog.push(
    `Hit Points Roll: 1d4 (${hpRoll.total}) + STA Mod (${staMod})${
      augurObj.id === 25 ? ` + Luck Augur (${luckMod})` : ''
    } = ${hp} (Min 1)`
  );

  // 8. Derived Defense & Saves
  const baseAC = 10 + agiMod;
  const hasShield = Boolean(occData.isShield);
  const armorBonus = hasShield ? 0 : occData.armorBonus || 0;
  const augurACBonus = augurObj.id === 23 ? luckMod : 0;
  const finalAC = baseAC + armorBonus + (hasShield ? 1 : 0) + augurACBonus;
  const armorCheckPenalty = hasShield ? 0 : occData.checkPenalty || 0;
  const armorFumbleDie = hasShield ? '1d4' : occData.fumbleDie || '1d4';
  const checkPenalty = armorCheckPenalty + (hasShield ? -1 : 0);
  const fumbleDie = hasShield ? worseFumbleDie(armorFumbleDie, '1d8') : armorFumbleDie;

  // Saves
  const fortSave = staMod + (augurObj.id === 17 || augurObj.id === 21 ? luckMod : 0);
  const refSave = agiMod + (augurObj.id === 17 || augurObj.id === 20 ? luckMod : 0);
  const willSave = perMod + (augurObj.id === 17 || augurObj.id === 22 ? luckMod : 0);

  // Weapons & Attack Calculation
  const weaponDetails = WEAPON_DATA[occData.weapon] || { damage: '1d4', type: 'melee', range: '-' };
  const isMissile = weaponDetails.type === 'missile';
  const isMeleeOrThrown = weaponDetails.type === 'melee' || weaponDetails.type === 'melee/thrown';
  const isTwoHanded = Boolean(weaponDetails.isTwoHanded);

  // Initiative (Two-handed weapons roll 1d16 instead of 1d20)
  const initMod = agiMod + (augurObj.id === 24 ? luckMod : 0);
  const initDie: '1d20' | '1d16' = isTwoHanded ? '1d16' : '1d20';

  // Speed
  let baseSpeed = 30;
  if (occData.race === 'Dwarf' || occData.race === 'Halfling') baseSpeed = 20;
  if (augurObj.id === 30) baseSpeed += luckMod * 5;
  baseSpeed = Math.max(5, baseSpeed);

  // Crits & Fumbles (0-level: 1d4 on Crit Table I)
  const critBonus = augurObj.id === 26 ? luckMod * 2 : luckMod;
  const fumbleMod = augurObj.id === 28 ? -luckMod * 2 : -luckMod;

  // Primary Attack & Damage
  let attBonus = isMissile ? agiMod : strMod;
  if (augurObj.id === 1) attBonus += luckMod;
  if (augurObj.id === 2 && isMeleeOrThrown) attBonus += luckMod;
  if (augurObj.id === 3 && isMissile) attBonus += luckMod;
  if (augurObj.id === 9) attBonus += luckMod;

  let dmgBonus = isMissile ? 0 : strMod;
  if (augurObj.id === 6) dmgBonus += luckMod;
  if (augurObj.id === 7 && isMeleeOrThrown) dmgBonus += luckMod;
  if (augurObj.id === 8 && isMissile) dmgBonus += luckMod;
  if (augurObj.id === 9) dmgBonus += luckMod;

  // Thrown profile for melee/thrown weapons
  let thrownAttBonus: number | undefined;
  let thrownDmgBonus: number | undefined;
  if (weaponDetails.type === 'melee/thrown') {
    thrownAttBonus = agiMod;
    if (augurObj.id === 1) thrownAttBonus += luckMod;
    if (augurObj.id === 3) thrownAttBonus += luckMod;
    if (augurObj.id === 9) thrownAttBonus += luckMod;

    thrownDmgBonus = 0;
    if (augurObj.id === 6) thrownDmgBonus += luckMod;
    if (augurObj.id === 8) thrownDmgBonus += luckMod;
    if (augurObj.id === 9) thrownDmgBonus += luckMod;
  }

  // Name from First Names & Sobriquets
  const name = generateRandomName();

  // 9. Languages (Appendix L, with duplicate re-roll)
  const knownLanguages: string[] = ['Common'];
  if (intSc <= 7) {
    diceLog.push(`Languages: Common (INT ${intSc} <= 7, Common only)`);
  } else {
    if (occData.race === 'Dwarf') knownLanguages.push('Dwarf');
    if (occData.race === 'Elf') knownLanguages.push('Elf');
    if (occData.race === 'Halfling') knownLanguages.push('Halfling');

    const bonusLangCount = Math.max(0, intMod + (augurObj.id === 29 ? luckMod : 0));
    let added = 0;
    let attempts = 0;
    while (added < bonusLangCount && attempts < 60) {
      attempts++;
      const rolledLang = rollLanguage(occData.race, alignment);
      if (!knownLanguages.includes(rolledLang)) {
        knownLanguages.push(rolledLang);
        added++;
        diceLog.push(`Language Roll ${added}: d% -> ${rolledLang}`);
      }
    }
  }

  // Special Notes
  const specialNotes: string[] = [];
  if (str <= 5) specialNotes.push('Can carry a weapon or a shield, but not both.');
  if (sta <= 5) specialNotes.push('Takes double damage from all poisons and diseases.');
  if (intSc <= 7) specialNotes.push('Can speak only Common.');
  if (intSc <= 5) specialNotes.push('Cannot read or write.');

  if (occData.race === 'Dwarf') {
    specialNotes.push("Infravision 60'. Must advance as Dwarf at Level 1.");
  } else if (occData.race === 'Elf') {
    specialNotes.push('Heightened senses (+4 secret doors within 10\'). Sensitive to iron (1 hp dmg/day direct contact). Must advance as Elf at Lvl 1.');
  } else if (occData.race === 'Halfling') {
    specialNotes.push("Infravision 30'. Must advance as Halfling at Level 1.");
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    name,
    title: occData.title,
    race: occData.race,
    alignment,
    xp: 0,
    isDead: false,
    baseAbilities: { str, agi, sta, per, int: intSc, lck },
    abilities: { str, agi, sta, per, int: intSc, lck },
    abilityMods: { strMod, agiMod, staMod, perMod, intMod, luckMod },
    hp,
    maxHp: hp,
    ac: finalAC,
    baseAC,
    augurACBonus,
    armor: occData.armor || 'Unarmored',
    armorBonus,
    armorCheckPenalty,
    armorFumbleDie,
    hasShield,
    checkPenalty,
    fumbleDie,
    fumbleMod,
    critDie: '1d4',
    critTable: 'I',
    critBonus,
    saves: { fort: fortSave, ref: refSave, will: willSave },
    initMod,
    initDie,
    speed: baseSpeed,
    augur: augurObj,
    augurRoll: augurRoll.total,
    weapon: {
      name: occData.weapon,
      type: weaponDetails.type,
      damage: weaponDetails.damage,
      range: weaponDetails.range,
      isTwoHanded,
      attBonus,
      dmgBonus,
      thrownAttBonus,
      thrownDmgBonus,
      ammo: ammoText,
    },
    tradeItem,
    startingGear: gearItem,
    inventory: [gearItem, tradeItem, ...(ammoText ? [ammoText] : [])],
    coins: totalCp,
    specialNotes,
    knownLanguages,
    diceLog,
    isFarmer: occData.isFarmer,
    animalType: occData.animalType,
  };
};
