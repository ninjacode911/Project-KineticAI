import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const shoulderExternalRotationConfig: ExerciseConfig = {
  id: 'shoulder-external-rotation',
  name: 'Shoulder External Rotation',
  description: 'Rotator cuff rehabilitation exercise for shoulder stability and injury prevention',
  category: 'physio-rehab',
  model: 'full',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_SHOULDER,
    proximal: LandmarkIndex.LEFT_ELBOW,
    distal: LandmarkIndex.LEFT_HIP,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_ELBOW,
      proximal: LandmarkIndex.LEFT_SHOULDER,
      distal: LandmarkIndex.LEFT_WRIST,
    },
  ],
  goldenRanges: {
    'Left Shoulder': { bottom: { min: 10, max: 30 }, top: { min: 60, max: 90 } },
    'Right Shoulder': { bottom: { min: 10, max: 30 }, top: { min: 60, max: 90 } },
    'Left Elbow': { hold: { min: 80, max: 100 } },
  },
  coachingCues: {
    'elbow-drift': 'Keep your elbow pinned to your side throughout',
    'too-fast': 'Slow down — control the rotation in both directions',
    'limited-range': 'Try to rotate outward a little further if comfortable',
    'good-form': 'Excellent controlled rotation — great rehab form!',
  },
  standingAngle: { min: 10, max: 25 },
  bottomAngle: { min: 50, max: 90 },
  targetReps: 15,
  targetSets: 3,
  restSeconds: 45,
  angleDirection: 'increasing',
  minRepDuration: 2000,
};
