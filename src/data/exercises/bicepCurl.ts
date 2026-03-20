import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const bicepCurlConfig: ExerciseConfig = {
  id: 'bicep-curl',
  name: 'Bicep Curl',
  description: 'Isolation exercise targeting the biceps brachii with controlled tempo',
  category: 'upper-body-strength',
  model: 'lite',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_ELBOW,
    proximal: LandmarkIndex.LEFT_SHOULDER,
    distal: LandmarkIndex.LEFT_WRIST,
  },
  goldenRanges: {
    'Left Elbow': { bottom: { min: 30, max: 80 }, top: { min: 140, max: 180 } },
    'Right Elbow': { bottom: { min: 30, max: 80 }, top: { min: 140, max: 180 } },
  },
  coachingCues: {
    'body-swing': 'Control the movement — avoid swinging your body',
    'incomplete-range': 'Curl all the way up and fully extend down',
    'elbow-drift': 'Keep your elbows pinned to your sides',
    'good-form': 'Great controlled curl with full range of motion!',
  },
  standingAngle: { min: 140, max: 180 },
  bottomAngle: { min: 30, max: 80 },
  targetReps: 12,
  targetSets: 3,
  restSeconds: 60,
  minRepDuration: 800,
};
