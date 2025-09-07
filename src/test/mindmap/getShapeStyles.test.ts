import { describe, it, expect } from 'vitest';
import { getShapeStyles } from '../../components/mindmap/getShapeStyles';

describe('getShapeStyles', () => {
  it('returns default styles for unknown shape', () => {
    const s = getShapeStyles('default', 500);
    expect(s.width).toBe(500);
    expect(s.height).toBe('auto');
    expect(s.clipPath).toBe('none');
  });

  it('circle has 200x200 and 50% radius', () => {
    const s = getShapeStyles('circle');
    expect(s.width).toBe(200);
    expect(s.height).toBe(200);
    expect(s.borderRadius).toBe('50%');
  });

  it('ellipse has 200x100', () => {
    const s = getShapeStyles('ellipse');
    expect(s.width).toBe(200);
    expect(s.height).toBe(100);
  });

  it('connector has 200x80 and rounded corners', () => {
    const s = getShapeStyles('connector');
    expect(s.width).toBe(200);
    expect(s.height).toBe(80);
    expect(s.borderRadius).toBe('40px');
  });
});
