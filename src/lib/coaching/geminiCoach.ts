import type { RepLog } from '@/types/session';
import type { ExerciseConfig } from '@/types/exercise';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiCoachingResult {
  tips: string[];
  overallAssessment: string;
  priorityCorrection: string;
}

/**
 * Generate post-set coaching feedback using Gemini 2.0 Flash API.
 * Returns structured coaching tips based on session data.
 */
export async function generatePostSetCoaching(
  exercise: ExerciseConfig,
  repLog: RepLog[],
  setNumber: number,
): Promise<GeminiCoachingResult | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const avgFormScore = repLog.length > 0
    ? Math.round(repLog.reduce((sum, r) => sum + r.formScore, 0) / repLog.length)
    : 0;

  const avgPrimaryAngle = repLog.length > 0
    ? Math.round(repLog.reduce((sum, r) => sum + r.primaryAngle, 0) / repLog.length)
    : 0;

  const avgSymmetry = repLog.length > 0
    ? Math.round(repLog.reduce((sum, r) => sum + r.symmetryScore, 0) / repLog.length)
    : 0;

  const depthAchievedPercent = repLog.length > 0
    ? Math.round((repLog.filter((r) => r.depthAchieved).length / repLog.length) * 100)
    : 0;

  // Find the most common issue
  const lowScoreReps = repLog.filter((r) => r.formScore < 70);
  const topIssue = lowScoreReps.length > 0
    ? `Low form score in ${lowScoreReps.length} of ${repLog.length} reps`
    : 'No significant issues detected';

  const prompt = buildCoachingPrompt(exercise, {
    repCount: repLog.length,
    setNumber,
    avgFormScore,
    avgPrimaryAngle,
    avgSymmetry,
    depthAchievedPercent,
    topIssue,
    targetAngle: `${exercise.bottomAngle.min}-${exercise.bottomAngle.max}`,
  });

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return parseCoachingResponse(text);
  } catch {
    return null;
  }
}

/**
 * Generate a full session summary coaching report.
 */
export async function generateSessionSummary(
  exercise: ExerciseConfig,
  repLog: RepLog[],
  totalSets: number,
  durationSeconds: number,
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const avgScore = repLog.length > 0
    ? Math.round(repLog.reduce((sum, r) => sum + r.formScore, 0) / repLog.length)
    : 0;

  const bestScore = repLog.length > 0
    ? Math.max(...repLog.map((r) => r.formScore))
    : 0;

  const worstScore = repLog.length > 0
    ? Math.min(...repLog.map((r) => r.formScore))
    : 0;

  const prompt = `You are an expert movement coach. Write a brief session summary (3-4 sentences) for this workout.

Exercise: ${exercise.name}
Total reps: ${repLog.length} across ${totalSets} sets
Duration: ${Math.floor(durationSeconds / 60)} minutes
Average form score: ${avgScore}/100
Best rep: ${bestScore}/100, Worst rep: ${worstScore}/100

Be encouraging but specific. Mention one thing done well and one area to focus on next time.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

function buildCoachingPrompt(
  exercise: ExerciseConfig,
  stats: {
    repCount: number;
    setNumber: number;
    avgFormScore: number;
    avgPrimaryAngle: number;
    avgSymmetry: number;
    depthAchievedPercent: number;
    topIssue: string;
    targetAngle: string;
  },
): string {
  return `You are an expert movement coach and physiotherapist.
Analyse this exercise set data and provide 2-3 specific, actionable coaching tips.
Be encouraging but precise. Focus on the most impactful corrections only.

Exercise: ${exercise.name}
Set: ${stats.setNumber}
Reps completed: ${stats.repCount}
Average form score: ${stats.avgFormScore}/100
Primary joint angle avg: ${stats.avgPrimaryAngle}° (target range: ${stats.targetAngle}°)
Symmetry: ${stats.avgSymmetry}% (left vs right)
Depth achieved: ${stats.depthAchievedPercent}% of reps reached target depth
Top issue: ${stats.topIssue}

Response format: Return exactly 3 lines:
LINE 1: A brief overall assessment (1 sentence)
LINE 2: The most important correction tip (1 sentence)
LINE 3: A secondary tip or encouragement (1 sentence)

Do not use bullet points, numbering, or markdown. Just 3 plain text lines.`;
}

function parseCoachingResponse(text: string): GeminiCoachingResult {
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);

  return {
    overallAssessment: lines[0]?.trim() ?? 'Good effort on this set.',
    priorityCorrection: lines[1]?.trim() ?? 'Focus on maintaining consistent depth.',
    tips: lines.slice(0, 3).map((l) => l.trim()),
  };
}
