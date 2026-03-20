import type { JointAngle } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';
import type { CoachingCue } from '@/types/coaching';
import type { RepPhase } from '@/types/session';

/**
 * Generate real-time coaching micro-cues based on current joint angles.
 * These are rule-based (no API call, < 5ms) and shown as text overlays.
 */
export function generateCue(
  angles: JointAngle[],
  exercise: ExerciseConfig,
  phase: RepPhase,
  symmetryScore: number,
): CoachingCue | null {
  const now = Date.now();
  const increasing = exercise.angleDirection === 'increasing';

  // Check symmetry
  if (symmetryScore < 70) {
    return {
      message: 'Uneven — balance both sides equally',
      severity: 'warning',
      jointName: 'symmetry',
      timestamp: now,
    };
  }

  // Check primary joint depth during descending/bottom
  if (phase === 'descending' || phase === 'bottom') {
    const primaryName = getPrimaryJointName(exercise);
    const primaryAngle = angles.find((a) =>
      a.name.toLowerCase().includes(primaryName.toLowerCase()),
    );

    if (primaryAngle) {
      // Direction-aware depth check
      const isTooShallow = increasing
        ? primaryAngle.angle < exercise.bottomAngle.min - 20
        : primaryAngle.angle > exercise.bottomAngle.max + 20;

      if (isTooShallow) {
        const cueKey = findMatchingCue(exercise,
          'tooShallow', 'shallow-depth',
          'incompleteRange', 'incomplete-range',
          'tooUpright', 'too-upright',
          'incomplete-press', 'incomplete-extension',
          'limited-range',
        );
        return {
          message: cueKey ? exercise.coachingCues[cueKey] : 'Go deeper for full range of motion',
          severity: 'info',
          jointName: primaryAngle.name,
          timestamp: now,
        };
      }
    }
  }

  // Check spine alignment (if tracked)
  const spineAngle = angles.find((a) => a.name.toLowerCase().includes('spine'));
  if (spineAngle && exercise.goldenRanges['spine']?.max !== undefined) {
    if (spineAngle.angle > exercise.goldenRanges['spine'].max + 10) {
      const cueKey = findMatchingCue(exercise,
        'forwardLean', 'forward-lean',
        'backRounded', 'back-rounded',
        'leaningForward', 'leaning-forward',
        'torso-lean',
      );
      return {
        message: cueKey ? exercise.coachingCues[cueKey] : 'Maintain a neutral spine',
        severity: 'warning',
        jointName: 'Spine',
        timestamp: now,
      };
    }
  }

  // Good form cue when in bottom position with good angles
  if (phase === 'bottom') {
    const cueKey = findMatchingCue(exercise, 'goodForm', 'good-form');
    if (cueKey) {
      return {
        message: exercise.coachingCues[cueKey],
        severity: 'info',
        jointName: 'form',
        timestamp: now,
      };
    }
  }

  return null;
}

/** Map exercise primary joint config to a joint name for angle lookup */
function getPrimaryJointName(exercise: ExerciseConfig): string {
  const vertexNames: Record<number, string> = {
    25: 'Knee', 26: 'Knee',
    23: 'Hip', 24: 'Hip',
    13: 'Elbow', 14: 'Elbow',
    11: 'Shoulder', 12: 'Shoulder',
    27: 'Ankle', 28: 'Ankle',
  };
  return vertexNames[exercise.primaryJoint.vertex] ?? 'Joint';
}

/** Find the first matching cue key from the exercise config */
function findMatchingCue(exercise: ExerciseConfig, ...keys: string[]): string | undefined {
  return keys.find((k) => k in exercise.coachingCues);
}
