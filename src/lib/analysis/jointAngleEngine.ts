import { JOINT_PAIRS } from '@/data/constants';
import { areJointLandmarksConfident, getJointConfidence } from '@/lib/pose/confidenceFilter';
import { calculateAngle3D } from '@/lib/utils/math';
import type { Landmark, JointAngle, PoseAnalysis, JointPair } from '@/types/pose';

/**
 * Compute all joint angles for a single frame of landmarks.
 * Only computes angles where all three keypoints have sufficient confidence.
 */
export function computeJointAngles(
  landmarks: Landmark[],
  jointPairs: JointPair[] = JOINT_PAIRS,
): JointAngle[] {
  const angles: JointAngle[] = [];

  for (const pair of jointPairs) {
    if (!areJointLandmarksConfident(landmarks, pair.proximal, pair.vertex, pair.distal)) {
      continue;
    }

    const a = landmarks[pair.proximal];
    const b = landmarks[pair.vertex];
    const c = landmarks[pair.distal];
    if (!a || !b || !c) continue;

    const angle = calculateAngle3D(a, b, c);
    const confidence = getJointConfidence(landmarks, pair.proximal, pair.vertex, pair.distal);

    angles.push({
      name: pair.name,
      angle,
      confidence,
      side: pair.side,
    });
  }

  return angles;
}

/**
 * Build a full PoseAnalysis object from a frame's landmarks.
 */
export function analyzePose(
  landmarks: Landmark[],
  worldLandmarks: Landmark[] = [],
  timestamp: number = Date.now(),
): PoseAnalysis {
  return {
    jointAngles: computeJointAngles(landmarks),
    landmarks,
    worldLandmarks,
    timestamp,
  };
}

/**
 * Get a specific joint angle by name from a computed angles array.
 */
export function getAngleByName(angles: JointAngle[], name: string): number | null {
  const found = angles.find((a) => a.name === name);
  return found ? found.angle : null;
}

/**
 * Compute the symmetry score between left and right sides.
 * Returns 0-100 where 100 = perfect symmetry.
 * Compares matching L/R joint pairs and averages the deviation.
 */
export function computeSymmetryScore(angles: JointAngle[]): number {
  const leftAngles = angles.filter((a) => a.side === 'left');
  const rightAngles = angles.filter((a) => a.side === 'right');

  if (leftAngles.length === 0 || rightAngles.length === 0) return 100;

  let totalDeviation = 0;
  let pairCount = 0;

  for (const left of leftAngles) {
    const jointName = left.name.replace('Left ', '');
    const right = rightAngles.find((r) => r.name.replace('Right ', '') === jointName);
    if (!right) continue;

    const deviation = Math.abs(left.angle - right.angle);
    totalDeviation += deviation;
    pairCount++;
  }

  if (pairCount === 0) return 100;

  const avgDeviation = totalDeviation / pairCount;
  // 0° deviation = 100 score, 30°+ deviation = 0 score
  return Math.max(0, Math.round(100 - (avgDeviation / 30) * 100));
}

/**
 * Prepare angle label data for the skeleton renderer.
 * Returns positioned labels at each joint vertex.
 */
export function getAngleLabels(
  landmarks: Landmark[],
  angles: JointAngle[],
  jointPairs: JointPair[] = JOINT_PAIRS,
): { x: number; y: number; label: string }[] {
  const labels: { x: number; y: number; label: string }[] = [];

  for (const angle of angles) {
    const pair = jointPairs.find((p) => p.name === angle.name);
    if (!pair) continue;

    const vertex = landmarks[pair.vertex];
    if (!vertex) continue;

    labels.push({
      x: vertex.x,
      y: vertex.y,
      label: `${Math.round(angle.angle)}°`,
    });
  }

  return labels;
}
