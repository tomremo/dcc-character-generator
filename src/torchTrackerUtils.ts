export const TORCH_DURATION_TURNS = 6;
export const MINUTES_PER_DUNGEON_TURN = 10;

export interface TorchTrackerState {
  dungeonTurns: number;
  torchTurnsRemaining: number;
}

export function createInitialTorchState(): TorchTrackerState {
  return {
    dungeonTurns: 0,
    torchTurnsRemaining: TORCH_DURATION_TURNS,
  };
}

export function advanceDungeonTurn(state: TorchTrackerState): TorchTrackerState {
  return {
    dungeonTurns: state.dungeonTurns + 1,
    torchTurnsRemaining: Math.max(0, state.torchTurnsRemaining - 1),
  };
}

export function lightNewTorch(state: TorchTrackerState): TorchTrackerState {
  return {
    ...state,
    torchTurnsRemaining: TORCH_DURATION_TURNS,
  };
}

export function resetTorchTracker(): TorchTrackerState {
  return createInitialTorchState();
}

export function formatDungeonElapsedTime(turns: number): string {
  const safeTurns = Math.max(0, Math.floor(turns));
  const totalMinutes = safeTurns * MINUTES_PER_DUNGEON_TURN;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
