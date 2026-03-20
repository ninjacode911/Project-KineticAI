import { describe, it, expect } from 'vitest';
import { createRepCounter, processAngle } from '@/lib/analysis/repCounter';
import type { ExerciseConfig } from '@/types/exercise';

// Minimal exercise config for testing
const mockExercise: ExerciseConfig = {
  id: 'test',
  name: 'Test',
  description: 'Test exercise',
  category: 'lower-body-strength',
  model: 'lite',
  primaryJoint: { vertex: 25, proximal: 23, distal: 27 },
  goldenRanges: {},
  coachingCues: {},
  standingAngle: { min: 160, max: 180 },
  bottomAngle: { min: 60, max: 100 },
  targetReps: 10,
  targetSets: 3,
  restSeconds: 60,
  minRepDuration: 1200,
};

describe('repCounter', () => {
  it('starts in standing phase', () => {
    const state = createRepCounter();
    expect(state.phase).toBe('standing');
    expect(state.repCount).toBe(0);
  });

  it('transitions through full rep cycle correctly', () => {
    const state = createRepCounter();
    let t = 1000;

    // Standing → Descending (angle drops below standing - 15 = 145)
    processAngle(state, 170, mockExercise, t);
    expect(state.phase).toBe('standing');

    processAngle(state, 140, mockExercise, t += 200);
    expect(state.phase).toBe('descending');

    // Descending → Bottom (angle reaches bottom range)
    processAngle(state, 95, mockExercise, t += 300);
    expect(state.phase).toBe('bottom');

    // Bottom → Ascending (angle increases above bottom.max + 10 = 110)
    processAngle(state, 115, mockExercise, t += 300);
    expect(state.phase).toBe('ascending');

    // Ascending → Standing (angle exceeds standing threshold) = REP
    const event = processAngle(state, 165, mockExercise, t += 500);
    expect(state.phase).toBe('standing');
    expect(state.repCount).toBe(1);
    expect(event).not.toBeNull();
    expect(event!.repNumber).toBe(1);
  });

  it('does not count bounced reps (too fast)', () => {
    const state = createRepCounter();
    const t = 1000;

    // Slam through all phases in < minRepDuration
    processAngle(state, 140, mockExercise, t);
    processAngle(state, 80, mockExercise, t + 200);
    processAngle(state, 115, mockExercise, t + 400);
    const event = processAngle(state, 170, mockExercise, t + 600); // total 600ms < 1200ms

    // First rep is always counted (lastTransitionTime starts at 0)
    // But on second attempt it should reject
    if (event) {
      // First rep counted, try second fast rep
      processAngle(state, 140, mockExercise, t + 700);
      processAngle(state, 80, mockExercise, t + 900);
      processAngle(state, 115, mockExercise, t + 1000);
      const event2 = processAngle(state, 170, mockExercise, t + 1100); // 500ms since last rep < 1200ms
      expect(event2).toBeNull();
    }
  });

  it('does not count partial reps (never reaching bottom)', () => {
    const state = createRepCounter();
    let t = 1000;

    // Descend but not enough — stay above bottom range
    processAngle(state, 140, mockExercise, t);
    expect(state.phase).toBe('descending');

    // Go back up without reaching bottom
    processAngle(state, 165, mockExercise, t += 500);
    expect(state.phase).toBe('standing');
    expect(state.repCount).toBe(0);
  });

  it('handles multiple reps', () => {
    const state = createRepCounter();
    let t = 0;

    for (let rep = 0; rep < 3; rep++) {
      processAngle(state, 140, mockExercise, t += 300);
      processAngle(state, 80, mockExercise, t += 500);
      processAngle(state, 115, mockExercise, t += 400);
      processAngle(state, 170, mockExercise, t += 500);
    }

    expect(state.repCount).toBe(3);
  });

  // --- Increasing direction exercises (overhead press, knee extension, etc.) ---

  const increasingExercise: ExerciseConfig = {
    id: 'overhead-press',
    name: 'Overhead Press',
    description: 'Test',
    category: 'upper-body-strength',
    model: 'lite',
    primaryJoint: { vertex: 13, proximal: 11, distal: 15 },
    goldenRanges: {},
    coachingCues: {},
    standingAngle: { min: 60, max: 100 },
    bottomAngle: { min: 155, max: 180 },
    angleDirection: 'increasing',
    targetReps: 10,
    targetSets: 3,
    restSeconds: 60,
    minRepDuration: 1200,
  };

  it('counts reps for increasing-direction exercises', () => {
    const state = createRepCounter();
    let t = 1000;

    // Start at standing (elbow bent ~80°)
    processAngle(state, 80, increasingExercise, t);
    expect(state.phase).toBe('standing');

    // STANDING → DESCENDING (angle goes above standingAngle.max + 15 = 115)
    processAngle(state, 120, increasingExercise, t += 200);
    expect(state.phase).toBe('descending');

    // DESCENDING → BOTTOM (angle reaches bottom range ≥ 155)
    processAngle(state, 160, increasingExercise, t += 400);
    expect(state.phase).toBe('bottom');

    // BOTTOM → ASCENDING (angle drops below bottom.min - 10 = 145)
    processAngle(state, 140, increasingExercise, t += 300);
    expect(state.phase).toBe('ascending');

    // ASCENDING → STANDING (angle returns ≤ standingAngle.max = 100) = REP
    const event = processAngle(state, 85, increasingExercise, t += 500);
    expect(state.phase).toBe('standing');
    expect(state.repCount).toBe(1);
    expect(event).not.toBeNull();
  });

  it('handles multiple reps for increasing-direction exercises', () => {
    const state = createRepCounter();
    let t = 0;

    for (let rep = 0; rep < 3; rep++) {
      processAngle(state, 120, increasingExercise, t += 300);
      processAngle(state, 165, increasingExercise, t += 500);
      processAngle(state, 140, increasingExercise, t += 400);
      processAngle(state, 85, increasingExercise, t += 500);
    }

    expect(state.repCount).toBe(3);
  });
});
