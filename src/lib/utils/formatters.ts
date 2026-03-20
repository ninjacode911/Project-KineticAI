/** Format angle as rounded integer with degree symbol */
export function formatAngle(angle: number): string {
  return `${Math.round(angle)}°`;
}

/** Format time in seconds to mm:ss */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Format form score with colour hint */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  return '#ef4444'; // red
}

/** Get joint color based on angle deviation from target range */
export function getJointColor(
  angle: number,
  targetMin: number,
  targetMax: number,
): string {
  if (angle >= targetMin && angle <= targetMax) return '#22c55e'; // green — in range
  const deviation = angle < targetMin
    ? targetMin - angle
    : angle - targetMax;
  if (deviation <= 15) return '#eab308'; // yellow — close
  return '#ef4444'; // red — far off
}
