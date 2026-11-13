import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadSoundPreference,
  playDiceSound,
  resetAudioContextForTests,
  saveSoundPreference,
} from '../soundUtils';

describe('Sound utilities', () => {
  beforeEach(() => {
    resetAudioContextForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists and loads sound preference with safe fallback', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
      },
    });

    expect(loadSoundPreference()).toBe(true);
    saveSoundPreference(false);
    expect(loadSoundPreference()).toBe(false);
    saveSoundPreference(true);
    expect(loadSoundPreference()).toBe(true);
  });

  it('returns false gracefully when AudioContext is unavailable', () => {
    vi.stubGlobal('window', {});
    expect(playDiceSound()).toBe(false);
  });

  it('synthesizes dice clatter, Nat 20 chime, and Nat 1 thud via AudioContext', () => {
    const startMock = vi.fn();
    const stopMock = vi.fn();
    const connectMock = vi.fn();
    const mockCtx = {
      state: 'running',
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      resume: vi.fn(),
      createBuffer: vi.fn(() => ({
        getChannelData: () => new Float32Array(1543),
      })),
      createOscillator: vi.fn(() => ({
        type: 'triangle',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: connectMock,
        start: startMock,
        stop: stopMock,
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: connectMock,
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: connectMock,
        start: startMock,
        stop: stopMock,
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'bandpass',
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: connectMock,
      })),
    };

    vi.stubGlobal('window', {
      AudioContext: function MockAudioContext() {
        return mockCtx;
      },
    });

    expect(playDiceSound()).toBe(true);
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(6);
    expect(mockCtx.createBufferSource).toHaveBeenCalledTimes(6);

    mockCtx.createOscillator.mockClear();
    expect(playDiceSound({ isNat20: true })).toBe(true);
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(9); // 6 clatter + 3 chime notes

    mockCtx.createOscillator.mockClear();
    expect(playDiceSound({ isNat1: true })).toBe(true);
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(7); // 6 clatter + 1 low thud
  });
});
