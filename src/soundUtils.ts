const SOUND_STORAGE_KEY = 'dcc-level0-sound-enabled-v1';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new Ctor();
  }
  return sharedAudioCtx;
}

export function resetAudioContextForTests(): void {
  sharedAudioCtx = null;
}

export function loadSoundPreference(): boolean {
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw === null) return true;
    return raw !== 'false';
  } catch {
    return true;
  }
}

export function saveSoundPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage errors in sandboxed iframes
  }
}

export interface DiceSoundOptions {
  isNat20?: boolean;
  isNat1?: boolean;
}

/**
 * Synthesizes a polyhedral dice clatter on wood using the Web Audio API
 * (zero external audio files; works offline and inside single-file embeds).
 */
export function playDiceSound(options: DiceSoundOptions = {}): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const clatterOffsets = [0, 0.045, 0.095, 0.15, 0.215, 0.275];

    // Create a short white-noise buffer once per roll
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.035));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    clatterOffsets.forEach((offset, idx) => {
      const t = now + offset;
      const decayFactor = 1 - idx * 0.13;

      // Wooden knock body
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 240 + Math.random() * 220;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, t + 0.03);
      oscGain.gain.setValueAtTime(0.14 * decayFactor, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);

      // Crisp polyhedral click
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 1200, t);
      filter.Q.setValueAtTime(2.5, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22 * decayFactor, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.032);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.035);
    });

    if (options.isNat20) {
      // Bright heroic chime for Natural 20
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const t = now + 0.28 + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } else if (options.isNat1) {
      // Low ominous thud for Natural 1
      const t = now + 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(125, t);
      osc.frequency.exponentialRampToValueAtTime(58, t + 0.22);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    }

    return true;
  } catch {
    return false;
  }
}
