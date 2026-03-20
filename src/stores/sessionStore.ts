import { create } from 'zustand';
import type { SessionStatus, RepLog, FPSData } from '@/types/session';
import type { CoachingCue } from '@/types/coaching';

interface SessionState {
  // Session lifecycle
  status: SessionStatus;
  exerciseId: string | null;
  exerciseName: string | null;

  // Counters
  repCount: number;
  currentSet: number;
  targetReps: number;
  targetSets: number;

  // Scores
  currentFormScore: number;
  avgFormScore: number;
  repLog: RepLog[];

  // Timing
  startTime: number | null;
  elapsed: number;

  // Performance
  fps: FPSData;

  // Coaching
  currentCue: CoachingCue | null;

  // Actions
  startSession: (exerciseId: string, exerciseName: string, targetReps: number, targetSets: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  resetSession: () => void;
  incrementRep: (repData: RepLog) => void;
  setFPS: (fps: FPSData) => void;
  setCurrentFormScore: (score: number) => void;
  setCurrentCue: (cue: CoachingCue | null) => void;
  setElapsed: (elapsed: number) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: 'idle',
  exerciseId: null,
  exerciseName: null,
  repCount: 0,
  currentSet: 1,
  targetReps: 10,
  targetSets: 3,
  currentFormScore: 0,
  avgFormScore: 0,
  repLog: [],
  startTime: null,
  elapsed: 0,
  fps: { current: 0, average: 0, backend: 'loading' },
  currentCue: null,

  startSession: (exerciseId, exerciseName, targetReps, targetSets) =>
    set({
      status: 'active',
      exerciseId,
      exerciseName,
      targetReps,
      targetSets,
      repCount: 0,
      currentSet: 1,
      repLog: [],
      startTime: Date.now(),
      elapsed: 0,
      avgFormScore: 0,
      currentFormScore: 0,
      currentCue: null,
    }),

  pauseSession: () => set({ status: 'paused' }),
  resumeSession: () => set({ status: 'active' }),

  endSession: () => set({ status: 'completed', }),

  resetSession: () =>
    set({
      status: 'idle',
      exerciseId: null,
      exerciseName: null,
      repCount: 0,
      currentSet: 1,
      repLog: [],
      startTime: null,
      elapsed: 0,
      avgFormScore: 0,
      currentFormScore: 0,
      currentCue: null,
    }),

  incrementRep: (repData) => {
    const { repLog } = get();
    const newLog = [...repLog, repData];
    const avgScore =
      newLog.reduce((sum, r) => sum + r.formScore, 0) / newLog.length;
    set({
      repCount: newLog.length,
      repLog: newLog,
      avgFormScore: Math.round(avgScore),
    });
  },

  setFPS: (fps) => set({ fps }),
  setCurrentFormScore: (score) => set({ currentFormScore: score }),
  setCurrentCue: (cue) => set({ currentCue: cue }),
  setElapsed: (elapsed) => set({ elapsed }),
}));
