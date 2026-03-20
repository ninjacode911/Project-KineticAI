import { useSessionStore } from '@/stores/sessionStore';

/**
 * Row of coloured dots showing recent rep quality scores.
 * Green (≥80), yellow (≥60), red (<60).
 */
export function RepDots() {
  const repLog = useSessionStore((s) => s.repLog);

  if (repLog.length === 0) return null;

  // Show last 20 reps max
  const recent = repLog.slice(-20);

  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2">
      {recent.map((rep) => {
        const color =
          rep.formScore >= 80
            ? 'bg-green-500'
            : rep.formScore >= 60
              ? 'bg-yellow-500'
              : 'bg-red-500';

        return (
          <div
            key={rep.repNumber}
            className={`h-3 w-3 rounded-full ${color}`}
            title={`Rep ${rep.repNumber}: ${rep.formScore}/100`}
          />
        );
      })}
    </div>
  );
}
