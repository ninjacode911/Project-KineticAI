import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const overheadPressConfig: ExerciseConfig = {
  id: 'overhead-press',
  name: 'Overhead Press',
  description: 'Vertical pressing movement targeting shoulders, triceps, and upper back',
  category: 'upper-body-strength',
  model: 'lite',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_ELBOW,
    proximal: LandmarkIndex.LEFT_SHOULDER,
    distal: LandmarkIndex.LEFT_WRIST,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_SHOULDER,
      proximal: LandmarkIndex.LEFT_ELBOW,
      distal: LandmarkIndex.LEFT_HIP,
    },
  ],
  goldenRanges: {
    'Left Elbow': { bottom: { min: 60, max: 100 }, top: { min: 155, max: 180 } },
    'Right Elbow': { bottom: { min: 60, max: 100 }, top: { min: 155, max: 180 } },
    'Left Shoulder': { bottom: { min: 30, max: 60 }, top: { min: 160, max: 180 } },
    'Right Shoulder': { bottom: { min: 30, max: 60 }, top: { min: 160, max: 180 } },
  },
  coachingCues: {
    'incomplete-press': 'Press fully overhead — extend your arms completely',
    'excessive-lean': 'Stay upright — avoid leaning back',
    'elbow-flare': 'Keep elbows slightly in front of the bar path',
    'good-form': 'Full lockout with great alignment!',
  },
  standingAngle: { min: 60, max: 100 },
  bottomAngle: { min: 155, max: 180 },
  targetReps: 10,
  targetSets: 3,
  restSeconds: 90,
  angleDirection: 'increasing',
  minRepDuration: 1500,
};
