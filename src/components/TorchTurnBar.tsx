import React from 'react';
import { Clock, Flame, RotateCcw } from 'lucide-react';
import {
  TORCH_DURATION_TURNS,
  TorchTrackerState,
  formatDungeonElapsedTime,
} from '../torchTrackerUtils';
import { Button } from './ui';

export interface TorchTurnBarProps {
  state: TorchTrackerState;
  onAdvanceTurn: () => void;
  onLightTorch: () => void;
  onReset: () => void;
}

export function TorchTurnBar({
  state,
  onAdvanceTurn,
  onLightTorch,
  onReset,
}: TorchTurnBarProps) {
  const isOut = state.torchTurnsRemaining === 0;
  const isLow = state.torchTurnsRemaining === 1;

  return (
    <section
      aria-label="Torch and Dungeon Turn Tracker"
      className="dcc-panel rounded-sm px-3 py-2 mb-3 print:hidden text-[#efe4ce] flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
          <span className="font-bold text-xs md:text-sm tracking-wide text-[#fef3c7]">
            Dungeon Turn {state.dungeonTurns}
          </span>
          <span className="text-[11px] font-mono-stats bg-[#1a1410] border border-[#5c3d1e] px-1.5 py-0.5 rounded-sm text-[#e8d5b5]">
            {formatDungeonElapsedTime(state.dungeonTurns)}
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-xs font-bold ${
            isOut
              ? 'bg-[#450a0a] border-[#ef4444] text-[#fecaca]'
              : isLow
              ? 'bg-[#451a03] border-[#f59e0b] text-[#fde68a]'
              : 'bg-[#1a1410] border-[#5c3d1e] text-[#f3d37a]'
          }`}
          role="status"
          aria-live="polite"
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              isOut ? 'text-[#f87171]' : isLow ? 'text-[#fbbf24]' : 'text-[#f59e0b]'
            }`}
            aria-hidden="true"
          />
          {isOut ? (
            <span>Torch Out — Darkness!</span>
          ) : isLow ? (
            <span>Torch Low: 1/{TORCH_DURATION_TURNS} turn left!</span>
          ) : (
            <span>
              Torch: {state.torchTurnsRemaining}/{TORCH_DURATION_TURNS} turns
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="gold"
          size="xs"
          onClick={onAdvanceTurn}
          title="Advance dungeon time by 1 exploration turn (10 minutes) and burn 1 torch turn"
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" /> +1 Turn (10m)
        </Button>
        <Button
          variant="crimson"
          size="xs"
          onClick={onLightTorch}
          title="Light a fresh torch (6 turns / 1 hour)"
        >
          <Flame className="w-3.5 h-3.5" aria-hidden="true" /> Light Torch
        </Button>
        <Button
          variant="slate"
          size="xs"
          onClick={onReset}
          title="Reset dungeon turns and torch"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Reset
        </Button>
      </div>
    </section>
  );
}
