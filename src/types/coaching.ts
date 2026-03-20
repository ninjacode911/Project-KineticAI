export interface CoachingCue {
  message: string;
  severity: 'info' | 'warning' | 'critical';
  jointName: string;
  timestamp: number;
}

export interface GeminiFeedback {
  tips: string[];
  overallAssessment: string;
  priorityCorrection: string;
  generatedAt: number;
}
