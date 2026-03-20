import type { Landmark, JointAngle } from '@/types/pose';
import { computeJointAngles } from './jointAngleEngine';

export interface CalibrationData {
  baselineAngles: Record<string, number>;
  capturedAt: number;
  frameCount: number;
}

/**
 * Captures the user's standing baseline angles over multiple frames.
 * Used to personalise golden ranges to the user's anatomy.
 */
export class CalibrationCapture {
  private frames: JointAngle[][] = [];
  private readonly durationMs: number;
  private startTime = 0;

  constructor(durationMs: number = 5000) {
    this.durationMs = durationMs;
  }

  start(): void {
    this.frames = [];
    this.startTime = Date.now();
  }

  /** Add a frame of landmarks. Returns progress 0-1. */
  addFrame(landmarks: Landmark[]): number {
    if (this.isComplete()) return 1;

    const angles = computeJointAngles(landmarks);
    if (angles.length > 0) {
      this.frames.push(angles);
    }

    const elapsed = Date.now() - this.startTime;
    return Math.min(1, elapsed / this.durationMs);
  }

  isComplete(): boolean {
    return Date.now() - this.startTime >= this.durationMs;
  }

  /** Compute the average angle for each joint across all captured frames. */
  getResult(): CalibrationData | null {
    if (this.frames.length < 10) return null; // Not enough data

    const angleSums: Record<string, { total: number; count: number }> = {};

    for (const frame of this.frames) {
      for (const angle of frame) {
        if (!angleSums[angle.name]) {
          angleSums[angle.name] = { total: 0, count: 0 };
        }
        angleSums[angle.name].total += angle.angle;
        angleSums[angle.name].count += 1;
      }
    }

    const baselineAngles: Record<string, number> = {};
    for (const [name, data] of Object.entries(angleSums)) {
      baselineAngles[name] = Math.round(data.total / data.count);
    }

    return {
      baselineAngles,
      capturedAt: Date.now(),
      frameCount: this.frames.length,
    };
  }
}

/**
 * Adjust an exercise's standing angle based on calibration data.
 * If the user's natural standing knee angle is 172° instead of the default 175°,
 * all thresholds shift accordingly.
 */
export function adjustGoldenRanges(
  exerciseStandingAngle: { min: number; max: number },
  baselineAngle: number,
  defaultStanding: number = 175,
): { min: number; max: number } {
  const offset = baselineAngle - defaultStanding;
  return {
    min: exerciseStandingAngle.min + offset,
    max: Math.min(180, exerciseStandingAngle.max + offset),
  };
}
