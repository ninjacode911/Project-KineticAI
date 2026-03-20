import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExerciseById } from '@/data/exercises';
import { useSessionStore } from '@/stores/sessionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { generateSessionPDF } from '@/lib/report/pdfGenerator';
import { generateSessionSummary } from '@/lib/coaching/geminiCoach';
import { findFatigueOnset } from '@/lib/analysis/fatigueDetector';
import { formatTime, getScoreColor } from '@/lib/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, ArrowLeft, Download, RotateCcw, Sparkles } from 'lucide-react';

export function ReviewPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined;

  const repLog = useSessionStore((s) => s.repLog);
  const avgFormScore = useSessionStore((s) => s.avgFormScore);
  const elapsed = useSessionStore((s) => s.elapsed);
  const currentSet = useSessionStore((s) => s.currentSet);
  const resetSession = useSessionStore((s) => s.resetSession);
  const saveSession = useHistoryStore((s) => s.saveSession);

  const [aiCoaching, setAiCoaching] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const bestScore = repLog.length > 0 ? Math.max(...repLog.map((r) => r.formScore)) : 0;
  const worstScore = repLog.length > 0 ? Math.min(...repLog.map((r) => r.formScore)) : 0;
  const fatigueOnset = findFatigueOnset(repLog);

  // Generate AI coaching summary — run once on mount
  const aiRequestedRef = useRef(false);
  useEffect(() => {
    if (!exercise || repLog.length === 0 || aiRequestedRef.current) return;
    aiRequestedRef.current = true;

    setAiLoading(true);
    generateSessionSummary(exercise, repLog, currentSet, elapsed)
      .then((result) => setAiCoaching(result))
      .finally(() => setAiLoading(false));
  }, [exercise, repLog, currentSet, elapsed]);

  // Save session to history — run once on mount
  const sessionSavedRef = useRef(false);
  useEffect(() => {
    if (!exercise || repLog.length === 0 || sessionSavedRef.current) return;
    sessionSavedRef.current = true;

    saveSession({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date: new Date().toISOString(),
      totalReps: repLog.length,
      avgFormScore,
      bestRepScore: bestScore,
      durationSeconds: elapsed,
    });
  }, [exercise, repLog.length, avgFormScore, bestScore, elapsed, saveSession]);

  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    if (!exercise) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      await generateSessionPDF({
        exercise,
        repLog,
        totalSets: currentSet,
        durationSeconds: elapsed,
        avgFormScore,
        bestRepScore: bestScore,
        worstRepScore: worstScore,
        aiCoaching,
      });
    } catch {
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleNewSession = () => {
    resetSession();
    navigate('/');
  };

  if (!exercise || repLog.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">No session data to review.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to exercises
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Session Review</h1>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">{exercise.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} disabled={pdfLoading}>
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? 'Generating...' : 'Download PDF'}
            </Button>
            {pdfError && <span className="text-xs text-destructive">{pdfError}</span>}
            <Button onClick={handleNewSession}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Reps</p>
                <p className="text-3xl font-bold">{repLog.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-3xl font-bold" style={{ color: getScoreColor(avgFormScore) }}>
                  {avgFormScore}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-3xl font-bold font-mono">{formatTime(elapsed)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Best Rep</p>
                <p className="text-3xl font-bold" style={{ color: getScoreColor(bestScore) }}>
                  {bestScore}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fatigue info */}
          {fatigueOnset && (
            <Card className="border-yellow-500 bg-yellow-500/10">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  Fatigue detected starting at rep {fatigueOnset}. Form quality declined in the later reps of this set.
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Coaching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4" />
                AI Coaching Feedback
                <Badge variant="secondary" className="text-xs">Gemini</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Generating coaching feedback...
                </div>
              )}
              {aiCoaching && <p className="text-sm leading-relaxed">{aiCoaching}</p>}
              {!aiLoading && !aiCoaching && (
                <p className="text-sm text-muted-foreground">
                  AI coaching unavailable. Set VITE_GEMINI_API_KEY in .env.local to enable.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Rep-by-rep table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rep-by-Rep Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">#</th>
                      <th className="pb-2 pr-4">Score</th>
                      <th className="pb-2 pr-4">Duration</th>
                      <th className="pb-2 pr-4">Angle</th>
                      <th className="pb-2 pr-4">Symmetry</th>
                      <th className="pb-2">Depth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repLog.map((rep) => (
                      <tr key={rep.repNumber} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono">{rep.repNumber}</td>
                        <td className="py-2 pr-4" style={{ color: getScoreColor(rep.formScore) }}>
                          <span className="font-bold">{rep.formScore}</span>/100
                        </td>
                        <td className="py-2 pr-4 font-mono">{(rep.duration / 1000).toFixed(1)}s</td>
                        <td className="py-2 pr-4 font-mono">{Math.round(rep.primaryAngle)}°</td>
                        <td className="py-2 pr-4">{rep.symmetryScore}%</td>
                        <td className="py-2">
                          <Badge variant={rep.depthAchieved ? 'default' : 'secondary'}>
                            {rep.depthAchieved ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground">
            KineticAI is a fitness coaching tool, not a medical device.
            Consult a physiotherapist before beginning a rehabilitation programme.
          </p>
        </div>
      </main>
    </div>
  );
}
