import { useSessionStore } from '@/stores/sessionStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, ClipboardList } from 'lucide-react';

interface SessionControlsProps {
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
  onReview?: () => void;
}

export function SessionControls({ onStart, onEnd, onReset, onReview }: SessionControlsProps) {
  const status = useSessionStore((s) => s.status);
  const pauseSession = useSessionStore((s) => s.pauseSession);
  const resumeSession = useSessionStore((s) => s.resumeSession);

  return (
    <div className="flex items-center justify-center gap-3 p-4">
      {status === 'idle' && (
        <Button size="lg" className="min-w-[120px]" onClick={onStart}>
          <Play className="mr-2 h-5 w-5" />
          Start
        </Button>
      )}

      {status === 'active' && (
        <>
          <Button size="lg" variant="outline" onClick={pauseSession}>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </Button>
          <Button size="lg" variant="destructive" onClick={onEnd}>
            <Square className="mr-2 h-5 w-5" />
            End
          </Button>
        </>
      )}

      {status === 'paused' && (
        <>
          <Button size="lg" onClick={resumeSession}>
            <Play className="mr-2 h-5 w-5" />
            Resume
          </Button>
          <Button size="lg" variant="destructive" onClick={onEnd}>
            <Square className="mr-2 h-5 w-5" />
            End
          </Button>
        </>
      )}

      {status === 'completed' && (
        <>
          {onReview && (
            <Button size="lg" onClick={onReview}>
              <ClipboardList className="mr-2 h-5 w-5" />
              Review Session
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-5 w-5" />
            New Session
          </Button>
        </>
      )}
    </div>
  );
}
