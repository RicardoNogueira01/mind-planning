/**
 * Centralized type definitions for Mind Map
 */

export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  bgColor?: string;
  fontColor?: string;
  color?: string;
  completed?: boolean;
  tags?: string[];
  attachments?: Attachment[];
  notes?: string;
  collaboratorId?: string;
  emoji?: string;
  shapeType?: string;
  startDate?: string;
  dueDate?: string;
}

export interface Attachment {
  id: string;
  name: string;
  dateAdded: string;
  addedBy: string;
  type: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  nodeId: string | null;
  offset: Position;
}

export interface PanState {
  x: number;
  y: number;
  isDragging: boolean;
  startX: number;
  startY: number;
}
