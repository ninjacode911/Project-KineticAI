import { useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseById } from '@/data/exercises';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useExerciseSession } from '@/hooks/useExerciseSession';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSessionStore } from '@/stores/sessionStore';
import { FPSCounter } from '@/components/common/FPSCounter';
import { FormScoreBar } from '@/components/common/FormScoreBar';
import { RepDots } from '@/components/common/RepDots';
import { MetricsPanel } from '@/components/session/MetricsPanel';
import { SessionControls } from '@/components/session/SessionControls';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Activity, ArrowLeft, Camera, CameraOff, Eye, EyeOff } from 'lucide-react';
import { playRepBeep } from '@/lib/utils/audio';
import { useVoiceCoaching } from '@/hooks/useVoiceCoaching';

export function SessionPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined;

  const cameraDeviceId = useSettingsStore((s) => s.cameraDeviceId);
  const showAngles = useSettingsStore((s) => s.showAngles);
  const setShowAngles = useSettingsStore((s) => s.setShowAngles);

  const { videoRef, status: cameraStatus, error: cameraError, startCamera, stopCamera } = useCamera(cameraDeviceId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { landmarksRef, jointAnglesRef } = usePoseDetection({
    videoRef,
    canvasRef,
    enabled: cameraStatus === 'active',
  });

  const { handleStart, handleEnd, handleReset } = useExerciseSession({
    exercise: exercise ?? null,
    landmarksRef,
    jointAnglesRef,
  });

  // Voice coaching — speaks cues aloud when enabled
  useVoiceCoaching();

  // Audio beep on new rep — use ref to track previous count without triggering re-render
  const repCount = useSessionStore((s) => s.repCount);
  const prevRepCountRef = useRef(0);

  useEffect(() => {
    if (repCount > prevRepCountRef.current && prevRepCountRef.current > 0) {
      playRepBeep();
    }
    prevRepCountRef.current = repCount;
  }, [repCount]);

  // Auto-start camera
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Elapsed timer
  const sessionStatus = useSessionStore((s) => s.status);
  const startTime = useSessionStore((s) => s.startTime);
  const setElapsed = useSessionStore((s) => s.setElapsed);

  useEffect(() => {
    if (sessionStatus !== 'active' || !startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStatus, startTime, setElapsed]);

  const handleReview = useCallback(() => {
    if (exerciseId) navigate(`/review/${exerciseId}`);
  }, [navigate, exerciseId]);

  const handleToggleCamera = useCallback(async () => {
    if (cameraStatus === 'active') {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [cameraStatus, stopCamera, startCamera]);

  if (!exercise) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Exercise not found.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold">
              Kinetic<span className="text-primary">AI</span>
            </span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium">{exercise.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowAngles(!showAngles)}
            title={showAngles ? 'Hide angles' : 'Show angles'}
          >
            {showAngles ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleCamera}
            title={cameraStatus === 'active' ? 'Stop camera' : 'Start camera'}
          >
            {cameraStatus === 'active' ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main — split layout */}
      <main className="flex min-h-0 flex-1">
        {/* Camera — 70% */}
        <div className="relative flex w-[70%] items-center justify-center bg-black">
          <video
            ref={videoRef}
            className="h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
          />

          {/* FPS overlay */}
          <div className="absolute top-0 left-0 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <FPSCounter />
          </div>

          {/* Camera status overlays */}
          {cameraStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-white">Camera is not active</p>
              <Button onClick={startCamera}>Start Camera</Button>
            </div>
          )}

          {cameraStatus === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-white">Requesting camera access...</p>
            </div>
          )}

          {(cameraStatus === 'denied' || cameraStatus === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6">
              <CameraOff className="mb-4 h-12 w-12 text-destructive" />
              <p className="mb-2 text-center text-white">
                {cameraStatus === 'denied' ? 'Camera access denied' : 'Camera error'}
              </p>
              <p className="mb-4 text-center text-sm text-muted-foreground">{cameraError}</p>
              <Button onClick={startCamera}>Try Again</Button>
            </div>
          )}
        </div>

        <Separator orientation="vertical" />

        {/* Side panel — 30% */}
        <div className="flex w-[30%] flex-col overflow-y-auto">
          <MetricsPanel />
          <FormScoreBar />
          <RepDots />
          <div className="mt-auto border-t">
            <SessionControls
              onStart={handleStart}
              onEnd={handleEnd}
              onReset={handleReset}
              onReview={handleReview}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
