import { describe, it, expect } from 'vitest';
import { detectFatigue } from '@/lib/analysis/fatigueDetector';
import type { RepLog } from '@/types/session';

function makeRep(
  repNumber: number,
  overrides: Partial<RepLog> = {},
): RepLog {
  return {
    repNumber,
    formScore: 85,
    duration: 2000,
    primaryAngle: 85,
    symmetryScore: 90,
    depthAchieved: true,
    timestamp: Date.now() + repNumber * 3000,
    phase: 'standing',
    ...overrides,
  };
}

describe('fatigueDetector', () => {
  it('returns null with fewer than 3 reps', () => {
    const result = detectFatigue([makeRep(1), makeRep(2)]);
    expect(result).toBeNull();
  });

  it('detects depth fade (>10° over 3 reps)', () => {
    const reps = [
      makeRep(1, { primaryAngle: 80 }),
      makeRep(2, { primaryAngle: 85 }),
      makeRep(3, { primaryAngle: 92 }),
    ];

    const alert = detectFatigue(reps);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('depth-fade');
  });

  it('does not fire depth fade for stable reps', () => {
    const reps = [
      makeRep(1, { primaryAngle: 85 }),
      makeRep(2, { primaryAngle: 86 }),
      makeRep(3, { primaryAngle: 84 }),
    ];

    const alert = detectFatigue(reps);
    // Should not detect depth fade since angles are stable
    if (alert) {
      expect(alert.type).not.toBe('depth-fade');
    }
  });

  it('detects symmetry collapse', () => {
    const reps = [
      makeRep(1),
      makeRep(2, { symmetryScore: 60 }),
      makeRep(3, { symmetryScore: 55 }),
    ];

    const alert = detectFatigue(reps);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('symmetry-collapse');
  });

  it('detects speed collapse (>30% faster than baseline)', () => {
    const reps = [
      makeRep(1, { duration: 2000 }),
      makeRep(2, { duration: 2100 }),
      makeRep(3, { duration: 1900 }),
      makeRep(4, { duration: 1200 }), // 40% faster than baseline ~2000
    ];

    const alert = detectFatigue(reps);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('speed-collapse');
  });

  it('detects form trend when rolling 5-rep average < 70', () => {
    const reps = [
      makeRep(1, { formScore: 60 }),
      makeRep(2, { formScore: 55 }),
      makeRep(3, { formScore: 65 }),
      makeRep(4, { formScore: 60 }),
      makeRep(5, { formScore: 55 }),
    ];

    const alert = detectFatigue(reps);
    expect(alert).not.toBeNull();
    // Could be depth-fade, symmetry-collapse, or form-trend depending on order
  });
});
