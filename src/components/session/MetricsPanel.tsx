import { useSessionStore } from '@/stores/sessionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getScoreColor } from '@/lib/utils/formatters';
import { formatTime } from '@/lib/utils/formatters';
import { Activity, Target, Timer, TrendingUp } from 'lucide-react';

export function MetricsPanel() {
  const repCount = useSessionStore((s) => s.repCount);
  const currentFormScore = useSessionStore((s) => s.currentFormScore);
  const avgFormScore = useSessionStore((s) => s.avgFormScore);
  const elapsed = useSessionStore((s) => s.elapsed);
  const currentCue = useSessionStore((s) => s.currentCue);
  const status = useSessionStore((s) => s.status);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Rep Counter — large, visible from 2m away */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Reps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-6xl font-bold tabular-nums">{repCount}</p>
        </CardContent>
      </Card>

      {/* Form Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Form Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: status === 'active' ? getScoreColor(currentFormScore) : undefined }}
          >
            {status === 'active' ? currentFormScore : '--'}
          </p>
          <Progress
            value={currentFormScore}
            className="mt-2 h-2"
          />
          {avgFormScore > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Avg: {avgFormScore}/100
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-mono font-bold tabular-nums">
            {formatTime(elapsed)}
          </p>
        </CardContent>
      </Card>

      {/* Coaching Cue */}
      {currentCue && (
        <Card
          className={
            currentCue.severity === 'critical'
              ? 'border-red-500 bg-red-500/10'
              : currentCue.severity === 'warning'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-blue-500 bg-blue-500/10'
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{currentCue.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Status indicator */}
      {status === 'idle' && (
        <div className="mt-auto text-center text-sm text-muted-foreground">
          <p>Start camera to begin pose detection</p>
        </div>
      )}
    </div>
  );
}
