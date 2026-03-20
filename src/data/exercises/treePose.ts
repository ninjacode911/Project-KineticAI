import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const treePoseConfig: ExerciseConfig = {
  id: 'tree-pose',
  name: 'Tree Pose',
  description: 'Single-leg balance pose for stability, focus, and hip opening',
  category: 'yoga-mobility',
  model: 'full',
  // Track the RIGHT hip — the lifted leg. The angle decreases from ~170° (standing)
  // to ~90-120° when the foot is placed on the inner thigh.
  primaryJoint: {
    vertex: LandmarkIndex.RIGHT_HIP,
    proximal: LandmarkIndex.RIGHT_SHOULDER,
    distal: LandmarkIndex.RIGHT_KNEE,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_KNEE,
      proximal: LandmarkIndex.LEFT_HIP,
      distal: LandmarkIndex.LEFT_ANKLE,
    },
  ],
  goldenRanges: {
    'Right Hip': { hold: { min: 90, max: 130 } },
    'Left Knee': { hold: { min: 165, max: 180 } },
    spine: { max: 12 },
  },
  coachingCues: {
    'knee-bent': 'Straighten your standing leg — a micro-bend is fine',
    'hip-drop': 'Level your hips — avoid leaning to one side',
    'forward-lean': 'Stand tall — lengthen your spine upward',
    'good-form': 'Excellent balance — steady and aligned!',
  },
  standingAngle: { min: 155, max: 180 },
  bottomAngle: { min: 80, max: 130 },
  targetReps: 3,
  targetSets: 2,
  restSeconds: 30,
  minRepDuration: 5000,
};
