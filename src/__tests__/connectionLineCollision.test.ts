import { describe, it, expect, beforeAll } from 'vitest';
import { computeOrganicPath } from '../components/mindmap/connectionGeometry';

/**
 * Connection Line No-Collision Test
 * 
 * This test verifies that connection lines computed by computeOrganicPath
 * do not pass through sibling nodes when there are many children.
 * 
 * Test scenario: 24 children nodes in a radial layout around a central parent.
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

    // Match Bezier curve: M sx sy C c1x c1y, c2x c2y, ex ey
    const matchBz = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*C\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+)/);

    if (matchBz) {
        const start = { x: parseFloat(matchBz[1]), y: parseFloat(matchBz[2]) };
        const c1 = { x: parseFloat(matchBz[3]), y: parseFloat(matchBz[4]) };
        const c2 = { x: parseFloat(matchBz[5]), y: parseFloat(matchBz[6]) };
        const end = { x: parseFloat(matchBz[7]), y: parseFloat(matchBz[8]) };

        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            points.push(bezierPoint(start, c1, c2, end, t));
        }
    }

    return points;
}

function pointInRect(point: Point, rect: Rect): boolean {
    // Add small buffer explicitly to be safe
    const buffer = 2;
    return (
        point.x >= rect.left + buffer &&
        point.x <= rect.right - buffer &&
        point.y >= rect.top + buffer &&
        point.y <= rect.bottom - buffer
    );
}

function checkPathCollision(d: string, obstacleRects: Rect[]): boolean {
    const points = samplePathPoints(d, 50); // High sample count

    // Check points against all obstacles
    // Skip first/last few points to avoid collision with start/end node boundaries themselves
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

    const childRects: Rect[] = [];

    beforeAll(() => {
        // Radial star layout: 24 nodes in a circle
        // This tests the multi-directional exit logic (Top/Bottom/Left/Right)
        const count = 24;
        const radius = 350;
        const cx = 460; // Parent Center X (400+520)/2 = 460
        const cy = 500; // Parent Center Y (460+540)/2 = 500

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            childRects.push({
                left: x - 40, right: x + 40,
                top: y - 20, bottom: y + 20
            });
        }
    });

    it('should calculate paths without collisions in radial layout', () => {
        const collisions: number[] = [];

        // Helper to determine direction same as app logic
        const getDirection = (to: Rect): 'left' | 'right' | 'top' | 'bottom' => {
            const fromCx = (parentRect.left + parentRect.right) / 2;
            const fromCy = (parentRect.top + parentRect.bottom) / 2;
            const toCx = (to.left + to.right) / 2;
            const toCy = (to.top + to.bottom) / 2;
            const dx = toCx - fromCx;
            const dy = toCy - fromCy;
            if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
            return dy > 0 ? 'bottom' : 'top';
        };

        for (let i = 0; i < childRects.length; i++) {
            const child = childRects[i];
            const direction = getDirection(child);
            const siblings = childRects.filter(c => getDirection(c) === direction);

            // Siblings sort logic matching App
            siblings.sort((a, b) => {
                if (direction === 'left' || direction === 'right') return a.top - b.top;
                return a.left - b.left;
            });

            const index = siblings.indexOf(child);

            const result = computeOrganicPath(parentRect, child, {
                childIndex: index,
                totalChildren: siblings.length,
                direction
            });

            // Iterate ALL OTHER children for collision check
            const others = childRects.filter((_, idx) => idx !== i);
            if (checkPathCollision(result.d, others)) {
                collisions.push(i);
            }
        }

        if (collisions.length > 0) {
            console.log('Collisions detected for child indices:', collisions);
        }

        expect(collisions.length).toBe(0);
    });
});
