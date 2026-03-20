import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExerciseConfig, ExerciseCategory } from '@/types/exercise';
import { EXERCISE_LIST } from '@/data/exercises';
import { ExerciseCard } from './ExerciseCard';
import { Search } from 'lucide-react';

interface ExerciseGridProps {
  onSelect: (exercise: ExerciseConfig) => void;
}

const CATEGORIES: { key: ExerciseCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lower-body-strength', label: 'Lower Body' },
  { key: 'upper-body-strength', label: 'Upper Body' },
  { key: 'physio-rehab', label: 'Physio' },
  { key: 'yoga-mobility', label: 'Yoga' },
];

export function ExerciseGrid({ onSelect }: ExerciseGridProps) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result: ExerciseConfig[] = EXERCISE_LIST;

    if (activeCategory !== 'all') {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-[var(--color-kinetic-cyan)]/30 focus:bg-white/[0.05]"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${
              activeCategory === cat.key
                ? 'bg-[var(--color-kinetic-cyan)] text-[#0a0a0f] shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'border border-white/[0.06] text-muted-foreground hover:border-white/[0.12] hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise grid with staggered animation */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((exercise, i) => (
            <motion.div
              key={exercise.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.35,
                delay: i * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ExerciseCard exercise={exercise} onSelect={onSelect} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center text-sm text-muted-foreground"
        >
          No exercises match your search.
        </motion.p>
      )}
    </div>
  );
}
