import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ExerciseConfig } from '@/types/exercise';
import { AnimatedPage } from '@/components/layout/AnimatedPage';
import { HeroSection } from '@/components/layout/HeroSection';
import { FeaturesSection } from '@/components/layout/FeaturesSection';
import { ExerciseGrid } from '@/components/exercise/ExerciseGrid';
import { useHistoryStore } from '@/stores/historyStore';
import { Activity, Settings, Github } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const addRecent = useHistoryStore((s) => s.addRecent);
  const recentExercises = useHistoryStore((s) => s.recentExercises);

  const handleSelect = useCallback(
    (exercise: ExerciseConfig) => {
      addRecent(exercise.id, exercise.name);
      navigate(`/session/${exercise.id}`);
    },
    [navigate, addRecent],
  );

  return (
    <AnimatedPage className="min-h-screen bg-background text-foreground">
      {/* Floating nav */}
      <nav className="fixed top-0 right-0 left-0 z-50 glass-strong">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--color-kinetic-cyan)]" />
            <span className="font-heading text-base font-bold tracking-tight">
              Kinetic<span className="text-[var(--color-kinetic-cyan)]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/settings')}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/ninjacode911/Project-KineticAI"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* Exercise Library */}
      <section id="exercises" className="relative px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Recent exercises */}
          {recentExercises.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <p className="mb-3 text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
                Continue where you left off
              </p>
              <div className="flex flex-wrap gap-2">
                {recentExercises.map((recent) => (
                  <motion.button
                    key={recent.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addRecent(recent.id, recent.name);
                      navigate(`/session/${recent.id}`);
                    }}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--color-kinetic-cyan)]/30 hover:bg-white/[0.06]"
                  >
                    {recent.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Grid header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Exercise Library
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select an exercise to start your session
            </p>
          </motion.div>

          <ExerciseGrid onSelect={handleSelect} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>KineticAI — Built by Ninjacode911</span>
          </div>
          <p className="text-xs text-muted-foreground/50">
            All processing runs on your device. No data ever leaves your browser.
          </p>
        </div>
      </footer>
    </AnimatedPage>
  );
}
