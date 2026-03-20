import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/utils/animations';
import { Zap, Brain, Shield, DollarSign } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-Time Tracking',
    description: '33 keypoints tracked at 30+ FPS using MediaPipe. Sub-20ms inference directly in your browser.',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    iconColor: 'text-cyan-400',
    borderColor: 'hover:border-cyan-500/30',
  },
  {
    icon: Brain,
    title: 'AI Coaching',
    description: 'Gemini-powered coaching feedback after every set. Rep counting, form scoring, and fatigue detection.',
    gradient: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
    borderColor: 'hover:border-violet-500/30',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'Zero data leaves your device. All inference runs client-side. No server, no uploads, no tracking.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: DollarSign,
    title: 'Completely Free',
    description: 'No subscription, no sign-up, no app download. Open a browser tab and start training immediately.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/30',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--color-kinetic-cyan)]">
            Why KineticAI
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Clinical-grade motion analysis.
            <br />
            <span className="text-muted-foreground">In your browser.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br ${feature.gradient} p-6 transition-all duration-300 ${feature.borderColor}`}
            >
              {/* Subtle inner glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-white/[0.02] to-transparent" />

              <div className="relative">
                <feature.icon className={`mb-4 h-6 w-6 ${feature.iconColor}`} />
                <h3 className="mb-2 font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
