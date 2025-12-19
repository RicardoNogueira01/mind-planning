import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table2, Download, Upload, Copy, Clipboard, Search, Filter, Plus, Trash2, ChevronDown, HelpCircle, X } from 'lucide-react';

/**
 * Excel View for Mind Map Tasks
 * Emulates a Google Sheets-like interface with editable cells,
 * formula support, and import/export capabilities
 */
const ExcelView = ({ nodes, connections, onNodeUpdate, onNodesChange, collaborators = [] }) => {
    // Use collaborators from props, or fall back to extracting from nodes
    // Build assignee options using collaborator IDs as values for proper sync
    const assigneeOptions = useMemo(() => {
        // Use collaborators passed from MindMap - store ID as value for sync with CollaboratorPicker
        if (collaborators && collaborators.length > 0) {
            return collaborators.map(c => ({
                value: c.id,          // Use ID so it syncs with node.collaborators
                label: c.name || c.id,
                initials: c.initials,
                color: c.color
            }));
        }
        return [];
    }, [collaborators]);

    // Helper to get the first collaborator ID from a node (for display)
    const getNodeAssigneeId = useCallback((node) => {
        if (Array.isArray(node.collaborators) && node.collaborators.length > 0) {
            return node.collaborators[0]; // Return first collaborator ID
        }
        return null;
    }, []);

    // Column definitions with Google Sheets-like structure
    const columns = useMemo(() => [
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
        { id: 'assignee', label: 'Assignee', width: 140, type: 'select', editable: true, options: assigneeOptions },
    ], [assigneeOptions]);

    // Helper function to get relationship info for a node
    const getNodeRelationship = useCallback((node) => {
        if (!connections || connections.length === 0) {
            return { type: 'orphan', parent: null, children: [], siblings: [] };
        }

        // Find parent (connections where this node is 'to')
        const parentConnection = connections.find(c => c.to === node.id);
        const parentNode = parentConnection ? nodes.find(n => n.id === parentConnection.from) : null;

        // Find children (connections where this node is 'from')
        const childConnections = connections.filter(c => c.from === node.id);
        const childNodes = childConnections.map(c => nodes.find(n => n.id === c.to)).filter(Boolean);

        // Find siblings (other nodes with same parent)
        let siblingNodes = [];
        if (parentConnection) {
            const siblingConnections = connections.filter(c =>
                c.from === parentConnection.from && c.to !== node.id
            );
            siblingNodes = siblingConnections.map(c => nodes.find(n => n.id === c.to)).filter(Boolean);
        }

        // Determine node type
        let type = 'orphan';
        if (!parentNode && childNodes.length > 0) {
            type = 'root';
        } else if (parentNode && childNodes.length === 0) {
            type = 'leaf';
        } else if (parentNode && childNodes.length > 0) {
            type = 'branch';
        }

        return {
            type,
            parent: parentNode ? { id: parentNode.id, name: parentNode.text } : null,
            children: childNodes.map(c => ({ id: c.id, name: c.text })),
            siblings: siblingNodes.map(s => ({ id: s.id, name: s.text }))
        };
    }, [connections, nodes]);
    const [selectedCell, setSelectedCell] = useState(null); // { rowId, colId }
    const [editingCell, setEditingCell] = useState(null); // { rowId, colId, value }
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
    const [showFormulas, setShowFormulas] = useState(false);
    const [formulaBarValue, setFormulaBarValue] = useState('');
    const [copiedCells, setCopiedCells] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const tableRef = useRef(null);
    const inputRef = useRef(null);

    // ========== FORMULA SUPPORT ==========
    // Parse cell reference like "A1", "B2", etc. to get column index and row index
    const parseCellReference = useCallback((ref) => {
        const match = ref.match(/^([A-Z]+)(\d+)$/i);
        if (!match) return null;

        // Convert column letters to index (A=0, B=1, ..., Z=25, AA=26, etc.)
        const colLetters = match[1].toUpperCase();
        let colIndex = 0;
        for (let i = 0; i < colLetters.length; i++) {
            colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colIndex--; // Make it 0-indexed

        const rowIndex = parseInt(match[2], 10) - 1; // Make it 0-indexed
        return { colIndex, rowIndex };
    }, []);

    // Get cell value by reference (e.g., "A1")
    const getCellValue = useCallback((ref, rows) => {
        const parsed = parseCellReference(ref);
        if (!parsed) return null;

        const { colIndex, rowIndex } = parsed;
        if (rowIndex < 0 || rowIndex >= rows.length) return null;
        if (colIndex < 0 || colIndex >= columns.length) return null;

        const node = rows[rowIndex];
        const column = columns[colIndex];
        const value = node[column.id];

        // Try to parse as number
        const numValue = parseFloat(value);
        return isNaN(numValue) ? value : numValue;
    }, [columns, parseCellReference]);

    // Parse range like "A1:A5" and return array of values
    const parseRange = useCallback((range, rows) => {
        const parts = range.split(':');
        if (parts.length !== 2) return [getCellValue(range, rows)];

        const start = parseCellReference(parts[0]);
        const end = parseCellReference(parts[1]);
        if (!start || !end) return [];

        const values = [];
        for (let row = start.rowIndex; row <= end.rowIndex; row++) {
            for (let col = start.colIndex; col <= end.colIndex; col++) {
                if (row >= 0 && row < rows.length && col >= 0 && col < columns.length) {
                    const node = rows[row];
                    const column = columns[col];
                    const value = node[column.id];
                    const numValue = parseFloat(value);
                    values.push(isNaN(numValue) ? value : numValue);
                }
            }
        }
        return values;
    }, [columns, parseCellReference, getCellValue]);

    // Formula functions
    const formulaFunctions = useMemo(() => ({
        // Math functions
        SUM: (args) => args.flat().filter(v => typeof v === 'number').reduce((a, b) => a + b, 0),
        AVERAGE: (args) => {
            const nums = args.flat().filter(v => typeof v === 'number');
            return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        },
        COUNT: (args) => args.flat().filter(v => typeof v === 'number').length,
        COUNTA: (args) => args.flat().filter(v => v !== null && v !== undefined && v !== '').length,
        MIN: (args) => Math.min(...args.flat().filter(v => typeof v === 'number')),
        MAX: (args) => Math.max(...args.flat().filter(v => typeof v === 'number')),
        ROUND: (args) => {
            const [num, decimals = 0] = args.flat();
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },
        ABS: (args) => Math.abs(args.flat()[0] || 0),
        SQRT: (args) => Math.sqrt(args.flat()[0] || 0),
        POWER: (args) => {
            const [base, exp] = args.flat();
            return Math.pow(base || 0, exp || 1);
        },

        // Text functions
        UPPER: (args) => String(args.flat()[0] || '').toUpperCase(),
        LOWER: (args) => String(args.flat()[0] || '').toLowerCase(),
        LEN: (args) => String(args.flat()[0] || '').length,
        CONCAT: (args) => args.flat().map(v => String(v || '')).join(''),
        CONCATENATE: (args) => args.flat().map(v => String(v || '')).join(''),
        LEFT: (args) => {
            const [text, num = 1] = args.flat();
            return String(text || '').substring(0, num);
        },
        RIGHT: (args) => {
            const [text, num = 1] = args.flat();
            const str = String(text || '');
            return str.substring(str.length - num);
        },
        TRIM: (args) => String(args.flat()[0] || '').trim(),
        MID: (args) => {
            const [text, start, length] = args.flat();
            return String(text || '').substring(start - 1, start - 1 + length);
        },
        REPLACE: (args) => {
            const [text, start, length, newText] = args.flat();
            const str = String(text || '');
            return str.substring(0, start - 1) + newText + str.substring(start - 1 + length);
        },
        SUBSTITUTE: (args) => {
            const [text, oldText, newText, instance] = args.flat();
            const str = String(text || '');
            if (instance) {
                let count = 0;
                return str.replace(new RegExp(oldText, 'g'), (match) => {
                    count++;
                    return count === instance ? newText : match;
                });
            }
            return str.split(oldText).join(newText);
        },
        FIND: (args) => {
            const [findText, withinText, startNum = 1] = args.flat();
            const index = String(withinText || '').indexOf(findText, startNum - 1);
            return index === -1 ? '#VALUE!' : index + 1;
        },
        SEARCH: (args) => {
            const [findText, withinText, startNum = 1] = args.flat();
            const index = String(withinText || '').toLowerCase().indexOf(String(findText).toLowerCase(), startNum - 1);
            return index === -1 ? '#VALUE!' : index + 1;
        },
        REPT: (args) => {
            const [text, times] = args.flat();
            return String(text || '').repeat(Math.max(0, Math.floor(times || 0)));
        },
        PROPER: (args) => {
            return String(args.flat()[0] || '').replace(/\w\S*/g, txt =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        TEXT: (args) => String(args.flat()[0] || ''),
        VALUE: (args) => parseFloat(args.flat()[0]) || 0,
        EXACT: (args) => {
            const [text1, text2] = args.flat();
            return String(text1) === String(text2);
        },

        // Logical functions
        IF: (args) => {
            const [condition, trueVal, falseVal] = args.flat();
            return condition ? trueVal : falseVal;
        },
        AND: (args) => args.flat().every(v => Boolean(v)),
        OR: (args) => args.flat().some(v => Boolean(v)),
        NOT: (args) => !args.flat()[0],
        XOR: (args) => args.flat().filter(v => Boolean(v)).length % 2 === 1,
        IFS: (args) => {
            const flat = args.flat();
            for (let i = 0; i < flat.length; i += 2) {
                if (flat[i]) return flat[i + 1];
            }
            return '#N/A';
        },
        SWITCH: (args) => {
            const flat = args.flat();
            const expr = flat[0];
            for (let i = 1; i < flat.length - 1; i += 2) {
                if (flat[i] === expr) return flat[i + 1];
            }
            return flat.length % 2 === 0 ? flat[flat.length - 1] : '#N/A';
        },
        CHOOSE: (args) => {
            const flat = args.flat();
            const index = Math.floor(flat[0]);
            return index >= 1 && index < flat.length ? flat[index] : '#VALUE!';
        },
        IFERROR: (args) => {
            const [value, errorValue] = args.flat();
            return (value === '#ERROR!' || value === '#VALUE!' || value === '#N/A' || value === '#REF!')
                ? errorValue : value;
        },
        IFNA: (args) => {
            const [value, naValue] = args.flat();
            return value === '#N/A' ? naValue : value;
        },

        // More Math functions
        PRODUCT: (args) => args.flat().filter(v => typeof v === 'number').reduce((a, b) => a * b, 1),
        MOD: (args) => {
            const [num, divisor] = args.flat();
            return num % divisor;
        },
        FLOOR: (args) => {
            const [num, significance = 1] = args.flat();
            return Math.floor(num / significance) * significance;
        },
        CEILING: (args) => {
            const [num, significance = 1] = args.flat();
            return Math.ceil(num / significance) * significance;
        },
        INT: (args) => Math.floor(args.flat()[0] || 0),
        SIGN: (args) => Math.sign(args.flat()[0] || 0),
        LOG: (args) => {
            const [num, base = Math.E] = args.flat();
            return Math.log(num) / Math.log(base);
        },
        LOG10: (args) => Math.log10(args.flat()[0] || 1),
        LN: (args) => Math.log(args.flat()[0] || 1),
        EXP: (args) => Math.exp(args.flat()[0] || 0),
        SIN: (args) => Math.sin(args.flat()[0] || 0),
        COS: (args) => Math.cos(args.flat()[0] || 0),
        TAN: (args) => Math.tan(args.flat()[0] || 0),
        ASIN: (args) => Math.asin(args.flat()[0] || 0),
        ACOS: (args) => Math.acos(args.flat()[0] || 0),
        ATAN: (args) => Math.atan(args.flat()[0] || 0),
        ATAN2: (args) => {
            const [y, x] = args.flat();
            return Math.atan2(y, x);
        },
        DEGREES: (args) => args.flat()[0] * (180 / Math.PI),
        RADIANS: (args) => args.flat()[0] * (Math.PI / 180),
        PI: () => Math.PI,
        RAND: () => Math.random(),
        RANDBETWEEN: (args) => {
            const [min, max] = args.flat();
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        TRUNC: (args) => {
            const [num, decimals = 0] = args.flat();
            const factor = Math.pow(10, decimals);
            return Math.trunc(num * factor) / factor;
        },
        GCD: (args) => {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            return args.flat().filter(v => typeof v === 'number').reduce((a, b) => gcd(a, Math.abs(b)));
        },
        LCM: (args) => {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
            return args.flat().filter(v => typeof v === 'number').reduce((a, b) => lcm(a, b));
        },
        FACT: (args) => {
            let n = Math.floor(args.flat()[0] || 0);
            if (n < 0) return '#NUM!';
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        },

        // Statistical functions
        MEDIAN: (args) => {
            const nums = args.flat().filter(v => typeof v === 'number').sort((a, b) => a - b);
            const mid = Math.floor(nums.length / 2);
            return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        },
        MODE: (args) => {
            const nums = args.flat().filter(v => typeof v === 'number');
            const freq = {};
            nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
            let maxFreq = 0, mode = nums[0];
            Object.entries(freq).forEach(([val, count]) => {
                if (count > maxFreq) { maxFreq = count; mode = parseFloat(val); }
            });
            return mode;
        },
        STDEV: (args) => {
            const nums = args.flat().filter(v => typeof v === 'number');
            if (nums.length < 2) return '#DIV/0!';
            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            const variance = nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / (nums.length - 1);
            return Math.sqrt(variance);
        },
        VAR: (args) => {
            const nums = args.flat().filter(v => typeof v === 'number');
            if (nums.length < 2) return '#DIV/0!';
            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            return nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / (nums.length - 1);
        },
        LARGE: (args) => {
            const [range, k] = [args[0], args[1]?.[0] || args[1]];
            const nums = (Array.isArray(range) ? range : [range]).filter(v => typeof v === 'number').sort((a, b) => b - a);
            return k >= 1 && k <= nums.length ? nums[k - 1] : '#NUM!';
        },
        SMALL: (args) => {
            const [range, k] = [args[0], args[1]?.[0] || args[1]];
            const nums = (Array.isArray(range) ? range : [range]).filter(v => typeof v === 'number').sort((a, b) => a - b);
            return k >= 1 && k <= nums.length ? nums[k - 1] : '#NUM!';
        },
        PERCENTILE: (args) => {
            const [range, k] = [args[0], args[1]?.[0] || args[1]];
            const nums = (Array.isArray(range) ? range : [range]).filter(v => typeof v === 'number').sort((a, b) => a - b);
            if (k < 0 || k > 1) return '#NUM!';
            const index = k * (nums.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            return lower === upper ? nums[lower] : nums[lower] + (nums[upper] - nums[lower]) * (index - lower);
        },

        // Conditional functions
        SUMIF: (args) => {
            const [range, criteria, sumRange] = args;
            const values = Array.isArray(range) ? range : [range];
            const sums = sumRange ? (Array.isArray(sumRange) ? sumRange : [sumRange]) : values;
            let total = 0;
            values.forEach((v, i) => {
                if (String(v) === String(criteria) || (typeof criteria === 'number' && v === criteria)) {
                    total += typeof sums[i] === 'number' ? sums[i] : 0;
                }
            });
            return total;
        },
        COUNTIF: (args) => {
            const [range, criteria] = args;
            const values = Array.isArray(range) ? range : [range];
            return values.filter(v => String(v) === String(criteria) || v === criteria).length;
        },
        AVERAGEIF: (args) => {
            const [range, criteria, avgRange] = args;
            const values = Array.isArray(range) ? range : [range];
            const avgs = avgRange ? (Array.isArray(avgRange) ? avgRange : [avgRange]) : values;
            const matches = [];
            values.forEach((v, i) => {
                if (String(v) === String(criteria) || v === criteria) {
                    if (typeof avgs[i] === 'number') matches.push(avgs[i]);
                }
            });
            return matches.length ? matches.reduce((a, b) => a + b, 0) / matches.length : 0;
        },

        // Lookup functions
        VLOOKUP: (args) => {
            const [searchKey, range, index, isSorted = true] = args.flat();
            // Simplified - just return the search key for now
            return `VLOOKUP: ${searchKey}`;
        },
        HLOOKUP: (args) => {
            const [searchKey, range, index, isSorted = true] = args.flat();
            return `HLOOKUP: ${searchKey}`;
        },

        // Information functions
        ISNUMBER: (args) => typeof args.flat()[0] === 'number',
        ISTEXT: (args) => typeof args.flat()[0] === 'string',
        ISBLANK: (args) => {
            const val = args.flat()[0];
            return val === null || val === undefined || val === '';
        },
        ISERROR: (args) => {
            const val = args.flat()[0];
            return String(val).startsWith('#');
        },
        ISEVEN: (args) => Math.floor(args.flat()[0]) % 2 === 0,
        ISODD: (args) => Math.floor(args.flat()[0]) % 2 !== 0,
        TYPE: (args) => {
            const val = args.flat()[0];
            if (typeof val === 'number') return 1;
            if (typeof val === 'string') return 2;
            if (typeof val === 'boolean') return 4;
            if (String(val).startsWith('#')) return 16;
            return 64;
        },
        N: (args) => {
            const val = args.flat()[0];
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return 0;
        },

        // Date functions
        TODAY: () => new Date().toISOString().split('T')[0],
        NOW: () => new Date().toISOString(),
        YEAR: (args) => new Date(args.flat()[0]).getFullYear(),
        MONTH: (args) => new Date(args.flat()[0]).getMonth() + 1,
        DAY: (args) => new Date(args.flat()[0]).getDate(),
        HOUR: (args) => new Date(args.flat()[0]).getHours(),
        MINUTE: (args) => new Date(args.flat()[0]).getMinutes(),
        SECOND: (args) => new Date(args.flat()[0]).getSeconds(),
        WEEKDAY: (args) => {
            const [date, type = 1] = args.flat();
            const day = new Date(date).getDay();
            if (type === 1) return day + 1; // Sunday = 1
            if (type === 2) return day === 0 ? 7 : day; // Monday = 1
            return day; // Sunday = 0
        },
        WEEKNUM: (args) => {
            const date = new Date(args.flat()[0]);
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
            return Math.ceil((days + startOfYear.getDay() + 1) / 7);
        },
        DATE: (args) => {
            const [year, month, day] = args.flat();
            return new Date(year, month - 1, day).toISOString().split('T')[0];
        },
        TIME: (args) => {
            const [hour, minute, second = 0] = args.flat();
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        },
        DATEDIF: (args) => {
            const [start, end, unit] = args.flat();
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffMs = endDate - startDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            switch (String(unit).toUpperCase()) {
                case 'D': return diffDays;
                case 'M': return Math.floor(diffDays / 30);
                case 'Y': return Math.floor(diffDays / 365);
                default: return diffDays;
            }
        },
        EDATE: (args) => {
            const [start, months] = args.flat();
            const date = new Date(start);
            date.setMonth(date.getMonth() + months);
            return date.toISOString().split('T')[0];
        },
        EOMONTH: (args) => {
            const [start, months] = args.flat();
            const date = new Date(start);
            date.setMonth(date.getMonth() + months + 1, 0);
            return date.toISOString().split('T')[0];
        },
        DAYS: (args) => {
            const [end, start] = args.flat();
            return Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        },
        NETWORKDAYS: (args) => {
            const [start, end] = args.flat();
            let count = 0;
            const current = new Date(start);
            const endDate = new Date(end);
            while (current <= endDate) {
                const day = current.getDay();
                if (day !== 0 && day !== 6) count++;
                current.setDate(current.getDate() + 1);
            }
            return count;
        },
    }), []);

    // Evaluate a formula string
    const evaluateFormula = useCallback((formula, rows) => {
        if (!formula || typeof formula !== 'string' || !formula.startsWith('=')) {
            return formula;
        }

        try {
            const expr = formula.substring(1).trim();

            // Match function calls like SUM(A1:A5) or IF(A1>5, "yes", "no")
            const funcMatch = expr.match(/^([A-Z]+)\((.*)\)$/i);
            if (funcMatch) {
                const funcName = funcMatch[1].toUpperCase();
                const argsStr = funcMatch[2];

                if (formulaFunctions[funcName]) {
                    // Parse arguments (handle nested functions, ranges, and values)
                    const args = [];
                    let depth = 0;
                    let current = '';

                    for (let i = 0; i < argsStr.length; i++) {
                        const char = argsStr[i];
                        if (char === '(') depth++;
                        else if (char === ')') depth--;
                        else if (char === ',' && depth === 0) {
                            args.push(current.trim());
                            current = '';
                            continue;
                        }
                        current += char;
                    }
                    if (current.trim()) args.push(current.trim());

                    // Evaluate each argument
                    const evaluatedArgs = args.map(arg => {
                        // Check if it's a range (e.g., A1:A5)
                        if (arg.includes(':')) {
                            return parseRange(arg, rows);
                        }
                        // Check if it's a cell reference
                        if (/^[A-Z]+\d+$/i.test(arg)) {
                            return getCellValue(arg, rows);
                        }
                        // Check if it's a nested function
                        if (/^[A-Z]+\(/.test(arg)) {
                            return evaluateFormula('=' + arg, rows);
                        }
                        // Check if it's a quoted string
                        if (/^["'].*["']$/.test(arg)) {
                            return arg.slice(1, -1);
                        }
                        // Try to parse as number
                        const num = parseFloat(arg);
                        return isNaN(num) ? arg : num;
                    });

                    return formulaFunctions[funcName](evaluatedArgs);
                }
            }

            // Simple cell reference
            if (/^[A-Z]+\d+$/i.test(expr)) {
                return getCellValue(expr, rows);
            }

            // Simple arithmetic (only for basic expressions)
            // This is a simplified evaluator
            return formula; // Return as-is if can't parse
        } catch (error) {
            console.error('Formula error:', error);
            return '#ERROR!';
        }
    }, [formulaFunctions, getCellValue, parseRange]);

    // Helper function to get column letter (A, B, C, ..., Z, AA, AB, etc.)
    const getColumnLetter = (index) => {
        let letter = '';
        while (index >= 0) {
            letter = String.fromCharCode(65 + (index % 26)) + letter;
            index = Math.floor(index / 26) - 1;
        }
        return letter;
    };

    // Process and filter rows
    const processedRows = useMemo(() => {
        let rows = [...nodes];

        // Apply search filter
        if (searchQuery) {
            rows = rows.filter(node =>
                Object.values(node).some(val =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply sorting
        if (sortConfig.column) {
            rows.sort((a, b) => {
                const aVal = a[sortConfig.column] || '';
                const bVal = b[sortConfig.column] || '';

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return rows;
    }, [nodes, searchQuery, sortConfig]);

    // Handle cell click
    const handleCellClick = (rowId, colId) => {
        setSelectedCell({ rowId, colId });
        const node = nodes.find(n => n.id === rowId);
        const value = node ? (node[colId] ?? '') : '';
        setFormulaBarValue(Array.isArray(value) ? value.join(', ') : String(value));
    };

    // Handle double-click to edit
    const handleCellDoubleClick = (rowId, colId) => {
        const column = columns.find(c => c.id === colId);
        if (!column?.editable) return;

        const node = nodes.find(n => n.id === rowId);

        // Special handling for assignee - read from node.collaborators
        let value;
        if (colId === 'assignee') {
            const collabIds = Array.isArray(node?.collaborators) ? node.collaborators : [];
            value = collabIds.length > 0 ? collabIds[0] : ''; // Use the first collaborator ID
        } else {
            value = node ? (node[colId] ?? '') : '';
        }

        setEditingCell({ rowId, colId, value: Array.isArray(value) ? value.join(', ') : value });
    };

    // Handle cell value change
    const handleCellChange = useCallback((rowId, colId, value) => {
        const column = columns.find(c => c.id === colId);

        // Special handling for assignee - update node.collaborators array instead
        if (colId === 'assignee') {
            const collaboratorId = value; // value is now the collaborator ID
            if (onNodesChange) {
                onNodesChange(prev => prev.map(n => {
                    if (n.id !== rowId) return n;
                    const existingCollabs = Array.isArray(n.collaborators) ? n.collaborators : [];
                    if (!collaboratorId) {
                        // If empty value, clear all collaborators
                        return { ...n, collaborators: [] };
                    }
                    if (existingCollabs.includes(collaboratorId)) {
                        // Already assigned, do nothing
                        return n;
                    }
                    // Add new collaborator (replace the primary assignee)
                    return { ...n, collaborators: [collaboratorId, ...existingCollabs.filter(id => id !== collaboratorId)] };
                }));
            }
            return;
        }

        // Parse value based on column type
        let parsedValue = value;
        if (column?.type === 'number') {
            parsedValue = parseFloat(value) || 0;
        } else if (column?.type === 'tags') {
            parsedValue = value.split(',').map(t => t.trim()).filter(t => t);
        }

        if (onNodeUpdate) {
            onNodeUpdate(rowId, { [colId]: parsedValue });
        } else if (onNodesChange) {
            onNodesChange(prev => prev.map(n =>
                n.id === rowId ? { ...n, [colId]: parsedValue } : n
            ));
        }
    }, [columns, onNodeUpdate, onNodesChange]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        // If we're editing a cell, don't handle navigation keys (let the input handle them)
        // Only handle Escape to cancel editing
        if (editingCell) {
            if (e.key === 'Escape') {
                setEditingCell(null);
            }
            // For all other keys while editing, let the input handle them
            return;
        }

        if (!selectedCell) return;

        const currentRowIndex = processedRows.findIndex(r => r.id === selectedCell.rowId);
        const currentColIndex = columns.findIndex(c => c.id === selectedCell.colId);

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentRowIndex > 0) {
                    setSelectedCell({ rowId: processedRows[currentRowIndex - 1].id, colId: selectedCell.colId });
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentRowIndex < processedRows.length - 1) {
                    setSelectedCell({ rowId: processedRows[currentRowIndex + 1].id, colId: selectedCell.colId });
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentColIndex > 0) {
                    setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex - 1].id });
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentColIndex < columns.length - 1) {
                    setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex + 1].id });
                }
                break;
            case 'Enter':
            case 'F2': {
                const column = columns.find(c => c.id === selectedCell.colId);
                if (column?.editable) {
                    const node = nodes.find(n => n.id === selectedCell.rowId);
                    const value = node ? (node[selectedCell.colId] ?? '') : '';
                    setEditingCell({ ...selectedCell, value: Array.isArray(value) ? value.join(', ') : String(value) });
                }
                break;
            }
            case 'Tab':
                e.preventDefault();
                if (currentColIndex < columns.length - 1) {
                    setSelectedCell({ rowId: selectedCell.rowId, colId: columns[currentColIndex + 1].id });
                } else if (currentRowIndex < processedRows.length - 1) {
                    setSelectedCell({ rowId: processedRows[currentRowIndex + 1].id, colId: columns[0].id });
                }
                break;
            case 'Delete':
            case 'Backspace': {
                // Clear the cell value
                const column = columns.find(c => c.id === selectedCell.colId);
                if (column?.editable) {
                    handleCellChange(selectedCell.rowId, selectedCell.colId, '');
                }
                break;
            }
            default:
                // If it's a printable character, start editing with that character
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const column = columns.find(c => c.id === selectedCell.colId);
                    if (column?.editable) {
                        setEditingCell({ ...selectedCell, value: e.key });
                    }
                }
                break;
        }
    }, [selectedCell, editingCell, processedRows, columns, nodes, handleCellChange]);

    // Focus input when editing
    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            // Only call select() for text inputs and textareas, not for select elements
            const tagName = inputRef.current.tagName?.toUpperCase();
            if ((tagName === 'INPUT' || tagName === 'TEXTAREA') && typeof inputRef.current.select === 'function') {
                inputRef.current.select();
            }
        }
    }, [editingCell]);

    // Sort handler
    const handleSort = (columnId) => {
        setSortConfig(prev => ({
            column: columnId,
            direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = columns.map(c => c.label).join(',');
        const rows = processedRows.map(node =>
            columns.map(col => {
                const value = node[col.id];
                if (Array.isArray(value)) return `"${value.join(';')}"`;
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value ?? '';
            }).join(',')
        ).join('\n');

        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindmap-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import from CSV
    const importFromCSV = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text !== 'string') return;

            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const newNodes = lines.slice(1).filter(line => line.trim()).map((line, index) => {
                const values = line.split(',');
                const node = {
                    id: `imported-${Date.now()}-${index}`,
                    x: 100 + (index % 5) * 350,
                    y: 100 + Math.floor(index / 5) * 150,
                    bgColor: '#ffffff',
                    fontColor: '#2d3748',
                };

                headers.forEach((header, i) => {
                    const col = columns.find(c => c.label.toLowerCase() === header || c.id === header);
                    if (col && col.id !== 'id') {
                        let value = values[i]?.trim().replace(/^"|"$/g, '');
                        if (col.type === 'tags') {
                            value = value ? value.split(';').map(t => t.trim()) : [];
                        } else if (col.type === 'number') {
                            value = parseFloat(value) || 0;
                        }
                        node[col.id] = value;
                    }
                });

                return node;
            });

            if (onNodesChange) {
                onNodesChange(prev => [...prev, ...newNodes]);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Copy cells
    const handleCopy = () => {
        if (!selectedCell) return;
        const node = nodes.find(n => n.id === selectedCell.rowId);
        const value = node?.[selectedCell.colId] ?? '';
        navigator.clipboard.writeText(String(value));
        setCopiedCells({ rowId: selectedCell.rowId, colId: selectedCell.colId, value });
    };

    // Paste cells
    const handlePaste = async () => {
        if (!selectedCell) return;
        try {
            const text = await navigator.clipboard.readText();
            handleCellChange(selectedCell.rowId, selectedCell.colId, text);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    };

    // Format cell value for display
    const formatCellValue = useCallback((node, column) => {
        // Special handling for assignee - read from node.collaborators
        if (column.id === 'assignee') {
            const collabIds = Array.isArray(node.collaborators) ? node.collaborators : [];
            if (collabIds.length === 0) return '';
            // Look up the first collaborator's name
            const primaryCollabId = collabIds[0];
            const collab = collaborators.find(c => c.id === primaryCollabId);
            return collab ? collab.name : primaryCollabId;
        }

        const value = node[column.id];

        if (value === undefined || value === null) return '';

        // Check if value is a formula
        if (typeof value === 'string' && value.startsWith('=')) {
            // In showFormulas mode, display the formula itself
            if (showFormulas) {
                return value;
            }
            // Otherwise, evaluate the formula
            const result = evaluateFormula(value, processedRows);
            return result;
        }

        switch (column.type) {
            case 'date':
                if (!value) return '';
                try {
                    return new Date(value).toLocaleDateString();
                } catch {
                    return value;
                }
            case 'tags':
                return Array.isArray(value) ? value.join(', ') : value;
            case 'number':
                return typeof value === 'number' ? value.toString() : value;
            case 'select': {
                // Look up the label from options if available
                if (column.options && value) {
                    const option = column.options.find(opt =>
                        (typeof opt === 'object' ? opt.value : opt) === value
                    );
                    if (option) {
                        return typeof option === 'object' ? option.label : option;
                    }
                }
                return value || '';
            }
            default:
                return String(value);
        }
    }, [showFormulas, evaluateFormula, processedRows]);

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'not-started': 'bg-gray-100 text-gray-700',
            'in-progress': 'bg-blue-100 text-blue-700',
            'review': 'bg-yellow-100 text-yellow-700',
            'completed': 'bg-green-100 text-green-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'bg-green-100 text-green-700',
            'medium': 'bg-yellow-100 text-yellow-700',
            'high': 'bg-red-100 text-red-700',
        };
        return colors[priority] || '';
    };

    // Render cell content
    const renderCell = (node, column, rowIndex) => {
        const isSelected = selectedCell?.rowId === node.id && selectedCell?.colId === column.id;
        const isEditing = editingCell?.rowId === node.id && editingCell?.colId === column.id;

        if (isEditing) {
            if (column.type === 'select') {
                return (
                    <select
                        ref={inputRef}
                        defaultValue={editingCell.value || ''}
                        autoFocus
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCellChange(node.id, column.id, e.target.value);
                            setEditingCell(null);
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onBlur={() => setEditingCell(null)}
                        className="w-full h-full px-2 py-1 text-sm text-gray-900 border-2 border-blue-500 outline-none bg-white"
                    >
                        <option value="">Select {column.label}</option>
                        {column.options?.map(opt => {
                            // Handle both string options and {value, label} objects
                            const value = typeof opt === 'object' ? opt.value : opt;
                            const label = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <option key={value} value={value}>{label}</option>
                            );
                        })}
                    </select>
                );
            }

            return (
                <input
                    ref={inputRef}
                    type={column.type === 'date' ? 'date' : column.type === 'number' ? 'number' : 'text'}
                    defaultValue={editingCell.value}
                    autoFocus
                    onKeyDown={(e) => {
                        // Stop propagation for ALL keys so the parent handler doesn't interfere
                        e.stopPropagation();

                        if (e.key === 'Enter') {
                            handleCellChange(node.id, column.id, e.target.value);
                            setEditingCell(null);
                        } else if (e.key === 'Escape') {
                            setEditingCell(null);
                        }
                    }}
                    onBlur={(e) => {
                        handleCellChange(node.id, column.id, e.target.value);
                        setEditingCell(null);
                    }}
                    className="w-full h-full px-2 py-1 text-sm text-gray-900 border-2 border-blue-500 outline-none bg-white"
                />
            );
        }

        const value = formatCellValue(node, column);
        const rawValue = node[column.id]; // Raw value for color lookup

        // Special rendering for relationship/hierarchy column
        if (column.id === 'relationship') {
            const rel = getNodeRelationship(node);
            return (
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Node Type Badge */}
                    {rel.type === 'root' && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            Root
                        </span>
                    )}
                    {rel.type === 'orphan' && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                            Standalone
                        </span>
                    )}

                    {/* Parent Info */}
                    {rel.parent && (
                        <span
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full flex items-center gap-1 max-w-[100px] truncate"
                            title={`Child of: ${rel.parent.name}`}
                        >
                            <span className="text-blue-400">↳</span>
                            {rel.parent.name?.length > 12 ? rel.parent.name.slice(0, 12) + '...' : rel.parent.name}
                        </span>
                    )}

                    {/* Children Count */}
                    {rel.children.length > 0 && (
                        <span
                            className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1"
                            title={`Children: ${rel.children.map(c => c.name).join(', ')}`}
                        >
                            <span className="text-green-500">▼</span>
                            {rel.children.length} {rel.children.length === 1 ? 'child' : 'children'}
                        </span>
                    )}

                    {/* Siblings Count */}
                    {rel.siblings.length > 0 && (
                        <span
                            className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full flex items-center gap-1"
                            title={`Siblings: ${rel.siblings.map(s => s.name).join(', ')}`}
                        >
                            <span className="text-amber-500">↔</span>
                            {rel.siblings.length} {rel.siblings.length === 1 ? 'sibling' : 'siblings'}
                        </span>
                    )}
                </div>
            );
        }

        // Special rendering for status - with dropdown indicator
        if (column.id === 'status') {
            return (
                <div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
                    {rawValue ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rawValue)}`}>
                            {value}
                        </span>
                    ) : (
                        <span className="text-gray-400 italic text-sm">Select...</span>
                    )}
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>
            );
        }

        // Special rendering for priority - with dropdown indicator
        if (column.id === 'priority') {
            return (
                <div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
                    {rawValue ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rawValue)}`}>
                            {value}
                        </span>
                    ) : (
                        <span className="text-gray-400 italic text-sm">Select...</span>
                    )}
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>
            );
        }

        if (column.id === 'progress') {
            const progress = parseFloat(value) || 0;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[32px]">{progress}%</span>
                </div>
            );
        }

        // For assignee column - show with dropdown indicator
        if (column.id === 'assignee') {
            return (
                <div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
                    <span className="text-sm text-gray-700 truncate">{value || <span className="text-gray-400 italic">Select...</span>}</span>
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>
            );
        }

        // For other select columns - show with dropdown indicator
        if (column.type === 'select') {
            return (
                <div className="flex items-center justify-between gap-1 w-full cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
                    <span className="text-sm text-gray-700 truncate">{value || <span className="text-gray-400 italic">Select...</span>}</span>
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </div>
            );
        }

        return <span className="text-sm text-gray-700 truncate">{value}</span>;
    };

    return (
        <div className="h-full flex flex-col bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Toolbar - Google Sheets style */}
            <div className="flex flex-col border-b border-gray-200">
                {/* Top toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Table2 size={20} className="text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Excel View</h2>
                        <span className="text-sm text-gray-500">({processedRows.length} rows)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="pl-8 pr-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-48 bg-white"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
                            <button
                                onClick={handleCopy}
                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                title="Copy (Ctrl+C)"
                            >
                                <Copy size={16} className="text-gray-600" />
                            </button>
                            <button
                                onClick={handlePaste}
                                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                                title="Paste (Ctrl+V)"
                            >
                                <Clipboard size={16} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download size={14} />
                                Export
                            </button>
                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <Upload size={14} />
                                Import
                                <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                            </label>
                        </div>

                        {/* Help button */}
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors ml-2"
                            title="Formula Help"
                        >
                            <HelpCircle size={18} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Formula bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedCell ? (
                            <span className="text-gray-700">
                                {getColumnLetter(columns.findIndex(c => c.id === selectedCell.colId))}
                                {processedRows.findIndex(r => r.id === selectedCell.rowId) + 1}
                            </span>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                    </div>
                    <div className="text-gray-300">|</div>
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-gray-400 text-sm italic">fx</span>
                        <input
                            type="text"
                            value={formulaBarValue}
                            onChange={(e) => setFormulaBarValue(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter' && selectedCell) {
                                    handleCellChange(selectedCell.rowId, selectedCell.colId, formulaBarValue);
                                }
                            }}
                            placeholder="Enter value or formula..."
                            className="flex-1 text-sm text-gray-900 border-none outline-none bg-transparent placeholder-gray-400"
                            disabled={!selectedCell}
                        />
                    </div>
                </div>
            </div>

            {/* Spreadsheet table */}
            <div className="flex-1 overflow-auto" ref={tableRef}>
                <table className="w-full border-collapse">
                    {/* Column headers with letters */}
                    <thead className="sticky top-0 z-20">
                        {/* Letter row */}
                        <tr className="bg-gray-100">
                            <th className="w-12 min-w-[48px] border-b border-r border-gray-300 bg-gray-200"></th>
                            {columns.map((col, index) => (
                                <th
                                    key={col.id}
                                    className="border-b border-r border-gray-300 bg-gray-100 text-center text-xs font-normal text-gray-500 py-1"
                                    style={{ width: col.width, minWidth: col.width }}
                                >
                                    {getColumnLetter(index)}
                                </th>
                            ))}
                        </tr>
                        {/* Header row */}
                        <tr className="bg-gray-50">
                            <th className="w-12 min-w-[48px] border-b border-r border-gray-300 bg-gray-200 text-center text-xs font-medium text-gray-600">
                                #
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    className="border-b border-r border-gray-300 bg-gray-50 text-left px-2 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                    style={{ width: col.width, minWidth: col.width }}
                                    onClick={() => handleSort(col.id)}
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-semibold text-gray-700 truncate">{col.label}</span>
                                        {sortConfig.column === col.id && (
                                            <ChevronDown
                                                size={12}
                                                className={`flex-shrink-0 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {processedRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-12 text-gray-500">
                                    No data available. Add nodes in Mind Map view or import a CSV file.
                                </td>
                            </tr>
                        ) : (
                            processedRows.map((node, rowIndex) => (
                                <tr
                                    key={node.id}
                                    className={`group ${selectedRows.has(node.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Row number */}
                                    <td
                                        className="border-b border-r border-gray-200 bg-gray-100 text-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
                                        onClick={() => {
                                            setSelectedRows(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(node.id)) {
                                                    newSet.delete(node.id);
                                                } else {
                                                    newSet.add(node.id);
                                                }
                                                return newSet;
                                            });
                                        }}
                                    >
                                        {rowIndex + 1}
                                    </td>
                                    {/* Data cells */}
                                    {columns.map((col) => {
                                        const isSelected = selectedCell?.rowId === node.id && selectedCell?.colId === col.id;
                                        return (
                                            <td
                                                key={col.id}
                                                className={`
                          border-b border-r border-gray-200 px-2 py-1.5 cursor-cell
                          ${isSelected ? 'outline outline-2 outline-blue-500 outline-offset-[-2px] bg-blue-50' : ''}
                          ${col.editable ? 'hover:bg-blue-50/50' : 'bg-gray-50/30'}
                        `}
                                                style={{ width: col.width, minWidth: col.width }}
                                                onClick={() => handleCellClick(node.id, col.id)}
                                                onDoubleClick={() => handleCellDoubleClick(node.id, col.id)}
                                            >
                                                {renderCell(node, col, rowIndex)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <span>Rows: {processedRows.length}</span>
                    <span>Columns: {columns.length}</span>
                    {selectedRows.size > 0 && <span>Selected: {selectedRows.size}</span>}
                </div>
                <div className="flex items-center gap-4">
                    {selectedCell && (
                        <span>
                            Cell: {getColumnLetter(columns.findIndex(c => c.id === selectedCell.colId))}
                            {processedRows.findIndex(r => r.id === selectedCell.rowId) + 1}
                        </span>
                    )}
                    <span className="text-gray-400">Press F2 to edit • Tab to navigate</span>
                </div>
            </div>

            {/* Formula Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelpModal(false)}>
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col mx-4"
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-900">
                            <div className="flex items-center gap-3">
                                <HelpCircle size={24} className="text-white" />
                                <h2 className="text-xl font-bold text-white">Formula Reference</h2>
                            </div>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <p className="text-gray-600 mb-4">
                                Start any cell with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-green-600 font-mono">=</code> to create a formula.
                                Use cell references like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-green-600 font-mono">A1</code> or ranges like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-green-600 font-mono">A1:A10</code>.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Math Functions */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">∑</span>
                                        Math Functions
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-blue-700">=SUM(A1:A10)</code> <span className="text-gray-600">- Sum of values</span></div>
                                        <div><code className="text-blue-700">=AVERAGE(A1:A10)</code> <span className="text-gray-600">- Average</span></div>
                                        <div><code className="text-blue-700">=COUNT(A1:A10)</code> <span className="text-gray-600">- Count numbers</span></div>
                                        <div><code className="text-blue-700">=MIN(A1:A10)</code> / <code className="text-blue-700">=MAX(A1:A10)</code></div>
                                        <div><code className="text-blue-700">=ROUND(A1, 2)</code> <span className="text-gray-600">- Round to decimals</span></div>
                                        <div><code className="text-blue-700">=ABS(A1)</code>, <code className="text-blue-700">=SQRT(A1)</code>, <code className="text-blue-700">=POWER(A1, 2)</code></div>
                                        <div><code className="text-blue-700">=MOD(A1, 3)</code> <span className="text-gray-600">- Remainder</span></div>
                                        <div><code className="text-blue-700">=FLOOR(A1)</code>, <code className="text-blue-700">=CEILING(A1)</code></div>
                                        <div><code className="text-blue-700">=PI()</code>, <code className="text-blue-700">=RAND()</code>, <code className="text-blue-700">=RANDBETWEEN(1, 100)</code></div>
                                    </div>
                                </div>

                                {/* Statistical Functions */}
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">📊</span>
                                        Statistical Functions
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-purple-700">=MEDIAN(A1:A10)</code> <span className="text-gray-600">- Median value</span></div>
                                        <div><code className="text-purple-700">=MODE(A1:A10)</code> <span className="text-gray-600">- Most frequent</span></div>
                                        <div><code className="text-purple-700">=STDEV(A1:A10)</code> <span className="text-gray-600">- Standard deviation</span></div>
                                        <div><code className="text-purple-700">=VAR(A1:A10)</code> <span className="text-gray-600">- Variance</span></div>
                                        <div><code className="text-purple-700">=LARGE(A1:A10, 2)</code> <span className="text-gray-600">- 2nd largest</span></div>
                                        <div><code className="text-purple-700">=SMALL(A1:A10, 3)</code> <span className="text-gray-600">- 3rd smallest</span></div>
                                        <div><code className="text-purple-700">=PERCENTILE(A1:A10, 0.75)</code></div>
                                    </div>
                                </div>

                                {/* Text Functions */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">Aa</span>
                                        Text Functions
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-green-700">=UPPER(A1)</code>, <code className="text-green-700">=LOWER(A1)</code>, <code className="text-green-700">=PROPER(A1)</code></div>
                                        <div><code className="text-green-700">=LEN(A1)</code> <span className="text-gray-600">- Text length</span></div>
                                        <div><code className="text-green-700">=TRIM(A1)</code> <span className="text-gray-600">- Remove extra spaces</span></div>
                                        <div><code className="text-green-700">=LEFT(A1, 5)</code>, <code className="text-green-700">=RIGHT(A1, 5)</code></div>
                                        <div><code className="text-green-700">=MID(A1, 2, 5)</code> <span className="text-gray-600">- Middle text</span></div>
                                        <div><code className="text-green-700">=CONCAT(A1, " ", B1)</code></div>
                                        <div><code className="text-green-700">=SUBSTITUTE(A1, "old", "new")</code></div>
                                        <div><code className="text-green-700">=FIND("x", A1)</code>, <code className="text-green-700">=SEARCH("x", A1)</code></div>
                                    </div>
                                </div>

                                {/* Logical Functions */}
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">?</span>
                                        Logical Functions
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-orange-700">=IF(A1{">"}"5", "Yes", "No")</code></div>
                                        <div><code className="text-orange-700">=IFS(A1{">"}10, "High", A1{">"}5, "Med", true, "Low")</code></div>
                                        <div><code className="text-orange-700">=SWITCH(A1, 1, "One", 2, "Two")</code></div>
                                        <div><code className="text-orange-700">=AND(A1{">"}5, B1{"<"}10)</code></div>
                                        <div><code className="text-orange-700">=OR(A1{">"}5, B1{"<"}10)</code></div>
                                        <div><code className="text-orange-700">=NOT(A1)</code>, <code className="text-orange-700">=XOR(A1, B1)</code></div>
                                        <div><code className="text-orange-700">=IFERROR(A1/B1, 0)</code></div>
                                        <div><code className="text-orange-700">=CHOOSE(2, "A", "B", "C")</code></div>
                                    </div>
                                </div>

                                {/* Date Functions */}
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">📅</span>
                                        Date Functions
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-red-700">=TODAY()</code>, <code className="text-red-700">=NOW()</code></div>
                                        <div><code className="text-red-700">=DATE(2024, 12, 25)</code></div>
                                        <div><code className="text-red-700">=YEAR(E1)</code>, <code className="text-red-700">=MONTH(E1)</code>, <code className="text-red-700">=DAY(E1)</code></div>
                                        <div><code className="text-red-700">=HOUR(E1)</code>, <code className="text-red-700">=MINUTE(E1)</code>, <code className="text-red-700">=SECOND(E1)</code></div>
                                        <div><code className="text-red-700">=WEEKDAY(E1)</code>, <code className="text-red-700">=WEEKNUM(E1)</code></div>
                                        <div><code className="text-red-700">=DAYS(end, start)</code></div>
                                        <div><code className="text-red-700">=DATEDIF(start, end, "D")</code></div>
                                        <div><code className="text-red-700">=NETWORKDAYS(E1, F1)</code></div>
                                        <div><code className="text-red-700">=EDATE(E1, 3)</code>, <code className="text-red-700">=EOMONTH(E1, 0)</code></div>
                                    </div>
                                </div>

                                {/* Information & Conditional Functions */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">i</span>
                                        Info & Conditional
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-800">
                                        <div><code className="text-gray-700">=ISNUMBER(A1)</code>, <code className="text-gray-700">=ISTEXT(A1)</code></div>
                                        <div><code className="text-gray-700">=ISBLANK(A1)</code>, <code className="text-gray-700">=ISERROR(A1)</code></div>
                                        <div><code className="text-gray-700">=ISEVEN(A1)</code>, <code className="text-gray-700">=ISODD(A1)</code></div>
                                        <div><code className="text-gray-700">=SUMIF(C1:C10, "completed", G1:G10)</code></div>
                                        <div><code className="text-gray-700">=COUNTIF(C1:C10, "completed")</code></div>
                                        <div><code className="text-gray-700">=AVERAGEIF(C1:C10, "high", G1:G10)</code></div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <h3 className="font-semibold text-green-800 mb-2">💡 Tips</h3>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Cell references use column letters (A, B, C...) and row numbers (1, 2, 3...)</li>
                                    <li>• Use ranges like <code className="bg-white px-1 rounded">A1:A10</code> or <code className="bg-white px-1 rounded">B2:D5</code></li>
                                    <li>• Formulas are case-insensitive: <code className="bg-white px-1 rounded">=SUM</code> = <code className="bg-white px-1 rounded">=sum</code></li>
                                    <li>• Press <kbd className="bg-white px-1.5 py-0.5 rounded border">F2</kbd> to edit a cell, <kbd className="bg-white px-1.5 py-0.5 rounded border">Escape</kbd> to cancel</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ExcelView.propTypes = {
    nodes: PropTypes.array.isRequired,
    connections: PropTypes.array,
    onNodeUpdate: PropTypes.func,
    onNodesChange: PropTypes.func,
    collaborators: PropTypes.array,
};

export default ExcelView;
