/**
 * getShapeStyles
 * Returns style primitives for a given node shape. Keep this function pure and unit-testable.
 */
export type ShapeType = 'circle' | 'hexagon' | 'rhombus' | 'pentagon' | 'ellipse' | 'connector' | 'default';

export interface ShapeStyles {
  borderRadius: string;
  width: number | 'auto';
  height: number | 'auto';
  clipPath: string;
}

export function getShapeStyles(shapeType: ShapeType, nodeWidth = 400): ShapeStyles {
  switch (shapeType) {
    case 'circle':
      return {
        borderRadius: '50%',
        width: 200,
        height: 200,
        clipPath: 'none',
      };
    case 'hexagon':
      return {
        borderRadius: '8px',
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        width: 200,
        height: 200,
      };
    case 'rhombus':
      return {
        borderRadius: '4px',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        width: 200,
        height: 200,
      };
    case 'pentagon':
      return {
        borderRadius: '8px',
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        width: 200,
        height: 200,
      };
    case 'ellipse':
      return {
        borderRadius: '50%',
        width: 200,
        height: 100,
        clipPath: 'none',
      };
    case 'connector':
      return {
        borderRadius: '40px',
        width: 200,
        height: 80,
        clipPath: 'none',
      };
    default:
      return {
        borderRadius: '16px',
        width: nodeWidth,
        height: 'auto',
        clipPath: 'none',
      };
  }
}
