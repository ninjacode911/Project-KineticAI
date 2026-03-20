import type { LandmarkIndex } from './pose';

export type ExerciseCategory =
  | 'lower-body-strength'
  | 'upper-body-strength'
  | 'physio-rehab'
  | 'core-stability'
  | 'yoga-mobility';

export type ModelPreference = 'lite' | 'full' | 'heavy';

export interface AngleRange {
  min: number;
  max: number;
}

export interface GoldenRanges {
  [jointName: string]: {
    bottom?: AngleRange;
    top?: AngleRange;
    hold?: AngleRange;
    max?: number;
  };
}

export interface JointConfig {
  vertex: LandmarkIndex;
  proximal: LandmarkIndex;
  distal: LandmarkIndex;
}

export interface CoachingCues {
  [issueKey: string]: string;
}

export interface ExerciseConfig {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  model: ModelPreference;
  primaryJoint: JointConfig;
  secondaryJoints?: JointConfig[];
  goldenRanges: GoldenRanges;
  coachingCues: CoachingCues;
  /** Angle range at the start/rest position (where the rep begins and ends) */
  standingAngle: AngleRange;
  /** Angle range at the "work" position (deepest point of the movement) */
  bottomAngle: AngleRange;
  /**
   * Movement direction: 'decreasing' means the angle gets smaller during the work phase
   * (e.g., squat, curl). 'increasing' means the angle gets larger (e.g., overhead press, glute bridge).
   * Defaults to 'decreasing' if omitted for backward compatibility.
   */
  angleDirection?: 'decreasing' | 'increasing';
  targetReps: number;
  targetSets: number;
  restSeconds: number;
  minRepDuration: number;
}
