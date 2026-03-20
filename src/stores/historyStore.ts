import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentExercise {
  id: string;
  name: string;
  lastUsed: number;
}

interface SessionRecord {
  exerciseId: string;
  exerciseName: string;
  date: string;
  totalReps: number;
  avgFormScore: number;
  bestRepScore: number;
  durationSeconds: number;
}

interface HistoryState {
  recentExercises: RecentExercise[];
  sessionHistory: SessionRecord[];
  addRecent: (id: string, name: string) => void;
  saveSession: (record: SessionRecord) => void;
  clearHistory: () => void;
}

const MAX_RECENT = 5;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      recentExercises: [],
      sessionHistory: [],

      addRecent: (id, name) => {
        const { recentExercises } = get();
        const filtered = recentExercises.filter((e) => e.id !== id);
        const updated = [{ id, name, lastUsed: Date.now() }, ...filtered].slice(0, MAX_RECENT);
        set({ recentExercises: updated });
      },

      saveSession: (record) => {
        const { sessionHistory } = get();
        set({ sessionHistory: [record, ...sessionHistory].slice(0, 100) });
      },

      clearHistory: () => set({ recentExercises: [], sessionHistory: [] }),
    }),
    { name: 'kineticai-history' },
  ),
);
