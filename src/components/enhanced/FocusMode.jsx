import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Play, Pause, RotateCcw, Coffee, Volume2, VolumeX, Settings, X, CheckCircle, Clock, Flame, SkipForward } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * FocusMode - Pomodoro timer with distraction blocking
 * Helps users focus on specific tasks with built-in timer,
 * break management, and session tracking.
 */
export default function FocusMode({ selectedNode, onComplete, onClose }) {
  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartFocus: false
  });

  // Audio ref
  const audioRef = useRef(null);

  // Timer durations based on settings
  const FOCUS_TIME = settings.focusTime * 60;
  const SHORT_BREAK = settings.shortBreak * 60;
  const LONG_BREAK = settings.longBreak * 60;

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Play three beeps
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.3);
      }, 400);
      
      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        osc3.connect(gainNode);
        osc3.frequency.value = 1000;
        osc3.type = 'sine';
        osc3.start();
        osc3.stop(audioContext.currentTime + 0.5);
      }, 800);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        if (mode === 'focus') {
          setTotalFocusTime((total) => total + 1);
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      playSound();
      
      if (mode === 'focus') {
        const newSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(newSessionCount);
        
        // Determine break type
        const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
        const breakTime = isLongBreak ? LONG_BREAK : SHORT_BREAK;
        const breakMode = isLongBreak ? 'longBreak' : 'shortBreak';
        
        setTimeLeft(breakTime);
        setMode(breakMode);
        
        if (!settings.autoStartBreaks) {
          setIsActive(false);
          setIsPaused(false);
        }
      } else {
        // Break is over, back to focus
        setTimeLeft(FOCUS_TIME);
        setMode('focus');
        
        if (!settings.autoStartFocus) {
          setIsActive(false);
          setIsPaused(false);
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, mode, sessionsCompleted, settings, playSound, FOCUS_TIME, SHORT_BREAK, LONG_BREAK]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getCurrentDuration = () => {
    switch (mode) {
      case 'focus': return FOCUS_TIME;
      case 'shortBreak': return SHORT_BREAK;
      case 'longBreak': return LONG_BREAK;
      default: return FOCUS_TIME;
    }
  };

  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(FOCUS_TIME);
    setMode('focus');
  };

  const skipToNext = () => {
    if (mode === 'focus') {
      const isLongBreak = (sessionsCompleted + 1) % settings.sessionsUntilLongBreak === 0;
      setTimeLeft(isLongBreak ? LONG_BREAK : SHORT_BREAK);
      setMode(isLongBreak ? 'longBreak' : 'shortBreak');
      setSessionsCompleted(s => s + 1);
    } else {
      setTimeLeft(FOCUS_TIME);
      setMode('focus');
    }
    setIsActive(false);
    setIsPaused(false);
  };

  const handleMarkComplete = () => {
    if (selectedNode) {
      onComplete?.(selectedNode.id);
    }
  };

  const getModeColors = () => {
    switch (mode) {
      case 'focus':
        return {
          bg: 'from-indigo-500 to-purple-600',
          accent: 'bg-indigo-500',
          light: 'bg-indigo-100 text-indigo-700'
        };
      case 'shortBreak':
        return {
          bg: 'from-green-500 to-teal-600',
          accent: 'bg-green-500',
          light: 'bg-green-100 text-green-700'
        };
      case 'longBreak':
        return {
          bg: 'from-blue-500 to-cyan-600',
          accent: 'bg-blue-500',
          light: 'bg-blue-100 text-blue-700'
        };
      default:
        return {
          bg: 'from-indigo-500 to-purple-600',
          accent: 'bg-indigo-500',
          light: 'bg-indigo-100 text-indigo-700'
        };
    }
  };

  const colors = getModeColors();

  // Settings panel
  if (showSettings) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xs sm:w-80 overflow-hidden mx-4">
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Timer Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Time settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.focusTime}
              onChange={(e) => setSettings(s => ({ ...s, focusTime: parseInt(e.target.value) || 25 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreak}
              onChange={(e) => setSettings(s => ({ ...s, shortBreak: parseInt(e.target.value) || 5 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreak}
              onChange={(e) => setSettings(s => ({ ...s, longBreak: parseInt(e.target.value) || 15 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sessions until long break
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.sessionsUntilLongBreak}
              onChange={(e) => setSettings(s => ({ ...s, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Auto-start toggles */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-start breaks</span>
              <button
                onClick={() => setSettings(s => ({ ...s, autoStartBreaks: !s.autoStartBreaks }))}
                className={`w-10 h-6 rounded-full transition-colors ${
                  settings.autoStartBreaks ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  settings.autoStartBreaks ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-start focus</span>
              <button
                onClick={() => setSettings(s => ({ ...s, autoStartFocus: !s.autoStartFocus }))}
                className={`w-10 h-6 rounded-full transition-colors ${
                  settings.autoStartFocus ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  settings.autoStartFocus ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </label>
          </div>

          <button
            onClick={() => {
              setTimeLeft(settings.focusTime * 60);
              setShowSettings(false);
            }}
            className="w-full py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          >
            Save & Apply
          </button>
        </div>
      </div>
    );
  }

  // No task selected state
  if (!selectedNode) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xs sm:w-80 p-6 text-center mx-4">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Focus Mode</h3>
        <p className="text-sm text-gray-500">Select a task to start focusing</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs sm:w-80 bg-gradient-to-br ${colors.bg} mx-4`}>
      {/* Header */}
      <div className="p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {mode === 'focus' ? (
              <Target className="w-5 h-5" />
            ) : (
              <Coffee className="w-5 h-5" />
            )}
            <span className="font-semibold text-sm uppercase tracking-wide">
              {mode === 'focus' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Timer settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Task name */}
        <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
          <p className="text-sm text-white/90 truncate">{selectedNode.text}</p>
        </div>
      </div>

      {/* Timer display */}
      <div className="bg-white/10 backdrop-blur p-6">
        <div className="text-center">
          {/* Time */}
          <div className="text-6xl font-bold text-white font-mono mb-4 tracking-tight">
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => {
                if (!isActive) {
                  startTimer();
                } else if (isPaused) {
                  resumeTimer();
                } else {
                  pauseTimer();
                }
              }}
              className="p-5 bg-white text-indigo-600 rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {!isActive || isPaused ? (
                <Play className="w-7 h-7" />
              ) : (
                <Pause className="w-7 h-7" />
              )}
            </button>

            <button
              onClick={skipToNext}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Skip to next"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Mark complete button */}
          {mode === 'focus' && (
            <button
              onClick={handleMarkComplete}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Task Complete
            </button>
          )}
        </div>
      </div>

      {/* Session stats */}
      <div className="bg-white/5 px-4 py-3 flex items-center justify-between text-white/80 text-sm">
        <div className="flex items-center gap-4">
          {/* Session dots */}
          <div className="flex items-center gap-1">
            {[...Array(settings.sessionsUntilLongBreak)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < (sessionsCompleted % settings.sessionsUntilLongBreak) ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            {sessionsCompleted} sessions
          </span>
        </div>
        
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatTotalTime(totalFocusTime)} focused
        </span>
      </div>
    </div>
  );
}

FocusMode.propTypes = {
  selectedNode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string
  }),
  onComplete: PropTypes.func,
  onClose: PropTypes.func
};
