import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const gluteBridgeConfig: ExerciseConfig = {
  id: 'glute-bridge',
  name: 'Glute Bridge',
  description: 'Hip extension exercise for glute activation and lower back rehabilitation',
  category: 'physio-rehab',
  model: 'full',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_HIP,
    proximal: LandmarkIndex.LEFT_SHOULDER,
    distal: LandmarkIndex.LEFT_KNEE,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_KNEE,
      proximal: LandmarkIndex.LEFT_HIP,
      distal: LandmarkIndex.LEFT_ANKLE,
    },
  ],
  goldenRanges: {
    'Left Hip': { bottom: { min: 120, max: 150 }, top: { min: 160, max: 180 } },
    'Right Hip': { bottom: { min: 120, max: 150 }, top: { min: 160, max: 180 } },
    'Left Knee': { hold: { min: 80, max: 100 } },
  },
  coachingCues: {
    'incomplete-extension': 'Drive your hips higher — squeeze your glutes at the top',
    'knees-caving': 'Keep your knees in line with your toes',
    'lower-back-arch': 'Avoid overarching — stop when hips are level with shoulders',
    'good-form': 'Great hip extension — strong glute squeeze!',
  },
  standingAngle: { min: 90, max: 130 },
  bottomAngle: { min: 160, max: 180 },
  targetReps: 12,
  targetSets: 3,
  restSeconds: 45,
  angleDirection: 'increasing',
  minRepDuration: 1500,
};
