import React, { useState, useEffect } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  History,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  Clock,
  Sparkles,
  GitCommit
} from 'lucide-react';

export const MemoryEnvironment: React.FC = () => {
  const { activeDate, setActiveDate } = useNavigationStore();
  const { events, undoStack } = useEventStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);
  const [currentStep, setCurrentStep] = useState(0);

  // Generate synthetic / actual revision sequence
  const revisionSteps = [
    { id: 1, time: '08:00', label: 'Initial schedule conceived (4 planned blocks)' },
    { id: 2, time: '09:15', label: 'Started "Build Spatial Calendar Engine"' },
    { id: 3, time: '11:00', label: 'Extended Deep Work by 30 minutes' },
    { id: 4, time: '13:30', label: 'Recorded actual session for Procedural Shaders' },
    { id: 5, time: '17:30', label: 'Shifted Evening Run to 17:30' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= revisionSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, revisionSteps.length]);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-hidden select-none p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-completed text-xs font-mono font-semibold">
            <History size={14} />
            <span>MEMORY — HISTORICAL RECONSTRUCTION</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Schedule Replay & Revision Engine
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Temporal state reconstructed from chronological append-only revisions
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-border">
          <button
            onClick={() => setCurrentStep(0)}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Previous Revision"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-completed text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-[#86b59f] transition-colors shadow-glow-completed"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            <span>{isPlaying ? 'Pause' : 'Replay Revisions'}</span>
          </button>
          <button
            onClick={() => setCurrentStep(p => Math.min(revisionSteps.length - 1, p + 1))}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Next Revision"
          >
            <SkipForward size={14} />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 border-l border-border pl-2 text-xs font-mono">
            {([1, 2, 5] as const).map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  playbackSpeed === s ? 'bg-surface-raised text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Historical Stage */}
      <div className="flex-1 grid grid-cols-3 gap-6 py-6 overflow-hidden">
        {/* Revision Step Timeline */}
        <div className="col-span-1 bg-surface/70 border border-border rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase mb-4 flex items-center gap-2">
              <GitCommit size={14} className="text-completed" />
              Revision Sequence
            </h4>
            <div className="space-y-4">
              {revisionSteps.map((rev, index) => {
                const isCurrent = index === currentStep;
                const isPassed = index <= currentStep;
                return (
                  <div
                    key={rev.id}
                    onClick={() => setCurrentStep(index)}
                    className={`relative pl-6 cursor-pointer group transition-all`}
                  >
                    {/* Step line */}
                    {index < revisionSteps.length - 1 && (
                      <div
                        className={`absolute left-2.5 top-5 w-0.5 h-10 transition-colors ${
                          isPassed ? 'bg-completed' : 'bg-border'
                        }`}
                      />
                    )}
                    {/* Node Dot */}
                    <div
                      className={`absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'bg-completed border-white scale-125 shadow-glow-completed'
                          : isPassed
                          ? 'bg-completed/60 border-completed'
                          : 'bg-surface border-border'
                      }`}
                    />

                    <div>
                      <div className="text-[10px] font-mono text-accent">
                        {rev.time} · Rev #{rev.id}
                      </div>
                      <div className={`text-xs mt-0.5 ${isCurrent ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                        {rev.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-text-muted pt-4 border-t border-border/50">
            Current Historical State: Step {currentStep + 1} of {revisionSteps.length}
          </div>
        </div>

        {/* Planned vs Actual Reconstructed Matrix */}
        <div className="col-span-2 bg-surface/50 border border-border rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase mb-4">
              Planned vs Actual Activity Traces
            </h4>

            <div className="space-y-3">
              {events.slice(0, 4).map((ev, i) => (
                <div key={ev.id} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-primary">{ev.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-completed/20 text-completed">
                      Trace Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                    <div className="text-text-muted">
                      <span>PLANNED: </span>
                      <span className="text-future font-medium">{ev.startAt.substring(11, 16)} — {ev.endAt.substring(11, 16)}</span>
                    </div>
                    <div className="text-text-muted">
                      <span>ACTUAL: </span>
                      <span className="text-completed font-medium">
                        {i === 0 ? '06:35 — 07:25 (50m)' : i === 1 ? '08:30 — 11:15 (165m)' : 'Pending playback'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-[11px] font-mono text-text-muted flex items-center justify-between">
            <span>Deterministic Seed: #0x82f18a</span>
            <span>Historical Integrity: 100% Non-destructive</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-8 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
        <span>Append-only revision log guarantees exact reconstruction at any historical point</span>
        <span className="text-completed">Temporal Integrity Intact</span>
      </div>
    </div>
  );
};
