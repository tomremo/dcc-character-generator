import { describe, expect, it } from 'vitest';
import {
  TORCH_DURATION_TURNS,
  advanceDungeonTurn,
  createInitialTorchState,
  formatDungeonElapsedTime,
  lightNewTorch,
  resetTorchTracker,
} from '../torchTrackerUtils';

describe('torchTrackerUtils', () => {
  it('advances dungeon turns and counts down torch turns to 0 without going negative', () => {
    let state = createInitialTorchState();
    expect(state).toEqual({ dungeonTurns: 0, torchTurnsRemaining: TORCH_DURATION_TURNS });

    for (let i = 0; i < 8; i++) {
      state = advanceDungeonTurn(state);
    }

    expect(state.dungeonTurns).toBe(8);
    expect(state.torchTurnsRemaining).toBe(0);
  });

  it('lights a fresh torch without resetting dungeon turns, and resets cleanly', () => {
    const depleted = { dungeonTurns: 7, torchTurnsRemaining: 0 };
    const relit = lightNewTorch(depleted);
    expect(relit).toEqual({ dungeonTurns: 7, torchTurnsRemaining: TORCH_DURATION_TURNS });

    expect(resetTorchTracker()).toEqual({
      dungeonTurns: 0,
      torchTurnsRemaining: TORCH_DURATION_TURNS,
    });
  });

  it('formats elapsed dungeon time in 10-minute increments', () => {
    expect(formatDungeonElapsedTime(0)).toBe('0m');
    expect(formatDungeonElapsedTime(3)).toBe('30m');
    expect(formatDungeonElapsedTime(6)).toBe('1h');
    expect(formatDungeonElapsedTime(7)).toBe('1h 10m');
  });
});
