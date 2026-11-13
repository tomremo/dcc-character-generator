import React from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Dices,
  Flame,
  RotateCcw,
  Skull,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Character, formatMod } from '../dccData';
import { DCC_DICE_CHAIN, DiceRollResult, DccDieSides } from '../diceUtils';
import { Button } from './ui';

export interface DiceTrayProps {
  history: DiceRollResult[];
  isOpen: boolean;
  soundEnabled: boolean;
  party: Character[];
  dieShiftSteps: number;
  situationalMod: number;
  onToggleOpen: () => void;
  onToggleSound: () => void;
  onRollDie: (sides: DccDieSides) => void;
  onBurnLuck: (rollId: string) => void;
  onFollowUpRoll: (roll: DiceRollResult) => void;
  onClearHistory: () => void;
  onChangeDieShift: (delta: number) => void;
  onChangeSituationalMod: (delta: number) => void;
  onResetRollMods: () => void;
  onOpenTables: (tab?: 'crit' | 'fumble') => void;
}

export function DiceTray({
  history,
  isOpen,
  soundEnabled,
  party,
  dieShiftSteps,
  situationalMod,
  onToggleOpen,
  onToggleSound,
  onRollDie,
  onBurnLuck,
  onFollowUpRoll,
  onClearHistory,
  onChangeDieShift,
  onChangeSituationalMod,
  onResetRollMods,
  onOpenTables,
}: DiceTrayProps) {
  const latestRoll = history[0] ?? null;
  const latestChar = latestRoll?.characterId
    ? party.find((c) => c.id === latestRoll.characterId)
    : undefined;
  const canBurnLuck = Boolean(latestRoll && latestChar && latestChar.abilities.lck > 0);
  const isHalfling = latestChar?.race === 'Halfling';

  return (
    <aside
      aria-label="DCC Dice Tray"
      className="print:hidden fixed bottom-3 right-3 z-40 w-[calc(100vw-1.5rem)] max-w-sm dcc-panel rounded-md shadow-2xl border-2 border-[#7c5828] overflow-hidden"
    >
      {/* TRAY HEADER / COLLAPSE TOGGLE */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#14110f] border-b border-[#5c3d1e]">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
        >
          <Dices className="w-4 h-4 text-[#f3d37a] shrink-0" aria-hidden="true" />
          <span className="font-display text-xs font-bold uppercase tracking-wider text-[#f3d37a]">
            Dice Tray
          </span>
          {latestRoll && (
            <span className="font-mono-stats text-xs text-[#e7dec8] truncate">
              &bull; {latestRoll.label}: <strong className="text-[#fef3c7]">{latestRoll.total}</strong>
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onOpenTables(latestRoll?.tableKind)}
            title="Open Crit Table I & Table 4-2: Fumbles"
            className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f3d37a] bg-[#29221c] hover:bg-[#3d2817] border border-[#5c3d1e] rounded-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            Tables
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute dice sound effects' : 'Enable dice sound effects'}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            className="p-1 text-[#c2b293] hover:text-[#f3d37a] cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
          {history.length > 0 && isOpen && (
            <button
              type="button"
              onClick={onClearHistory}
              aria-label="Clear roll history"
              className="p-1 text-[#c2b293] hover:text-[#fca5a5] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleOpen}
            aria-label={isOpen ? 'Collapse dice tray' : 'Expand dice tray'}
            className="p-1 text-[#f3d37a] hover:text-white cursor-pointer"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3 bg-[#1f1914]">
          {/* DCC DICE CHAIN */}
          <div>
            <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[#c2b293] mb-1.5">
              DCC Dice Chain
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DCC_DICE_CHAIN.map((sides) => (
                <button
                  key={sides}
                  type="button"
                  onClick={() => onRollDie(sides)}
                  className="px-1 py-1 bg-[#29221c] hover:bg-[#3d2817] text-[#f3d37a] border border-[#5c3d1e] rounded-sm font-mono-stats text-[11px] font-bold transition cursor-pointer"
                >
                  d{sides}
                </button>
              ))}
            </div>

            {/* DICE CHAIN SHIFT & SITUATIONAL MODIFIER */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 bg-[#14110f] border border-[#3d2817] rounded-sm px-2 py-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#c2b293] font-bold mr-0.5">
                  Chain
                </span>
                <button
                  type="button"
                  onClick={() => onChangeDieShift(-1)}
                  className="px-1.5 py-0.5 text-[10px] font-mono-stats font-bold bg-[#29221c] hover:bg-[#3d2817] text-[#e7dec8] border border-[#5c3d1e] rounded-sm cursor-pointer"
                  title="Step die down 1 step on DCC Dice Chain"
                >
                  -1d
                </button>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono-stats font-bold rounded-sm ${
                    dieShiftSteps === 0
                      ? 'text-[#a89f91]'
                      : dieShiftSteps > 0
                      ? 'bg-[#2d4a1e] text-[#d9f99d]'
                      : 'bg-[#8b1a1a] text-[#fef2f2]'
                  }`}
                >
                  {dieShiftSteps === 0
                    ? 'Normal'
                    : `${dieShiftSteps > 0 ? '+' : ''}${dieShiftSteps}d`}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeDieShift(1)}
                  className="px-1.5 py-0.5 text-[10px] font-mono-stats font-bold bg-[#29221c] hover:bg-[#3d2817] text-[#e7dec8] border border-[#5c3d1e] rounded-sm cursor-pointer"
                  title="Step die up 1 step on DCC Dice Chain"
                >
                  +1d
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#c2b293] font-bold mr-0.5">
                  Mod
                </span>
                <button
                  type="button"
                  onClick={() => onChangeSituationalMod(-1)}
                  className="px-1.5 py-0.5 text-[10px] font-mono-stats font-bold bg-[#29221c] hover:bg-[#3d2817] text-[#e7dec8] border border-[#5c3d1e] rounded-sm cursor-pointer"
                  aria-label="Decrease situational modifier"
                >
                  -
                </button>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono-stats font-bold rounded-sm min-w-[28px] text-center ${
                    situationalMod === 0
                      ? 'text-[#a89f91]'
                      : situationalMod > 0
                      ? 'bg-[#2d4a1e] text-[#d9f99d]'
                      : 'bg-[#8b1a1a] text-[#fef2f2]'
                  }`}
                >
                  {formatMod(situationalMod)}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeSituationalMod(1)}
                  className="px-1.5 py-0.5 text-[10px] font-mono-stats font-bold bg-[#29221c] hover:bg-[#3d2817] text-[#e7dec8] border border-[#5c3d1e] rounded-sm cursor-pointer"
                  aria-label="Increase situational modifier"
                >
                  +
                </button>
                {(dieShiftSteps !== 0 || situationalMod !== 0) && (
                  <button
                    type="button"
                    onClick={onResetRollMods}
                    title="Reset dice chain shift and situational modifier"
                    className="p-1 text-[#c2b293] hover:text-[#f3d37a] cursor-pointer"
                    aria-label="Reset roll modifiers"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LATEST ROLL FEATURED CARD */}
          {latestRoll ? (
            <div
              role="status"
              aria-live="polite"
              className="bg-[#14110f] border border-[#7c5828] rounded-sm p-2.5 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {latestRoll.characterName && (
                    <div className="text-[11px] font-bold text-[#d4a84f] truncate">
                      {latestRoll.characterName}
                    </div>
                  )}
                  <div className="text-xs font-bold text-[#fef3c7]">{latestRoll.label}</div>
                  <div className="font-mono-stats text-[11px] text-[#c2b293]">
                    {latestRoll.formula}: [{latestRoll.rolls.join(', ')}]
                    {latestRoll.modifier !== 0 ? ` ${formatMod(latestRoll.modifier)}` : ''}
                    {latestRoll.luckBurned > 0
                      ? ` + ${latestRoll.luckBurned * (isHalfling ? 2 : 1)} Luck`
                      : ''}
                  </div>
                </div>

                <div className="font-mono-stats text-2xl font-black text-[#f3d37a] leading-none shrink-0">
                  {latestRoll.total}
                </div>
              </div>

              {/* CALLOUT BADGES */}
              <div className="flex flex-wrap items-center gap-1.5">
                {latestRoll.isNat20 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#2d4a1e] text-[#d9f99d] border border-[#bef264]/40 text-[10px] font-bold uppercase">
                    <Sparkles className="w-3 h-3" aria-hidden="true" /> Natural 20 (Crit!)
                  </span>
                )}
                {latestRoll.isNat1 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#8b1a1a] text-[#fef2f2] border border-[#fca5a5]/40 text-[10px] font-bold uppercase">
                    <Skull className="w-3 h-3" aria-hidden="true" /> Natural 1 (Fumble!)
                  </span>
                )}
                {latestRoll.luckCheckPassed !== undefined && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                      latestRoll.luckCheckPassed
                        ? 'bg-[#2d4a1e] text-[#d9f99d] border-[#bef264]/40'
                        : 'bg-[#8b1a1a] text-[#fef2f2] border-[#fca5a5]/40'
                    }`}
                  >
                    {latestRoll.luckCheckPassed ? 'Luck Check Passed' : 'Luck Check Failed'}
                  </span>
                )}
              </div>

              {latestRoll.tableOutcome && (
                <div
                  className={`text-xs leading-snug rounded-sm px-2.5 py-1.5 border ${
                    latestRoll.tableKind === 'fumble'
                      ? 'bg-[#2a1212] border-[#7f1d1d] text-[#fecaca]'
                      : 'bg-[#251f10] border-[#92400e] text-[#fef3c7]'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5">
                    {latestRoll.tableKind === 'fumble' ? 'Fumble Effect:' : 'Crit Table I:'}
                  </span>
                  {latestRoll.tableOutcome}
                </div>
              )}

              {/* FOLLOW-UP & LUCK BURN ACTIONS */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {latestRoll.followUpType === 'crit' && (
                  <Button
                    variant="forest"
                    size="xs"
                    onClick={() => onFollowUpRoll(latestRoll)}
                  >
                    Roll Crit Table I
                  </Button>
                )}
                {latestRoll.followUpType === 'fumble' && (
                  <Button
                    variant="crimson"
                    size="xs"
                    onClick={() => onFollowUpRoll(latestRoll)}
                  >
                    Roll Fumble
                  </Button>
                )}
                {latestRoll.characterId && (
                  <Button
                    variant="gold"
                    size="xs"
                    disabled={!canBurnLuck}
                    onClick={() => onBurnLuck(latestRoll.id)}
                    title={
                      !latestChar
                        ? 'Character no longer in party'
                        : latestChar.abilities.lck <= 0
                        ? 'No Luck remaining to burn'
                        : 'Permanently burn 1 Luck to boost this roll'
                    }
                  >
                    <Flame className="w-3 h-3" aria-hidden="true" />
                    Burn Luck {isHalfling ? '+2 (Halfling)' : '+1'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#c2b293] italic text-center py-2 bg-[#14110f]/60 rounded-sm border border-[#3d2817]">
              Click any stat on a sheet or a die above to roll.
            </div>
          )}

          {/* ROLL HISTORY LIST */}
          {history.length > 1 && (
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {history.slice(1).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2 text-[11px] bg-[#14110f]/70 border border-[#3d2817] rounded-sm px-2 py-1"
                >
                  <div className="min-w-0 truncate">
                    {entry.characterName && (
                      <span className="text-[#d4a84f] font-semibold">{entry.characterName}: </span>
                    )}
                    <span className="text-[#e7dec8]">{entry.label}</span>
                    <span className="font-mono-stats text-[#a89f91] ml-1">
                      [{entry.rolls.join(',')}]
                      {entry.modifier !== 0 ? formatMod(entry.modifier) : ''}
                      {entry.luckBurned > 0 ? ` +${entry.luckBurned}L` : ''}
                    </span>
                  </div>
                  <span className="font-mono-stats font-bold text-[#f3d37a] shrink-0">
                    {entry.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
