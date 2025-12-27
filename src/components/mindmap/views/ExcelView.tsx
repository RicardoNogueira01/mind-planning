import React, { useState, useMemo, useRef, useCallback, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Table2, Download, Upload, Copy, Clipboard, Search, Filter, Plus, Trash2, ChevronDown, HelpCircle, X } from 'lucide-react';

// Types
interface Collaborator {
    id: string;
    name?: string;
    initials?: string;
    color?: string;
}

interface AssigneeOption {
    value: string;
    label: string;
    initials?: string;
    color?: string;
}

interface ColumnOption {
    value: string;
    label: string;
}

interface Column {
    id: string;
    label: string;
    width: number;
    type: 'text' | 'select' | 'date' | 'number' | 'tags' | 'relationship';
    editable: boolean;
    options?: ColumnOption[];
}

interface Connection {
    from: string;
    to: string;
}

interface NodeData {
    id: string;
    text?: string;
    x?: number;
    y?: number;
    bgColor?: string;
    fontColor?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    progress?: number;
    sprint?: string;
    tags?: string[];
    notes?: string;
    collaborators?: string[];
    [key: string]: unknown;
}

interface SelectedCell {
    rowId: string;
    colId: string;
}

interface EditingCell {
    rowId: string;
    colId: string;
    value: string;
}

interface CopiedCells {
    rowId: string;
    colId: string;
    value: unknown;
}

interface SortConfig {
    column: string | null;
    direction: 'asc' | 'desc';
}

interface RelationshipInfo {
    type: 'orphan' | 'root' | 'leaf' | 'branch';
    parent: { id: string; name: string } | null;
    children: { id: string; name: string }[];
    siblings: { id: string; name: string }[];
}

interface ExcelViewProps {
    nodes: NodeData[];
    connections?: Connection[];
    onNodeUpdate?: (nodeId: string, updates: Partial<NodeData>) => void;
    onNodesChange?: (updateFn: (nodes: NodeData[]) => NodeData[]) => void;
    collaborators?: Collaborator[];
}

type FormulaValue = number | string | boolean | unknown[] | null;
type FormulaFunction = (args: FormulaValue[][]) => FormulaValue;

