import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Enhanced Delete Confirmation Dialog
 * Shows implications of deleting a node with associated children
 * with Cancel, Delete (node only), and Delete All (with dropdown) buttons
 */
const DeleteConfirmDialog = ({
  show,
  onClose,
  onConfirm,
  onConfirmWithChildren,
  hasChildren = false,
  childrenCount = 0,
  nodeText = 'this node',
  descendantNodes = [], // Array of { id, text } for all descendants
  isMultiSelect = false
}) => {
  const [showDeleteAllDropdown, setShowDeleteAllDropdown] = useState(false);

  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      setShowDeleteAllDropdown(false); // Reset dropdown when dialog opens
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  // Generate implications list when node has children
  const implications = useMemo(() => {
    if (!hasChildren) return [];

    const list = [];

    // For multi-select, show simpler implications
    if (isMultiSelect) {
      list.push({
        icon: '🗑️',
        type: 'danger',
        title: `Delete ${childrenCount} nodes`,
        description: 'These nodes and their connections will be permanently removed'
      });
      return list;
    }

    // Connection changes
    list.push({
      icon: '🔗',
      type: 'warning',
      title: 'Connections will be removed',
      description: `All connections to and from "${nodeText}" will be deleted`
    });

    // Children impact
    if (childrenCount > 0) {
      list.push({
        icon: '📦',
        type: 'info',
        title: `${childrenCount} child node${childrenCount > 1 ? 's' : ''} will become orphaned`,
        description: 'If you delete only this node, children will lose their parent connection'
      });
    }

    // Cascade delete warning
    if (childrenCount > 0) {
      list.push({
        icon: '⚠️',
        type: 'danger',
        title: 'Cascade deletion available',
        description: `You can delete this node along with all ${childrenCount} descendant${childrenCount > 1 ? 's' : ''}`
      });
    }

    return list;
  }, [hasChildren, childrenCount, nodeText]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full border border-gray-100 overflow-hidden"
        style={{ maxWidth: hasChildren ? '520px' : '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900">
                {isMultiSelect ? 'Delete Selection?' : 'Delete Node?'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isMultiSelect
                  ? `Are you sure you want to delete these ${childrenCount} nodes?`
                  : <React.Fragment>Are you sure you want to delete "<span className="font-medium text-gray-800">{nodeText}</span>"?</React.Fragment>
                }
              </p>
            </div>
          </div>
        </div>

        {/* Implications Section - Only show when node has children */}
        {hasChildren && implications.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              What will happen
            </h4>
            <div className="space-y-2.5">
              {implications.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${item.type === 'danger'
                    ? 'bg-red-50 border-red-200'
                    : item.type === 'warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                    }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.type === 'danger'
                      ? 'text-red-800'
                      : item.type === 'warning'
                        ? 'text-amber-800'
                        : 'text-blue-800'
                      }`}>
                      {item.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${item.type === 'danger'
                      ? 'text-red-600'
                      : item.type === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                      }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer with action buttons */}
        <div className="px-6 py-4 bg-white">
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* Cancel Button */}
            <button
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 order-last sm:order-first"
              onClick={onClose}
            >
              Cancel
            </button>

            {hasChildren ? (
              <>
                {/* Delete Node Only Button */}
                <button
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow"
                  onClick={onConfirm}
                  title="Delete only this node, children will become orphaned"
                  style={{ display: isMultiSelect ? 'none' : 'block' }}
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    </svg>
                    Delete
                  </span>
                </button>

                {/* Delete All with Dropdown */}
                <div className="relative">
                  <button
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                    onClick={() => setShowDeleteAllDropdown(!showDeleteAllDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    {isMultiSelect ? `Delete Items (${childrenCount})` : `Delete All (${childrenCount + 1})`}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${showDeleteAllDropdown ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Dropdown showing all nodes to be deleted */}
                  {showDeleteAllDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 w-72 max-h-64 overflow-auto bg-white rounded-xl shadow-2xl border border-gray-200 z-10">
                      <div className="sticky top-0 px-4 py-3 border-b border-gray-100 bg-red-50">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                          Nodes to be deleted({isMultiSelect ? childrenCount : childrenCount + 1})
                        </p>
                      </div>
                      <div className="p-2">
                        {/* The main node - only show if NOT multi-select */}
                        {!isMultiSelect && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 mb-1">
                            <span className="text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              </svg>
                            </span>
                            <span className="text-sm font-medium text-red-800 truncate flex-1">
                              {nodeText}
                            </span>
                            <span className="text-xs text-red-500 font-medium">Main</span>
                          </div>
                        )}

                        {/* Descendant nodes (or ALL nodes in multi-select) */}
                        {descendantNodes.length > 0 ? (
                          <div className="space-y-1 mt-2">
                            <p className="px-2 text-xs text-gray-500 font-medium">{isMultiSelect ? 'Selected Nodes:' : 'Descendants:'}</p>
                            {descendantNodes.map((node, index) => (
                              <div
                                key={node.id || index}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </span>
                                <span className="text-sm text-gray-700 truncate flex-1">
                                  {node.text || `Node ${index + 1}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : childrenCount > 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-500 italic">
                            + {childrenCount} {isMultiSelect ? 'node' : 'descendant node'}{childrenCount > 1 ? 's' : ''}
                          </p>
                        ) : null}
                      </div>

                      {/* Confirm Delete All button inside dropdown */}
                      <div className="sticky bottom-0 p-3 border-t border-gray-100 bg-gray-50">
                        <button
                          className="w-full px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm"
                          onClick={() => {
                            setShowDeleteAllDropdown(false);
                            isMultiSelect ? onConfirm() : onConfirmWithChildren();
                          }}
                        >
                          Confirm Delete {isMultiSelect ? 'Selection' : 'All'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Simple delete button for nodes without children */
              <button
                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow"
                onClick={onConfirm}
              >
                Yes, Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

DeleteConfirmDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onConfirmWithChildren: PropTypes.func,
  hasChildren: PropTypes.bool,
  childrenCount: PropTypes.number,
  nodeText: PropTypes.string,
  descendantNodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string
  })),
  isMultiSelect: PropTypes.bool
};

export default DeleteConfirmDialog;
