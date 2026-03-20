import { useCallback, useEffect, useRef, useState } from 'react';
import type { PoseLandmarker } from '@mediapipe/tasks-vision';
import { initPoseLandmarker, closePoseLandmarker } from '@/lib/pose/mediapipeLoader';
import { renderSkeleton, renderNoPose } from '@/lib/rendering/skeletonRenderer';
import { computeJointAngles, getAngleLabels } from '@/lib/analysis/jointAngleEngine';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Landmark, JointAngle } from '@/types/pose';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
}

interface UsePoseDetectionReturn {
  landmarksRef: React.RefObject<Landmark[]>;
  jointAnglesRef: React.RefObject<JointAngle[]>;
  isModelLoaded: boolean;
  modelLoadError: string | null;
}

/** Safely convert MediaPipe NormalizedLandmark (optional visibility) to our Landmark type */
function normalizeLandmark(lm: NormalizedLandmark): Landmark {
  return {
    x: lm.x,
    y: lm.y,
    z: lm.z,
    visibility: lm.visibility ?? 0,
  };
}

export function usePoseDetection({
  videoRef,
  canvasRef,
  enabled,
}: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const landmarksRef = useRef<Landmark[]>([]);
  const jointAnglesRef = useRef<JointAngle[]>([]);
  const detectorRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);

  // Use useState for values that consumers need to react to
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  // FPS tracking — initialize to 0, set actual time in first callback invocation
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(0);
  const fpsHistoryRef = useRef<number[]>([]);

  const modelVariant = useSettingsStore((s) => s.modelVariant);

  // Use refs for hot-path values to avoid recreating the detection loop
  const showAnglesRef = useRef(useSettingsStore.getState().showAngles);
  const setFPSRef = useRef(useSessionStore.getState().setFPS);

  // Keep refs in sync with store changes without causing loop recreation
  useEffect(() => {
    const unsubSettings = useSettingsStore.subscribe((state) => {
      showAnglesRef.current = state.showAngles;
    });
    const unsubSession = useSessionStore.subscribe((state) => {
      setFPSRef.current = state.setFPS;
    });
    return () => {
      unsubSettings();
      unsubSession();
    };
  }, []);

  const updateFPS = useCallback(() => {
    fpsFrameCountRef.current++;
    const now = performance.now();

    // Initialize on first call
    if (fpsLastTimeRef.current === 0) {
      fpsLastTimeRef.current = now;
      return;
    }

    const elapsed = now - fpsLastTimeRef.current;

    if (elapsed >= 1000) {
      const currentFPS = Math.round((fpsFrameCountRef.current * 1000) / elapsed);
      fpsHistoryRef.current.push(currentFPS);
      if (fpsHistoryRef.current.length > 10) fpsHistoryRef.current.shift();

      const avgFPS = Math.round(
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length,
      );

      setFPSRef.current({
        current: currentFPS,
        average: avgFPS,
        backend: 'GPU (WebGL)',
      });

      fpsFrameCountRef.current = 0;
      fpsLastTimeRef.current = now;
    }
  }, []);

  // Use a ref to hold the detect function so the rAF loop always calls the latest version
  const detectRef = useRef<() => void>(() => {});

  detectRef.current = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || !detector || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(() => detectRef.current());
      return;
    }

    // Sync canvas size with video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(() => detectRef.current());
      return;
    }

    // MediaPipe requires monotonically increasing timestamps
    const timestamp = performance.now();
    if (timestamp <= lastTimestampRef.current) {
      animFrameRef.current = requestAnimationFrame(() => detectRef.current());
      return;
    }
    lastTimestampRef.current = timestamp;

    try {
      const results = detector.detectForVideo(video, timestamp);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0].map(normalizeLandmark);
        landmarksRef.current = landmarks;

        // Compute joint angles every frame
        const angles = computeJointAngles(landmarks);
        jointAnglesRef.current = angles;

        // Build angle labels for overlay if enabled
        const angleLabels = showAnglesRef.current
          ? getAngleLabels(landmarks, angles)
          : undefined;

        renderSkeleton(ctx, landmarks, canvas.width, canvas.height, {
          showAngles: showAnglesRef.current,
          angleLabels,
        });
      } else {
        landmarksRef.current = [];
        jointAnglesRef.current = [];
        renderNoPose(ctx, canvas.width, canvas.height);
      }
    } catch {
      // Skip frame on detection error — continue loop
    }

    updateFPS();
    animFrameRef.current = requestAnimationFrame(() => detectRef.current());
  };

  // Initialize model and start detection loop
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        setModelLoadError(null);
        const detector = await initPoseLandmarker(modelVariant);
        if (cancelled) return;

        detectorRef.current = detector;
        setIsModelLoaded(true);
        animFrameRef.current = requestAnimationFrame(() => detectRef.current());
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load pose model';
        setModelLoadError(message);
        console.error('Pose model load error:', message);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [enabled, modelVariant]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      closePoseLandmarker();
    };
  }, []);

  return {
    landmarksRef,
    jointAnglesRef,
    isModelLoaded,
    modelLoadError,
  };
}
