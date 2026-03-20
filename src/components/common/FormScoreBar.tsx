import { useSessionStore } from '@/stores/sessionStore';

/**
 * Animated colour gradient bar showing the current form score (0-100).
 * Green (80+), yellow (60-79), red (<60).
 */
export function FormScoreBar() {
  const currentFormScore = useSessionStore((s) => s.currentFormScore);
  const status = useSessionStore((s) => s.status);

  if (status !== 'active') return null;

  const color =
    currentFormScore >= 80
      ? 'bg-green-500'
      : currentFormScore >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Form</span>
        <span className="font-mono font-bold">{currentFormScore}/100</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${currentFormScore}%` }}
        />
      </div>
    </div>
  );
}
