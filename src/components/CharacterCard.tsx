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
import {
  AbilityKey,
  Alignment,
  Character,
  STARTER_ITEM_SUGGESTIONS,
  formatCoins,
  formatMod,
  splitCoins,
  swapFirstName,
  swapSobriquet,
} from '../dccData';
import { Button, ConfirmDialog } from './ui';

export interface CharacterRollRequest {
  label: string;
  expr: string;
  modifier: number;
  isAttack?: boolean;
  kind?: 'standard' | 'luckCheck';
}

export interface CharacterCardProps {
  char: Character;
  onReroll: () => void;
  onRerollName: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAlignment: (align: Alignment) => void;
  onAdjustHp: (delta: number) => void;
  onToggleDead: () => void;
  onAddItem: (itemName: string, quantity?: number) => void;
  onRemoveItem: (index: number) => void;
  onSetCoins: (gp: number, sp: number, cp: number) => void;
  onAdjustAbility: (stat: AbilityKey, delta: number) => void;
  onResetAbilities: () => void;
  onAdjustXp: (delta: number) => void;
  onRoll: (request: CharacterRollRequest) => void;
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
  onAddItem,
  onRemoveItem,
  onSetCoins,
  onAdjustAbility,
  onResetAbilities,
  onAdjustXp,
  onRoll,
  onOpenShop,
  onOpenLog,
}: CharacterCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(char.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [pendingRemove, setPendingRemove] = useState<{ index: number; name: string } | null>(null);
  const [isEditingPurse, setIsEditingPurse] = useState(false);
  const [coinInputs, setCoinInputs] = useState(() => splitCoins(char.coins));
  const nameInputId = useId();
  const alignSelectId = useId();
  const addItemInputId = useId();
  const starterListId = useId();
  const gpInputId = useId();
  const spInputId = useId();
  const cpInputId = useId();

  useEffect(() => {
    setTempName(char.name);
  }, [char.name]);

  useEffect(() => {
    setCoinInputs(splitCoins(char.coins));
  }, [char.coins]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(tempName.trim() || char.name);
    setIsEditingName(false);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName, newItemQty);
    setNewItemName('');
    setNewItemQty(1);
    setIsAddingItem(false);
  };

  const handlePurseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetCoins(coinInputs.gp, coinInputs.sp, coinInputs.cp);
    setIsEditingPurse(false);
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

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs md:text-sm font-bold text-[#6e2c14] uppercase tracking-wider mt-0.5">
              <span>
                {char.title} <span className="text-[#3d2817]">({char.race})</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono-stats text-[11px] font-semibold">
                <span className="text-[#4a3728]">&bull;</span>
                <button
                  type="button"
                  onClick={() => onAdjustXp(-1)}
                  aria-label={`Decrease XP for ${char.name}`}
                  className="print:hidden w-4 h-4 inline-flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828]/70 cursor-pointer"
                >
                  <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                </button>
                <span className={char.xp >= 10 ? 'text-[#1e5631] font-bold print:text-black' : 'text-[#4a3728]'}>
                  XP: {char.xp}/10
                </span>
                <button
                  type="button"
                  onClick={() => onAdjustXp(1)}
                  aria-label={`Increase XP for ${char.name}`}
                  className="print:hidden w-4 h-4 inline-flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828]/70 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" aria-hidden="true" />
                </button>
              </span>
            </div>
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

        {/* CORE ABILITIES STRIP (3d6 Straight, with temporary override controls) */}
        {(() => {
          const abilityEntries: ReadonlyArray<{
            key: AbilityKey;
            label: string;
            val: number;
            baseVal: number;
            mod: number;
          }> = [
            { key: 'str', label: 'STR', val: char.abilities.str, baseVal: char.baseAbilities?.str ?? char.abilities.str, mod: char.abilityMods.strMod },
            { key: 'agi', label: 'AGI', val: char.abilities.agi, baseVal: char.baseAbilities?.agi ?? char.abilities.agi, mod: char.abilityMods.agiMod },
            { key: 'sta', label: 'STA', val: char.abilities.sta, baseVal: char.baseAbilities?.sta ?? char.abilities.sta, mod: char.abilityMods.staMod },
            { key: 'per', label: 'PER', val: char.abilities.per, baseVal: char.baseAbilities?.per ?? char.abilities.per, mod: char.abilityMods.perMod },
            { key: 'int', label: 'INT', val: char.abilities.int, baseVal: char.baseAbilities?.int ?? char.abilities.int, mod: char.abilityMods.intMod },
            { key: 'lck', label: 'LCK', val: char.abilities.lck, baseVal: char.baseAbilities?.lck ?? char.abilities.lck, mod: char.abilityMods.luckMod },
          ];
          const hasOverrides = abilityEntries.some((s) => s.val !== s.baseVal);

          return (
            <div className="mb-2.5">
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {abilityEntries.map((stat) => {
                  const isOverridden = stat.val !== stat.baseVal;
                  return (
                    <div
                      key={stat.key}
                      className={`dcc-stat-box rounded-sm py-1 px-0.5 flex flex-col items-center ${
                        isOverridden ? 'ring-1 ring-[#8b1a1a]' : ''
                      }`}
                    >
                      <span className="font-display text-[10px] font-bold text-[#4a3728] tracking-wider">
                        {stat.label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onAdjustAbility(stat.key, -1)}
                          aria-label={`Decrease ${stat.label} for ${char.name}`}
                          className="print:hidden w-4 h-4 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828]/70 cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                        </button>
                        <span
                          className={`font-mono-stats text-sm md:text-base font-bold leading-tight ${
                            isOverridden ? 'text-[#8b1a1a] print:text-black' : 'text-[#1a1410]'
                          }`}
                        >
                          {stat.val}
                          {isOverridden && (
                            <span className="text-[10px] text-[#5c4938] font-normal">
                              /{stat.baseVal}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustAbility(stat.key, 1)}
                          aria-label={`Increase ${stat.label} for ${char.name}`}
                          className="print:hidden w-4 h-4 flex items-center justify-center rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[#3d2817] border border-[#7c5828]/70 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" aria-hidden="true" />
                        </button>
                      </div>
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
                  );
                })}
              </div>
              {hasOverrides && (
                <div className="print:hidden mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={onResetAbilities}
                    className="text-[11px] font-bold text-[#8b1a1a] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" /> Reset temporary stat overrides
                  </button>
                </div>
              )}
            </div>
          );
        })()}

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

          <button
            type="button"
            onClick={() =>
              onRoll({
                label: 'Initiative',
                expr: char.initDie,
                modifier: char.initMod,
              })
            }
            aria-label={`Roll Initiative (${char.initDie}${formatMod(char.initMod)}) for ${char.name}`}
            className="dcc-rule-box rounded-sm p-1.5 flex flex-col items-center justify-center hover:bg-[#eadbb8]/80 transition cursor-pointer print:cursor-default"
          >
            <span className="text-[10px] font-bold text-[#4a3728] uppercase flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-[#92400e]" aria-hidden="true" /> INIT
            </span>
            <span className="font-mono-stats text-base font-bold text-[#1a1410] underline decoration-dotted decoration-[#8c6d46] print:no-underline">
              {formatMod(char.initMod)}
            </span>
            <span className="font-mono-stats text-[10px] text-[#4a3728] leading-tight">
              {char.initDie}
              {char.weapon.isTwoHanded ? ' (2H)' : ''}
            </span>
          </button>

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
          <div className="flex items-center gap-2 font-mono-stats">
            <button
              type="button"
              onClick={() => onRoll({ label: 'FORT Save', expr: '1d20', modifier: char.saves.fort })}
              aria-label={`Roll Fortitude save (${formatMod(char.saves.fort)}) for ${char.name}`}
              className="hover:bg-[#eadbb8] px-1 py-0.5 rounded-sm transition cursor-pointer print:p-0"
            >
              <strong className="font-body text-[#4a3728]">FORT</strong>{' '}
              <span className="underline decoration-dotted decoration-[#8c6d46] print:no-underline">
                {formatMod(char.saves.fort)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRoll({ label: 'REF Save', expr: '1d20', modifier: char.saves.ref })}
              aria-label={`Roll Reflex save (${formatMod(char.saves.ref)}) for ${char.name}`}
              className="hover:bg-[#eadbb8] px-1 py-0.5 rounded-sm transition cursor-pointer print:p-0"
            >
              <strong className="font-body text-[#4a3728]">REF</strong>{' '}
              <span className="underline decoration-dotted decoration-[#8c6d46] print:no-underline">
                {formatMod(char.saves.ref)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRoll({ label: 'WILL Save', expr: '1d20', modifier: char.saves.will })}
              aria-label={`Roll Willpower save (${formatMod(char.saves.will)}) for ${char.name}`}
              className="hover:bg-[#eadbb8] px-1 py-0.5 rounded-sm transition cursor-pointer print:p-0"
            >
              <strong className="font-body text-[#4a3728]">WILL</strong>{' '}
              <span className="underline decoration-dotted decoration-[#8c6d46] print:no-underline">
                {formatMod(char.saves.will)}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 font-mono-stats text-[11px] text-[#3d2817]">
            <button
              type="button"
              onClick={() =>
                onRoll({
                  label: `Crit Table ${char.critTable}`,
                  expr: char.critDie,
                  modifier: char.critBonus,
                })
              }
              aria-label={`Roll Crit (${char.critDie}${formatMod(char.critBonus)}) for ${char.name}`}
              className="hover:bg-[#eadbb8] px-1 py-0.5 rounded-sm transition cursor-pointer underline decoration-dotted decoration-[#8c6d46] print:no-underline print:p-0"
            >
              Crit: {char.critDie} Tbl {char.critTable} ({formatMod(char.critBonus)})
            </button>
            <button
              type="button"
              onClick={() =>
                onRoll({
                  label: 'Fumble',
                  expr: char.fumbleDie,
                  modifier: char.fumbleMod,
                })
              }
              aria-label={`Roll Fumble (${char.fumbleDie}${formatMod(char.fumbleMod)}) for ${char.name}`}
              className="hover:bg-[#eadbb8] px-1 py-0.5 rounded-sm transition cursor-pointer underline decoration-dotted decoration-[#8c6d46] print:no-underline print:p-0"
            >
              Fumble: {char.fumbleDie} ({formatMod(char.fumbleMod)})
            </button>
            <span>Chk: {char.checkPenalty}</span>
          </div>
        </div>

        {/* TRAINED WEAPON BLOCK */}
        <div className="dcc-rule-box rounded-sm p-2 mb-2.5">
          <div className="flex flex-wrap items-center justify-between border-b border-[#8c6d46]/50 pb-1 mb-1 gap-1">
            <span className="text-xs font-display font-bold text-[#3d2817] uppercase flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" /> Trained Weapon
            </span>
            <span className="font-mono-stats text-xs font-bold text-[#8b1a1a] print:text-black inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    label: `Atk (${char.weapon.name})`,
                    expr: '1d20',
                    modifier: char.weapon.attBonus,
                    isAttack: true,
                  })
                }
                aria-label={`Roll Attack with ${char.weapon.name} (${formatMod(char.weapon.attBonus)}) for ${char.name}`}
                className="hover:bg-[#eadbb8] px-1 rounded-sm transition cursor-pointer underline decoration-dotted print:no-underline print:p-0"
              >
                Atk {formatMod(char.weapon.attBonus)}
              </button>
              <span aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    label: `Dmg (${char.weapon.name})`,
                    expr: char.weapon.damage,
                    modifier: char.weapon.dmgBonus,
                  })
                }
                aria-label={`Roll Damage with ${char.weapon.name} for ${char.name}`}
                className="hover:bg-[#eadbb8] px-1 rounded-sm transition cursor-pointer underline decoration-dotted print:no-underline print:p-0"
              >
                Dmg {char.weapon.damage}
                {char.weapon.dmgBonus !== 0 ? formatMod(char.weapon.dmgBonus) : ''}
                {char.weapon.dmgBonus < 0 ? ' (min 1)' : ''}
              </button>
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
            <div className="font-mono-stats text-[11px] text-[#4a3728] mt-1 pt-1 border-t border-dashed border-[#8c6d46]/40 flex flex-wrap items-center gap-1">
              <span>Thrown:</span>
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    label: `Thrown Atk (${char.weapon.name})`,
                    expr: '1d20',
                    modifier: char.weapon.thrownAttBonus ?? 0,
                    isAttack: true,
                  })
                }
                aria-label={`Roll Thrown Attack with ${char.weapon.name} for ${char.name}`}
                className="hover:bg-[#eadbb8] px-1 rounded-sm transition cursor-pointer underline decoration-dotted print:no-underline print:p-0"
              >
                Atk {formatMod(char.weapon.thrownAttBonus)}
              </button>
              <span aria-hidden="true">|</span>
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    label: `Thrown Dmg (${char.weapon.name})`,
                    expr: char.weapon.damage,
                    modifier: char.weapon.thrownDmgBonus ?? 0,
                  })
                }
                aria-label={`Roll Thrown Damage with ${char.weapon.name} for ${char.name}`}
                className="hover:bg-[#eadbb8] px-1 rounded-sm transition cursor-pointer underline decoration-dotted print:no-underline print:p-0"
              >
                Dmg {char.weapon.damage}
                {(char.weapon.thrownDmgBonus ?? 0) !== 0
                  ? formatMod(char.weapon.thrownDmgBonus ?? 0)
                  : ''}
              </button>
              {char.abilityMods.strMod !== 0 && (
                <span>({formatMod(char.abilityMods.strMod)} STR close range)</span>
              )}
            </div>
          )}
        </div>

        {/* BIRTH AUGUR & LUCK CHECK BLOCK */}
        <div className="bg-[#eadbb8] border border-[#5c3d1e] rounded-sm p-2 mb-2.5 text-xs print:bg-white print:border-black">
          <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#3d2817]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8b1a1a]" aria-hidden="true" />
              Birth Augur #{char.augur.id}: {char.augur.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono-stats font-bold">
                Luck {formatMod(char.abilityMods.luckMod)}
              </span>
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    label: `Luck Check (≤ ${char.abilities.lck})`,
                    expr: '1d20',
                    modifier: 0,
                    kind: 'luckCheck',
                  })
                }
                aria-label={`Roll Luck Check (1d20 <= ${char.abilities.lck}) for ${char.name}`}
                className="print:hidden px-1.5 py-0.5 bg-[#3d2817] hover:bg-[#523620] text-[#f3d37a] rounded-sm font-mono-stats text-[10px] font-bold cursor-pointer"
              >
                Luck Check
              </button>
            </div>
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
            <dt className="font-bold text-[#4a3728] shrink-0 flex items-center gap-1">
              <span>Inventory:</span>
              <button
                type="button"
                onClick={() => setIsAddingItem((prev) => !prev)}
                aria-label={`Add custom item to ${char.name}'s inventory`}
                title="Add custom item or starter gear"
                className="print:hidden px-1.5 py-0.5 inline-flex items-center gap-0.5 rounded-sm bg-[#eadbb8] hover:bg-[#dcc594] text-[10px] font-bold text-[#3d2817] border border-[#7c5828] cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </dt>
            <dd className="font-medium text-right text-[#1a1410] flex-1">
              <div className="flex flex-wrap justify-end gap-1">
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
                        onClick={() => setPendingRemove({ index: idx, name: item })}
                        aria-label={`Remove ${item} from ${char.name}'s inventory`}
                        className="print:hidden text-[#6e2c14] hover:text-[#8b1a1a] cursor-pointer leading-none"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {isAddingItem && (
                <form
                  onSubmit={handleAddItemSubmit}
                  className="print:hidden mt-1.5 flex flex-wrap items-center justify-end gap-1"
                >
                  <label htmlFor={addItemInputId} className="visually-hidden">
                    Custom item name
                  </label>
                  <input
                    id={addItemInputId}
                    list={starterListId}
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Custom item (e.g. Torch, Silver key)"
                    className="px-2 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-xs text-[#1a1410] w-44"
                    autoFocus
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
                    aria-label="Item quantity"
                    title="Quantity"
                    className="px-1.5 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-xs font-mono-stats text-center text-[#1a1410] w-12"
                  />
                  <datalist id={starterListId}>
                    {STARTER_ITEM_SUGGESTIONS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  <Button type="submit" variant="forest" size="xs">
                    Add
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItemName('');
                      setNewItemQty(1);
                    }}
                    aria-label="Cancel adding item"
                    className="p-0.5 text-[#5c4938] hover:text-[#1a1410] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </form>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-3 items-start">
            <dt className="font-bold text-[#4a3728] shrink-0">Purse:</dt>
            <dd className="font-mono-stats font-bold text-[#6e2c14] print:text-black">
              {isEditingPurse ? (
                <form onSubmit={handlePurseSubmit} className="print:hidden flex flex-wrap items-center justify-end gap-1.5">
                  <label htmlFor={gpInputId} className="inline-flex items-center gap-0.5 text-[11px] text-[#3d2817]">
                    <input
                      id={gpInputId}
                      type="number"
                      min={0}
                      value={coinInputs.gp}
                      onChange={(e) => setCoinInputs((prev) => ({ ...prev, gp: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-12 px-1 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-xs text-[#1a1410] text-right"
                    />
                    <span>gp</span>
                  </label>
                  <label htmlFor={spInputId} className="inline-flex items-center gap-0.5 text-[11px] text-[#3d2817]">
                    <input
                      id={spInputId}
                      type="number"
                      min={0}
                      value={coinInputs.sp}
                      onChange={(e) => setCoinInputs((prev) => ({ ...prev, sp: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-12 px-1 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-xs text-[#1a1410] text-right"
                    />
                    <span>sp</span>
                  </label>
                  <label htmlFor={cpInputId} className="inline-flex items-center gap-0.5 text-[11px] text-[#3d2817]">
                    <input
                      id={cpInputId}
                      type="number"
                      min={0}
                      value={coinInputs.cp}
                      onChange={(e) => setCoinInputs((prev) => ({ ...prev, cp: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-12 px-1 py-0.5 bg-white border border-[#5c3d1e] rounded-sm text-xs text-[#1a1410] text-right"
                    />
                    <span>cp</span>
                  </label>
                  <Button type="submit" variant="forest" size="xs">
                    Save
                  </Button>
                  <Button
                    variant="parchment"
                    size="xs"
                    onClick={() => {
                      setCoinInputs(splitCoins(char.coins));
                      setIsEditingPurse(false);
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCoinInputs(splitCoins(char.coins));
                    setIsEditingPurse(true);
                  }}
                  aria-label={`Edit purse for ${char.name}`}
                  className="inline-flex items-center gap-1 hover:underline decoration-[#8b1a1a] cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 inline" aria-hidden="true" />
                  <span>{formatCoins(char.coins)}</span>
                  <Pencil className="w-3 h-3 text-[#6b4c2e] print:hidden" aria-hidden="true" />
                </button>
              )}
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

      {pendingRemove && (
        <ConfirmDialog
          title="Remove Inventory Item"
          message={
            <>
              Remove <strong>{pendingRemove.name}</strong> from <strong>{char.name}</strong>&apos;s
              inventory?
            </>
          }
          onConfirm={() => {
            onRemoveItem(pendingRemove.index);
            setPendingRemove(null);
          }}
          onCancel={() => setPendingRemove(null)}
        />
      )}
    </article>
  );
}
