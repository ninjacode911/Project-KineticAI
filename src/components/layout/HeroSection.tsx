import { motion } from 'framer-motion';
import { Activity, ArrowDown } from 'lucide-react';

/** Wireframe body silhouette built from positioned dots */
const JOINTS = [
  { x: 50, y: 12, delay: 0 },     // head
  { x: 50, y: 22, delay: 0.1 },   // neck
  { x: 38, y: 28, delay: 0.2 },   // L shoulder
  { x: 62, y: 28, delay: 0.2 },   // R shoulder
  { x: 30, y: 42, delay: 0.3 },   // L elbow
  { x: 70, y: 42, delay: 0.3 },   // R elbow
  { x: 24, y: 55, delay: 0.4 },   // L wrist
  { x: 76, y: 55, delay: 0.4 },   // R wrist
  { x: 50, y: 45, delay: 0.15 },  // mid torso
  { x: 42, y: 58, delay: 0.25 },  // L hip
  { x: 58, y: 58, delay: 0.25 },  // R hip
  { x: 38, y: 74, delay: 0.35 },  // L knee
  { x: 62, y: 74, delay: 0.35 },  // R knee
  { x: 36, y: 90, delay: 0.45 },  // L ankle
  { x: 64, y: 90, delay: 0.45 },  // R ankle
];

const BONES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7],
  [1, 8], [8, 9], [8, 10], [9, 11], [10, 12], [11, 13], [12, 14],
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6">
      {/* Animated grid background */}
      <div className="grid-bg noise-overlay absolute inset-0" />

      {/* Radial glow behind silhouette */}
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_70%)]" />

      {/* Wireframe body silhouette */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-[340px] w-[200px] -translate-x-1/2 -translate-y-[55%] opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
          {BONES.map(([a, b], i) => (
            <motion.line
              key={`bone-${i}`}
              x1={JOINTS[a].x}
              y1={JOINTS[a].y}
              x2={JOINTS[b].x}
              y2={JOINTS[b].y}
              stroke="#06b6d4"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 0.5 + Math.max(JOINTS[a].delay, JOINTS[b].delay) }}
            />
          ))}
          {JOINTS.map((joint, i) => (
            <motion.circle
              key={`joint-${i}`}
              cx={joint.x}
              cy={joint.y}
              r="1.5"
              fill="#06b6d4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 0.3, delay: 0.4 + joint.delay }}
              className="joint-dot"
              style={{ animationDelay: `${joint.delay * 2}s` }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 flex items-center gap-2"
        >
          <Activity className="h-5 w-5 text-[var(--color-kinetic-cyan)]" />
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--color-kinetic-cyan)]">
            KineticAI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl font-heading text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
        >
          Your body.{' '}
          <span className="kinetic-gradient-text">Tracked in real-time.</span>{' '}
          Coached by AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
        >
          Browser-native pose estimation that runs entirely on your device.
          No downloads, no subscriptions, no data leaving your camera.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex items-center gap-4"
        >
          <a
            href="#exercises"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-kinetic-cyan)] to-[var(--color-kinetic-emerald)] px-8 py-3 text-sm font-semibold text-[#0a0a0f] transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            Start Training
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
          <span className="text-xs text-muted-foreground tracking-wide">
            Free forever — zero cost
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
