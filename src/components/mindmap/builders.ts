type Node = { id: string; text: string; x: number; y: number; color?: string; backgroundColor?: string; fontColor?: string; shapeType?: string; _justAdded?: boolean };
type Conn = { id: string; from: string; to: string; label?: string };

let idCounter = 0;
export function genId(prefix = 'n') { idCounter += 1; return `${prefix}-${idCounter}`; }

export function buildShapedNode(x: number, y: number, shapeType: string, baseColor: string, label = ''): Node {
  return { id: genId('node'), text: label, x, y, backgroundColor: baseColor, color: baseColor, shapeType, _justAdded: true };
}

export const shapeBuilders: Record<string, (x: number, y: number, getColor: (type: string) => string) => { nodes: Node[]; connections: Conn[]; mainId: string } > = {
  circle: (x, y, getColor) => {
    const color = getColor('circle') || '#3B82F6';
    const start = buildShapedNode(x, y, 'circle', color, 'Start');
    const first = buildShapedNode(x + 240, y, 'connector', '#6B7280', 'First step');
    const conn: Conn = { id: genId('conn'), from: start.id, to: first.id, label: '' };
    return { nodes: [start, first], connections: [conn], mainId: start.id };
  },
  hexagon: (x, y, getColor) => {
    const color = getColor('hexagon') || '#10B981';
    const action = buildShapedNode(x, y, 'hexagon', color, 'Action');
    const ok = buildShapedNode(x + 280, y - 120, 'connector', '#6B7280', 'Success');
    const ko = buildShapedNode(x + 280, y + 120, 'connector', '#6B7280', 'Failure');
    const c1: Conn = { id: genId('conn'), from: action.id, to: ok.id, label: 'Success' };
    const c2: Conn = { id: genId('conn'), from: action.id, to: ko.id, label: 'Failure' };
    return { nodes: [action, ok, ko], connections: [c1, c2], mainId: action.id };
  },
  rhombus: (x, y, getColor) => {
    const color = getColor('rhombus') || '#F59E0B';
    const ifNode = buildShapedNode(x, y, 'rhombus', color, 'If condition');
    const t = buildShapedNode(x + 420, y - 120, 'connector', '#6B7280', 'True');
    const f = buildShapedNode(x + 420, y + 120, 'connector', '#6B7280', 'False');
    const c1: Conn = { id: genId('conn'), from: ifNode.id, to: t.id, label: 'True' };
    const c2: Conn = { id: genId('conn'), from: ifNode.id, to: f.id, label: 'False' };
    return { nodes: [ifNode, t, f], connections: [c1, c2], mainId: ifNode.id };
  },
  pentagon: (x, y, getColor) => {
    const color = getColor('pentagon') || '#EF4444';
    const sw = buildShapedNode(x, y, 'pentagon', color, 'Switch');
    const c1 = buildShapedNode(x + 360, y - 140, 'connector', '#6B7280', 'Case 1');
    const c2 = buildShapedNode(x + 360, y + 0, 'connector', '#6B7280', 'Case 2');
    const c3 = buildShapedNode(x + 360, y + 140, 'connector', '#6B7280', 'Otherwise');
    const e1: Conn = { id: genId('conn'), from: sw.id, to: c1.id, label: 'Case 1' };
    const e2: Conn = { id: genId('conn'), from: sw.id, to: c2.id, label: 'Case 2' };
    const e3: Conn = { id: genId('conn'), from: sw.id, to: c3.id, label: 'Otherwise' };
    return { nodes: [sw, c1, c2, c3], connections: [e1, e2, e3], mainId: sw.id };
  },
  ellipse: (x, y, getColor) => {
    const color = getColor('ellipse') || '#8B5CF6';
    const loop = buildShapedNode(x, y, 'ellipse', color, 'Loop');
    const body = buildShapedNode(x + 320, y, 'connector', '#6B7280', 'Body');
    const exit = buildShapedNode(x + 520, y + 0, 'connector', '#6B7280', 'Exit');
    const e1: Conn = { id: genId('conn'), from: loop.id, to: body.id, label: 'True' };
    const e2: Conn = { id: genId('conn'), from: loop.id, to: exit.id, label: 'False' };
    return { nodes: [loop, body, exit], connections: [e1, e2], mainId: loop.id };
  },
  connector: (x, y, getColor) => {
    const color = getColor('connector') || '#6B7280';
    const connNode = buildShapedNode(x, y, 'connector', color, 'Connector');
    return { nodes: [connNode], connections: [], mainId: connNode.id };
  },
};
