import { LandmarkIndex } from '@/types/pose';
import type { ExerciseConfig } from '@/types/exercise';

export const warriorIIConfig: ExerciseConfig = {
  id: 'warrior-ii',
  name: 'Warrior II Pose',
  description: 'Standing yoga pose for hip opening, leg strength, and balance',
  category: 'yoga-mobility',
  model: 'full',
  primaryJoint: {
    vertex: LandmarkIndex.LEFT_KNEE,
    proximal: LandmarkIndex.LEFT_HIP,
    distal: LandmarkIndex.LEFT_ANKLE,
  },
  secondaryJoints: [
    {
      vertex: LandmarkIndex.LEFT_SHOULDER,
      proximal: LandmarkIndex.LEFT_ELBOW,
      distal: LandmarkIndex.LEFT_HIP,
    },
  ],
  goldenRanges: {
    'Left Knee': { hold: { min: 85, max: 100 } },
    'Right Knee': { hold: { min: 160, max: 180 } },
    'Left Shoulder': { hold: { min: 160, max: 180 } },
    spine: { max: 15 },
  },
  coachingCues: {
    'knee-not-stacked': 'Bend your front knee to 90 degrees — knee over ankle',
    'arms-dropping': 'Raise your arms to shoulder height — keep them active',
    'torso-lean': 'Stack your torso over your hips — stay centred',
    'good-form': 'Beautiful Warrior II — strong stance and open chest!',
  },
  standingAngle: { min: 160, max: 180 },
  bottomAngle: { min: 85, max: 100 },
  targetReps: 5,
  targetSets: 2,
  restSeconds: 30,
  minRepDuration: 5000,
};
