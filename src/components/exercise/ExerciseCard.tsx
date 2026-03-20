import { motion } from 'framer-motion';
import type { ExerciseConfig } from '@/types/exercise';
import { Dumbbell, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface ExerciseCardProps {
  exercise: ExerciseConfig;
  onSelect: (exercise: ExerciseConfig) => void;
}

const categoryConfig = {
  'lower-body-strength': {
    icon: Dumbbell,
    label: 'Lower Body',
    gradient: 'from-cyan-500/10 via-transparent to-transparent',
    accentColor: 'text-cyan-400',
    hoverBorder: 'group-hover:border-cyan-500/30',
    dotColor: 'bg-cyan-400',
  },
  'upper-body-strength': {
    icon: Dumbbell,
    label: 'Upper Body',
    gradient: 'from-blue-500/10 via-transparent to-transparent',
    accentColor: 'text-blue-400',
    hoverBorder: 'group-hover:border-blue-500/30',
    dotColor: 'bg-blue-400',
  },
  'physio-rehab': {
    icon: Heart,
    label: 'Physio Rehab',
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
    accentColor: 'text-emerald-400',
    hoverBorder: 'group-hover:border-emerald-500/30',
    dotColor: 'bg-emerald-400',
  },
  'core-stability': {
    icon: Sparkles,
    label: 'Core',
    gradient: 'from-amber-500/10 via-transparent to-transparent',
    accentColor: 'text-amber-400',
    hoverBorder: 'group-hover:border-amber-500/30',
    dotColor: 'bg-amber-400',
  },
  'yoga-mobility': {
    icon: Sparkles,
    label: 'Yoga',
    gradient: 'from-violet-500/10 via-transparent to-transparent',
    accentColor: 'text-violet-400',
    hoverBorder: 'group-hover:border-violet-500/30',
    dotColor: 'bg-violet-400',
  },
} as const;

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  const config = categoryConfig[exercise.category] ?? categoryConfig['lower-body-strength'];
  const Icon = config.icon;

  return (
    <motion.button
      onClick={() => onSelect(exercise)}
      className={`group relative w-full overflow-hidden rounded-xl border border-white/[0.04] bg-gradient-to-br ${config.gradient} p-5 text-left transition-all duration-300 ${config.hoverBorder} hover:bg-white/[0.02]`}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 kinetic-glow" />

      <div className="relative">
        {/* Category + icon row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
            <span className={`text-[11px] font-medium tracking-wide uppercase ${config.accentColor}`}>
              {config.label}
            </span>
          </div>
          <Icon className="h-4 w-4 text-muted-foreground/40" />
        </div>

        {/* Exercise name */}
        <h3 className="mb-1.5 font-heading text-base font-semibold tracking-tight">
          {exercise.name}
        </h3>

        {/* Description */}
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {exercise.description}
        </p>

        {/* Footer: stats + arrow */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-[11px] text-muted-foreground/70">
            <span>{exercise.targetReps} reps</span>
            <span className="text-white/10">|</span>
            <span>{exercise.targetSets} sets</span>
            <span className="text-white/10">|</span>
            <span>{exercise.restSeconds}s rest</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-foreground" />
        </div>
      </div>
    </motion.button>
  );
}
