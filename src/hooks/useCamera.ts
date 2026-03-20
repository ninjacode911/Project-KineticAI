import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  devices: MediaDeviceInfo[];
  switchCamera: (deviceId: string) => Promise<void>;
}

export function useCamera(preferredDeviceId?: string | null): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Enumerate available cameras
  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch {
      // Silently fail — device enumeration is optional
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setStatus('requesting');
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('active');
      await enumerateDevices();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown camera error';
      if (message.includes('Permission') || message.includes('NotAllowed')) {
        setStatus('denied');
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setStatus('error');
        setError(`Camera error: ${message}`);
      }
    }
  }, [enumerateDevices]);

  const switchCamera = useCallback(async (deviceId: string) => {
    stopCamera();
    await startCamera(deviceId);
  }, [stopCamera, startCamera]);

  // Start with preferred device
  const startCameraWithPreferred = useCallback(async () => {
    await startCamera(preferredDeviceId ?? undefined);
  }, [startCamera, preferredDeviceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    startCamera: startCameraWithPreferred,
    stopCamera,
    devices,
    switchCamera,
  };
}
