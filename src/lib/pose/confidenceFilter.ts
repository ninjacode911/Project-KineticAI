import { MIN_CONFIDENCE } from '@/data/constants';
import type { Landmark } from '@/types/pose';

/** Check if a landmark has sufficient confidence for use in analysis */
export function isLandmarkConfident(landmark: Landmark): boolean {
  return landmark.visibility >= MIN_CONFIDENCE;
}

/** Check if all three landmarks in a joint triplet are confident */
export function areJointLandmarksConfident(
  landmarks: Landmark[],
  proximal: number,
  vertex: number,
  distal: number,
): boolean {
  const a = landmarks[proximal];
  const b = landmarks[vertex];
  const c = landmarks[distal];
  if (!a || !b || !c) return false;
  return (
    isLandmarkConfident(a) &&
    isLandmarkConfident(b) &&
    isLandmarkConfident(c)
  );
}

/** Get the minimum confidence score across three landmarks */
export function getJointConfidence(
  landmarks: Landmark[],
  proximal: number,
  vertex: number,
  distal: number,
): number {
  const a = landmarks[proximal];
  const b = landmarks[vertex];
  const c = landmarks[distal];
  if (!a || !b || !c) return 0;
  return Math.min(a.visibility, b.visibility, c.visibility);
}
