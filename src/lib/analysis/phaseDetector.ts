/**
 * Phase detector — classifies the current movement phase as
 * eccentric (lowering), concentric (lifting), or hold (isometric).
 *
 * Uses a sliding window of recent angles to determine movement direction
 * and velocity, smoothing out frame-to-frame noise.
 */

export type MovementPhase = 'eccentric' | 'concentric' | 'hold';

const WINDOW_SIZE = 5;
const HOLD_THRESHOLD = 2; // degrees — below this, considered stationary

export class PhaseDetector {
  private angleHistory: number[] = [];

  reset(): void {
    this.angleHistory = [];
  }

  /**
   * Feed a new angle and get the current movement phase.
   */
  update(angle: number): MovementPhase {
    this.angleHistory.push(angle);
    if (this.angleHistory.length > WINDOW_SIZE) {
      this.angleHistory.shift();
    }

    if (this.angleHistory.length < 2) {
      return 'hold';
    }

    const first = this.angleHistory[0];
    const last = this.angleHistory[this.angleHistory.length - 1];
    const delta = last - first;

    if (Math.abs(delta) < HOLD_THRESHOLD) {
      return 'hold';
    }

    // Decreasing angle = eccentric (lowering into the movement)
    // Increasing angle = concentric (returning to start)
    return delta < 0 ? 'eccentric' : 'concentric';
  }

  /**
   * Get the average angular velocity in degrees per second.
   * Negative = eccentric, positive = concentric.
   */
  getAngularVelocity(frameDeltaMs: number): number {
    if (this.angleHistory.length < 2 || frameDeltaMs <= 0) return 0;

    const first = this.angleHistory[0];
    const last = this.angleHistory[this.angleHistory.length - 1];
    const totalTimeMs = frameDeltaMs * (this.angleHistory.length - 1);

    return ((last - first) / totalTimeMs) * 1000;
  }
}
