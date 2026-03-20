import type { RepLog } from '@/types/session';
import type { ExerciseConfig } from '@/types/exercise';
import { formatTime } from '@/lib/utils/formatters';

interface SessionReportData {
  exercise: ExerciseConfig;
  repLog: RepLog[];
  totalSets: number;
  durationSeconds: number;
  avgFormScore: number;
  bestRepScore: number;
  worstRepScore: number;
  aiCoaching: string | null;
}

/**
 * Generate and download a PDF session report using pdfmake.
 * Runs entirely client-side — no data uploaded.
 */
export async function generateSessionPDF(data: SessionReportData): Promise<void> {
  // Dynamic import to avoid loading pdfmake until needed
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = pdfMakeModule.default;
  (pdfMake as unknown as { vfs: Record<string, string> }).vfs = pdfFontsModule.vfs;

  const {
    exercise,
    repLog,
    totalSets,
    durationSeconds,
    avgFormScore,
    bestRepScore,
    worstRepScore,
    aiCoaching,
  } = data;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const docDefinition = {
    pageSize: 'A4' as const,
    pageMargins: [40, 60, 40, 60] as [number, number, number, number],
    content: [
      // Header
      {
        text: 'KineticAI — Session Report',
        fontSize: 22,
        bold: true,
        color: '#111827',
        margin: [0, 0, 0, 4] as [number, number, number, number],
      },
      {
        text: `${date} • ${exercise.name}`,
        fontSize: 11,
        color: '#6b7280',
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Summary metrics
      {
        text: 'Session Summary',
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'Total Reps', bold: true, color: '#374151' },
              { text: 'Sets', bold: true, color: '#374151' },
              { text: 'Duration', bold: true, color: '#374151' },
              { text: 'Avg Form Score', bold: true, color: '#374151' },
            ],
            [
              String(repLog.length),
              String(totalSets),
              formatTime(durationSeconds),
              `${avgFormScore}/100`,
            ],
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 16] as [number, number, number, number],
      },

      // Best/Worst rep
      {
        columns: [
          { width: '*', text: `Best Rep: ${bestRepScore}/100` },
          { width: '*', text: `Worst Rep: ${worstRepScore}/100` },
        ],
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // Per-rep breakdown
      {
        text: 'Rep-by-Rep Breakdown',
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },
      {
        table: {
          headerRows: 1,
          widths: [40, 60, 80, 60, 60, '*'],
          body: [
            [
              { text: '#', bold: true, color: '#374151' },
              { text: 'Score', bold: true, color: '#374151' },
              { text: 'Duration', bold: true, color: '#374151' },
              { text: 'Depth°', bold: true, color: '#374151' },
              { text: 'Symmetry', bold: true, color: '#374151' },
              { text: 'Depth OK', bold: true, color: '#374151' },
            ],
            ...repLog.map((rep) => [
              String(rep.repNumber),
              `${rep.formScore}/100`,
              `${(rep.duration / 1000).toFixed(1)}s`,
              `${Math.round(rep.primaryAngle)}°`,
              `${rep.symmetryScore}%`,
              rep.depthAchieved ? 'Yes' : 'No',
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20] as [number, number, number, number],
      },

      // AI Coaching (if available)
      ...(aiCoaching
        ? [
            {
              text: 'AI Coaching Feedback',
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 8] as [number, number, number, number],
            },
            {
              text: aiCoaching,
              fontSize: 10,
              color: '#374151',
              margin: [0, 0, 0, 20] as [number, number, number, number],
            },
          ]
        : []),

      // Disclaimer
      {
        text: 'Disclaimer: KineticAI is a fitness coaching tool, not a medical device. Consult a physiotherapist before beginning a rehabilitation programme.',
        fontSize: 8,
        color: '#9ca3af',
        margin: [0, 20, 0, 0] as [number, number, number, number],
        alignment: 'center' as const,
      },
    ],
    defaultStyle: {
      fontSize: 10,
    },
  };

  const pdf = pdfMake.createPdf(docDefinition);
  pdf.download(`kineticai-${exercise.id}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
