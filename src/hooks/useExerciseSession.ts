import { useCallback, useEffect, useRef } from 'react';
import type { ExerciseConfig } from '@/types/exercise';
import type { JointAngle, Landmark } from '@/types/pose';
import { useSessionStore } from '@/stores/sessionStore';
import { createRepCounter, processAngle, type RepCounterState } from '@/lib/analysis/repCounter';
import { scoreRep } from '@/lib/analysis/formScorer';
import { detectFatigue } from '@/lib/analysis/fatigueDetector';
import { generateCue } from '@/lib/coaching/ruleBasedCues';
import { computeSymmetryScore, getAngleByName } from '@/lib/analysis/jointAngleEngine';

interface UseExerciseSessionOptions {
  exercise: ExerciseConfig | null;
  landmarksRef: React.RefObject<Landmark[]>;
  jointAnglesRef: React.RefObject<JointAngle[]>;
}

/**
 * Main session controller hook.
 * Processes each frame's joint angles through the rep counter, form scorer,
 * fatigue detector, and coaching cue generator.
 */
export function useExerciseSession({
  exercise,
  // landmarksRef reserved for calibration (Phase 6)
  jointAnglesRef,
}: UseExerciseSessionOptions) {
  const repCounterRef = useRef<RepCounterState>(createRepCounter());
  const lastCueTimeRef = useRef(0);
  const eccentricStartRef = useRef(0);

  const status = useSessionStore((s) => s.status);
  const startSession = useSessionStore((s) => s.startSession);
  const endSession = useSessionStore((s) => s.endSession);
  const resetSession = useSessionStore((s) => s.resetSession);

  // Use refs for hot-path store actions to avoid effect recreation
  const storeRef = useRef(useSessionStore.getState());
  useEffect(() => {
    const unsub = useSessionStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsub;
  }, []);

  // Reset rep counter when exercise changes
  useEffect(() => {
    repCounterRef.current = createRepCounter();
  }, [exercise?.id]);

  // Main analysis loop — runs on every animation frame via a polling interval
  useEffect(() => {
    if (status !== 'active' || !exercise) return;

    const interval = setInterval(() => {
      const angles = jointAnglesRef.current;
      if (angles.length === 0) return;

      const now = Date.now();
      const store = storeRef.current;

      // Get the primary joint angle for rep counting
      const primaryAngle = getPrimaryAngle(angles, exercise);
      if (primaryAngle === null) return;

      // Track eccentric phase start
      const counter = repCounterRef.current;
      if (counter.phase === 'standing') {
        eccentricStartRef.current = now;
      }

      // Process angle through rep counter state machine
      const repEvent = processAngle(counter, primaryAngle, exercise, now);

      if (repEvent) {
        // Rep completed — score it
        const symmetryScore = computeSymmetryScore(angles);
        const eccentricDuration = now - eccentricStartRef.current;
        const returnedToStart = exercise.angleDirection === 'increasing'
          ? primaryAngle <= exercise.standingAngle.max
          : primaryAngle >= exercise.standingAngle.min;

        const score = scoreRep(
          repEvent.bottomAngle,
          angles,
          exercise,
          eccentricDuration,
          returnedToStart,
        );

        const repData = {
          repNumber: repEvent.repNumber,
          formScore: score.total,
          duration: repEvent.duration,
          primaryAngle: repEvent.bottomAngle,
          symmetryScore,
          depthAchieved: exercise.angleDirection === 'increasing'
            ? repEvent.bottomAngle >= exercise.bottomAngle.min
            : repEvent.bottomAngle <= exercise.bottomAngle.max,
          timestamp: repEvent.timestamp,
          phase: 'standing' as const,
        };

        store.incrementRep(repData);
        store.setCurrentFormScore(score.total);

        // Check fatigue after each rep (read latest repLog from store)
        const fatigueAlert = detectFatigue(store.repLog);
        if (fatigueAlert) {
          store.setCurrentCue({
            message: fatigueAlert.message,
            severity: fatigueAlert.severity === 'critical' ? 'critical' : 'warning',
            jointName: fatigueAlert.type,
            timestamp: now,
          });
          lastCueTimeRef.current = now;
        }
      }

      // Generate real-time coaching cues (throttled to every 3 seconds)
      if (now - lastCueTimeRef.current > 3000) {
        const symmetryScore = computeSymmetryScore(angles);
        const cue = generateCue(angles, exercise, counter.phase, symmetryScore);
        if (cue) {
          store.setCurrentCue(cue);
          lastCueTimeRef.current = now;
        }
      }
    }, 100); // Process at 10Hz (every 100ms) — sufficient for rep counting

    return () => clearInterval(interval);
  }, [status, exercise, jointAnglesRef]);

  const handleStart = useCallback(() => {
    if (!exercise) return;
    repCounterRef.current = createRepCounter();
    eccentricStartRef.current = Date.now();
    startSession(exercise.id, exercise.name, exercise.targetReps, exercise.targetSets);
  }, [exercise, startSession]);

  const handleEnd = useCallback(() => {
    endSession();
  }, [endSession]);

  const handleReset = useCallback(() => {
    repCounterRef.current = createRepCounter();
    resetSession();
  }, [resetSession]);

  return {
    repCounterRef,
    handleStart,
    handleEnd,
    handleReset,
  };
}

/** Extract the primary joint angle from the angles array based on exercise config */
function getPrimaryAngle(angles: JointAngle[], exercise: ExerciseConfig): number | null {
  // Map vertex landmark index to joint name
  const vertexNames: Record<number, string> = {
    25: 'Left Knee', 26: 'Right Knee',
    23: 'Left Hip', 24: 'Right Hip',
    13: 'Left Elbow', 14: 'Right Elbow',
    11: 'Left Shoulder', 12: 'Right Shoulder',
    27: 'Left Ankle', 28: 'Right Ankle',
  };

  const jointName = vertexNames[exercise.primaryJoint.vertex];
  if (!jointName) return null;

  return getAngleByName(angles, jointName);
}
