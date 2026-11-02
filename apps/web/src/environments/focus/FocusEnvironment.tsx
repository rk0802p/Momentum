import React, { useState, useEffect, useRef } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import type { ActivitySegment, ActivitySession } from '@momentum/shared-types';
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  Flame,
  Tag
} from 'lucide-react';

export const FocusEnvironment: React.FC = () => {
  const { selectedEventId, setEnvironment, activeDate } = useNavigationStore();
  const { events, updateEvent, recordActivitySession, categories } = useEventStore();

  const selectedEvent = events.find(e => e.id === selectedEventId && !e.deletedAt) || events[0];
  const category = categories.find(c => c.id === selectedEvent?.categoryId);

  // Timestamp-based elapsed calculation (avoids tab suspension drift!)
  const [isRunning, setIsRunning] = useState(false);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [segments, setSegments] = useState<ActivitySegment[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    let animId: number;
    const tick = () => {
      if (isRunning && startTimeRef.current !== null) {
        setAccumulatedSeconds(prev => prev); // triggers continuous render
      }
      animId = requestAnimationFrame(tick);
    };

    if (isRunning) {
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const handleStart = () => {
    const now = Date.now();
    startTimeRef.current = now;
    setIsRunning(true);
  };

  const handlePause = () => {
    if (startTimeRef.current !== null) {
      const now = Date.now();
      const segmentElapsed = Math.floor((now - startTimeRef.current) / 1000);
      setAccumulatedSeconds(prev => prev + segmentElapsed);

      // Record interval segment
      setSegments(prev => [
        ...prev,
        {
          id: `seg-${Date.now()}`,
          sessionId: `sess-${selectedEvent?.id || 'demo'}`,
          startedAt: new Date(startTimeRef.current!).toISOString(),
          endedAt: new Date(now).toISOString(),
          durationSeconds: segmentElapsed
        }
      ]);

      startTimeRef.current = null;
    }
    setIsRunning(false);
  };

  const handleComplete = () => {
    handlePause();

    if (selectedEvent) {
      // Record actual session
      const nowIso = new Date().toISOString();
      const finalSession: ActivitySession = {
        id: `sess-${Date.now()}`,
        eventId: selectedEvent.id,
        userId: 'default-user',
        status: 'completed',
        startedAt: sessionStartTimeRef.current,
        endedAt: nowIso,
        segments: segments.length > 0 ? segments : [
          {
            id: `seg-${Date.now()}`,
            sessionId: `sess-${Date.now()}`,
            startedAt: sessionStartTimeRef.current,
            endedAt: nowIso,
            durationSeconds: Math.max(1, accumulatedSeconds)
          }
        ],
        createdAt: sessionStartTimeRef.current
      };

      recordActivitySession(finalSession);
      updateEvent(selectedEvent.id, { status: 'completed' });
    }

    setEnvironment('memory');
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
          <span>ACTIVE TEMPORAL EXECUTION · ZERO TAB-SUSPENSION DRIFT</span>
        </div>
      </div>

      {/* Main Focus Dial & Timer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-2 max-w-xl">
          <span
            className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border inline-flex items-center gap-1.5"
            style={{
              backgroundColor: `${category?.color || '#D6A66D'}20`,
              borderColor: `${category?.color || '#D6A66D'}40`,
              color: category?.color || '#D6A66D'
            }}
          >
            <Tag size={11} />
            <span>{category?.name || 'Objective'}</span>
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
          <div
            className={`absolute inset-2 rounded-full border border-dashed transition-all ${
              isRunning ? 'border-accent/40 animate-pulse' : 'border-border/40'
            }`}
          />
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
              <span>{accumulatedSeconds > 0 ? 'Resume Session' : 'Start Session'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 rounded-xl bg-surface-raised border border-border text-text-primary font-semibold text-sm flex items-center gap-2 hover:bg-surface transition-colors"
            >
              <Pause size={16} fill="currentColor" />
              <span>Pause Interval</span>
            </button>
          )}

          <button
            onClick={handleComplete}
            className="px-6 py-3 rounded-xl bg-completed text-black font-semibold text-sm flex items-center gap-2 hover:bg-[#86b59f] transition-colors shadow-glow-completed"
          >
            <CheckCircle2 size={16} />
            <span>Complete & Log to MEMORY</span>
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
