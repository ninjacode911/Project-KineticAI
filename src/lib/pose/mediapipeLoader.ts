import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_WASM_CDN, POSE_MODEL_PATHS } from '@/data/constants';
import type { ModelPreference } from '@/types/exercise';

let poseLandmarker: PoseLandmarker | null = null;
let currentModel: ModelPreference | null = null;

export async function initPoseLandmarker(
  modelVariant: ModelPreference = 'lite',
): Promise<PoseLandmarker> {
  // Return cached instance if same model already loaded
  if (poseLandmarker && currentModel === modelVariant) {
    return poseLandmarker;
  }

  // Close previous instance if switching models
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: POSE_MODEL_PATHS[modelVariant],
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });

  currentModel = modelVariant;
  return poseLandmarker;
}

export function getPoseLandmarker(): PoseLandmarker | null {
  return poseLandmarker;
}

export function closePoseLandmarker(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
    currentModel = null;
  }
}
