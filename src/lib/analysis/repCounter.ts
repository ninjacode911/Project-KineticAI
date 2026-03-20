import type { RepPhase } from '@/types/session';
import type { ExerciseConfig } from '@/types/exercise';

export interface RepCounterState {
  phase: RepPhase;
  repCount: number;
  lastTransitionTime: number;
  peakAngle: number;
  phaseStartTime: number;
}

/**
 * Finite state machine for counting exercise repetitions.
 * Supports both angle-decreasing exercises (squat, curl) and
 * angle-increasing exercises (overhead press, knee extension).
 *
 * For decreasing (default):
 *   STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING = 1 rep
 *
 * For increasing:
 *   STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING = 1 rep
 *   (but "descending" = angle increasing toward target, "ascending" = returning)
 */
export function createRepCounter(): RepCounterState {
  return {
    phase: 'standing',
    repCount: 0,
    lastTransitionTime: 0,
    peakAngle: 0,
    phaseStartTime: Date.now(),
  };
}

export interface RepEvent {
  repNumber: number;
  duration: number;
  bottomAngle: number;
  timestamp: number;
}

/**
 * Process a new primary joint angle and return a rep event if a rep was completed.
 * Mutates the state in place for performance (called at 10Hz).
 */
export function processAngle(
  state: RepCounterState,
  primaryAngle: number,
  exercise: ExerciseConfig,
  now: number = Date.now(),
): RepEvent | null {
  const { standingAngle, bottomAngle, minRepDuration } = exercise;
  const increasing = exercise.angleDirection === 'increasing';
  const prevPhase = state.phase;

  // Helpers that abstract direction
  const hasLeftStanding = increasing
    ? primaryAngle > standingAngle.max + 15
    : primaryAngle < standingAngle.min - 15;

  const hasReachedBottom = increasing
    ? primaryAngle >= bottomAngle.min
    : primaryAngle <= bottomAngle.max;

  const hasReturnedToStanding = increasing
    ? primaryAngle <= standingAngle.max
    : primaryAngle >= standingAngle.min;

  const hasLeftBottom = increasing
    ? primaryAngle < bottomAngle.min - 10
    : primaryAngle > bottomAngle.max + 10;

  const isBetterPeak = increasing
    ? primaryAngle > state.peakAngle
    : primaryAngle < state.peakAngle;

  switch (state.phase) {
    case 'standing':
      if (hasLeftStanding) {
        state.phase = 'descending';
        state.phaseStartTime = now;
        state.peakAngle = primaryAngle;
      }
      break;

    case 'descending':
      if (isBetterPeak) {
        state.peakAngle = primaryAngle;
      }
      if (hasReachedBottom) {
        state.phase = 'bottom';
        state.phaseStartTime = now;
      }
      // Went back without reaching bottom — reset
      if (hasReturnedToStanding) {
        state.phase = 'standing';
        state.phaseStartTime = now;
        state.peakAngle = increasing ? 0 : 180;
      }
      break;

    case 'bottom':
      if (isBetterPeak) {
        state.peakAngle = primaryAngle;
      }
      if (hasLeftBottom) {
        state.phase = 'ascending';
        state.phaseStartTime = now;
      }
      break;

    case 'ascending':
      if (hasReturnedToStanding) {
        const repDuration = now - state.lastTransitionTime;

        if (state.lastTransitionTime === 0 || repDuration >= minRepDuration) {
          state.repCount++;
          const event: RepEvent = {
            repNumber: state.repCount,
            duration: repDuration,
            bottomAngle: state.peakAngle,
            timestamp: now,
          };

          state.phase = 'standing';
          state.lastTransitionTime = now;
          state.phaseStartTime = now;
          state.peakAngle = increasing ? 0 : 180;

          return event;
        }

        // Too fast — reset without counting
        state.phase = 'standing';
        state.phaseStartTime = now;
        state.peakAngle = increasing ? 0 : 180;
      }
      break;
  }

  if (state.phase !== prevPhase) {
    state.phaseStartTime = now;
  }

  return null;
}

/** Get the current phase as a user-friendly label. */
export function getPhaseLabel(phase: RepPhase): string {
  switch (phase) {
    case 'standing': return 'READY';
    case 'descending': return 'DOWN';
    case 'bottom': return 'HOLD';
    case 'ascending': return 'UP';
  }
}
