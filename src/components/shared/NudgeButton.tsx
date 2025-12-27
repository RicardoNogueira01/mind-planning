/**
 * NudgeButton Component
 * 
 * A fun "poke" feature for conversations that:
 * - Shakes the recipient's screen
 * - Plays a playful notification sound
 * - Limited to 5 nudges per day per user
 * 
 * Features:
 * - Animated button with wobble effect
 * - Countdown timer showing remaining nudges
 * - Fun emoji animation when clicked
 * - Sound effect (can be toggled)
 */

import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { NudgeButtonProps, NudgeReceiverProps, NudgePayload, UseNudgeReturn } from './types';

// Extend Window interface for webkit audio context
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

// Generate a playful notification sound using Web Audio API
const playNudgeSound = (): void => {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        const audioContext = new AudioContextClass();

        // Create a fun "boing" sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Playful ascending tones
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);

        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator2.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);

        // Volume envelope - quick attack, quick decay
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);

        // Second boing for extra fun
        setTimeout(() => {
            const osc3 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc3.connect(gain2);
            gain2.connect(audioContext.destination);

            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(500, audioContext.currentTime);
            osc3.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.08);
            osc3.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.15);

            gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            osc3.start(audioContext.currentTime);
            osc3.stop(audioContext.currentTime + 0.2);
        }, 150);

    } catch (error) {
        console.log('Audio not available:', error);
    }
};

// Storage key for tracking daily nudges
const getNudgeStorageKey = (userId: string): string => `nudges_${userId}_${new Date().toDateString()}`;

// Get remaining nudges for today
const getRemainingNudges = (userId: string, maxNudges: number = 5): number => {
    const key = getNudgeStorageKey(userId);
    const stored = localStorage.getItem(key);
    const count = stored ? parseInt(stored, 10) : 0;
    return Math.max(0, maxNudges - count);
};

// Increment nudge count
const incrementNudgeCount = (userId: string): void => {
    const key = getNudgeStorageKey(userId);
    const stored = localStorage.getItem(key);
    const count = stored ? parseInt(stored, 10) : 0;
    localStorage.setItem(key, (count + 1).toString());
};

/**
 * NudgeButton - The button to send a nudge
 */
