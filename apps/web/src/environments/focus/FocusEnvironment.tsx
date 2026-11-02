import React, { useState, useEffect, useRef } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  Flame
} from 'lucide-react';

export const FocusEnvironment: React.FC = () => {
  const { selectedEventId, setEnvironment } = useNavigationStore();
  const { events, updateEvent } = useEventStore();

  const selectedEvent = events.find(e => e.id === selectedEventId && !e.deletedAt) || events[0];

  // Timestamp-based elapsed calculation (avoids tab suspension drift!)
  const [isRunning, setIsRunning] = useState(false);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isRunning && startTimeRef.current !== null) {
        const now = Date.now();
        const deltaSec = Math.floor((now - startTimeRef.current) / 1000);
        setAccumulatedSeconds(prev => prev); // trigger render
      }
      animId = requestAnimationFrame(tick);
    };

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    if (startTimeRef.current !== null) {
      const segmentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setAccumulatedSeconds(prev => prev + segmentElapsed);
      startTimeRef.current = null;
    }
    setIsRunning(false);
  };

  const handleComplete = () => {
    handlePause();
    if (selectedEvent) {
      updateEvent(selectedEvent.id, { status: 'completed' });
    }
    setEnvironment('now');
  };

  // Current display seconds
  const currentElapsed = accumulatedSeconds + (isRunning && startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0);
  const mins = Math.floor(currentElapsed / 60);
  const secs = currentElapsed % 60;

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-hidden select-none p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEnvironment('now')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-text-primary transition-colors font-mono"
        >
          <ArrowLeft size={14} />
          <span>Exit to NOW</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-accent">
          <Flame size={14} />
          <span>ACTIVE TEMPORAL EXECUTION</span>
        </div>
      </div>

      {/* Main Focus Dial & Timer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted px-2.5 py-1 rounded bg-surface border border-border">
            Current Objective
          </span>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mt-2">
            {selectedEvent ? selectedEvent.title : 'Deep Focus Block'}
          </h1>
          {selectedEvent?.description && (
            <p className="text-sm text-text-secondary mt-1">
              {selectedEvent.description}
            </p>
          )}
        </div>

        {/* Big Monospace Stopwatch Display */}
        <div className="relative w-80 h-80 rounded-full border border-border bg-[#121419]/90 flex flex-col items-center justify-center shadow-glow-accent">
          <div className="absolute inset-2 rounded-full border border-dashed border-accent/30 animate-pulse" />
          <div className="text-6xl font-bold font-mono text-text-primary tracking-tighter">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="text-xs font-mono text-text-muted mt-2 tracking-widest uppercase">
            {isRunning ? 'RECORDING ACTUAL TIME' : 'PAUSED'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-accent text-black font-semibold text-sm flex items-center gap-2 hover:bg-[#e4b57e] transition-colors shadow-glow"
            >
              <Play size={16} fill="currentColor" />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 rounded-xl bg-surface-raised border border-border text-text-primary font-semibold text-sm flex items-center gap-2 hover:bg-surface transition-colors"
            >
              <Pause size={16} fill="currentColor" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleComplete}
            className="px-6 py-3 rounded-xl bg-completed text-black font-semibold text-sm flex items-center gap-2 hover:bg-[#86b59f] transition-colors shadow-glow-completed"
          >
            <CheckCircle2 size={16} />
            <span>Complete Activity</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-xs text-text-muted">
        Timer verified by UTC instant subtraction: Elapsed = CurrentInstant - StartedAt
      </div>
    </div>
  );
};
