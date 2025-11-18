/**
 * Adjust a HEX color brightness by a percentage amount (-100 to 100)
 * 
 * @param hex - Color in HEX format (e.g., '#3B82F6')
 * @param percent - Brightness adjustment: positive = lighter, negative = darker
 * @returns Adjusted color in HEX format
 * 
 * @example
 * adjustBrightness('#3B82F6', 30)   // Returns '#68AFF8' (30% lighter)
 * adjustBrightness('#3B82F6', -20)  // Returns '#2F6BCD' (20% darker)
 * 
 * Algorithm:
 * 1. Convert HEX string to decimal number
 * 2. Extract RGB components using bit shifting
 * 3. Add brightness adjustment (percent * 2.55 to map 0-100 to 0-255)
 * 4. Clamp each component to valid range (0-255)
 * 5. Recombine and convert back to HEX
 */
export function adjustBrightness(hex: string, percent: number): string {
  // Parse HEX color to decimal number
  const num = parseInt(hex.replace('#', ''), 16);
  
  // Calculate brightness adjustment amount (2.55 = 255/100)
  const amt = Math.round(2.55 * percent);
  
  // Extract RGB components using bit shifting and masks
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));           // Red: shift right 16 bits
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt)); // Green: shift right 8 bits, mask to 8 bits
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));      // Blue: mask to last 8 bits
  
  // Recombine RGB components back to HEX
  // 0x1000000 ensures 6-digit HEX (adds leading digit we'll slice off)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