export const NudgeButton: React.FC<NudgeButtonProps> = ({
    recipientId,
    recipientName,
    senderId,
    onNudge,
    maxNudgesPerDay = 5,
    disabled = false,
}) => {
    const [remaining, setRemaining] = useState<number>(() => getRemainingNudges(senderId, maxNudgesPerDay));
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [justNudged, setJustNudged] = useState<boolean>(false);

    const handleNudge = useCallback(() => {
        if (remaining <= 0 || disabled || isAnimating) return;

        // Animate button
        setIsAnimating(true);
        setJustNudged(true);

        // Play sound on sender side too (quieter)
        playNudgeSound();

        // Decrement remaining
        incrementNudgeCount(senderId);
        setRemaining(prev => prev - 1);

        // Call the nudge callback
        onNudge?.({
            from: senderId,
            to: recipientId,
            timestamp: Date.now(),
        });

        // Reset animations
        setTimeout(() => {
            setIsAnimating(false);
        }, 600);

        setTimeout(() => {
            setJustNudged(false);
        }, 2000);

    }, [remaining, disabled, isAnimating, senderId, recipientId, onNudge]);

    const canNudge = remaining > 0 && !disabled && !isAnimating;

    return (
        <div className="relative inline-block">
            {/* Tooltip */}
            {showTooltip && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div className="font-medium">
                        {remaining > 0
                            ? `Nudge ${recipientName}!`
                            : 'No nudges left today 😅'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        {remaining} of {maxNudgesPerDay} remaining
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="border-8 border-transparent border-t-gray-900" />
                    </div>
                </div>
            )}

            {/* Just nudged feedback */}
            {justNudged && (
                <div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    style={{ animation: 'floatUp 2s ease-out forwards' }}
                >
                    <span className="text-2xl">👋</span>
                </div>
            )}

            {/* Main button */}
            <button
                onClick={handleNudge}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={!canNudge}
                className={`
          relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium
          transition-all duration-200 
          ${canNudge
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30 cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
          ${isAnimating ? 'animate-wiggle' : ''}
        `}
                style={{
                    animation: isAnimating ? 'wiggle 0.5s ease-in-out' : undefined,
                }}
            >
                {/* Icon */}
                <span className={`text-xl ${isAnimating ? 'animate-bounce' : ''}`}>
                    {remaining > 0 ? '👋' : '😴'}
                </span>

                {/* Text */}
                <span>Nudge</span>

                {/* Remaining count badge */}
                <span
                    className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold
            flex items-center justify-center
            ${remaining > 0
                            ? 'bg-white text-orange-600 shadow-md'
                            : 'bg-gray-300 text-gray-600'
                        }
          `}
                >
                    {remaining}
                </span>
            </button>

            {/* Styles */}
            <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -30px) scale(1.5); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
        </div>
    );
};

interface NudgeEventDetail {
    from?: string;
    fromName?: string;
}

/**
 * NudgeReceiver - Component that handles receiving nudges
 * Wrap your app/page with this to enable screen shake effect
 */
export const NudgeReceiver: React.FC<NudgeReceiverProps> = ({ children }) => {
    const [isShaking, setIsShaking] = useState<boolean>(false);
    const [nudgeFrom, setNudgeFrom] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Listen for nudge events (you'd replace this with your real-time system like WebSocket)
    useEffect(() => {
        const handleNudge = (event: CustomEvent<NudgeEventDetail>) => {
            const { from, fromName } = event.detail || {};

            setNudgeFrom(fromName || 'Someone');
            setIsShaking(true);
            setShowNotification(true);

            // Play the nudge sound
            playNudgeSound();

            // Stop shaking after animation
            setTimeout(() => {
                setIsShaking(false);
            }, 500);

            // Hide notification after a while
            setTimeout(() => {
                setShowNotification(false);
                setNudgeFrom(null);
            }, 4000);
        };

        window.addEventListener('nudge-received', handleNudge as EventListener);
        return () => window.removeEventListener('nudge-received', handleNudge as EventListener);
    }, []);

    return (
        <div
            ref={containerRef}
            className={isShaking ? 'nudge-shake' : ''}
            style={{ minHeight: '100%' }}
        >
            {children}

            {/* Nudge notification popup */}
            {showNotification && (
                <div
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999]"
                    style={{ animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl shadow-2xl shadow-orange-500/40">
                        <span className="text-4xl animate-bounce">👋</span>
                        <div>
                            <p className="font-bold text-lg">{nudgeFrom} nudged you!</p>
                            <p className="text-sm text-white/80">Hey! Pay attention! 😄</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Shake animation styles */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10% { transform: translateX(-10px) rotate(-1deg); }
          20% { transform: translateX(10px) rotate(1deg); }
          30% { transform: translateX(-10px) rotate(-1deg); }
          40% { transform: translateX(10px) rotate(1deg); }
          50% { transform: translateX(-8px) rotate(-0.5deg); }
          60% { transform: translateX(8px) rotate(0.5deg); }
          70% { transform: translateX(-5px) rotate(-0.25deg); }
          80% { transform: translateX(5px) rotate(0.25deg); }
          90% { transform: translateX(-2px) rotate(0); }
        }
        
        .nudge-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: translate(-50%, -50px) scale(0.5); }
          50% { transform: translate(-50%, 10px) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
        </div>
    );
};

/**
 * Utility function to trigger a nudge (for testing or direct calls)
 */
export function triggerNudge(fromName: string): void {
    window.dispatchEvent(new CustomEvent('nudge-received', {
        detail: { fromName }
    }));
}

/**
 * useNudge hook - For components that want to integrate nudge functionality
 */
export function useNudge(userId: string, maxNudgesPerDay: number = 5): UseNudgeReturn {
    const [remaining, setRemaining] = useState<number>(() => getRemainingNudges(userId, maxNudgesPerDay));

    const sendNudge = useCallback((recipientId: string, recipientName: string, socket?: any): boolean => {
        if (remaining <= 0) return false;

        incrementNudgeCount(userId);
        setRemaining(prev => prev - 1);

        // If using socket.io or similar, emit the nudge
        if (socket) {
            socket.emit('nudge', { to: recipientId, from: userId });
        }

        // Play sound
        playNudgeSound();

        return true;
    }, [remaining, userId]);

    return {
        remaining,
        maxNudgesPerDay,
        sendNudge,
        canNudge: remaining > 0,
    };
}

export default NudgeButton;
