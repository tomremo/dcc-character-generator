import { Character, formatCoins, formatMod } from './dccData';

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeCsv = (val: string | number): string => {
  const s = String(val);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const formatWeaponSummary = (c: Character): string => {
  const dmgSuffix = c.weapon.dmgBonus !== 0 ? formatMod(c.weapon.dmgBonus) : '';
  const minNote = c.weapon.dmgBonus < 0 ? ' (min 1)' : '';
  let base = `${c.weapon.name} (Atk ${formatMod(c.weapon.attBonus)}, Dmg ${c.weapon.damage}${dmgSuffix}${minNote})`;
  if (c.weapon.range !== '-') {
    base += ` [Range: ${c.weapon.range}]`;
  }
  if (c.weapon.type === 'melee/thrown' && c.weapon.thrownAttBonus !== undefined) {
    const tDmg = c.weapon.thrownDmgBonus ?? 0;
    const strClose = c.abilityMods.strMod !== 0 ? ` / ${formatMod(c.abilityMods.strMod)} STR close` : '';
    base += ` | Thrown: Atk ${formatMod(c.weapon.thrownAttBonus)}, Dmg ${c.weapon.damage}${tDmg !== 0 ? formatMod(tDmg) : ''}${strClose}`;
  }
  return base;
};

export const formatPartyMarkdown = (party: Character[]): string =>
  party
    .map(
      (c, i) => `========================================
# CHARACTER ${i + 1}: ${c.name.toUpperCase()}${c.isDead ? ' [DECEASED]' : ''}
Occupation: ${c.title} (${c.race}) | Alignment: ${c.alignment} | XP: ${c.xp}/10
----------------------------------------
Abilities:
  STR ${c.abilities.str} (${formatMod(c.abilityMods.strMod)}) | AGI ${c.abilities.agi} (${formatMod(c.abilityMods.agiMod)}) | STA ${c.abilities.sta} (${formatMod(c.abilityMods.staMod)})
  PER ${c.abilities.per} (${formatMod(c.abilityMods.perMod)}) | INT ${c.abilities.int} (${formatMod(c.abilityMods.intMod)}) | LCK ${c.abilities.lck} (${formatMod(c.abilityMods.luckMod)})

HP: ${c.hp}/${c.maxHp} | AC: ${c.ac} (${c.armor}) | Speed: ${c.speed}' | Init: ${formatMod(c.initMod)} (${c.initDie})
Action Die: 1d20 | Check Penalty: ${c.checkPenalty}
Saves: Fort ${formatMod(c.saves.fort)} | Ref ${formatMod(c.saves.ref)} | Will ${formatMod(c.saves.will)}
Crit: ${c.critDie} Table ${c.critTable} (${formatMod(c.critBonus)}) | Fumble: ${c.fumbleDie} (${formatMod(c.fumbleMod)})

Birth Augur: #${c.augur.id} ${c.augur.name} (${c.augur.desc}): ${formatMod(c.abilityMods.luckMod)}
Weapon: ${formatWeaponSummary(c)}
Trade Goods: ${c.tradeItem}
Equipment: ${c.inventory.join(', ')}
Purse: ${formatCoins(c.coins)} (${c.coins} cp)
Languages: ${c.knownLanguages.join(', ')}
Notes: ${c.specialNotes.length > 0 ? c.specialNotes.join(' ') : 'None'}`
    )
    .join('\n\n');

export const formatPartyJSON = (party: Character[]): string =>
  JSON.stringify(
    {
      system: 'Dungeon Crawl Classics RPG (4th Printing)',
      level: 0,
      generatedAt: new Date().toISOString(),
      characters: party,
    },
    null,
    2
  );

export const formatPartyCSV = (party: Character[]): string => {
  const headers = [
    'Name',
    'Status',
    'Occupation',
    'Race',
    'Alignment',
    'XP',
    'STR',
    'AGI',
    'STA',
    'PER',
    'INT',
    'LCK',
    'HP',
    'MaxHP',
    'AC',
    'Armor',
    'CheckPenalty',
    'Speed',
    'InitMod',
    'InitDie',
    'Fort',
    'Ref',
    'Will',
    'Crit',
    'Fumble',
    'BirthAugur',
    'Weapon',
    'Inventory',
    'Purse',
    'Languages',
    'Notes',
  ];

  const rows = party.map((c) => [
    c.name,
    c.isDead ? 'Deceased' : 'Alive',
    c.title,
    c.race,
    c.alignment,
    `${c.xp}/10`,
    `${c.abilities.str} (${formatMod(c.abilityMods.strMod)})`,
    `${c.abilities.agi} (${formatMod(c.abilityMods.agiMod)})`,
    `${c.abilities.sta} (${formatMod(c.abilityMods.staMod)})`,
    `${c.abilities.per} (${formatMod(c.abilityMods.perMod)})`,
    `${c.abilities.int} (${formatMod(c.abilityMods.intMod)})`,
    `${c.abilities.lck} (${formatMod(c.abilityMods.luckMod)})`,
    c.hp,
    c.maxHp,
    c.ac,
    c.armor,
    c.checkPenalty,
    `${c.speed}'`,
    formatMod(c.initMod),
    c.initDie,
    formatMod(c.saves.fort),
    formatMod(c.saves.ref),
    formatMod(c.saves.will),
    `${c.critDie} Table ${c.critTable} (${formatMod(c.critBonus)})`,
    `${c.fumbleDie} (${formatMod(c.fumbleMod)})`,
    `#${c.augur.id} ${c.augur.name}: ${c.augur.desc}`,
    formatWeaponSummary(c),
    c.inventory.join('; '),
    formatCoins(c.coins),
    c.knownLanguages.join('; '),
    c.specialNotes.join(' '),
  ]);

  return [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
};

export const formatPartyPrintableHTML = (party: Character[]): string => {
  const cards = party
    .map(
      (c) => `
    <article class="sheet">
      <header class="sheet-header">
        <div>
          <h2>${escapeHtml(c.name)}${c.isDead ? ' [DECEASED]' : ''}</h2>
          <div class="subtitle">${escapeHtml(c.title)} (${escapeHtml(c.race)}) &bull; ${escapeHtml(c.alignment)} &bull; XP: ${c.xp}/10</div>
        </div>
        <div class="action-die">Act Die: 1d20</div>
      </header>
      <div class="stats-grid">
        <div><span>STR</span><strong>${c.abilities.str}</strong><em>${formatMod(c.abilityMods.strMod)}</em></div>
        <div><span>AGI</span><strong>${c.abilities.agi}</strong><em>${formatMod(c.abilityMods.agiMod)}</em></div>
        <div><span>STA</span><strong>${c.abilities.sta}</strong><em>${formatMod(c.abilityMods.staMod)}</em></div>
        <div><span>PER</span><strong>${c.abilities.per}</strong><em>${formatMod(c.abilityMods.perMod)}</em></div>
        <div><span>INT</span><strong>${c.abilities.int}</strong><em>${formatMod(c.abilityMods.intMod)}</em></div>
        <div><span>LCK</span><strong>${c.abilities.lck}</strong><em>${formatMod(c.abilityMods.luckMod)}</em></div>
      </div>
      <div class="combat-grid">
        <div><span>HP</span><strong>${c.hp}/${c.maxHp}</strong></div>
        <div><span>AC</span><strong>${c.ac}</strong><small>${escapeHtml(c.armor)}</small></div>
        <div><span>INIT</span><strong>${formatMod(c.initMod)}</strong><small>${c.initDie}</small></div>
        <div><span>SPEED</span><strong>${c.speed}'</strong><small>Chk ${c.checkPenalty}</small></div>
      </div>
      <div class="saves-row">
        <span>FORT <strong>${formatMod(c.saves.fort)}</strong></span>
        <span>REF <strong>${formatMod(c.saves.ref)}</strong></span>
        <span>WILL <strong>${formatMod(c.saves.will)}</strong></span>
        <span>CRIT <strong>${c.critDie} Tbl ${c.critTable} (${formatMod(c.critBonus)})</strong></span>
        <span>FUMBLE <strong>${c.fumbleDie} (${formatMod(c.fumbleMod)})</strong></span>
      </div>
      <div class="block"><strong>Weapon:</strong> ${escapeHtml(formatWeaponSummary(c))}</div>
      <div class="block"><strong>Birth Augur (#${c.augur.id}):</strong> ${escapeHtml(c.augur.name)} &mdash; ${escapeHtml(c.augur.desc)} (${formatMod(c.abilityMods.luckMod)})</div>
      <div class="block"><strong>Trade Goods:</strong> ${escapeHtml(c.tradeItem)}</div>
      <div class="block"><strong>Equipment:</strong> ${escapeHtml(c.inventory.join(', '))}</div>
      <div class="block"><strong>Purse:</strong> ${escapeHtml(formatCoins(c.coins))} &bull; <strong>Languages:</strong> ${escapeHtml(c.knownLanguages.join(', '))}</div>
      ${c.specialNotes.length > 0 ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(c.specialNotes.join(' '))}</div>` : ''}
    </article>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>DCC RPG Level 0 Character Sheets</title>
  <style>
    @page { size: letter portrait; margin: 0.35in; }
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #000; background: #fff; margin: 0; padding: 16px; }
    h1 { text-align: center; font-size: 16pt; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px; }
    .page-sub { text-align: center; font-size: 9pt; font-style: italic; margin: 0 0 14px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .sheet { border: 2px solid #000; padding: 10px; break-inside: avoid; page-break-inside: avoid; }
    .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
    .sheet-header h2 { margin: 0; font-size: 12pt; text-transform: uppercase; }
    .subtitle { font-size: 8.5pt; font-weight: bold; }
    .action-die { font-size: 8pt; font-weight: bold; border: 1px solid #000; padding: 2px 5px; }
    .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center; border: 1px solid #000; padding: 4px; margin-bottom: 6px; }
    .stats-grid span { display: block; font-size: 7.5pt; font-weight: bold; }
    .stats-grid strong { display: block; font-size: 11pt; }
    .stats-grid em { display: block; font-style: normal; font-size: 8pt; font-weight: bold; }
    .combat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center; margin-bottom: 6px; }
    .combat-grid > div { border: 1px solid #000; padding: 3px; }
    .combat-grid span { display: block; font-size: 7pt; font-weight: bold; }
    .combat-grid strong { display: block; font-size: 11pt; }
    .combat-grid small { display: block; font-size: 7pt; }
    .saves-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; border: 1px solid #000; padding: 4px 6px; font-size: 8pt; margin-bottom: 6px; }
    .block { font-size: 8.5pt; margin-bottom: 3px; line-height: 1.25; }
    .notes { font-size: 8pt; border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
    @media screen { .no-print { text-align: center; margin-bottom: 12px; } }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Print Character Sheets</button></div>
  <h1>Dungeon Crawl Classics &mdash; Level 0 Peasant Funnel</h1>
  <p class="page-sub">Official Character Creation Rules (4th Printing)</p>
  <div class="grid">${cards}</div>
</body>
</html>`;
};

function legacyCopy(text: string): boolean {
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

export async function copyTextReliable(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacyCopy (common inside cross-origin iframes like Google Sites)
  }
  return legacyCopy(text);
}

export function downloadFileReliable(content: string, filename: string, mimeType: string): boolean {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    try {
      const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch {
      return false;
    }
  }
}
