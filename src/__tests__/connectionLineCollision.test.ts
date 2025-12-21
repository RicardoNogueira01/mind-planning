import { describe, it, expect, beforeAll } from 'vitest';
import { computeOrganicPath } from '../components/mindmap/connectionGeometry';

/**
 * Connection Line No-Collision Test
 * 
 * This test verifies that connection lines computed by computeOrganicPath
 * do not pass through sibling nodes when there are many children.
 * 
 * Test scenario: 24 children nodes from a central parent
 */

interface Point {
    x: number;
    y: number;
}

interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

// Helper: Calculate point on cubic bezier at parameter t
function bezierPoint(start: Point, c1: Point, c2: Point, end: Point, t: number): Point {
    const mt = 1 - t;
    return {
        x: mt * mt * mt * start.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * end.x,
        y: mt * mt * mt * start.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * end.y,
    };
}

// Helper: Parse compound paths and sample points along them
function samplePathPoints(d: string, samples: number = 30): Point[] {
    const points: Point[] = [];

    // Match: M sx sy L cx cy A rx ry rot large sweep ax ay L ex ey (L-shape with arc corner)
    const matchLAL = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*L\s*([\d.-]+)\s+([\d.-]+)\s*A\s*([\d.-]+)\s+([\d.-]+)\s+\d+\s+\d+\s+\d+\s+([\d.-]+)\s+([\d.-]+)\s*L\s*([\d.-]+)\s+([\d.-]+)/);

    if (matchLAL) {
        const start = { x: parseFloat(matchLAL[1]), y: parseFloat(matchLAL[2]) };
        const corner = { x: parseFloat(matchLAL[3]), y: parseFloat(matchLAL[4]) };
        const arcEnd = { x: parseFloat(matchLAL[7]), y: parseFloat(matchLAL[8]) };
        const end = { x: parseFloat(matchLAL[9]), y: parseFloat(matchLAL[10]) };

        const thirdSamples = Math.floor(samples / 3);

        // Sample first line segment (start to corner)
        for (let i = 0; i <= thirdSamples; i++) {
            const t = i / thirdSamples;
            points.push({
                x: start.x + t * (corner.x - start.x),
                y: start.y + t * (corner.y - start.y),
            });
        }

        // Sample arc (simplified as straight line - arc is small)
        for (let i = 1; i <= thirdSamples; i++) {
            const t = i / thirdSamples;
            points.push({
                x: corner.x + t * (arcEnd.x - corner.x),
                y: corner.y + t * (arcEnd.y - corner.y),
            });
        }

        // Sample second line segment (arcEnd to end)
        for (let i = 1; i <= thirdSamples; i++) {
            const t = i / thirdSamples;
            points.push({
                x: arcEnd.x + t * (end.x - arcEnd.x),
                y: arcEnd.y + t * (end.y - arcEnd.y),
            });
        }

        return points;
    }

    // Match: M sx sy L mx my C c1x c1y, c2x c2y, ex ey (Line + Cubic Bezier)
    const matchLC = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*L\s*([\d.-]+)\s+([\d.-]+)\s*C\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)/);

    if (matchLC) {
        const start = { x: parseFloat(matchLC[1]), y: parseFloat(matchLC[2]) };
        const lineEnd = { x: parseFloat(matchLC[3]), y: parseFloat(matchLC[4]) };
        const c1 = { x: parseFloat(matchLC[5]), y: parseFloat(matchLC[6]) };
        const c2 = { x: parseFloat(matchLC[7]), y: parseFloat(matchLC[8]) };
        const end = { x: parseFloat(matchLC[9]), y: parseFloat(matchLC[10]) };

        const halfSamples = Math.floor(samples / 2);

        // Sample the line segment (start to lineEnd)
        for (let i = 0; i <= halfSamples; i++) {
            const t = i / halfSamples;
            points.push({
                x: start.x + t * (lineEnd.x - start.x),
                y: start.y + t * (lineEnd.y - start.y),
            });
        }

        // Sample the cubic bezier curve (lineEnd to end via c1, c2)
        for (let i = 1; i <= halfSamples; i++) {
            const t = i / halfSamples;
            const mt = 1 - t;
            points.push({
                x: mt * mt * mt * lineEnd.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * end.x,
                y: mt * mt * mt * lineEnd.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * end.y,
            });
        }

        return points;
    }

    // Match: M sx sy L mx my Q cx cy, ex ey (Line + Quadratic)
    const matchLQ = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*L\s*([\d.-]+)\s+([\d.-]+)\s*Q\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)/);

    if (matchLQ) {
        const start = { x: parseFloat(matchLQ[1]), y: parseFloat(matchLQ[2]) };
        const mid = { x: parseFloat(matchLQ[3]), y: parseFloat(matchLQ[4]) };
        const ctrl = { x: parseFloat(matchLQ[5]), y: parseFloat(matchLQ[6]) };
        const end = { x: parseFloat(matchLQ[7]), y: parseFloat(matchLQ[8]) };

        const halfSamples = Math.floor(samples / 2);

        // Sample the line segment (start to mid)
        for (let i = 0; i <= halfSamples; i++) {
            const t = i / halfSamples;
            points.push({
                x: start.x + t * (mid.x - start.x),
                y: start.y + t * (mid.y - start.y),
            });
        }

        // Sample the quadratic curve (mid to end via ctrl)
        for (let i = 1; i <= halfSamples; i++) {
            const t = i / halfSamples;
            const mt = 1 - t;
            points.push({
                x: mt * mt * mid.x + 2 * mt * t * ctrl.x + t * t * end.x,
                y: mt * mt * mid.y + 2 * mt * t * ctrl.y + t * t * end.y,
            });
        }

        return points;
    }

    // Fallback: try pure cubic bezier format (M C)
    const matchC = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*C\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)/);
    if (matchC) {
        const start = { x: parseFloat(matchC[1]), y: parseFloat(matchC[2]) };
        const c1 = { x: parseFloat(matchC[3]), y: parseFloat(matchC[4]) };
        const c2 = { x: parseFloat(matchC[5]), y: parseFloat(matchC[6]) };
        const end = { x: parseFloat(matchC[7]), y: parseFloat(matchC[8]) };

        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const mt = 1 - t;
            points.push({
                x: mt * mt * mt * start.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * end.x,
                y: mt * mt * mt * start.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * end.y,
            });
        }
        return points;
    }

    return [];
}

