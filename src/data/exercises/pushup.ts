import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const pushupConfig: ExerciseConfig = {
  id: 'pushup',
  name: 'Push-Up',
  description: 'Upper-body pushing exercise targeting chest, shoulders, and triceps',
  category: 'upper-body-strength',
  model: 'lite',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_ELBOW,
    proximal: LandmarkIndex.LEFT_SHOULDER,
    distal: LandmarkIndex.LEFT_WRIST,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_HIP,
      proximal: LandmarkIndex.LEFT_SHOULDER,
      distal: LandmarkIndex.LEFT_KNEE,
    },
  ],
  goldenRanges: {
    'Left Elbow': { bottom: { min: 70, max: 100 }, top: { min: 155, max: 180 } },
    'Right Elbow': { bottom: { min: 70, max: 100 }, top: { min: 155, max: 180 } },
    'Left Hip': { hold: { min: 160, max: 180 } },
  },
  coachingCues: {
    'shallow-depth': 'Lower your chest closer to the ground',
    'hip-sag': 'Keep your hips in line — engage your core',
    'hip-pike': 'Lower your hips — maintain a straight plank',
    'good-form': 'Perfect push-up — great depth and alignment!',
  },
  standingAngle: { min: 155, max: 180 },
  bottomAngle: { min: 60, max: 100 },
  targetReps: 12,
  targetSets: 3,
  restSeconds: 60,
  minRepDuration: 1200,
};
