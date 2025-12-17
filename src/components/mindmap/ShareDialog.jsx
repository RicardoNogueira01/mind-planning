import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Share Dialog Component - Generate and share mind map links
 */
const ShareDialog = ({
  show,
  onClose,
  sharePermission,
  setSharePermission,
  shareLink,
  shareVisitors,
  onGenerateLink,
  onCopyLink,
  formatVisitorTime,
  onRemoveVisitor
}) => {
  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={() => {
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-md w-full border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Share Mind Map
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Choose permissions and generate a shareable link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Permission Selection */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Permission Level
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation">
              <input
                type="radio"
                name="permission"
                value="view"
                checked={sharePermission === 'view'}
                onChange={(e) => setSharePermission(e.target.value)}
                className="w-4 h-4 text-black focus:ring-2 focus:ring-black flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium text-gray-900">View Only</div>
                <div className="text-xs text-gray-500">Users can view but not edit</div>
              </div>
            </label>
            <label className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation">
              <input
                type="radio"
                name="permission"
                value="edit"
                checked={sharePermission === 'edit'}
                onChange={(e) => setSharePermission(e.target.value)}
                className="w-4 h-4 text-black focus:ring-2 focus:ring-black flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium text-gray-900">Can Edit</div>
                <div className="text-xs text-gray-500">Users can view and edit</div>
              </div>
            </label>
          </div>
        </div>

        {/* Visitor Tracking - Show always, not just when shareLink exists */}
        {shareVisitors.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              People with Access ({shareVisitors.length})
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 sm:space-y-2 border border-gray-200 rounded-lg p-2">
              {shareVisitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between gap-2 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {visitor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{visitor.name}</div>
                      <div className="text-xs text-gray-500">{formatVisitorTime(visitor.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${visitor.permission === 'edit'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {visitor.permission === 'edit' ? 'Edit' : 'View'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveVisitor(visitor.id);
                      }}
                      className="p-1 sm:p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors touch-manipulation"
                      title="Remove access"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Link */}
        {shareLink && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 min-w-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={onCopyLink}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm touch-manipulation flex-shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 justify-end border-t pt-3 sm:pt-4">
          <button
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm touch-manipulation"
            onClick={onGenerateLink}
          >
            {shareLink ? 'Regenerate Link' : 'Generate Link'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

ShareDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sharePermission: PropTypes.string.isRequired,
  setSharePermission: PropTypes.func.isRequired,
  shareLink: PropTypes.string.isRequired,
  shareVisitors: PropTypes.array.isRequired,
  onGenerateLink: PropTypes.func.isRequired,
  onCopyLink: PropTypes.func.isRequired,
  formatVisitorTime: PropTypes.func.isRequired,
  onRemoveVisitor: PropTypes.func.isRequired
};

export default ShareDialog;
