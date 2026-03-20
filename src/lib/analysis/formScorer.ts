import type { JointAngle } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';
import { computeSymmetryScore } from './jointAngleEngine';

/**
 * Score weights for the 5-component form score formula.
 */
const WEIGHTS = {
  depth: 0.30,
  alignment: 0.25,
  symmetry: 0.20,
  control: 0.15,
  rom: 0.10,
} as const;

interface FormScoreComponents {
  depth: number;
  alignment: number;
  symmetry: number;
  control: number;
  rom: number;
  total: number;
}

/**
 * Score a single rep based on how well joint angles matched golden ranges.
 *
 * @param bottomAngle The primary joint angle at the deepest point of the rep
 * @param angles All joint angles at the bottom of the rep
 * @param exercise Exercise config with golden ranges
 * @param eccentricDuration Time spent in the descending phase (ms)
 * @param returnedToStart Whether the joint fully returned to starting position
 */
export function scoreRep(
  bottomAngle: number,
  angles: JointAngle[],
  exercise: ExerciseConfig,
  eccentricDuration: number,
  returnedToStart: boolean,
): FormScoreComponents {
  const depth = scoreDepth(bottomAngle, exercise);
  const alignment = scoreAlignment(angles, exercise);
  const symmetry = computeSymmetryScore(angles);
  const control = scoreControl(eccentricDuration);
  const rom = returnedToStart ? 100 : 60;

  const total = Math.round(
    depth * WEIGHTS.depth +
    alignment * WEIGHTS.alignment +
    symmetry * WEIGHTS.symmetry +
    control * WEIGHTS.control +
    rom * WEIGHTS.rom,
  );

  return { depth, alignment, symmetry, control, rom, total };
}

/**
 * Depth achievement: did the primary joint reach the target angle range?
 * 100 = perfect depth, 0 = didn't even start descending
 */
function scoreDepth(bottomAngle: number, exercise: ExerciseConfig): number {
  const { bottomAngle: target } = exercise;
  const increasing = exercise.angleDirection === 'increasing';
  const targetMid = (target.min + target.max) / 2;

  if (bottomAngle >= target.min && bottomAngle <= target.max) {
    return 100; // In the golden range
  }

  // Went past the target range
  const overshot = increasing
    ? bottomAngle > target.max ? bottomAngle - target.max : 0
    : bottomAngle < target.min ? target.min - bottomAngle : 0;
  if (overshot > 0) {
    return Math.max(70, 100 - overshot * 2);
  }

  // Didn't reach the target range
  const shortfall = Math.abs(bottomAngle - targetMid);
  return Math.max(0, Math.round(100 - (shortfall / 40) * 100));
}

/**
 * Alignment: check secondary joints against their golden ranges.
 * Checks spine neutrality, knee tracking, etc.
 */
function scoreAlignment(angles: JointAngle[], exercise: ExerciseConfig): number {
  const ranges = exercise.goldenRanges;
  let totalScore = 0;
  let checkedCount = 0;

  for (const [jointKey, range] of Object.entries(ranges)) {
    if (jointKey === 'spine' && range.max !== undefined) {
      // Spine deviation check — lower is better
      const spineAngle = angles.find((a) => a.name.toLowerCase().includes('spine'));
      if (spineAngle) {
        const deviation = Math.abs(spineAngle.angle);
        totalScore += deviation <= range.max ? 100 : Math.max(0, 100 - (deviation - range.max) * 5);
        checkedCount++;
      }
      continue;
    }

    // Check the 'bottom' or 'hold' range (the work position of the rep)
    // Prefer 'bottom', fall back to 'hold' — skip 'top' since we score at deepest point
    const phaseRange = range.bottom ?? range.hold;
    if (phaseRange) {
      const matching = angles.find((a) =>
        a.name.toLowerCase().includes(jointKey.toLowerCase()),
      );
      if (matching) {
        const mid = (phaseRange.min + phaseRange.max) / 2;
        const deviation = Math.abs(matching.angle - mid);
        const rangeHalf = (phaseRange.max - phaseRange.min) / 2;
        totalScore += deviation <= rangeHalf ? 100 : Math.max(0, 100 - ((deviation - rangeHalf) / 20) * 100);
        checkedCount++;
      }
    }
  }

  return checkedCount > 0 ? Math.round(totalScore / checkedCount) : 85;
}

/**
 * Control (speed): eccentric phase should be ≥ 1.5 seconds for a controlled rep.
 */
function scoreControl(eccentricDuration: number): number {
  if (eccentricDuration >= 2000) return 100;
  if (eccentricDuration >= 1500) return 90;
  if (eccentricDuration >= 1000) return 70;
  if (eccentricDuration >= 500) return 50;
  return 30;
}
