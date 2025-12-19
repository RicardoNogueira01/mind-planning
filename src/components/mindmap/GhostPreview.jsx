/**
 * GhostPreview Component
 * 
 * A sophisticated translucent preview system that shows users where new nodes
 * will be placed before confirming. Features:
 * - Smooth mouse-following with interpolation
 * - Pulsing glow effects
 * - Glassmorphism styling
 * - Keyboard support (Enter to confirm, Escape to cancel)
 * - Connection line previews
 * - ALLOWS PANNING: Click and drag to move around the canvas
 * - Only triggers placement on simple clicks (not drags)
 * - Shows confirmation popup before placing
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

// Smooth interpolation for mouse following
const lerp = (start, end, factor) => start + (end - start) * factor;

// Threshold for distinguishing click from drag (in pixels)
const DRAG_THRESHOLD = 8;

export default function GhostPreview({
    show,
    nodes: previewNodes = [],
    connections: previewConnections = [],
    onConfirm,
    onCancel,
    zoom = 1,
    pan = { x: 0, y: 0 },
    onPanChange, // Callback to update pan in parent
    containerRef,
}) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
    const [isPlacing, setIsPlacing] = useState(false);
    const [showConfirmRipple, setShowConfirmRipple] = useState(false);

    // Click vs Drag detection
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [panStart, setPanStart] = useState(null);
    const [mouseDownPos, setMouseDownPos] = useState(null);

    // Confirmation popup state
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [confirmPosition, setConfirmPosition] = useState({ x: 0, y: 0, screenX: 0, screenY: 0 });

    const animationRef = useRef(null);
    const isInitializedRef = useRef(false);

    // Calculate bounding box of preview nodes
    const boundingBox = React.useMemo(() => {
        if (previewNodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

        const xs = previewNodes.map(n => n.x);
        const ys = previewNodes.map(n => n.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        return {
            minX,
            minY,
            maxX: maxX + 280,
            maxY: maxY + 80,
            width: maxX - minX + 280,
            height: maxY - minY + 80,
            centerX: (minX + maxX + 280) / 2,
            centerY: (minY + maxY + 80) / 2,
        };
    }, [previewNodes]);

    // Mouse movement handler
    const handleMouseMove = useCallback((e) => {
        if (!containerRef?.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to canvas coordinates
        const canvasX = (x - pan.x) / zoom;
        const canvasY = (y - pan.y) / zoom;

        setMousePos({ x: canvasX, y: canvasY });

        // Initialize smooth position on first move
        if (!isInitializedRef.current) {
            setSmoothPos({ x: canvasX, y: canvasY });
            isInitializedRef.current = true;
        }

        // Handle panning if dragging
        if (isDragging && dragStart && panStart && onPanChange) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            onPanChange({
                x: panStart.x + dx,
                y: panStart.y + dy,
            });
        }
    }, [pan, zoom, containerRef, isDragging, dragStart, panStart, onPanChange]);

    // Smooth animation loop
    useEffect(() => {
        if (!show) {
            isInitializedRef.current = false;
            return;
        }

        const animate = () => {
            setSmoothPos(prev => ({
                x: lerp(prev.x, mousePos.x, 0.15),
                y: lerp(prev.y, mousePos.y, 0.15),
            }));
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [show, mousePos]);

    // Event listeners
    useEffect(() => {
        if (!show) return;

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [show, handleMouseMove]);

    // Keyboard handlers
    useEffect(() => {
        if (!show) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showConfirmPopup) {
                    setShowConfirmPopup(false);
                } else {
                    onCancel?.();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, onCancel, showConfirmPopup]);

    // Mouse down handler - start potential pan
    const handleMouseDown = useCallback((e) => {
        if (showConfirmPopup) return; // Don't start drag if popup is open

        setMouseDownPos({ x: e.clientX, y: e.clientY });
        setDragStart({ x: e.clientX, y: e.clientY });
        setPanStart({ x: pan.x, y: pan.y });
    }, [pan, showConfirmPopup]);

    // Mouse up handler - determine if click or drag
    const handleMouseUp = useCallback((e) => {
        if (!mouseDownPos) return;

        const dx = Math.abs(e.clientX - mouseDownPos.x);
        const dy = Math.abs(e.clientY - mouseDownPos.y);
        const wasDrag = dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD;

        if (!wasDrag && !isPlacing && !showConfirmPopup) {
            // This was a click, not a drag - show confirmation popup
            const rect = containerRef?.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const canvasX = (x - pan.x) / zoom;
                const canvasY = (y - pan.y) / zoom;

                setConfirmPosition({
                    x: canvasX,
                    y: canvasY,
                    screenX: e.clientX,
                    screenY: e.clientY,
                });
                setShowConfirmPopup(true);
            }
        }

        setIsDragging(false);
        setDragStart(null);
        setPanStart(null);
        setMouseDownPos(null);
    }, [mouseDownPos, isPlacing, showConfirmPopup, containerRef, pan, zoom]);

    // Track if we're dragging (moved beyond threshold while mouse down)
    useEffect(() => {
        if (!mouseDownPos || !dragStart) return;

        const checkDrag = (e) => {
            const dx = Math.abs(e.clientX - dragStart.x);
            const dy = Math.abs(e.clientY - dragStart.y);
            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                setIsDragging(true);
            }
        };

        window.addEventListener('mousemove', checkDrag);
        return () => window.removeEventListener('mousemove', checkDrag);
    }, [mouseDownPos, dragStart]);

    // Handle placement confirmation
    const handleConfirmPlace = useCallback(() => {
        setIsPlacing(true);
        setShowConfirmRipple(true);
        setShowConfirmPopup(false);

        setTimeout(() => {
            onConfirm?.(confirmPosition);
            setIsPlacing(false);
            setShowConfirmRipple(false);
        }, 400);
    }, [onConfirm, confirmPosition]);

    // Cancel popup
    const handleCancelPopup = useCallback(() => {
        setShowConfirmPopup(false);
    }, []);

    if (!show || previewNodes.length === 0) return null;

    // Calculate offset to center the preview on mouse
    const offsetX = smoothPos.x - boundingBox.centerX + boundingBox.minX;
    const offsetY = smoothPos.y - boundingBox.centerY + boundingBox.minY;

    return createPortal(
        <div
            className="ghost-preview-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'auto',
            }}
        >
            {/* Instruction Banner */}
            <div
                className="ghost-preview-banner"
                style={{
                    position: 'fixed',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95))',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                    backdropFilter: 'blur(20px)',
                    animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 1001,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: 0 }}>
                            Click to place • Drag to pan
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
                            Find the perfect spot, then click to confirm placement
                        </p>
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                    Cancel
                </button>
            </div>

            {/* Confirmation Popup */}
            {showConfirmPopup && (
                <div
                    style={{
                        position: 'fixed',
                        left: confirmPosition.screenX,
                        top: confirmPosition.screenY,
                        transform: 'translate(-50%, -120%)',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        zIndex: 1002,
                        animation: 'popupSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        minWidth: '200px',
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Arrow pointing down */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: '16px',
                            height: '16px',
                            background: 'white',
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                        }}
                    />

                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '15px',
                            color: '#1f2937',
                        }}>
                            Place nodes here?
                        </p>
                        <p style={{
                            margin: '4px 0 0',
                            fontSize: '13px',
                            color: '#6b7280',
                        }}>
                            {previewNodes.length} node{previewNodes.length > 1 ? 's' : ''} will be added
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleCancelPopup}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                background: 'white',
                                color: '#374151',
                                fontWeight: '500',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmPlace}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                border: 'none',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            Add Here
                        </button>
                    </div>
                </div>
            )}

            {/* Ghost Preview Container */}
            <div
                className="ghost-preview-container"
                style={{
                    position: 'absolute',
                    left: `${(offsetX * zoom) + pan.x}px`,
                    top: `${(offsetY * zoom) + pan.y}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    transition: isPlacing ? 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                    opacity: isPlacing ? 1 : (showConfirmPopup ? 0.95 : 0.75),
                    filter: isPlacing ? 'none' : 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.3))',
                }}
            >
                {/* Placement ripple effect */}
                {showConfirmRipple && (
                    <div
                        style={{
                            position: 'absolute',
                            left: boundingBox.centerX - boundingBox.minX,
                            top: boundingBox.centerY - boundingBox.minY,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.4)',
                            transform: 'translate(-50%, -50%)',
                            animation: 'rippleExpand 0.5s ease-out forwards',
                        }}
                    />
                )}

                {/* Preview Connections */}
                <svg
                    style={{
                        position: 'absolute',
                        top: -50,
                        left: -50,
                        width: boundingBox.width + 100,
                        height: boundingBox.height + 100,
                        overflow: 'visible',
                        pointerEvents: 'none',
                    }}
                >
                    <defs>
                        <linearGradient id="ghostConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.6)" />
                            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
                        </linearGradient>
                    </defs>
                    {previewConnections.map((conn, idx) => {
                        const fromNode = previewNodes.find(n => n.id === conn.from);
                        const toNode = previewNodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        const fromX = (fromNode.x - boundingBox.minX) + 140 + 50;
                        const fromY = (fromNode.y - boundingBox.minY) + 40 + 50;
                        const toX = (toNode.x - boundingBox.minX) + 140 + 50;
                        const toY = (toNode.y - boundingBox.minY) + 40 + 50;

                        const dx = toX - fromX;
                        const controlOffset = Math.min(Math.abs(dx) * 0.4, 80);

                        return (
                            <path
                                key={`ghost-conn-${idx}`}
                                d={`M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${toX - controlOffset} ${toY}, ${toX} ${toY}`}
                                stroke="url(#ghostConnectionGradient)"
                                strokeWidth="2.5"
                                fill="none"
                                strokeDasharray="8 4"
                                style={{
                                    animation: 'dash 1s linear infinite',
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Preview Nodes */}
                {previewNodes.map((node, idx) => (
                    <div
                        key={node.id}
                        className="ghost-node"
                        style={{
                            position: 'absolute',
                            left: node.x - boundingBox.minX,
                            top: node.y - boundingBox.minY,
                            width: '280px',
                            minHeight: '70px',
                            background: node.bgColor === '#ffffff'
                                ? 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(248,250,252,0.85))'
                                : `linear-gradient(135deg, ${node.bgColor}dd, ${node.bgColor}aa)`,
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '2px solid',
                            borderColor: isPlacing
                                ? 'rgba(99, 102, 241, 1)'
                                : (showConfirmPopup ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.5)'),
                            boxShadow: isPlacing
                                ? '0 0 40px rgba(99, 102, 241, 0.6), 0 8px 32px rgba(0,0,0,0.1)'
                                : '0 0 20px rgba(99, 102, 241, 0.3), 0 8px 32px rgba(0,0,0,0.08)',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: isPlacing
                                ? 'solidify 0.4s ease-out forwards'
                                : (showConfirmPopup ? 'none' : `ghostFloat ${1.5 + idx * 0.2}s ease-in-out infinite, ghostPulse 2s ease-in-out infinite`),
                            animationDelay: `${idx * 0.1}s`,
                            transform: isPlacing ? 'scale(1)' : 'scale(0.98)',
                            transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                    >
                        {/* Node emoji if present */}
                        {node.emoji && (
                            <span style={{
                                fontSize: '24px',
                                marginRight: '12px',
                                opacity: 0.9,
                            }}>
                                {node.emoji}
                            </span>
                        )}

                        {/* Node text */}
                        <span style={{
                            color: node.fontColor || '#374151',
                            fontWeight: '500',
                            fontSize: '15px',
                            opacity: 0.9,
                            textAlign: 'center',
                            lineHeight: '1.4',
                        }}>
                            {node.text}
                        </span>

                        {/* Shimmer effect overlay */}
                        {!showConfirmPopup && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    pointerEvents: 'none',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '50%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                        animation: 'shimmer 2.5s ease-in-out infinite',
                                        animationDelay: `${idx * 0.3}s`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* Center crosshair indicator */}
                {!showConfirmPopup && (
                    <div
                        style={{
                            position: 'absolute',
                            left: boundingBox.centerX - boundingBox.minX - 12,
                            top: boundingBox.centerY - boundingBox.minY - 12,
                            width: '24px',
                            height: '24px',
                            pointerEvents: 'none',
                            animation: 'crosshairPulse 1.5s ease-in-out infinite',
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(99, 102, 241, 0.8)" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Styles */}
            <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -120%) scale(1);
          }
        }

        @keyframes ghostFloat {
          0%, 100% {
            transform: translateY(0) scale(0.98);
          }
          50% {
            transform: translateY(-4px) scale(0.99);
          }
        }

        @keyframes ghostPulse {
          0%, 100% {
            opacity: 0.75;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          50%, 100% {
            left: 200%;
          }
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }

        @keyframes crosshairPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes rippleExpand {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0.8;
          }
          100% {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        @keyframes solidify {
          0% {
            opacity: 0.75;
            transform: scale(0.98);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }

        .ghost-preview-overlay {
          user-select: none;
        }
      `}</style>
        </div>,
        document.body
    );
}

GhostPreview.propTypes = {
    show: PropTypes.bool.isRequired,
    nodes: PropTypes.array,
    connections: PropTypes.array,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    zoom: PropTypes.number,
    pan: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    }),
    onPanChange: PropTypes.func,
    containerRef: PropTypes.object,
};
