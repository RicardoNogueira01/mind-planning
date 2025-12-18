import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table2, Download, Upload, Copy, Clipboard, Search, Filter, Plus, Trash2, ChevronDown } from 'lucide-react';

/**
 * Excel View for Mind Map Tasks
 * Emulates a Google Sheets-like interface with editable cells,
 * formula support, and import/export capabilities
 */
const ExcelView = ({ nodes, connections, onNodeUpdate, onNodesChange }) => {
    // Column definitions with Google Sheets-like structure
    const defaultColumns = [
        { id: 'id', label: 'ID', width: 80, type: 'text', editable: false },
        { id: 'text', label: 'Task Name', width: 200, type: 'text', editable: true },
        { id: 'status', label: 'Status', width: 120, type: 'select', editable: true, options: ['not-started', 'in-progress', 'review', 'completed'] },
        { id: 'priority', label: 'Priority', width: 100, type: 'select', editable: true, options: ['low', 'medium', 'high'] },
        { id: 'startDate', label: 'Start Date', width: 140, type: 'date', editable: true },
        { id: 'dueDate', label: 'Due Date', width: 140, type: 'date', editable: true },
        { id: 'progress', label: 'Progress', width: 100, type: 'number', editable: true },
        { id: 'sprint', label: 'Sprint', width: 100, type: 'text', editable: true },
        { id: 'tags', label: 'Tags', width: 150, type: 'tags', editable: true },
        { id: 'notes', label: 'Notes', width: 250, type: 'text', editable: true },
        { id: 'assignee', label: 'Assignee', width: 120, type: 'text', editable: true },
    ];

    const [columns] = useState(defaultColumns);
    const [selectedCell, setSelectedCell] = useState(null); // { rowId, colId }
    const [editingCell, setEditingCell] = useState(null); // { rowId, colId, value }
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
    const [showFormulas, setShowFormulas] = useState(false);
    const [formulaBarValue, setFormulaBarValue] = useState('');
    const [copiedCells, setCopiedCells] = useState(null);

    const tableRef = useRef(null);
    const inputRef = useRef(null);

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
        const value = node ? (node[colId] ?? '') : '';
        setEditingCell({ rowId, colId, value: Array.isArray(value) ? value.join(', ') : value });
    };

    // Handle cell value change
    const handleCellChange = useCallback((rowId, colId, value) => {
        const column = columns.find(c => c.id === colId);

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
            inputRef.current.select();
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
    const formatCellValue = (node, column) => {
        const value = node[column.id];

        if (value === undefined || value === null) return '';

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
            case 'select':
                return value || '';
            default:
                return String(value);
        }
    };

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
                        className="w-full h-full px-2 py-1 text-sm border-2 border-blue-500 outline-none bg-white"
                    >
                        <option value="">-</option>
                        {column.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
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
                    className="w-full h-full px-2 py-1 text-sm border-2 border-blue-500 outline-none bg-white"
                />
            );
        }

        const value = formatCellValue(node, column);

        // Special rendering for status and priority
        if (column.id === 'status' && value) {
            return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(value)}`}>
                    {value}
                </span>
            );
        }

        if (column.id === 'priority' && value) {
            return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(value)}`}>
                    {value}
                </span>
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
                                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-48"
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
                                if (e.key === 'Enter' && selectedCell) {
                                    handleCellChange(selectedCell.rowId, selectedCell.colId, formulaBarValue);
                                }
                            }}
                            placeholder="Enter value or formula..."
                            className="flex-1 text-sm border-none outline-none bg-transparent"
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
        </div>
    );
};

ExcelView.propTypes = {
    nodes: PropTypes.array.isRequired,
    connections: PropTypes.array,
    onNodeUpdate: PropTypes.func,
    onNodesChange: PropTypes.func,
};

export default ExcelView;
