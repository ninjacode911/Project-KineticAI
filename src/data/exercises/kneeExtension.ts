import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const kneeExtensionConfig: ExerciseConfig = {
  id: 'knee-extension',
  name: 'Seated Knee Extension',
  description: 'Quadriceps isolation exercise for knee rehabilitation and strength',
  category: 'physio-rehab',
  model: 'full',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_KNEE,
    proximal: LandmarkIndex.LEFT_HIP,
    distal: LandmarkIndex.LEFT_ANKLE,
  },
  goldenRanges: {
    'Left Knee': { bottom: { min: 80, max: 100 }, top: { min: 155, max: 180 } },
    'Right Knee': { bottom: { min: 80, max: 100 }, top: { min: 155, max: 180 } },
  },
  coachingCues: {
    'incomplete-extension': 'Straighten your leg fully at the top',
    'too-fast': 'Slow and controlled — 2 seconds up, 2 seconds down',
    'hip-lifting': 'Keep your hips planted on the seat',
    'good-form': 'Full extension with great control!',
  },
  standingAngle: { min: 80, max: 100 },
  bottomAngle: { min: 155, max: 180 },
  targetReps: 15,
  targetSets: 3,
  restSeconds: 45,
  angleDirection: 'increasing',
  minRepDuration: 1500,
};
