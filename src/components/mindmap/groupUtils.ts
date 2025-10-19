export const NODE_HALF_WIDTH = 75;   // approx node half width used in hit/bounds
export const NODE_HALF_HEIGHT = 25;  // approx node half height used in hit/bounds
export const GROUP_PADDING = 20;     // padding around nodes inside a group
export const MIN_GROUP_WIDTH = 520;  // minimum group width to keep drop target usable
export const MIN_GROUP_HEIGHT = 530; // minimum group height to keep drop target usable

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type NodeLike = { x: number; y: number };

// Compute a tight bounding box around given nodes with padding and enforce minimum size.
export function computeGroupBoundingBox(groupNodes: NodeLike[] | null | undefined): Rect | null {
  if (!Array.isArray(groupNodes) || groupNodes.length === 0) return null;
  const minX = Math.min(...groupNodes.map((n) => n.x - NODE_HALF_WIDTH));
  const maxX = Math.max(...groupNodes.map((n) => n.x + NODE_HALF_WIDTH));
  const minY = Math.min(...groupNodes.map((n) => n.y - NODE_HALF_HEIGHT));
  const maxY = Math.max(...groupNodes.map((n) => n.y + NODE_HALF_HEIGHT));

  const rawX = minX - GROUP_PADDING;
  const rawY = minY - GROUP_PADDING;
  const rawW = maxX - minX + GROUP_PADDING * 2;
  const rawH = maxY - minY + GROUP_PADDING * 2;

  // Enforce minimum size by expanding from center
  const centerX = rawX + rawW / 2;
  const centerY = rawY + rawH / 2;
  const width = Math.max(MIN_GROUP_WIDTH, rawW);
  const height = Math.max(MIN_GROUP_HEIGHT, rawH);
  const x = centerX - width / 2;
  const y = centerY - height / 2;

  return { x, y, width, height };
}

// Build a bounding box from a selection rectangle with minimum size enforcement
export function bboxFromSelectionRect(rect: Rect | null | undefined): Rect | null {
  if (!rect) return null;
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const width = Math.max(MIN_GROUP_WIDTH, rect.width);
  const height = Math.max(MIN_GROUP_HEIGHT, rect.height);
  const x = centerX - width / 2;
  const y = centerY - height / 2;
  return { x, y, width, height };
}
