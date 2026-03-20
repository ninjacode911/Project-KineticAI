import { describe, it, expect } from 'vitest';
import { calculateAngle, calculateAngle3D } from '@/lib/utils/math';
import type { Landmark } from '@/types/pose';

function lm(x: number, y: number, z = 0): Landmark {
  return { x, y, z, visibility: 1 };
}

describe('calculateAngle', () => {
  it('returns 90° for a right angle', () => {
    const angle = calculateAngle(lm(0, 1), lm(0, 0), lm(1, 0));
    expect(Math.round(angle)).toBe(90);
  });

  it('returns 180° for a straight line', () => {
    const angle = calculateAngle(lm(-1, 0), lm(0, 0), lm(1, 0));
    expect(Math.round(angle)).toBe(180);
  });

  it('returns 0° for overlapping vectors', () => {
    const angle = calculateAngle(lm(1, 0), lm(0, 0), lm(1, 0));
    expect(Math.round(angle)).toBe(0);
  });

  it('returns 0° when magnitude is zero', () => {
    const angle = calculateAngle(lm(0, 0), lm(0, 0), lm(1, 0));
    expect(angle).toBe(0);
  });

  it('handles 45° correctly', () => {
    const angle = calculateAngle(lm(0, 1), lm(0, 0), lm(1, 1));
    expect(Math.round(angle)).toBe(45);
  });
});

describe('calculateAngle3D', () => {
  it('returns 90° for a right angle in 3D', () => {
    const angle = calculateAngle3D(lm(0, 1, 0), lm(0, 0, 0), lm(1, 0, 0));
    expect(Math.round(angle)).toBe(90);
  });

  it('returns 90° with z-axis involvement', () => {
    const angle = calculateAngle3D(lm(0, 0, 1), lm(0, 0, 0), lm(1, 0, 0));
    expect(Math.round(angle)).toBe(90);
  });

  it('3D and 2D differ for non-planar points', () => {
    // a has z=1 which makes it offset from c in 3D but collinear in 2D projection
    const a = lm(1, 0, 1);
    const b = lm(0, 0, 0);
    const c = lm(1, 0, 0);
    const angle2D = calculateAngle(a, b, c);
    const angle3D = calculateAngle3D(a, b, c);
    // 2D: BA=(1,0), BC=(1,0) → 0°; 3D: BA=(1,0,1), BC=(1,0,0) → 45°
    expect(Math.round(angle2D)).toBe(0);
    expect(Math.round(angle3D)).toBe(45);
  });
});
