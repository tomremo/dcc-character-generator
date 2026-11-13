import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Dices, Plus, SkipForward, Skull, Swords, Trash2, X } from 'lucide-react';
import { InitiativeEntry } from '../initiativeUtils';
import { Button } from './ui';

export interface InitiativeTrackerProps {
  entries: InitiativeEntry[];
  activeTurnIndex: number;
  round: number;
  isOpen: boolean;
  hasLivingParty: boolean;
  onToggleOpen: () => void;
  onRollParty: () => void;
  onNextTurn: () => void;
  onAddEnemy: (name: string, manualInit?: number) => void;
  onAdjustInit: (id: string, delta: number) => void;
  onRemoveEntry: (id: string) => void;
  onClear: () => void;
}

export function InitiativeTracker({
  entries,
  activeTurnIndex,
  round,
  isOpen,
  hasLivingParty,
  onToggleOpen,
  onRollParty,
  onNextTurn,
  onAddEnemy,
  onAdjustInit,
  onRemoveEntry,
  onClear,
}: InitiativeTrackerProps) {
  const [enemyName, setEnemyName] = useState('');
  const [enemyInitInput, setEnemyInitInput] = useState('');

  const handleEnemySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = enemyName.trim() || 'Enemy';
    const parsed = enemyInitInput.trim() === '' ? undefined : Number.parseInt(enemyInitInput.trim(), 10);
    onAddEnemy(trimmed, Number.isFinite(parsed) ? parsed : undefined);
    setEnemyName('');
    setEnemyInitInput('');
  };

  const activeEntry = entries[activeTurnIndex];

  return (
    <section
      aria-label="Initiative Tracker"
      className="dcc-panel rounded-sm px-3 py-2 mb-4 print:hidden text-[#efe4ce]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-left cursor-pointer group"
          aria-expanded={isOpen}
        >
          <Swords className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-bold text-xs md:text-sm tracking-wide text-[#fef3c7] group-hover:text-white">
            Initiative Tracker
          </span>
          <span className="text-[11px] font-mono bg-[#1a1410] border border-[#5c3d1e] px-1.5 py-0.5 rounded-sm text-[#e8d5b5]">
            Round {round}
          </span>
          {activeEntry && !activeEntry.isDead && (
            <span className="text-[11px] text-[#fcd34d] font-semibold">
              Active: {activeEntry.name} ({activeEntry.initiative})
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#c2b293]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#c2b293]" />
          )}
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="gold"
            size="xs"
            onClick={onRollParty}
            disabled={!hasLivingParty}
            title="Roll initiative for all living party members"
          >
            <Dices className="w-3.5 h-3.5" /> Roll Party Init
          </Button>
          <Button
            variant="forest"
            size="xs"
            onClick={onNextTurn}
            disabled={entries.every((entry) => entry.isDead)}
            title="Advance to next living combatant"
          >
            <SkipForward className="w-3.5 h-3.5" /> Next Turn
          </Button>
          {entries.length > 0 && (
            <Button
              variant="slate"
              size="xs"
              onClick={onClear}
              title="Clear initiative order"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-[#4b382a] space-y-2.5">
          <form onSubmit={handleEnemySubmit} className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={enemyName}
              onChange={(e) => setEnemyName(e.target.value)}
              placeholder="Enemy name (e.g. Beastman)"
              aria-label="Enemy name"
              className="flex-1 min-w-[140px] bg-[#14110f] border border-[#5c3d1e] rounded-sm px-2 py-1 text-xs text-[#efe4ce] placeholder-[#8c785d] focus:outline-none focus:border-[#f59e0b]"
            />
            <input
              type="number"
              value={enemyInitInput}
              onChange={(e) => setEnemyInitInput(e.target.value)}
              placeholder="Init (auto 1d20)"
              aria-label="Enemy initiative"
              className="w-28 bg-[#14110f] border border-[#5c3d1e] rounded-sm px-2 py-1 text-xs font-mono text-[#efe4ce] placeholder-[#8c785d] focus:outline-none focus:border-[#f59e0b]"
            />
            <Button type="submit" variant="crimson" size="xs">
              <Plus className="w-3.5 h-3.5" /> Add Enemy
            </Button>
          </form>

          {entries.length === 0 ? (
            <div className="text-xs text-[#b5a387] italic py-1">
              Click <span className="font-semibold text-[#fef3c7]">Roll Party Init</span> or add an enemy to start tracking turn order.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {entries.map((entry, idx) => {
                const isActive = idx === activeTurnIndex && !entry.isDead;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-xs transition ${
                      entry.isDead
                        ? 'bg-[#1a1410]/60 border-[#3d2e22] text-[#7c6a53] line-through opacity-70'
                        : isActive
                        ? 'bg-[#451a03] border-[#f59e0b] text-[#fef3c7] shadow-sm'
                        : entry.isEnemy
                        ? 'bg-[#2a1615] border-[#7f1d1d] text-[#fecaca]'
                        : 'bg-[#1d1712] border-[#5c3d1e] text-[#efe4ce]'
                    }`}
                  >
                    <span className="font-mono font-bold text-[11px] bg-[#14110f] px-1.5 py-0.5 rounded-sm border border-[#4b382a]">
                      {entry.initiative}
                    </span>
                    <span className="font-semibold truncate max-w-[140px]">
                      {entry.isDead && <Skull className="w-3 h-3 inline mr-1 text-[#ef4444]" />}
                      {entry.name}
                    </span>
                    <div className="flex items-center gap-0.5 ml-0.5">
                      <button
                        type="button"
                        onClick={() => onAdjustInit(entry.id, -1)}
                        className="px-1 text-[10px] font-bold rounded hover:bg-black/30 cursor-pointer"
                        title="Decrease initiative by 1"
                        aria-label={`Decrease ${entry.name} initiative`}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustInit(entry.id, 1)}
                        className="px-1 text-[10px] font-bold rounded hover:bg-black/30 cursor-pointer"
                        title="Increase initiative by 1"
                        aria-label={`Increase ${entry.name} initiative`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveEntry(entry.id)}
                        className="p-0.5 rounded hover:bg-black/30 text-[#c2b293] hover:text-white cursor-pointer"
                        title={`Remove ${entry.name}`}
                        aria-label={`Remove ${entry.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
