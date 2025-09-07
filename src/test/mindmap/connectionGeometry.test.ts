import { describe, it, expect } from 'vitest';
import { computeBezierPath, getPerimeterPoint } from '../../components/mindmap/connectionGeometry';

const rect = (x: number, y: number, w: number, h: number) => ({ left: x, top: y, right: x + w, bottom: y + h });

describe('connectionGeometry', () => {
  it('computes perimeter points on right edge when target is to the right', () => {
    const r = rect(0, 0, 100, 50);
    const target = { x: 200, y: 25 };
    const p = getPerimeterPoint(r, target.x, target.y);
    expect(p.x).toBeCloseTo(100, 4);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThanOrEqual(50);
  });

  it('gives a valid bezier path between two rectangles', () => {
    const a = rect(0, 0, 100, 50);
    const b = rect(300, 120, 100, 50);
    const { d, start, end, label } = computeBezierPath(a, b);
    expect(d.startsWith('M ')).toBe(true);
    expect(start.x).toBeLessThan(end.x);
    expect(label.x).toBeGreaterThan(start.x);
    expect(label.x).toBeLessThan(end.x);
  });
});
