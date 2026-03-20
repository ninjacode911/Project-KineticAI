import { describe, it, expect } from 'vitest';
import { scoreRep } from '@/lib/analysis/formScorer';
import type { JointAngle } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

const mockExercise: ExerciseConfig = {
  id: 'test',
  name: 'Test',
  description: 'Test',
  category: 'lower-body-strength',
  model: 'lite',
  primaryJoint: { vertex: 25, proximal: 23, distal: 27 },
  goldenRanges: {
    'Left Knee': { bottom: { min: 70, max: 100 }, top: { min: 160, max: 180 } },
    'Right Knee': { bottom: { min: 70, max: 100 }, top: { min: 160, max: 180 } },
  },
  coachingCues: {},
  standingAngle: { min: 160, max: 180 },
  bottomAngle: { min: 60, max: 100 },
  targetReps: 10,
  targetSets: 3,
  restSeconds: 60,
  minRepDuration: 1200,
};

function makeAngles(leftKnee: number, rightKnee: number): JointAngle[] {
  return [
    { name: 'Left Knee', angle: leftKnee, confidence: 0.9, side: 'left' },
    { name: 'Right Knee', angle: rightKnee, confidence: 0.9, side: 'right' },
  ];
}

describe('formScorer', () => {
  it('scores near 100 for perfect form', () => {
    const score = scoreRep(
      85,                          // Perfect depth in golden range
      makeAngles(85, 85),          // Symmetric
      mockExercise,
      2000,                        // Good eccentric control
      true,                        // Full ROM return
    );

    expect(score.total).toBeGreaterThanOrEqual(85);
    expect(score.depth).toBe(100);
    expect(score.symmetry).toBe(100);
  });

  it('scores < 50 for severe deviations', () => {
    const score = scoreRep(
      150,                         // Barely moved (way above bottom range)
      makeAngles(150, 120),        // Very asymmetric (30° difference)
      mockExercise,
      400,                         // Rushed eccentric
      false,                       // Incomplete ROM
    );

    expect(score.total).toBeLessThan(50);
  });

  it('penalizes asymmetry (L/R differ by > 10°)', () => {
    const symmetric = scoreRep(85, makeAngles(85, 85), mockExercise, 2000, true);
    const asymmetric = scoreRep(85, makeAngles(85, 105), mockExercise, 2000, true);

    expect(symmetric.symmetry).toBeGreaterThan(asymmetric.symmetry);
  });

  it('penalizes fast eccentric phase', () => {
    const slow = scoreRep(85, makeAngles(85, 85), mockExercise, 2000, true);
    const fast = scoreRep(85, makeAngles(85, 85), mockExercise, 500, true);

    expect(slow.control).toBeGreaterThan(fast.control);
  });

  it('penalizes incomplete ROM', () => {
    const full = scoreRep(85, makeAngles(85, 85), mockExercise, 2000, true);
    const partial = scoreRep(85, makeAngles(85, 85), mockExercise, 2000, false);

    expect(full.rom).toBeGreaterThan(partial.rom);
  });
});
