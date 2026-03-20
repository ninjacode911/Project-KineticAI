declare module '@mediapipe/tasks-vision' {
  export interface BaseOptions {
    modelAssetPath?: string;
    modelAssetBuffer?: Uint8Array;
    delegate?: 'CPU' | 'GPU';
  }

  export interface PoseLandmarkerOptions {
    baseOptions: BaseOptions;
    runningMode: 'IMAGE' | 'VIDEO';
    numPoses?: number;
    minPoseDetectionConfidence?: number;
    minPosePresenceConfidence?: number;
    minTrackingConfidence?: number;
    outputSegmentationMasks?: boolean;
  }

  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export interface PoseLandmarkerResult {
    landmarks: NormalizedLandmark[][];
    worldLandmarks: NormalizedLandmark[][];
    segmentationMasks?: unknown[];
  }

  export class PoseLandmarker {
    static createFromOptions(
      vision: FilesetResolver,
      options: PoseLandmarkerOptions,
    ): Promise<PoseLandmarker>;
    detectForVideo(
      video: HTMLVideoElement,
      timestamp: number,
    ): PoseLandmarkerResult;
    close(): void;
  }

  export class FilesetResolver {
    static forVisionTasks(wasmPath: string): Promise<FilesetResolver>;
  }
}
