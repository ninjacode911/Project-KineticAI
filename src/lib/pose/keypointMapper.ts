import { LandmarkIndex, type Landmark } from '@/types/pose';

/** Human-readable names for all 33 MediaPipe landmarks */
const LANDMARK_NAMES: Record<LandmarkIndex, string> = {
  [LandmarkIndex.NOSE]: 'Nose',
  [LandmarkIndex.LEFT_EYE_INNER]: 'Left Eye Inner',
  [LandmarkIndex.LEFT_EYE]: 'Left Eye',
  [LandmarkIndex.LEFT_EYE_OUTER]: 'Left Eye Outer',
  [LandmarkIndex.RIGHT_EYE_INNER]: 'Right Eye Inner',
  [LandmarkIndex.RIGHT_EYE]: 'Right Eye',
  [LandmarkIndex.RIGHT_EYE_OUTER]: 'Right Eye Outer',
  [LandmarkIndex.LEFT_EAR]: 'Left Ear',
  [LandmarkIndex.RIGHT_EAR]: 'Right Ear',
  [LandmarkIndex.MOUTH_LEFT]: 'Mouth Left',
  [LandmarkIndex.MOUTH_RIGHT]: 'Mouth Right',
  [LandmarkIndex.LEFT_SHOULDER]: 'Left Shoulder',
  [LandmarkIndex.RIGHT_SHOULDER]: 'Right Shoulder',
  [LandmarkIndex.LEFT_ELBOW]: 'Left Elbow',
  [LandmarkIndex.RIGHT_ELBOW]: 'Right Elbow',
  [LandmarkIndex.LEFT_WRIST]: 'Left Wrist',
  [LandmarkIndex.RIGHT_WRIST]: 'Right Wrist',
  [LandmarkIndex.LEFT_PINKY]: 'Left Pinky',
  [LandmarkIndex.RIGHT_PINKY]: 'Right Pinky',
  [LandmarkIndex.LEFT_INDEX]: 'Left Index',
  [LandmarkIndex.RIGHT_INDEX]: 'Right Index',
  [LandmarkIndex.LEFT_THUMB]: 'Left Thumb',
  [LandmarkIndex.RIGHT_THUMB]: 'Right Thumb',
  [LandmarkIndex.LEFT_HIP]: 'Left Hip',
  [LandmarkIndex.RIGHT_HIP]: 'Right Hip',
  [LandmarkIndex.LEFT_KNEE]: 'Left Knee',
  [LandmarkIndex.RIGHT_KNEE]: 'Right Knee',
  [LandmarkIndex.LEFT_ANKLE]: 'Left Ankle',
  [LandmarkIndex.RIGHT_ANKLE]: 'Right Ankle',
  [LandmarkIndex.LEFT_HEEL]: 'Left Heel',
  [LandmarkIndex.RIGHT_HEEL]: 'Right Heel',
  [LandmarkIndex.LEFT_FOOT_INDEX]: 'Left Foot',
  [LandmarkIndex.RIGHT_FOOT_INDEX]: 'Right Foot',
};

export function getLandmarkName(index: LandmarkIndex): string {
  return LANDMARK_NAMES[index] ?? `Landmark ${index}`;
}

/** Body landmarks only (indices 11-32) — excludes face */
export const BODY_LANDMARK_INDICES: LandmarkIndex[] = [
  LandmarkIndex.LEFT_SHOULDER,
  LandmarkIndex.RIGHT_SHOULDER,
  LandmarkIndex.LEFT_ELBOW,
  LandmarkIndex.RIGHT_ELBOW,
  LandmarkIndex.LEFT_WRIST,
  LandmarkIndex.RIGHT_WRIST,
  LandmarkIndex.LEFT_HIP,
  LandmarkIndex.RIGHT_HIP,
  LandmarkIndex.LEFT_KNEE,
  LandmarkIndex.RIGHT_KNEE,
  LandmarkIndex.LEFT_ANKLE,
  LandmarkIndex.RIGHT_ANKLE,
  LandmarkIndex.LEFT_HEEL,
  LandmarkIndex.RIGHT_HEEL,
  LandmarkIndex.LEFT_FOOT_INDEX,
  LandmarkIndex.RIGHT_FOOT_INDEX,
];

/** Get a named landmark from the landmarks array */
export function getLandmark(
  landmarks: Landmark[],
  index: LandmarkIndex,
): Landmark | null {
  const lm = landmarks[index];
  if (!lm) return null;
  return lm;
}
