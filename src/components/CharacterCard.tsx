import React, { useEffect, useId, useState } from 'react';
import {
  Coins,
  FileText,
  Heart,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Skull,
  Sparkles,
  Swords,
  X,
  Zap,
} from 'lucide-react';
import { Alignment, Character, formatCoins, formatMod, swapFirstName, swapSobriquet } from '../dccData';
import { Button } from './ui';

export interface CharacterCardProps {
  char: Character;
  onReroll: () => void;
  onRerollName: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAlignment: (align: Alignment) => void;
  onAdjustHp: (delta: number) => void;
  onToggleDead: () => void;
  onRemoveItem: (index: number) => void;
  onOpenShop: () => void;
  onOpenLog: () => void;
}

export function CharacterCard({
  char,
  onReroll,
  onRerollName,
  onUpdateName,
  onUpdateAlignment,
  onAdjustHp,
  onToggleDead,
  onRemoveItem,
  onOpenShop,
  onOpenLog,
}: CharacterCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(char.name);
  const nameInputId = useId();
  const alignSelectId = useId();

  useEffect(() => {
    setTempName(char.name);
  }, [char.name]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(tempName.trim() || char.name);
    setIsEditingName(false);
  };

  return (
    <article
      className={`dcc-sheet relative rounded-sm p-4 print:p-2.5 flex flex-col justify-between transition-opacity ${
        char.isDead ? 'opacity-80' : ''
      }`}
    >
      {/* DECEASED STAMP OVERLAY */}
      {char.isDead && (
        <div
          className="pointer-events-none absolute top-14 right-4 z-10 border-2 border-[#8b1a1a] text-[#8b1a1a] bg-[#f4ebd0]/90 px-2.5 py-0.5 font-display font-black text-xs uppercase tracking-widest -rotate-6 shadow-sm print:bg-white print:text-black print:border-black"
          aria-label="Character is deceased"
        >
          Deceased
        </div>
      )}

      <div>
        {/* CARD HEADER */}
        <div className="flex items-start justify-between border-b-2 border-[#3d2817] pb-2 mb-2.5 gap-2">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <form onSubmit={handleNameSubmit} className="flex flex-wrap items-center gap-1.5">
                <label htmlFor={nameInputId} className="visually-hidden">
                  Character Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-sm font-bold text-[#1a1410] flex-1 min-w-36"
                  autoFocus
                />
                <Button
                  variant="parchment"
                  size="xs"
                  onClick={() => setTempName((prev) => swapFirstName(prev))}
                  title="Reroll first name"
                >
                  Name
                </Button>
                <Button
                  variant="parchment"
                  size="xs"
                  onClick={() => setTempName((prev) => swapSobriquet(prev))}
                  title="Reroll sobriquet"
                >
                  Sobriquet
                </Button>
                <Button type="submit" variant="wood" size="xs">
                  Save
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base md:text-lg font-black text-[#1a1410] uppercase tracking-wide truncate">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-left hover:underline decoration-[#8b1a1a] cursor-pointer inline-flex items-center gap-1.5"
                    aria-label={`Edit name ${char.name}`}
                  >
                    <span>{char.name}</span>
                    <Pencil className="w-3 h-3 text-[#6b4c2e] print:hidden shrink-0" aria-hidden="true" />
                  </button>
                </h2>
                <button
                  type="button"
                  onClick={onRerollName}
                  className="p-1 text-[#5c3d1e] hover:text-[#8b1a1a] print:hidden cursor-pointer shrink-0"
                  aria-label={`Randomize sobriquet for ${char.name}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            <p className="text-xs md:text-sm font-bold text-[#6e2c14] uppercase tracking-wider mt-0.5">
              {char.title} <span className="text-[#3d2817]">({char.race})</span>
              <span className="ml-2 font-mono-stats text-[11px] text-[#4a3728] font-semibold">
                &bull; XP: {char.xp}/10
              </span>
            </p>
          </div>

          {/* ALIGNMENT & SHEET CONTROLS */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 print:hidden">
              <label htmlFor={alignSelectId} className="visually-hidden">
                Alignment for {char.name}
              </label>
              <select
                id={alignSelectId}
                value={char.alignment}
                onChange={(e) => onUpdateAlignment(e.target.value as Alignment)}
                className="bg-[#eadbb8] border border-[#5c3d1e] text-[#1a1410] font-bold text-xs rounded-sm px-1.5 py-1 cursor-pointer"
              >
                <option value="Lawful">Lawful</option>
                <option value="Neutral">Neutral</option>
                <option value="Chaotic">Chaotic</option>
              </select>

              <Button
                variant={char.isDead ? 'crimson' : 'parchment'}
                size="icon"
                onClick={onToggleDead}
                aria-pressed={char.isDead}
                aria-label={char.isDead ? `Revive ${char.name}` : `Mark ${char.name} deceased`}
              >
                <Skull className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>

              <Button
                variant="crimson"
                size="icon"
                onClick={onReroll}
                aria-label={`Re-roll ${char.name}`}
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>

            <span className="hidden print:inline text-xs font-bold uppercase text-black border border-black px-1.5 py-0.5">
              {char.alignment}
            </span>
          </div>
        </div>

        {/* CORE ABILITIES STRIP (3d6 Straight) */}
        <div className="grid grid-cols-6 gap-1.5 mb-2.5 text-center">
          {[
            { label: 'STR', val: char.abilities.str, mod: char.abilityMods.strMod },
            { label: 'AGI', val: char.abilities.agi, mod: char.abilityMods.agiMod },
            { label: 'STA', val: char.abilities.sta, mod: char.abilityMods.staMod },
            { label: 'PER', val: char.abilities.per, mod: char.abilityMods.perMod },
            { label: 'INT', val: char.abilities.int, mod: char.abilityMods.intMod },
            { label: 'LCK', val: char.abilities.lck, mod: char.abilityMods.luckMod },
          ].map((stat) => (
            <div key={stat.label} className="dcc-stat-box rounded-sm py-1 px-0.5 flex flex-col items-center">
              <span className="font-display text-[10px] font-bold text-[#4a3728] tracking-wider">
                {stat.label}
              </span>
              <span className="font-mono-stats text-sm md:text-base font-bold text-[#1a1410] leading-tight">
                {stat.val}
              </span>
              <span
                className={`font-mono-stats text-[11px] font-bold leading-tight ${
                  stat.mod > 0
                    ? 'text-[#1e5631] print:text-black'
                    : stat.mod < 0
                    ? 'text-[#8b1a1a] print:text-black'
                    : 'text-[#5c4938] print:text-black'
                }`}
              >
                {formatMod(stat.mod)}
              </span>
            </div>
          ))}
        </div>

        {/* COMBAT & DERIVED STATS */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Heart className="w-3 h-3 text-[#8b1a1a]" aria-hidden="true" /> HP
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onAdjustHp(-1)}
                aria-label={`Decrease HP for ${char.name}`}
                className="print:hidden w-5 h-5 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828] cursor-pointer"
              >
                <Minus className="w-2.5 h-2.5" aria-hidden="true" />
              </button>
              <span className="font-mono-stats text-base font-bold text-[#8b1a1a] print:text-black">
                {char.hp}
                <span className="text-[11px] text-[#5c4938] font-normal">/{char.maxHp}</span>
              </span>
              <button
                type="button"
                onClick={() => onAdjustHp(1)}
                aria-label={`Increase HP for ${char.name}`}
                className="print:hidden w-5 h-5 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828] cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Shield className="w-3 h-3 text-[#2b4c7e]" aria-hidden="true" /> AC
            </span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">{char.ac}</span>
            <span className="text-[10px] text-[#4a3728] leading-tight truncate max-w-full">
              {char.armor}
            </span>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-[#92400e]" aria-hidden="true" /> INIT
            </span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">
              {formatMod(char.initMod)}
            </span>
            <span className="font-mono-stats text-[10px] text-[#4a3728] leading-tight">
              {char.initDie}
              {char.weapon.isTwoHanded ? ' (2H)' : ''}
            </span>
          </div>

          <div className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#4a3728] uppercase">SPEED</span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410]">{char.speed}'</span>
            <span className="font-mono-stats text-[10px] text-[#4a3728] leading-tight">
              Act: 1d20
            </span>
          </div>
        </div>

        {/* SAVING THROWS, CRIT, FUMBLE & CHECK PENALTY */}
        <div className="dcc-rule-box rounded-sm px-2.5 py-1.5 mb-2.5 text-xs flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex items-center gap-2.5 font-mono-stats">
            <span>
              <strong className="font-body text-[#4a3728]">FORT</strong> {formatMod(char.saves.fort)}
            </span>
            <span>
              <strong className="font-body text-[#4a3728]">REF</strong> {formatMod(char.saves.ref)}
            </span>
            <span>
              <strong className="font-body text-[#4a3728]">WILL</strong> {formatMod(char.saves.will)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 font-mono-stats text-[11px] text-[#3d2817]">
            <span>
              Crit: {char.critDie} Tbl {char.critTable} ({formatMod(char.critBonus)})
            </span>
            <span>
              Fumble: {char.fumbleDie} ({formatMod(char.fumbleMod)})
            </span>
            <span>Chk: {char.checkPenalty}</span>
          </div>
        </div>

        {/* TRAINED WEAPON BLOCK */}
        <div className="dcc-rule-box rounded-sm p-2 mb-2.5">
          <div className="flex items-center justify-between border-b border-[#8c6d46]/50 pb-1 mb-1">
            <span className="text-xs font-display font-bold text-[#3d2817] uppercase flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" /> Trained Weapon
            </span>
            <span className="font-mono-stats text-xs font-bold text-[#8b1a1a] print:text-black">
              Atk {formatMod(char.weapon.attBonus)} | Dmg {char.weapon.damage}
              {char.weapon.dmgBonus !== 0 ? formatMod(char.weapon.dmgBonus) : ''}
              {char.weapon.dmgBonus < 0 ? ' (min 1)' : ''}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-center text-xs font-bold text-[#1a1410] gap-1">
            <span>
              {char.weapon.name}
              {char.weapon.ammo ? ` (${char.weapon.ammo})` : ''}
            </span>
            {char.weapon.range !== '-' && (
              <span className="font-mono-stats text-[11px] font-normal text-[#4a3728]">
                Range: {char.weapon.range}
              </span>
            )}
          </div>
          {char.weapon.type === 'melee/thrown' && char.weapon.thrownAttBonus !== undefined && (
            <div className="font-mono-stats text-[11px] text-[#4a3728] mt-1 pt-1 border-t border-dashed border-[#8c6d46]/40">
              Thrown: Atk {formatMod(char.weapon.thrownAttBonus)} | Dmg {char.weapon.damage}
              {(char.weapon.thrownDmgBonus ?? 0) !== 0
                ? formatMod(char.weapon.thrownDmgBonus ?? 0)
                : ''}
              {char.abilityMods.strMod !== 0
                ? ` (${formatMod(char.abilityMods.strMod)} STR close range)`
                : ''}
            </div>
          )}
        </div>

        {/* BIRTH AUGUR BLOCK */}
        <div className="bg-[#eadbb8] border border-[#5c3d1e] rounded-sm p-2 mb-2.5 text-xs print:bg-white print:border-black">
          <div className="flex items-center justify-between gap-2 font-bold text-[#3d2817]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" />
              Birth Augur #{char.augur.id}: {char.augur.name}
            </span>
            <span className="font-mono-stats font-bold">
              Luck {formatMod(char.abilityMods.luckMod)}
            </span>
          </div>
          <p className="text-xs text-[#2b1d0e] italic mt-0.5">{char.augur.desc}</p>
        </div>

        {/* EQUIPMENT, TRADE GOODS, PURSE & LANGUAGES */}
        <dl className="space-y-1 mb-2.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Trade Goods:</dt>
            <dd className="font-semibold text-right text-[#1a1410]">{char.tradeItem}</dd>
          </div>
          <div className="flex justify-between gap-3 items-start">
            <dt className="font-bold text-[#4a3728] shrink-0">Inventory:</dt>
            <dd className="font-medium text-right text-[#1a1410] flex flex-wrap justify-end gap-1">
              {char.inventory.length === 0 ? (
                <span className="italic text-[#5c4938]">None</span>
              ) : (
                char.inventory.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="inline-flex items-center gap-1 bg-[#eadbb8]/80 border border-[#5c3d1e]/40 rounded-sm px-1.5 py-0.5 text-[11px] print:bg-transparent print:border-0 print:p-0"
                  >
                    <span>
                      {item}
                      <span className="hidden print:inline">
                        {idx < char.inventory.length - 1 ? ',' : ''}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      aria-label={`Remove ${item} from ${char.name}'s inventory`}
                      className="print:hidden text-[#6e2c14] hover:text-[#8b1a1a] cursor-pointer leading-none"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Purse:</dt>
            <dd className="font-mono-stats font-bold text-[#6e2c14] flex items-center gap-1 print:text-black">
              <Coins className="w-3.5 h-3.5 inline" aria-hidden="true" /> {formatCoins(char.coins)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-[#4a3728] shrink-0">Languages:</dt>
            <dd className="font-medium text-right text-[#1a1410]">
              {char.knownLanguages.join(', ')}
            </dd>
          </div>
        </dl>

        {/* SPECIAL NOTES */}
        {char.specialNotes.length > 0 && (
          <div className="bg-[#f8e7e2] border border-[#991b1b]/50 rounded-sm p-1.5 mb-2.5 text-[11px] text-[#6e1313] font-medium leading-snug print:bg-white print:text-black print:border-black">
            <strong>Notes:</strong> {char.specialNotes.join(' ')}
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="pt-2 border-t border-[#5c3d1e]/50 flex items-center justify-between print:hidden">
        <Button variant="wood" size="sm" onClick={onOpenShop}>
          <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Buy Gear
        </Button>

        <Button variant="slate" size="sm" onClick={onOpenLog}>
          <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Dice Log
        </Button>
      </div>
    </article>
  );
}
