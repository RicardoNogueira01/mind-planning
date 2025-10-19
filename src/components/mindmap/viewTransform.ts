import type { Rect } from './groupUtils';

export function computeZoomAndPanToRect(
  rect: Rect,
  viewportW: number,
  viewportH: number,
  padding = 80,
  minZoom = 0.5,
  maxZoom = 2
): { zoom: number; panX: number; panY: number } {
  const targetW = rect.width + padding * 2;
  const targetH = rect.height + padding * 2;
  const scaleX = viewportW / Math.max(1, targetW);
  const scaleY = viewportH / Math.max(1, targetH);
  const nextZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(scaleX, scaleY)));
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const panX = viewportW / 2 - centerX * nextZoom;
  const panY = viewportH / 2 - centerY * nextZoom;
  return { zoom: nextZoom, panX, panY };
}
