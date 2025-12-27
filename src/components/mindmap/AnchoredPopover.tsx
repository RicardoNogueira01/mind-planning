import React, { useEffect, useRef, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface AnchoredPopoverProps {
    anchorEl: HTMLElement | null;
    onClose?: () => void;
    width?: number;
    children?: ReactNode;
    className?: string;
}

const AnchoredPopover: React.FC<AnchoredPopoverProps> = ({
    anchorEl,
    onClose,
    width = 280,
    children,
    className = ''
}) => {
    const containerRef = useRef<HTMLDialogElement>(null);

    const getRect = (): DOMRect | null => {
        if (!anchorEl) return null;
        try {
            return anchorEl.getBoundingClientRect();
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent): void => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const rect = getRect();
    if (!rect) return null;

    const style: CSSProperties = {
        position: 'fixed',
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        top: Math.max(8, rect.bottom + 8),
        zIndex: 5000,
        width: `${width}px`
    };

    return createPortal(
        <dialog
            ref={containerRef}
            open
            className={`node-popup bg-white rounded-xl border border-gray-200 shadow-xl p-3 ${className}`}
            style={style}
        >
            {children}
        </dialog>,
        document.body
    );
};

export default AnchoredPopover;
