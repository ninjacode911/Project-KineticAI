import type { RepLog } from '@/types/session';

export interface FatigueAlert {
  type: 'depth-fade' | 'symmetry-collapse' | 'speed-collapse' | 'form-trend';
  message: string;
  severity: 'warning' | 'critical';
}

/**
 * Analyse rep-over-rep degradation to detect fatigue.
 * Called after each rep with the full rep log.
 */
export function detectFatigue(repLog: RepLog[]): FatigueAlert | null {
  if (repLog.length < 3) return null;

  const depthFade = checkDepthFade(repLog);
  if (depthFade) return depthFade;

  const symmetryCollapse = checkSymmetryCollapse(repLog);
  if (symmetryCollapse) return symmetryCollapse;

  const speedCollapse = checkSpeedCollapse(repLog);
  if (speedCollapse) return speedCollapse;

  const formTrend = checkFormTrend(repLog);
  if (formTrend) return formTrend;

  return null;
}

/**
 * Depth fade: bottom angle increases by > 10° over 3 consecutive reps.
 * Indicates the user is no longer reaching full depth.
 */
function checkDepthFade(repLog: RepLog[]): FatigueAlert | null {
  if (repLog.length < 3) return null;

  const last3 = repLog.slice(-3);
  const isIncreasing =
    last3[1].primaryAngle > last3[0].primaryAngle + 3 &&
    last3[2].primaryAngle > last3[1].primaryAngle + 3;
  const totalIncrease = last3[2].primaryAngle - last3[0].primaryAngle;

  if (isIncreasing && totalIncrease > 10) {
    return {
      type: 'depth-fade',
      message: 'Depth fading — you\'re not going as deep. Consider resting.',
      severity: 'warning',
    };
  }
  return null;
}

/**
 * Symmetry collapse: L/R asymmetry exceeds 15° for 2 consecutive reps.
 * Indicates compensation pattern due to fatigue.
 */
function checkSymmetryCollapse(repLog: RepLog[]): FatigueAlert | null {
  if (repLog.length < 2) return null;

  const last2 = repLog.slice(-2);
  const bothAsymmetric = last2.every((r) => r.symmetryScore < 70);

  if (bothAsymmetric) {
    return {
      type: 'symmetry-collapse',
      message: 'Asymmetry detected — one side is compensating. Check your form.',
      severity: 'warning',
    };
  }
  return null;
}

/**
 * Speed collapse: rep duration drops > 30% below baseline.
 * Indicates rushing through reps due to fatigue.
 */
function checkSpeedCollapse(repLog: RepLog[]): FatigueAlert | null {
  if (repLog.length < 4) return null;

  // Baseline = average of first 3 reps
  const baseline = repLog.slice(0, 3).reduce((sum, r) => sum + r.duration, 0) / 3;
  const lastRep = repLog[repLog.length - 1];

  if (lastRep.duration < baseline * 0.7) {
    return {
      type: 'speed-collapse',
      message: 'Rushing reps — slow down and control the movement.',
      severity: 'warning',
    };
  }
  return null;
}

/**
 * Form trend: rolling 5-rep average form score drops below 70.
 * Indicates overall form degradation — recommend rest.
 */
function checkFormTrend(repLog: RepLog[]): FatigueAlert | null {
  if (repLog.length < 5) return null;

  const last5 = repLog.slice(-5);
  const avgScore = last5.reduce((sum, r) => sum + r.formScore, 0) / 5;

  if (avgScore < 70) {
    return {
      type: 'form-trend',
      message: 'Form declining — consider taking a rest before your next set.',
      severity: 'critical',
    };
  }
  return null;
}

/**
 * Detect the rep number where fatigue onset occurred.
 * Returns null if no fatigue detected.
 */
export function findFatigueOnset(repLog: RepLog[]): number | null {
  if (repLog.length < 5) return null;

  // Find the first rep where rolling 3-rep avg drops below 75
  for (let i = 2; i < repLog.length; i++) {
    const window = repLog.slice(i - 2, i + 1);
    const avg = window.reduce((sum, r) => sum + r.formScore, 0) / 3;
    if (avg < 75) return repLog[i].repNumber;
  }

  return null;
}
