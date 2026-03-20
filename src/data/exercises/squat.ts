import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const squatConfig: ExerciseConfig = {
  id: 'squat',
  name: 'Back Squat',
  description: 'Compound lower-body exercise targeting quads, glutes, and hamstrings',
  category: 'lower-body-strength',
  model: 'lite',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_KNEE,
    proximal: LandmarkIndex.LEFT_HIP,
    distal: LandmarkIndex.LEFT_ANKLE,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_HIP,
      proximal: LandmarkIndex.LEFT_SHOULDER,
      distal: LandmarkIndex.LEFT_KNEE,
    },
  ],
  goldenRanges: {
    'Left Knee': { bottom: { min: 70, max: 100 }, top: { min: 160, max: 180 } },
    'Right Knee': { bottom: { min: 70, max: 100 }, top: { min: 160, max: 180 } },
    'Left Hip': { bottom: { min: 70, max: 110 }, top: { min: 160, max: 180 } },
    'Right Hip': { bottom: { min: 70, max: 110 }, top: { min: 160, max: 180 } },
    spine: { max: 15 },
  },
  coachingCues: {
    'knee-cave': 'Push knees out over toes',
    'shallow-depth': 'Go deeper — aim for parallel',
    'forward-lean': 'Keep your chest up and core braced',
    'good-form': 'Great squat depth and alignment!',
  },
  standingAngle: { min: 160, max: 180 },
  bottomAngle: { min: 60, max: 100 },
  targetReps: 10,
  targetSets: 3,
  restSeconds: 90,
  minRepDuration: 1500,
};
