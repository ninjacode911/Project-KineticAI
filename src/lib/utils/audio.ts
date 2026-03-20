/**
 * Simple audio feedback using the Web Audio API.
 * No external audio files needed — synthesizes beeps programmatically.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Play a short beep to indicate rep completion */
export function playRepBeep(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 880; // A5
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not available — silently skip
  }
}

/** Play a double beep for set completion */
export function playSetComplete(): void {
  try {
    const ctx = getAudioContext();

    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = i === 0 ? 880 : 1100;
      osc.type = 'sine';

      const start = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);

      osc.start(start);
      osc.stop(start + 0.15);
    }
  } catch {
    // Audio not available
  }
}

/** Play a low tone for rest timer end */
export function playRestEnd(): void {
  try {
    const ctx = getAudioContext();

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 660;
      osc.type = 'sine';

      const start = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

      osc.start(start);
      osc.stop(start + 0.2);
    }
  } catch {
    // Audio not available
  }
}
