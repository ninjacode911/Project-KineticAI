import { LandmarkIndex, type JointPair } from '@/types/pose';

/** Minimum keypoint confidence threshold — below this, keypoint is excluded */
export const MIN_CONFIDENCE = 0.3;

/** MediaPipe WASM files CDN path — pinned to match installed npm version */
export const MEDIAPIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.33/wasm';

/** MediaPipe model paths — GCS only supports /latest/, not versioned paths */
export const POSE_MODEL_PATHS = {
  lite: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
  full: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
  heavy: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task',
} as const;

/** Skeleton connection pairs for rendering lines between joints */
export const SKELETON_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  // Torso
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.RIGHT_SHOULDER],
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_HIP],
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_HIP],
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.RIGHT_HIP],
  // Left arm
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_ELBOW],
  [LandmarkIndex.LEFT_ELBOW, LandmarkIndex.LEFT_WRIST],
  // Right arm
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_ELBOW],
  [LandmarkIndex.RIGHT_ELBOW, LandmarkIndex.RIGHT_WRIST],
  // Left leg
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.LEFT_KNEE],
  [LandmarkIndex.LEFT_KNEE, LandmarkIndex.LEFT_ANKLE],
  [LandmarkIndex.LEFT_ANKLE, LandmarkIndex.LEFT_HEEL],
  [LandmarkIndex.LEFT_ANKLE, LandmarkIndex.LEFT_FOOT_INDEX],
  [LandmarkIndex.LEFT_HEEL, LandmarkIndex.LEFT_FOOT_INDEX],
  // Right leg
  [LandmarkIndex.RIGHT_HIP, LandmarkIndex.RIGHT_KNEE],
  [LandmarkIndex.RIGHT_KNEE, LandmarkIndex.RIGHT_ANKLE],
  [LandmarkIndex.RIGHT_ANKLE, LandmarkIndex.RIGHT_HEEL],
  [LandmarkIndex.RIGHT_ANKLE, LandmarkIndex.RIGHT_FOOT_INDEX],
  [LandmarkIndex.RIGHT_HEEL, LandmarkIndex.RIGHT_FOOT_INDEX],
];

/** All tracked joint angle pairs for analysis */
export const JOINT_PAIRS: JointPair[] = [
  // Left side
  { name: 'Left Knee', proximal: LandmarkIndex.LEFT_HIP, vertex: LandmarkIndex.LEFT_KNEE, distal: LandmarkIndex.LEFT_ANKLE, side: 'left' },
  { name: 'Left Hip', proximal: LandmarkIndex.LEFT_SHOULDER, vertex: LandmarkIndex.LEFT_HIP, distal: LandmarkIndex.LEFT_KNEE, side: 'left' },
  { name: 'Left Elbow', proximal: LandmarkIndex.LEFT_SHOULDER, vertex: LandmarkIndex.LEFT_ELBOW, distal: LandmarkIndex.LEFT_WRIST, side: 'left' },
  { name: 'Left Shoulder', proximal: LandmarkIndex.LEFT_ELBOW, vertex: LandmarkIndex.LEFT_SHOULDER, distal: LandmarkIndex.LEFT_HIP, side: 'left' },
  { name: 'Left Ankle', proximal: LandmarkIndex.LEFT_KNEE, vertex: LandmarkIndex.LEFT_ANKLE, distal: LandmarkIndex.LEFT_FOOT_INDEX, side: 'left' },
  // Right side
  { name: 'Right Knee', proximal: LandmarkIndex.RIGHT_HIP, vertex: LandmarkIndex.RIGHT_KNEE, distal: LandmarkIndex.RIGHT_ANKLE, side: 'right' },
  { name: 'Right Hip', proximal: LandmarkIndex.RIGHT_SHOULDER, vertex: LandmarkIndex.RIGHT_HIP, distal: LandmarkIndex.RIGHT_KNEE, side: 'right' },
  { name: 'Right Elbow', proximal: LandmarkIndex.RIGHT_SHOULDER, vertex: LandmarkIndex.RIGHT_ELBOW, distal: LandmarkIndex.RIGHT_WRIST, side: 'right' },
  { name: 'Right Shoulder', proximal: LandmarkIndex.RIGHT_ELBOW, vertex: LandmarkIndex.RIGHT_SHOULDER, distal: LandmarkIndex.RIGHT_HIP, side: 'right' },
  { name: 'Right Ankle', proximal: LandmarkIndex.RIGHT_KNEE, vertex: LandmarkIndex.RIGHT_ANKLE, distal: LandmarkIndex.RIGHT_FOOT_INDEX, side: 'right' },
  // Center
  { name: 'Spine', proximal: LandmarkIndex.NOSE, vertex: LandmarkIndex.LEFT_SHOULDER, distal: LandmarkIndex.LEFT_HIP, side: 'center' },
  { name: 'Neck', proximal: LandmarkIndex.LEFT_EAR, vertex: LandmarkIndex.LEFT_SHOULDER, distal: LandmarkIndex.LEFT_HIP, side: 'center' },
];
