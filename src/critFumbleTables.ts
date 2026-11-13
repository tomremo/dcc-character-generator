export interface CritFumbleEntry {
  rollLabel: string;
  min: number;
  max: number;
  text: string;
}

// DCC RPG 4th Printing — Crit Table I: All 0-Level Characters and All Wizards (p. 82)
export const CRIT_TABLE_I: ReadonlyArray<CritFumbleEntry> = [
  { rollLabel: '0 or less', min: -Infinity, max: 0, text: 'Force of blow shivers your weapon free of your grasp. Inflict +1d6 damage with this strike and you are disarmed.' },
  { rollLabel: '1', min: 1, max: 1, text: 'Opportunistic strike. Inflict +1d3 damage with this strike.' },
  { rollLabel: '2', min: 2, max: 2, text: 'Foe jabbed in the eye! Ugly bruising and inflict +1d4 damage with this strike.' },
  { rollLabel: '3', min: 3, max: 3, text: 'Stunning crack to forehead. Inflict +1d3 damage with this strike, and the foe falls to the bottom of the initiative count next round.' },
  { rollLabel: '4', min: 4, max: 4, text: "Strike to foe's kneecap. Inflict +1d4 damage with this strike and the foe suffers a -10' penalty to speed until healed." },
  { rollLabel: '5', min: 5, max: 5, text: 'Solid strike to torso. Inflict +1d6 damage with this strike.' },
  { rollLabel: '6', min: 6, max: 6, text: 'Lucky strike disarms foe. You gain a free attack if the enemy stoops to retrieve his weapon.' },
  { rollLabel: '7', min: 7, max: 7, text: "Smash foe's hand. Inflict +2d3 damage with this strike. You break two of the enemy's fingers." },
  { rollLabel: '8', min: 8, max: 8, text: 'Numbing strike! Cursing in agony, the foe is unable to attack next round.' },
  { rollLabel: '9', min: 9, max: 9, text: "Smash foe's nose. Inflict +2d4 damage with this strike and blood streams down the enemy's face." },
  { rollLabel: '10', min: 10, max: 10, text: 'Foe trips on his own feet and falls prone for the remainder of the round.' },
  { rollLabel: '11', min: 11, max: 11, text: 'Piercing strike. Inflict +2d4 damage with this strike.' },
  { rollLabel: '12', min: 12, max: 12, text: 'Strike to groin. The foe must make a DC 15 Fort save or spend the next two rounds retching.' },
  { rollLabel: '13', min: 13, max: 13, text: "Blow smashes foe's ankle; his movement speed is reduced by half." },
  { rollLabel: '14', min: 14, max: 14, text: 'Strike grazes temple; blood blinds the foe for 1d3 rounds.' },
  { rollLabel: '15', min: 15, max: 15, text: "Stab enemy's weapon hand. The weapon is lost and knocked 1d10+5 feet away." },
  { rollLabel: '16', min: 16, max: 16, text: "Narrowly avoid foe's counterstrike! Inflict normal damage and make another attack roll. If the second attack hits, you inflict an additional +1d6 damage." },
  { rollLabel: '17', min: 17, max: 17, text: 'Blow to throat. Foe staggers around for 2 rounds and is unable to speak, cast spells, or attack.' },
  { rollLabel: '18', min: 18, max: 18, text: 'Foe falls into your attack. He takes +2d6 damage from the strike and curses your luck.' },
  { rollLabel: '19', min: 19, max: 19, text: 'Miracle strike. The foe must make a DC 20 Fort save or fall unconscious.' },
  { rollLabel: '20+', min: 20, max: Infinity, text: "Lucky blow dents foe's skull! Inflict +2d6 damage with this strike. If the foe has no helm, he suffers a permanent loss of 1d4 Int." },
];

// DCC RPG 4th Printing — Table 4-2: Fumbles (p. 80)
export const FUMBLE_TABLE: ReadonlyArray<CritFumbleEntry> = [
  { rollLabel: '0 or less', min: -Infinity, max: 0, text: 'You miss wildly but miraculously cause no other damage.' },
  { rollLabel: '1', min: 1, max: 1, text: 'Your incompetent blow makes you the laughingstock of the party but otherwise causes no damage.' },
  { rollLabel: '2', min: 2, max: 2, text: 'You trip but may recover with a DC 10 Ref save; otherwise, you must spend the next round prone.' },
  { rollLabel: '3', min: 3, max: 3, text: 'Your weapon comes loose in your hand. You quickly grab it, but your grip is disrupted. You take a -2 penalty on your next attack roll.' },
  { rollLabel: '4', min: 4, max: 4, text: 'Your weapon is damaged: a bowstring breaks, a sword hilt falls off, or a crossbow firing mechanism jams. The weapon can be repaired with 10 minutes of work but is useless for now.' },
  { rollLabel: '5', min: 5, max: 5, text: 'You trip and fall, wasting this action. You are prone and must use an action to stand next round.' },
  { rollLabel: '6', min: 6, max: 6, text: 'Your weapon becomes entangled in your armor. You must spend your next round untangling them. In addition, your armor bonus is reduced by 1 until you spend 10 minutes refitting the tangled buckles and straps.' },
  { rollLabel: '7', min: 7, max: 7, text: 'You drop your weapon. You must retrieve it or draw a new one on your next action.' },
  { rollLabel: '8', min: 8, max: 8, text: 'You accidentally smash your weapon against a solid, unyielding object (a rock, a wall, even the ground). Mundane weapons are ruined; magical weapons are not affected.' },
  { rollLabel: '9', min: 9, max: 9, text: 'You stumble and leave yourself wide open to attack. The next enemy that attacks you receives a +2 bonus on its attack roll.' },
  { rollLabel: '10', min: 10, max: 10, text: 'You should have maintained your armor! The joints of your armor seize up, freezing you in place. You cannot move or make an attack for 1d3 rounds. Unarmored characters are not affected.' },
  { rollLabel: '11', min: 11, max: 11, text: 'Your wild swing leaves you off balance. You take a -4 penalty to your next attack roll.' },
  { rollLabel: '12', min: 12, max: 12, text: 'You inadvertently swing at one randomly determined ally within range. Make an attack roll against that ally using the same attack die you just attempted to use.' },
  { rollLabel: '13', min: 13, max: 13, text: 'You trip badly. You fall hard, suffering 1d3 damage in the process. You are prone and must use your next round to stand.' },
  { rollLabel: '14', min: 14, max: 14, text: 'Like a turtle on its back, you slip and land upside down, flailing about and unable to right yourself. You must fight from a prone position for the next round before you can recover your balance and rise.' },
  { rollLabel: '15', min: 15, max: 15, text: 'You somehow manage to wound yourself, taking normal damage.' },
  { rollLabel: '16+', min: 16, max: Infinity, text: 'You accidentally strike yourself for normal damage plus an extra 1 point. In addition, you fall on your back and are unable to right yourself until you make a DC 16 Agility check.' },
];

export function lookupCritTableI(total: number): CritFumbleEntry {
  return (
    CRIT_TABLE_I.find((e) => total >= e.min && total <= e.max) ??
    CRIT_TABLE_I[total < 0 ? 0 : CRIT_TABLE_I.length - 1]
  );
}

export function lookupFumbleTable(total: number): CritFumbleEntry {
  return (
    FUMBLE_TABLE.find((e) => total >= e.min && total <= e.max) ??
    FUMBLE_TABLE[total < 0 ? 0 : FUMBLE_TABLE.length - 1]
  );
}
