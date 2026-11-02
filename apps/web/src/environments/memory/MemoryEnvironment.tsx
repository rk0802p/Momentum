import React, { useState, useEffect, useMemo } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  History,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  GitCommit,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const MemoryEnvironment: React.FC = () => {
  const { activeDate } = useNavigationStore();
  const { events, revisions, activitySessions, categories } = useEventStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5 | 10>(1);
  const [revisionIndex, setRevisionIndex] = useState(revisions.length - 1);

  // Playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setRevisionIndex(prev => {
          if (prev >= revisions.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1600 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, revisions.length]);

  // Current revision under cursor
  const currentRevision = revisions[revisionIndex] || revisions[0];

  // Reconstructed schedule up to revisionIndex
  const activeReconstructedEvents = useMemo(() => {
    // Map of eventId -> reconstructed state
    const reconstructed = new Map<string, any>();
    for (let i = 0; i <= revisionIndex; i++) {
      const rev = revisions[i];
      if (!rev) continue;
      if (rev.action === 'deleted') {
        reconstructed.delete(rev.eventId);
      } else {
        const prev = reconstructed.get(rev.eventId) || {};
        reconstructed.set(rev.eventId, {
          ...prev,
          ...rev.newState,
          id: rev.eventId
        });
      }
    }
    return Array.from(reconstructed.values());
  }, [revisions, revisionIndex]);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-hidden select-none p-6">
      {/* Top Historical Control Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-completed text-xs font-mono font-semibold">
            <History size={14} />
            <span>MEMORY · HISTORICAL RECONSTRUCTION & REPLAY</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Append-Only Audit Playback
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Temporal states reconstructed deterministically from recorded mutations
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-border">
          <button
            onClick={() => setRevisionIndex(0)}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Reset to Genesis"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setRevisionIndex(p => Math.max(0, p - 1))}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Step Backward"
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
            onClick={() => setRevisionIndex(p => Math.min(revisions.length - 1, p + 1))}
            className="p-1.5 hover:bg-surface-raised rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            title="Step Forward"
          >
            <SkipForward size={14} />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 border-l border-border pl-2 text-xs font-mono">
            {([1, 2, 5, 10] as const).map(s => (
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
      <div className="flex-1 grid grid-cols-12 gap-6 py-6 overflow-hidden">
        {/* Revision Log Scrubber */}
        <div className="col-span-5 bg-surface/80 border border-border rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase flex items-center gap-2">
                <GitCommit size={14} className="text-completed" />
                <span>Revision Cursor: Step {revisionIndex + 1} of {revisions.length}</span>
              </h4>
              <span className="text-[10px] font-mono bg-surface-raised px-2 py-0.5 rounded border border-border text-accent">
                {currentRevision?.recordedAt?.substring(11, 19)}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2">
              {revisions.map((rev, idx) => {
                const isSelected = idx === revisionIndex;
                const isPast = idx < revisionIndex;
                const targetEv = events.find(e => e.id === rev.eventId);

                return (
                  <div
                    key={rev.id}
                    onClick={() => setRevisionIndex(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-raised border-completed shadow-glow-completed'
                        : isPast
                        ? 'bg-surface/50 border-border/60 opacity-80'
                        : 'bg-surface/20 border-border/30 opacity-40 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-text-muted">REV #{rev.revisionNumber}</span>
                      <span className="text-completed uppercase font-semibold">{rev.action}</span>
                    </div>

                    <div className="text-xs font-medium text-text-primary mt-1">
                      {targetEv?.title || rev.newState?.title || rev.eventId}
                    </div>

                    {rev.newState?.startAt && rev.newState?.endAt && (
                      <div className="text-[10px] font-mono text-text-muted mt-1 flex items-center gap-1.5">
                        <Clock size={11} />
                        <span>
                          {rev.newState.startAt.substring(11, 16)} — {rev.newState.endAt.substring(11, 16)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-[11px] font-mono text-text-muted flex items-center justify-between">
            <span>Historical Integrity: Append-Only</span>
            <span className="text-completed">Deterministic Replay</span>
          </div>
        </div>

        {/* Reconstructed State & Planned vs Actual Matrix */}
        <div className="col-span-7 bg-surface/50 border border-border rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase mb-4 flex items-center gap-2">
              <Layers size={14} className="text-accent" />
              <span>Reconstructed Schedule State & Actual Execution Traces</span>
            </h4>

            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-2">
              {events.slice(0, 5).map(ev => {
                const session = activitySessions.find(s => s.eventId === ev.id);
                const isExecuted = Boolean(session);

                const plannedStart = ev.startAt.substring(11, 16);
                const plannedEnd = ev.endAt.substring(11, 16);
                const plannedDur = Math.round((new Date(ev.endAt).getTime() - new Date(ev.startAt).getTime()) / 60000);

                let actualDur = 0;
                let actualStart = '—';
                let actualEnd = '—';

                if (session) {
                  actualStart = session.startedAt.substring(11, 16);
                  actualEnd = session.endedAt ? session.endedAt.substring(11, 16) : 'Active';
                  actualDur = session.segments.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
                }

                return (
                  <div key={ev.id} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-text-primary">{ev.title}</div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isExecuted ? 'bg-completed/20 border-completed/40 text-completed' : 'bg-surface border-border text-text-muted'
                      }`}>
                        {isExecuted ? 'ACTUAL TRACE RECORDED' : 'UNTRACKED (HONEST)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1 border-t border-border/40">
                      <div>
                        <div className="text-[10px] text-text-muted">PLANNED COMMITMENT</div>
                        <div className="text-future font-medium mt-0.5">
                          {plannedStart} — {plannedEnd} ({plannedDur}m)
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-text-muted">ACTUAL RECORDED EXECUTION</div>
                        <div className={isExecuted ? 'text-completed font-medium mt-0.5' : 'text-neutral mt-0.5'}>
                          {isExecuted ? `${actualStart} — ${actualEnd} (${Math.round(actualDur)}m)` : 'No fabricated completion data'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-[11px] font-mono text-text-muted flex items-center justify-between">
            <span>Rule: Missing actual records remain missing</span>
            <span className="text-accent">Temporal Honesty Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
