import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const romanianDeadliftConfig: ExerciseConfig = {
  id: 'romanian-deadlift',
  name: 'Romanian Deadlift',
  description: 'Hip-hinge movement targeting hamstrings, glutes, and posterior chain',
  category: 'lower-body-strength',
  model: 'lite',
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
    'Left Hip': { bottom: { min: 70, max: 110 }, top: { min: 160, max: 180 } },
    'Right Hip': { bottom: { min: 70, max: 110 }, top: { min: 160, max: 180 } },
    'Left Knee': { hold: { min: 155, max: 175 } },
    'Right Knee': { hold: { min: 155, max: 175 } },
    spine: { max: 10 },
  },
  coachingCues: {
    'too-upright': 'Push your hips back further — hinge at the hips',
    'knees-bent': 'Maintain a soft knee — avoid excessive bending',
    'back-rounded': 'Brace your core and keep a flat back',
    'good-form': 'Great hip hinge — neutral spine maintained!',
  },
  standingAngle: { min: 160, max: 180 },
  bottomAngle: { min: 70, max: 110 },
  targetReps: 10,
  targetSets: 3,
  restSeconds: 90,
  minRepDuration: 2000,
};
