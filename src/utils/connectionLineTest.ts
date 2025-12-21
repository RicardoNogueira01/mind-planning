/**
 * Connection Line Collision Test Utility
 * 
 * This utility tests if connection lines pass through (collide with) nodes.
 * It samples points along each bezier curve and checks if any point
 * falls within a node's bounding box (excluding start and end nodes).
 */

interface Point {
    x: number;
    y: number;
}

interface NodeRect {
    id: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ConnectionTest {
    fromId: string;
    toId: string;
    collidesWithNodes: string[];
    collisionPoints: Point[];
}

/**
 * Parse a cubic bezier path string and extract control points
 */
function parseBezierPath(pathD: string): { start: Point; c1: Point; c2: Point; end: Point } | null {
    // Match: M x y C c1x c1y, c2x c2y, ex ey
    const match = pathD.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*C\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)\s*,\s*([\d.-]+)\s+([\d.-]+)/);

    if (!match) return null;

    return {
        start: { x: parseFloat(match[1]), y: parseFloat(match[2]) },
        c1: { x: parseFloat(match[3]), y: parseFloat(match[4]) },
        c2: { x: parseFloat(match[5]), y: parseFloat(match[6]) },
        end: { x: parseFloat(match[7]), y: parseFloat(match[8]) }
    };
}

/**
 * Calculate a point on a cubic bezier curve at parameter t (0-1)
 */
function bezierPoint(start: Point, c1: Point, c2: Point, end: Point, t: number): Point {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
        x: mt3 * start.x + 3 * mt2 * t * c1.x + 3 * mt * t2 * c2.x + t3 * end.x,
        y: mt3 * start.y + 3 * mt2 * t * c1.y + 3 * mt * t2 * c2.y + t3 * end.y
    };
}

/**
 * Check if a point is inside a rectangle (with some padding for the line width)
 */
function pointInRect(point: Point, rect: NodeRect, padding: number = 5): boolean {
    return point.x >= rect.left - padding &&
        point.x <= rect.right + padding &&
        point.y >= rect.top - padding &&
        point.y <= rect.bottom + padding;
}

/**
 * Get all node rectangles from the DOM
 */
function getNodeRects(): NodeRect[] {
    const nodeElements = document.querySelectorAll('[data-node-id]');
    const rects: NodeRect[] = [];

    nodeElements.forEach((el) => {
        const id = el.getAttribute('data-node-id');
        if (id) {
            const rect = el.getBoundingClientRect();
            // Get the canvas/container to calculate relative positions
            const container = document.querySelector('.mindmap-canvas, [class*="canvas"]');
            const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

            rects.push({
                id,
                left: rect.left - containerRect.left,
                right: rect.right - containerRect.left,
                top: rect.top - containerRect.top,
                bottom: rect.bottom - containerRect.top
            });
        }
    });

    return rects;
}

/**
 * Get all connection paths from the SVG
 */
function getConnectionPaths(): { fromId: string; toId: string; pathD: string }[] {
    const paths: { fromId: string; toId: string; pathD: string }[] = [];

    // Look for SVG paths with connection data
    const svgPaths = document.querySelectorAll('svg path[d]');

    svgPaths.forEach((path) => {
        const d = path.getAttribute('d');
        // Skip invisible/hitbox paths
        if (d && path.getAttribute('stroke') !== 'transparent') {
            // Try to find connection info from parent or data attributes
            const parent = path.closest('g');
            const dataFrom = parent?.getAttribute('data-from') || 'unknown';
            const dataTo = parent?.getAttribute('data-to') || 'unknown';

            paths.push({
                fromId: dataFrom,
                toId: dataTo,
                pathD: d
            });
        }
    });

    return paths;
}

/**
 * Test a single connection for collisions with nodes
 */
function testConnection(
    pathD: string,
    fromId: string,
    toId: string,
    nodeRects: NodeRect[],
    samples: number = 50
): ConnectionTest {
    const result: ConnectionTest = {
        fromId,
        toId,
        collidesWithNodes: [],
        collisionPoints: []
    };

    const bezier = parseBezierPath(pathD);
    if (!bezier) return result;

    // Sample points along the curve (skip very start and very end)
    for (let i = 1; i < samples - 1; i++) {
        const t = i / (samples - 1);
        const point = bezierPoint(bezier.start, bezier.c1, bezier.c2, bezier.end, t);

        // Check against each node (except from and to nodes)
        for (const nodeRect of nodeRects) {
            if (nodeRect.id === fromId || nodeRect.id === toId) continue;

            if (pointInRect(point, nodeRect)) {
                if (!result.collidesWithNodes.includes(nodeRect.id)) {
                    result.collidesWithNodes.push(nodeRect.id);
                }
                result.collisionPoints.push(point);
            }
        }
    }

    return result;
}

/**
 * Run the connection line collision test
 * Returns an object with test results
 */
export function runConnectionCollisionTest(): {
    passed: boolean;
    totalConnections: number;
    connectionsWithCollisions: number;
    details: ConnectionTest[];
    summary: string;
} {
    const nodeRects = getNodeRects();
    const connections = getConnectionPaths();

    const details: ConnectionTest[] = [];
    let connectionsWithCollisions = 0;

    for (const conn of connections) {
        const test = testConnection(conn.pathD, conn.fromId, conn.toId, nodeRects);
        details.push(test);

        if (test.collidesWithNodes.length > 0) {
            connectionsWithCollisions++;
        }
    }

    const passed = connectionsWithCollisions === 0;

    const summary = passed
        ? `✅ PASSED: All ${connections.length} connections are clear of nodes`
        : `❌ FAILED: ${connectionsWithCollisions} of ${connections.length} connections pass through nodes`;

    console.log(summary);
    if (!passed) {
        console.log('Collisions:', details.filter(d => d.collidesWithNodes.length > 0));
    }

    return {
        passed,
        totalConnections: connections.length,
        connectionsWithCollisions,
        details,
        summary
    };
}

/**
 * Visual test: highlights colliding paths in red
 */
export function visualizeCollisions(): void {
    const result = runConnectionCollisionTest();

    if (!result.passed) {
        // Highlight colliding paths
        const paths = document.querySelectorAll('svg path[d]');
        paths.forEach((path) => {
            const d = path.getAttribute('d');
            const hasCollision = result.details.some(
                detail => detail.collisionPoints.length > 0 && d?.includes(detail.fromId)
            );

            if (hasCollision) {
                (path as SVGPathElement).style.stroke = 'red';
                (path as SVGPathElement).style.strokeWidth = '5';
            }
        });
    }
}

// Expose to window for manual testing in browser console
if (typeof window !== 'undefined') {
    (window as any).runConnectionCollisionTest = runConnectionCollisionTest;
    (window as any).visualizeCollisions = visualizeCollisions;
}
