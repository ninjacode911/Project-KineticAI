export type SessionStatus = 'idle' | 'calibrating' | 'active' | 'paused' | 'resting' | 'completed';

export type RepPhase = 'standing' | 'descending' | 'bottom' | 'ascending';

export interface RepLog {
  repNumber: number;
  formScore: number;
  duration: number;
  primaryAngle: number;
  symmetryScore: number;
  depthAchieved: boolean;
  timestamp: number;
  phase: RepPhase;
}

export interface SessionData {
  exerciseId: string;
  exerciseName: string;
  startTime: number;
  endTime: number | null;
  totalReps: number;
  currentSet: number;
  targetSets: number;
  targetReps: number;
  repLog: RepLog[];
  avgFormScore: number;
  bestRepScore: number;
  worstRepScore: number;
  fatigueDetected: boolean;
  fatigueOnsetRep: number | null;
}

export interface FPSData {
  current: number;
  average: number;
  backend: string;
}
