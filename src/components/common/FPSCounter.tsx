import { useSessionStore } from '@/stores/sessionStore';
import { Badge } from '@/components/ui/badge';

export function FPSCounter() {
  const fps = useSessionStore((s) => s.fps);

  const fpsColor =
    fps.current >= 25
      ? 'text-green-500'
      : fps.current >= 15
        ? 'text-yellow-500'
        : 'text-red-500';

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="font-mono text-xs">
        {fps.backend}
      </Badge>
      <span className={`font-mono text-sm font-bold ${fpsColor}`}>
        {fps.current} FPS
      </span>
    </div>
  );
}
