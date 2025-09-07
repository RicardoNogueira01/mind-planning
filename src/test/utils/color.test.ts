import { describe, it, expect } from 'vitest';
import { adjustBrightness } from '../../utils/color';

describe('adjustBrightness', () => {
  it('lightens a color when percent > 0', () => {
    const c = adjustBrightness('#000000', 10);
    expect(c).toBe('#1a1a1a');
  });
  it('darkens a color when percent < 0', () => {
    const c = adjustBrightness('#ffffff', -10);
    expect(c).toBe('#e6e6e6');
  });
  it('keeps within bounds 0..255', () => {
    expect(adjustBrightness('#010101', -10)).toBe('#000000');
    expect(adjustBrightness('#fefefe', 10)).toBe('#ffffff');
  });
});