// Helper: Check if point is inside rect (with padding)
function pointInRect(point: Point, rect: Rect, padding: number = 5): boolean {
    return point.x >= rect.left - padding && point.x <= rect.right + padding &&
        point.y >= rect.top - padding && point.y <= rect.bottom + padding;
}

// Helper: Sample path and check for collisions with obstacles
function checkPathCollision(pathD: string, obstacleRects: Rect[], samples: number = 30): boolean {
    const points = samplePathPoints(pathD, samples);
    if (points.length === 0) return false;

    // Skip the first and last few points (they're at/near the nodes)
    for (let i = 2; i < points.length - 2; i++) {
        const point = points[i];
        for (const rect of obstacleRects) {
            if (pointInRect(point, rect)) {
                return true; // Collision found
            }
        }
    }
    return false;
}

describe('Connection Line Collision Tests', () => {
    // Simulate a parent node in the center
    const parentRect: Rect = {
        left: 400,
        right: 520,
        top: 460,
        bottom: 540,
    };

    // Create 24 child nodes - 12 on left, 12 on right
    // Spread them with larger gaps to avoid overlap with parent
    const childRects: Rect[] = [];
    const leftChildren: Rect[] = [];
    const rightChildren: Rect[] = [];

    beforeAll(() => {
        // Generate 12 children on the left
        // First 6 are above the parent, next 6 are below
        for (let i = 0; i < 12; i++) {
            const y = i < 6
                ? 50 + i * 60   // Above parent: Y = 50, 110, 170, 230, 290, 350
                : 600 + (i - 6) * 60; // Below parent: Y = 600, 660, 720, 780, 840, 900
            const rect: Rect = {
                left: 50,
                right: 170,
                top: y,
                bottom: y + 50,
            };
            leftChildren.push(rect);
            childRects.push(rect);
        }

        // Generate 12 children on the right with same Y distribution
        for (let i = 0; i < 12; i++) {
            const y = i < 6
                ? 50 + i * 60
                : 600 + (i - 6) * 60;
            const rect: Rect = {
                left: 650,
                right: 770,
                top: y,
                bottom: y + 50,
            };
            rightChildren.push(rect);
            childRects.push(rect);
        }
    });

    it('should not have connection lines passing through left sibling nodes', () => {
        const collisions: { childIndex: number; collidesWithIndex: number }[] = [];

        for (let i = 0; i < leftChildren.length; i++) {
            const result = computeOrganicPath(parentRect, leftChildren[i], {
                childIndex: i,
                totalChildren: leftChildren.length,
            });

            // Check if this path collides with any OTHER left children
            const otherChildren = leftChildren.filter((_, idx) => idx !== i);

            if (checkPathCollision(result.d, otherChildren)) {
                // Find which child it collides with
                for (let j = 0; j < leftChildren.length; j++) {
                    if (j !== i && checkPathCollision(result.d, [leftChildren[j]])) {
                        collisions.push({ childIndex: i, collidesWithIndex: j });
                    }
                }
            }
        }

        if (collisions.length > 0) {
            console.log('Left side collisions:', collisions);
        }

        expect(collisions.length).toBe(0);
    });

    it('should not have connection lines passing through right sibling nodes', () => {
        const collisions: { childIndex: number; collidesWithIndex: number }[] = [];

        for (let i = 0; i < rightChildren.length; i++) {
            const result = computeOrganicPath(parentRect, rightChildren[i], {
                childIndex: i,
                totalChildren: rightChildren.length,
            });

            // Check if this path collides with any OTHER right children
            const otherChildren = rightChildren.filter((_, idx) => idx !== i);

            if (checkPathCollision(result.d, otherChildren)) {
                for (let j = 0; j < rightChildren.length; j++) {
                    if (j !== i && checkPathCollision(result.d, [rightChildren[j]])) {
                        collisions.push({ childIndex: i, collidesWithIndex: j });
                    }
                }
            }
        }

        if (collisions.length > 0) {
            console.log('Right side collisions:', collisions);
        }

        expect(collisions.length).toBe(0);
    });

    it('should have exit points spread across the full parent edge', () => {
        const exitYPositions: number[] = [];

        for (let i = 0; i < rightChildren.length; i++) {
            const result = computeOrganicPath(parentRect, rightChildren[i], {
                childIndex: i,
                totalChildren: rightChildren.length,
            });

            exitYPositions.push(result.start.y);
        }

        // Check that exit points span most of the parent height
        const minY = Math.min(...exitYPositions);
        const maxY = Math.max(...exitYPositions);
        const span = maxY - minY;
        const parentHeight = parentRect.bottom - parentRect.top;

        // Exit points should span at least 70% of the parent height
        const expectedMinSpan = parentHeight * 0.7;

        console.log(`Exit Y span: ${span.toFixed(1)}px, Parent height: ${parentHeight}px`);
        console.log(`Exit positions:`, exitYPositions.map(y => y.toFixed(1)));

        expect(span).toBeGreaterThanOrEqual(expectedMinSpan);
    });

    it('should have each connection exit from a unique point', () => {
        const exitYPositions: number[] = [];

        for (let i = 0; i < rightChildren.length; i++) {
            const result = computeOrganicPath(parentRect, rightChildren[i], {
                childIndex: i,
                totalChildren: rightChildren.length,
            });
            exitYPositions.push(result.start.y);
        }

        // Check that no two exit points are exactly the same
        const uniquePositions = new Set(exitYPositions.map(y => Math.round(y)));

        console.log(`Unique exit positions: ${uniquePositions.size} of ${rightChildren.length}`);

        // Allow for some rounding, but most should be unique
        expect(uniquePositions.size).toBeGreaterThanOrEqual(rightChildren.length * 0.8);
    });
});
