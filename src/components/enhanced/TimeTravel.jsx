import React, { useState, useCallback } from 'react';
import { Clock, Camera, RotateCcw, ChevronRight, ChevronDown, Trash2, History, Calendar, CheckCircle, GitBranch, Download, Upload, AlertTriangle, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * TimeTravel - Project state snapshots component
 * Allows users to save and restore project states at any point,
 * enabling easy rollback and version comparison.
 */
export default function TimeTravel({ 
  snapshots = [], 
  onCreateSnapshot, 
  onRestoreSnapshot,
  onDeleteSnapshot,
  onExportSnapshot,
  onImportSnapshot,
  currentNodes = [],
  currentConnections = [],
  onClose
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreateSnapshot = useCallback(() => {
    if (!snapshotName.trim()) return;

    const snapshot = {
      id: `snapshot-${Date.now()}`,
      name: snapshotName.trim(),
      description: snapshotDescription.trim(),
      timestamp: new Date().toISOString(),
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      connections: JSON.parse(JSON.stringify(currentConnections)),
      metadata: {
        nodeCount: currentNodes.length,
        connectionCount: currentConnections.length,
        completedCount: currentNodes.filter(n => n.completed).length,
        pendingCount: currentNodes.filter(n => !n.completed).length
      }
    };

    onCreateSnapshot(snapshot);
    setSnapshotName('');
    setSnapshotDescription('');
    setShowNameInput(false);
  }, [snapshotName, snapshotDescription, currentNodes, currentConnections, onCreateSnapshot]);

  const handleRestore = useCallback((snapshot) => {
    if (confirmRestore === snapshot.id) {
      onRestoreSnapshot(snapshot);
      setConfirmRestore(null);
    } else {
      setConfirmRestore(snapshot.id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirmRestore(null), 3000);
    }
  }, [confirmRestore, onRestoreSnapshot]);

  const handleExport = useCallback((snapshot) => {
    const dataStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${snapshot.name.replace(/\s+/g, '-').toLowerCase()}-${new Date(snapshot.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const snapshot = JSON.parse(e.target.result);
        // Validate snapshot structure
        if (snapshot.nodes && snapshot.connections && snapshot.name) {
          snapshot.id = `imported-${Date.now()}`;
          snapshot.timestamp = new Date().toISOString();
          onImportSnapshot?.(snapshot);
        }
      } catch (error) {
        console.error('Failed to import snapshot:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [onImportSnapshot]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate current project stats
  const currentStats = {
    nodeCount: currentNodes.length,
    completedCount: currentNodes.filter(n => n.completed).length,
    connectionCount: currentConnections.length
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-md md:w-96 max-h-[80vh] flex flex-col mx-4">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Time Travel</h3>
              <p className="text-sm text-cyan-100">
                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Current state indicator */}
          <div className="px-4 py-3 bg-cyan-50 border-b border-cyan-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">Current State</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {currentStats.nodeCount} nodes
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {currentStats.completedCount} done
                </span>
              </div>
            </div>
          </div>

          {/* Create snapshot section */}
          <div className="p-4 border-b border-gray-100">
            {!showNameInput ? (
              <button
                onClick={() => setShowNameInput(true)}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Camera className="w-5 h-5" />
                Create Snapshot
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Snapshot name (e.g., 'Before redesign')"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                />
                
                <input
                  type="text"
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNameInput(false);
                      setSnapshotName('');
                      setSnapshotDescription('');
                    }}
                    className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSnapshot}
                    disabled={!snapshotName.trim()}
                    className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Snapshots list */}
          <div className="flex-1 overflow-y-auto">
            {snapshots.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No snapshots yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Create a snapshot to save your current progress
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {snapshots.map((snapshot, index) => (
                  <div
                    key={snapshot.id}
                    className="p-4 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Snapshot header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {snapshot.name}
                          </h4>
                          {index === 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded font-medium">
                              Latest
                            </span>
                          )}
                        </div>
                        {snapshot.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {snapshot.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1" title={formatFullDate(snapshot.timestamp)}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(snapshot.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {snapshot.metadata?.nodeCount || snapshot.nodes?.length || 0} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {snapshot.metadata?.completedCount || 0} done
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(snapshot)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                          confirmRestore === snapshot.id
                            ? 'bg-amber-500 text-white'
                            : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                        }`}
                      >
                        {confirmRestore === snapshot.id ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Click to confirm
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleExport(snapshot)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Export snapshot"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {onDeleteSnapshot && (
                        <button
                          onClick={() => onDeleteSnapshot(snapshot.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with import option */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Import Snapshot
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

TimeTravel.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    nodes: PropTypes.array.isRequired,
    connections: PropTypes.array.isRequired,
    metadata: PropTypes.shape({
      nodeCount: PropTypes.number,
      connectionCount: PropTypes.number,
      completedCount: PropTypes.number
    })
  })),
  onCreateSnapshot: PropTypes.func.isRequired,
  onRestoreSnapshot: PropTypes.func.isRequired,
  onDeleteSnapshot: PropTypes.func,
  onExportSnapshot: PropTypes.func,
  onImportSnapshot: PropTypes.func,
  currentNodes: PropTypes.array,
  currentConnections: PropTypes.array
};
