import React, { useEffect, MouseEvent } from 'react';
import { createPortal } from 'react-dom';

interface DetachConfirmDialogProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * Detach Confirmation Dialog - Confirm detaching node from parent
 */
const DetachConfirmDialog: React.FC<DetachConfirmDialogProps> = ({
    show,
    onClose,
    onConfirm
}) => {
    // Lock body scroll when dialog is open
    useEffect(() => {
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

    const handleBackdropClick = (): void => {
        onClose();
    };

    const handleDialogClick = (e: MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-md w-full border border-gray-200"
                onClick={handleDialogClick}
            >
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                            <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path>
                            <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path>
                            <line x1="8" x2="8" y1="2" y2="5"></line>
                            <line x1="2" x2="5" y1="8" y2="8"></line>
                            <line x1="16" x2="16" y1="19" y2="22"></line>
                            <line x1="19" x2="22" y1="16" y2="16"></line>
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                            Detach Node?
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                            Are you sure you want to detach this node from its parent? The node will remain but the connection will be removed.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 justify-end">
                    <button
                        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm touch-manipulation"
                        onClick={onConfirm}
                    >
                        Yes, Detach
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DetachConfirmDialog;