const ExcelView: React.FC<ExcelViewProps> = ({ nodes, connections, onNodeUpdate, onNodesChange, collaborators = [] }) => {
    const assigneeOptions: AssigneeOption[] = useMemo(() => {
        if (collaborators && collaborators.length > 0) {
            return collaborators.map(c => ({
                value: c.id,
                label: c.name || c.id,
                initials: c.initials,
                color: c.color
            }));
        }
        return [];
    }, [collaborators]);

    const columns: Column[] = useMemo(() => [
        { id: 'id', label: 'ID', width: 80, type: 'text', editable: false },
        { id: 'text', label: 'Task Name', width: 200, type: 'text', editable: true },
        { id: 'relationship', label: 'Hierarchy', width: 220, type: 'relationship', editable: false },
        {
            id: 'status', label: 'Status', width: 140, type: 'select', editable: true, options: [
                { value: 'not-started', label: 'Not Started' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: '✓ Completed' }
            ]
        },
        {
            id: 'priority', label: 'Priority', width: 120, type: 'select', editable: true, options: [
                { value: 'low', label: '🟢 Low' },
                { value: 'medium', label: '🟡 Medium' },
                { value: 'high', label: '🔴 High' }
            ]
        },
        { id: 'startDate', label: 'Start Date', width: 140, type: 'date', editable: true },
        { id: 'dueDate', label: 'Due Date', width: 140, type: 'date', editable: true },
        { id: 'progress', label: 'Progress', width: 100, type: 'number', editable: true },
        { id: 'sprint', label: 'Sprint', width: 100, type: 'text', editable: true },
        { id: 'tags', label: 'Tags', width: 150, type: 'tags', editable: true },
        { id: 'notes', label: 'Notes', width: 250, type: 'text', editable: true },
        { id: 'assignee', label: 'Assignee', width: 140, type: 'select', editable: true, options: assigneeOptions as ColumnOption[] },
    ], [assigneeOptions]);

    const getNodeRelationship = useCallback((node: NodeData): RelationshipInfo => {
        if (!connections || connections.length === 0) {
            return { type: 'orphan', parent: null, children: [], siblings: [] };
        }
        const parentConnection = connections.find(c => c.to === node.id);
        const parentNode = parentConnection ? nodes.find(n => n.id === parentConnection.from) : null;
        const childConnections = connections.filter(c => c.from === node.id);
        const childNodes = childConnections.map(c => nodes.find(n => n.id === c.to)).filter(Boolean) as NodeData[];
        let siblingNodes: NodeData[] = [];
        if (parentConnection) {
            const siblingConnections = connections.filter(c => c.from === parentConnection.from && c.to !== node.id);
            siblingNodes = siblingConnections.map(c => nodes.find(n => n.id === c.to)).filter(Boolean) as NodeData[];
        }
        let type: 'orphan' | 'root' | 'leaf' | 'branch' = 'orphan';
        if (!parentNode && childNodes.length > 0) type = 'root';
        else if (parentNode && childNodes.length === 0) type = 'leaf';
        else if (parentNode && childNodes.length > 0) type = 'branch';
        return {
            type,
            parent: parentNode ? { id: parentNode.id, name: parentNode.text || '' } : null,
            children: childNodes.map(c => ({ id: c.id, name: c.text || '' })),
            siblings: siblingNodes.map(s => ({ id: s.id, name: s.text || '' }))
        };
    }, [connections, nodes]);

    const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' });
    const [showFormulas, setShowFormulas] = useState<boolean>(false);
    const [formulaBarValue, setFormulaBarValue] = useState<string>('');
    const [copiedCells, setCopiedCells] = useState<CopiedCells | null>(null);
    const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

    const tableRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

    const parseCellReference = useCallback((ref: string): { colIndex: number; rowIndex: number } | null => {
        const match = ref.match(/^([A-Z]+)(\d+)$/i);
        if (!match) return null;
        const colLetters = match[1].toUpperCase();
        let colIndex = 0;
        for (let i = 0; i < colLetters.length; i++) {
            colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colIndex--;
        const rowIndex = parseInt(match[2], 10) - 1;
        return { colIndex, rowIndex };
    }, []);

    const getCellValue = useCallback((ref: string, rows: NodeData[]): FormulaValue => {
        const parsed = parseCellReference(ref);
        if (!parsed) return null;
        const { colIndex, rowIndex } = parsed;
        if (rowIndex < 0 || rowIndex >= rows.length) return null;
        if (colIndex < 0 || colIndex >= columns.length) return null;
        const node = rows[rowIndex];
        const column = columns[colIndex];
        const value = node[column.id];
        const numValue = parseFloat(String(value));
        return isNaN(numValue) ? value as FormulaValue : numValue;
    }, [columns, parseCellReference]);

    const parseRange = useCallback((range: string, rows: NodeData[]): FormulaValue[] => {
        const parts = range.split(':');
        if (parts.length !== 2) return [getCellValue(range, rows)];
        const start = parseCellReference(parts[0]);
        const end = parseCellReference(parts[1]);
        if (!start || !end) return [];
        const values: FormulaValue[] = [];
        for (let row = start.rowIndex; row <= end.rowIndex; row++) {
            for (let col = start.colIndex; col <= end.colIndex; col++) {
                if (row >= 0 && row < rows.length && col >= 0 && col < columns.length) {
                    const node = rows[row];
                    const column = columns[col];
                    const value = node[column.id];
                    const numValue = parseFloat(String(value));
                    values.push(isNaN(numValue) ? value as FormulaValue : numValue);
                }
            }
        }
        return values;
    }, [columns, parseCellReference, getCellValue]);

    const formulaFunctions: Record<string, FormulaFunction> = useMemo(() => ({
        SUM: (args) => (args.flat().filter(v => typeof v === 'number') as number[]).reduce((a, b) => a + b, 0),
        AVERAGE: (args) => { const nums = args.flat().filter(v => typeof v === 'number') as number[]; return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; },
        COUNT: (args) => args.flat().filter(v => typeof v === 'number').length,
        COUNTA: (args) => args.flat().filter(v => v !== null && v !== undefined && v !== '').length,
        MIN: (args) => Math.min(...(args.flat().filter(v => typeof v === 'number') as number[])),
        MAX: (args) => Math.max(...(args.flat().filter(v => typeof v === 'number') as number[])),
        ROUND: (args) => { const [num, decimals = 0] = args.flat() as number[]; return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals); },
        ABS: (args) => Math.abs((args.flat()[0] as number) || 0),
        SQRT: (args) => Math.sqrt((args.flat()[0] as number) || 0),
        UPPER: (args) => String(args.flat()[0] || '').toUpperCase(),
        LOWER: (args) => String(args.flat()[0] || '').toLowerCase(),
        LEN: (args) => String(args.flat()[0] || '').length,
        CONCAT: (args) => args.flat().map(v => String(v || '')).join(''),
        TRIM: (args) => String(args.flat()[0] || '').trim(),
        IF: (args) => { const [condition, trueVal, falseVal] = args.flat(); return condition ? trueVal : falseVal; },
        AND: (args) => args.flat().every(v => Boolean(v)),
        OR: (args) => args.flat().some(v => Boolean(v)),
        NOT: (args) => !args.flat()[0],
        TODAY: () => new Date().toISOString().split('T')[0],
        NOW: () => new Date().toISOString(),
        YEAR: (args) => new Date(String(args.flat()[0])).getFullYear(),
        MONTH: (args) => new Date(String(args.flat()[0])).getMonth() + 1,
        DAY: (args) => new Date(String(args.flat()[0])).getDate(),
        ISNUMBER: (args) => typeof args.flat()[0] === 'number',
        ISTEXT: (args) => typeof args.flat()[0] === 'string',
        ISBLANK: (args) => { const val = args.flat()[0]; return val === null || val === undefined || val === ''; },
    }), []);

    const evaluateFormula = useCallback((formula: string | unknown, rows: NodeData[]): FormulaValue => {
        if (!formula || typeof formula !== 'string' || !formula.startsWith('=')) return formula as FormulaValue;
        try {
            const expr = formula.substring(1).trim();
            const funcMatch = expr.match(/^([A-Z]+)\((.*)\)$/i);
            if (funcMatch) {
                const funcName = funcMatch[1].toUpperCase();
                const argsStr = funcMatch[2];
                if (formulaFunctions[funcName]) {
                    const args: string[] = [];
                    let depth = 0, current = '';
                    for (let i = 0; i < argsStr.length; i++) {
                        const char = argsStr[i];
                        if (char === '(') depth++;
                        else if (char === ')') depth--;
                        else if (char === ',' && depth === 0) { args.push(current.trim()); current = ''; continue; }
                        current += char;
                    }
                    if (current.trim()) args.push(current.trim());
                    const evaluatedArgs = args.map(arg => {
                        if (arg.includes(':')) return parseRange(arg, rows);
                        if (/^[A-Z]+\d+$/i.test(arg)) return getCellValue(arg, rows);
                        if (/^[A-Z]+\(/.test(arg)) return evaluateFormula('=' + arg, rows);
                        if (/^["'].*["']$/.test(arg)) return arg.slice(1, -1);
                        const num = parseFloat(arg);
                        return isNaN(num) ? arg : num;
                    });
                    return formulaFunctions[funcName](evaluatedArgs as FormulaValue[][]);
                }
            }
            if (/^[A-Z]+\d+$/i.test(expr)) return getCellValue(expr, rows);
            return formula;
        } catch { return '#ERROR!'; }
    }, [formulaFunctions, getCellValue, parseRange]);

    const getColumnLetter = (index: number): string => {
        let letter = '';
        while (index >= 0) { letter = String.fromCharCode(65 + (index % 26)) + letter; index = Math.floor(index / 26) - 1; }
        return letter;
    };

    const processedRows = useMemo(() => {
        let rows = [...nodes];
        if (searchQuery) rows = rows.filter(node => Object.values(node).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase())));
        if (sortConfig.column) {
            rows.sort((a, b) => {
                const aVal = (a[sortConfig.column!] ?? '') as string | number;
                const bVal = (b[sortConfig.column!] ?? '') as string | number;
                if (typeof aVal === 'number' && typeof bVal === 'number') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return rows;
    }, [nodes, searchQuery, sortConfig]);

    const handleCellClick = (rowId: string, colId: string): void => {
        setSelectedCell({ rowId, colId });
        const node = nodes.find(n => n.id === rowId);
        const value = node ? (node[colId] ?? '') : '';
        setFormulaBarValue(Array.isArray(value) ? value.join(', ') : String(value));
    };

    const handleCellDoubleClick = (rowId: string, colId: string): void => {
        const column = columns.find(c => c.id === colId);
        if (!column?.editable) return;
        const node = nodes.find(n => n.id === rowId);
        let value: unknown;
        if (colId === 'assignee') {
            const collabIds = Array.isArray(node?.collaborators) ? node.collaborators : [];
            value = collabIds.length > 0 ? collabIds[0] : '';
        } else { value = node ? (node[colId] ?? '') : ''; }
        setEditingCell({ rowId, colId, value: Array.isArray(value) ? value.join(', ') : String(value) });
    };

    const handleCellChange = useCallback((rowId: string, colId: string, value: string): void => {
        const column = columns.find(c => c.id === colId);
        if (colId === 'assignee') {
            if (onNodesChange) {
                onNodesChange(prev => prev.map(n => {
                    if (n.id !== rowId) return n;
                    const existingCollabs = Array.isArray(n.collaborators) ? n.collaborators : [];
                    if (!value) return { ...n, collaborators: [] };
                    if (existingCollabs.includes(value)) return n;
                    return { ...n, collaborators: [value, ...existingCollabs.filter(id => id !== value)] };
                }));
            }
            return;
        }
        let parsedValue: unknown = value;
        if (column?.type === 'number') parsedValue = parseFloat(value) || 0;
        else if (column?.type === 'tags') parsedValue = value.split(',').map(t => t.trim()).filter(t => t);
        if (onNodeUpdate) onNodeUpdate(rowId, { [colId]: parsedValue });
        else if (onNodesChange) onNodesChange(prev => prev.map(n => n.id === rowId ? { ...n, [colId]: parsedValue } : n));
    }, [columns, onNodeUpdate, onNodesChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (editingCell) { if (e.key === 'Escape') setEditingCell(null); return; }
        if (!selectedCell) return;
        const currentRowIndex = processedRows.findIndex(r => r.id === selectedCell.rowId);
        const currentColIndex = columns.findIndex(c => c.id === selectedCell.colId);
        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); if (currentRowIndex > 0) setSelectedCell({ rowId: processedRows[currentRowIndex - 1].id, colId: selectedCell.colId }); break;
            case 'ArrowDown': e.preventDefault(); if (currentRowIndex < processedRows.length - 1) setSelectedCell({ rowId: processedRows[currentRowIndex + 1].id, colId: selectedCell.colId }); break;
            case 'ArrowLeft': e.preventDefault(); if (currentColIndex > 0) setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex - 1].id }); break;
            case 'ArrowRight': e.preventDefault(); if (currentColIndex < columns.length - 1) setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex + 1].id }); break;
            case 'Enter': case 'F2': { const column = columns.find(c => c.id === selectedCell.colId); if (column?.editable) { const node = nodes.find(n => n.id === selectedCell.rowId); const value = node ? (node[selectedCell.colId] ?? '') : ''; setEditingCell({ ...selectedCell, value: Array.isArray(value) ? value.join(', ') : String(value) }); } break; }
            case 'Tab': e.preventDefault(); if (currentColIndex < columns.length - 1) setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex + 1].id }); else if (currentRowIndex < processedRows.length - 1) setSelectedCell({ rowId: processedRows[currentRowIndex + 1].id, colId: columns[0].id }); break;
            case 'Delete': case 'Backspace': { const column = columns.find(c => c.id === selectedCell.colId); if (column?.editable) handleCellChange(selectedCell.rowId, selectedCell.colId, ''); break; }
            default: if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { const column = columns.find(c => c.id === selectedCell.colId); if (column?.editable) setEditingCell({ ...selectedCell, value: e.key }); } break;
        }
    }, [selectedCell, editingCell, processedRows, columns, nodes, handleCellChange]);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            const tagName = inputRef.current.tagName?.toUpperCase();
            if ((tagName === 'INPUT' || tagName === 'TEXTAREA') && 'select' in inputRef.current) (inputRef.current as HTMLInputElement).select();
        }
    }, [editingCell]);

    const handleSort = (columnId: string): void => { setSortConfig(prev => ({ column: columnId, direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc' })); };

    const exportToCSV = (): void => {
        const headers = columns.map(c => c.label).join(',');
        const rows = processedRows.map(node => columns.map(col => { const value = node[col.id]; if (Array.isArray(value)) return `"${value.join(';')}"`; if (typeof value === 'string' && value.includes(',')) return `"${value}"`; return value ?? ''; }).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `mindmap-export-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    };

    const importFromCSV = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text !== 'string') return;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const newNodes: NodeData[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
                const values = line.split(',');
                const node: NodeData = { id: `imported-${Date.now()}-${index}`, x: 100 + (index % 5) * 350, y: 100 + Math.floor(index / 5) * 150, bgColor: '#ffffff', fontColor: '#2d3748' };
                headers.forEach((header, i) => {
                    const col = columns.find(c => c.label.toLowerCase() === header || c.id === header);
                    if (col && col.id !== 'id') {
                        let value: unknown = values[i]?.trim().replace(/^"|"$/g, '');
                        if (col.type === 'tags') value = value ? String(value).split(';').map(t => t.trim()) : [];
                        else if (col.type === 'number') value = parseFloat(String(value)) || 0;
                        node[col.id] = value;
                    }
                });
                return node;
            });
            if (onNodesChange) onNodesChange(prev => [...prev, ...newNodes]);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleCopy = (): void => {
        if (!selectedCell) return;
        const node = nodes.find(n => n.id === selectedCell.rowId);
        const value = node?.[selectedCell.colId] ?? '';
        navigator.clipboard.writeText(String(value));
        setCopiedCells({ rowId: selectedCell.rowId, colId: selectedCell.colId, value });
    };

    const handlePaste = async (): Promise<void> => {
        if (!selectedCell) return;
        try { const text = await navigator.clipboard.readText(); handleCellChange(selectedCell.rowId, selectedCell.colId, text); } catch (err) { console.error('Failed to paste:', err); }
    };

    const formatCellValue = useCallback((node: NodeData, column: Column): string => {
        if (column.id === 'assignee') {
            const collabIds = Array.isArray(node.collaborators) ? node.collaborators : [];
            if (collabIds.length === 0) return '';
            const primaryCollabId = collabIds[0];
            const collab = collaborators.find(c => c.id === primaryCollabId);
            return collab ? collab.name || primaryCollabId : primaryCollabId;
        }
        const value = node[column.id];
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' && value.startsWith('=')) { if (showFormulas) return value; const result = evaluateFormula(value, processedRows); return String(result); }
        switch (column.type) {
            case 'date': if (!value) return ''; try { return new Date(String(value)).toLocaleDateString(); } catch { return String(value); }
            case 'tags': return Array.isArray(value) ? value.join(', ') : String(value);
            case 'number': return typeof value === 'number' ? value.toString() : String(value);
            case 'select': if (column.options && value) { const option = column.options.find(opt => opt.value === value); if (option) return option.label; } return String(value) || '';
            default: return String(value);
        }
    }, [showFormulas, evaluateFormula, processedRows, collaborators]);

    const getStatusColor = (status: string): string => ({ 'not-started': 'bg-gray-100 text-gray-700', 'in-progress': 'bg-blue-100 text-blue-700', 'review': 'bg-yellow-100 text-yellow-700', 'completed': 'bg-green-100 text-green-700' })[status] || 'bg-gray-100 text-gray-700';
    const getPriorityColor = (priority: string): string => ({ 'low': 'bg-green-100 text-green-700', 'medium': 'bg-yellow-100 text-yellow-700', 'high': 'bg-red-100 text-red-700' })[priority] || '';

    const renderCell = (node: NodeData, column: Column, rowIndex: number) => {
        const isSelected = selectedCell?.rowId === node.id && selectedCell?.colId === column.id;
        const isEditing = editingCell?.rowId === node.id && editingCell?.colId === column.id;
        if (isEditing) {
            if (column.type === 'select') {
                return (<select ref={inputRef as React.RefObject<HTMLSelectElement>} defaultValue={editingCell.value || ''} autoFocus onChange={(e) => { e.stopPropagation(); handleCellChange(node.id, column.id, e.target.value); setEditingCell(null); }} onKeyDown={(e) => e.stopPropagation()} onBlur={() => setEditingCell(null)} className="w-full h-full px-2 py-1 text-sm text-gray-900 border-2 border-blue-500 outline-none bg-white"><option value="">Select {column.label}</option>{column.options?.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>);
            }
            return (<input ref={inputRef as React.RefObject<HTMLInputElement>} type={column.type === 'date' ? 'date' : column.type === 'number' ? 'number' : 'text'} defaultValue={editingCell.value} autoFocus onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { handleCellChange(node.id, column.id, (e.target as HTMLInputElement).value); setEditingCell(null); } else if (e.key === 'Escape') setEditingCell(null); }} onBlur={(e) => { handleCellChange(node.id, column.id, e.target.value); setEditingCell(null); }} className="w-full h-full px-2 py-1 text-sm text-gray-900 border-2 border-blue-500 outline-none bg-white" />);
        }
        const value = formatCellValue(node, column);
        const rawValue = node[column.id] as string;
        if (column.id === 'relationship') { const rel = getNodeRelationship(node); return (<div className="flex flex-wrap items-center gap-1.5">{rel.type === 'root' && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Root</span>}{rel.type === 'orphan' && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">Standalone</span>}{rel.parent && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full flex items-center gap-1 max-w-[100px] truncate" title={`Child of: ${rel.parent.name}`}><span className="text-blue-400">↳</span>{rel.parent.name.length > 12 ? rel.parent.name.slice(0, 12) + '...' : rel.parent.name}</span>}{rel.children.length > 0 && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1" title={`Children: ${rel.children.map(c => c.name).join(', ')}`}><span className="text-green-500">▼</span>{rel.children.length} {rel.children.length === 1 ? 'child' : 'children'}</span>}{rel.siblings.length > 0 && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full flex items-center gap-1" title={`Siblings: ${rel.siblings.map(s => s.name).join(', ')}`}><span className="text-amber-500">↔</span>{rel.siblings.length} {rel.siblings.length === 1 ? 'sibling' : 'siblings'}</span>}</div>); }
        if (column.id === 'status') return (<div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">{rawValue ? <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rawValue)}`}>{value}</span> : <span className="text-gray-400 italic text-sm">Select...</span>}<ChevronDown size={14} className="text-gray-400 flex-shrink-0" /></div>);
        if (column.id === 'priority') return (<div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">{rawValue ? <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rawValue)}`}>{value}</span> : <span className="text-gray-400 italic text-sm">Select...</span>}<ChevronDown size={14} className="text-gray-400 flex-shrink-0" /></div>);
        if (column.id === 'progress') { const progress = parseFloat(value) || 0; return (<div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} /></div><span className="text-xs text-gray-600 min-w-[32px]">{progress}%</span></div>); }
        if (column.id === 'assignee') return (<div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"><span className="text-sm text-gray-700 truncate">{value || <span className="text-gray-400 italic">Select...</span>}</span><ChevronDown size={14} className="text-gray-400 flex-shrink-0" /></div>);
        if (column.type === 'select') return (<div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"><span className="text-sm text-gray-700 truncate">{value || <span className="text-gray-400 italic">Select...</span>}</span><ChevronDown size={14} className="text-gray-400 flex-shrink-0" /></div>);
        return <span className="text-sm text-gray-700 truncate">{value}</span>;
    };

    return (
        <div className="h-full flex flex-col bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="flex flex-col border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2"><Table2 size={20} className="text-green-600" /><h2 className="text-lg font-semibold text-gray-900">Excel View</h2><span className="text-sm text-gray-500">({processedRows.length} rows)</span></div>
                    <div className="flex items-center gap-2">
                        <div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="pl-8 pr-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-48 bg-white" /></div>
                        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2"><button onClick={handleCopy} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Copy (Ctrl+C)"><Copy size={16} className="text-gray-600" /></button><button onClick={handlePaste} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Paste (Ctrl+V)"><Clipboard size={16} className="text-gray-600" /></button></div>
                        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2"><button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Download size={14} />Export</button><label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"><Upload size={14} />Import<input type="file" accept=".csv" onChange={importFromCSV} className="hidden" /></label></div>
                        <button onClick={() => setShowHelpModal(true)} className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-2" title="Formula Help"><HelpCircle size={18} className="text-gray-500" /></button>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-2 py-1 rounded">{selectedCell ? <span className="text-gray-700">{getColumnLetter(columns.findIndex(c => c.id === selectedCell.colId))}{processedRows.findIndex(r => r.id === selectedCell.rowId) + 1}</span> : <span className="text-gray-400">-</span>}</div>
                    <div className="text-gray-300">|</div>
                    <div className="flex-1 flex items-center gap-2"><span className="text-gray-400 text-sm italic">fx</span><input type="text" value={formulaBarValue} onChange={(e) => setFormulaBarValue(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && selectedCell) handleCellChange(selectedCell.rowId, selectedCell.colId, formulaBarValue); }} placeholder="Enter value or formula..." className="flex-1 text-sm text-gray-900 border-none outline-none bg-transparent placeholder-gray-400" disabled={!selectedCell} /></div>
                </div>
            </div>
            <div className="flex-1 overflow-auto" ref={tableRef}>
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-gray-100"><th className="w-12 min-w-[48px] border-b border-r border-gray-300 bg-gray-200"></th>{columns.map((col, index) => (<th key={col.id} className="border-b border-r border-gray-300 bg-gray-100 text-center text-xs font-normal text-gray-500 py-1" style={{ width: col.width, minWidth: col.width }}>{getColumnLetter(index)}</th>))}</tr>
                        <tr className="bg-gray-50"><th className="w-12 min-w-[48px] border-b border-r border-gray-300 bg-gray-200 text-center text-xs font-medium text-gray-600">#</th>{columns.map((col) => (<th key={col.id} className="border-b border-r border-gray-300 bg-gray-50 text-left px-2 py-2 cursor-pointer hover:bg-gray-100 transition-colors" style={{ width: col.width, minWidth: col.width }} onClick={() => handleSort(col.id)}><div className="flex items-center justify-between gap-1"><span className="text-xs font-semibold text-gray-700 truncate">{col.label}</span>{sortConfig.column === col.id && <ChevronDown size={12} className={`flex-shrink-0 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />}</div></th>))}</tr>
                    </thead>
                    <tbody>
                        {processedRows.length === 0 ? (<tr><td colSpan={columns.length + 1} className="text-center py-12 text-gray-500">No data available. Add nodes in Mind Map view or import a CSV file.</td></tr>) : processedRows.map((node, rowIndex) => (
                            <tr key={node.id} className={`group ${selectedRows.has(node.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <td className="border-b border-r border-gray-200 bg-gray-100 text-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200" onClick={() => setSelectedRows(prev => { const newSet = new Set(prev); if (newSet.has(node.id)) newSet.delete(node.id); else newSet.add(node.id); return newSet; })}>{rowIndex + 1}</td>
                                {columns.map((col) => { const isSelected = selectedCell?.rowId === node.id && selectedCell?.colId === col.id; return (<td key={col.id} className={`border-b border-r border-gray-200 px-2 py-1.5 cursor-cell ${isSelected ? 'outline outline-2 outline-blue-500 outline-offset-[-2px] bg-blue-50' : ''} ${col.editable ? 'hover:bg-blue-50/50' : 'bg-gray-50/30'}`} style={{ width: col.width, minWidth: col.width }} onClick={() => handleCellClick(node.id, col.id)} onDoubleClick={() => handleCellDoubleClick(node.id, col.id)}>{renderCell(node, col, rowIndex)}</td>); })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex items-center gap-4"><span>Rows: {processedRows.length}</span><span>Columns: {columns.length}</span>{selectedRows.size > 0 && <span>Selected: {selectedRows.size}</span>}</div>
                <div className="flex items-center gap-4">{selectedCell && <span>Cell: {getColumnLetter(columns.findIndex(c => c.id === selectedCell.colId))}{processedRows.findIndex(r => r.id === selectedCell.rowId) + 1}</span>}<span className="text-gray-400">Press F2 to edit • Tab to navigate</span></div>
            </div>
            {showHelpModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelpModal(false)}><div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col mx-4" onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-900"><div className="flex items-center gap-3"><HelpCircle size={24} className="text-white" /><h2 className="text-xl font-bold text-white">Formula Reference</h2></div><button onClick={() => setShowHelpModal(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} className="text-white" /></button></div><div className="flex-1 overflow-auto p-6"><p className="text-gray-600 mb-4">Start any cell with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-green-600 font-mono">=</code> to create a formula.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-blue-50 rounded-lg p-4"><h3 className="font-semibold text-blue-800 mb-3">Math Functions</h3><div className="space-y-1 text-sm text-gray-800"><div><code className="text-blue-700">=SUM(A1:A10)</code> - Sum of values</div><div><code className="text-blue-700">=AVERAGE(A1:A10)</code> - Average</div><div><code className="text-blue-700">=COUNT(A1:A10)</code> - Count numbers</div><div><code className="text-blue-700">=MIN(A1:A10)</code> / <code className="text-blue-700">=MAX(A1:A10)</code></div></div></div><div className="bg-green-50 rounded-lg p-4"><h3 className="font-semibold text-green-800 mb-3">Text Functions</h3><div className="space-y-1 text-sm text-gray-800"><div><code className="text-green-700">=UPPER(A1)</code>, <code className="text-green-700">=LOWER(A1)</code></div><div><code className="text-green-700">=LEN(A1)</code> - Text length</div><div><code className="text-green-700">=TRIM(A1)</code> - Remove extra spaces</div><div><code className="text-green-700">=CONCAT(A1, B1)</code></div></div></div><div className="bg-orange-50 rounded-lg p-4"><h3 className="font-semibold text-orange-800 mb-3">Logical Functions</h3><div className="space-y-1 text-sm text-gray-800"><div><code className="text-orange-700">=IF(A1&gt;5, "Yes", "No")</code></div><div><code className="text-orange-700">=AND(A1&gt;5, B1&lt;10)</code></div><div><code className="text-orange-700">=OR(A1&gt;5, B1&lt;10)</code></div></div></div><div className="bg-red-50 rounded-lg p-4"><h3 className="font-semibold text-red-800 mb-3">Date Functions</h3><div className="space-y-1 text-sm text-gray-800"><div><code className="text-red-700">=TODAY()</code>, <code className="text-red-700">=NOW()</code></div><div><code className="text-red-700">=YEAR(E1)</code>, <code className="text-red-700">=MONTH(E1)</code>, <code className="text-red-700">=DAY(E1)</code></div></div></div></div></div></div></div>)}
        </div>
    );
};

export default ExcelView;
