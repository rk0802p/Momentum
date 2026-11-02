import React from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  Clock,
  Tag,
  AlertTriangle,
  Play,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const EventInspector: React.FC = () => {
  const {
    selectedEventId,
    setSelectedEventId,
    openEditor,
    setEnvironment
  } = useNavigationStore();

  const { events, categories, deleteEvent, getOverlaps } = useEventStore();

  const selectedEvent = events.find(e => e.id === selectedEventId && !e.deletedAt);
  if (!selectedEvent) return null;

  const category = categories.find(c => c.id === selectedEvent.categoryId);
  const overlaps = getOverlaps().filter(
    o => o.eventAId === selectedEvent.id || o.eventBId === selectedEvent.id
  );

  const startD = new Date(selectedEvent.startAt);
  const endD = new Date(selectedEvent.endAt);
  const durationMin = Math.round((endD.getTime() - startD.getTime()) / 60000);

  const handleDelete = () => {
    if (confirm(`Delete "${selectedEvent.title}"?`)) {
      deleteEvent(selectedEvent.id);
      setSelectedEventId(null);
    }
  };

  return (
    <aside className="w-80 h-full border-l border-border bg-[#121419]/95 backdrop-blur-md p-5 flex flex-col justify-between select-none shrink-0 z-20">
      <div className="space-y-6 overflow-y-auto">
        {/* Header with Title and Close */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded tracking-wider mb-2"
              style={{
                backgroundColor: `${category?.color || '#829AB9'}20`,
                color: category?.color || '#829AB9'
              }}
            >
              <Tag size={10} />
              {category?.name || 'General'}
            </span>
            <h3 className="text-base font-semibold text-text-primary tracking-tight leading-snug">
              {selectedEvent.title}
            </h3>
          </div>
          <button
            onClick={() => setSelectedEventId(null)}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Time and Duration Badge */}
        <div className="bg-surface-raised p-3.5 rounded-xl border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">INTERVAL</span>
            <span className="text-accent font-semibold">{durationMin} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-text-primary">
            <Clock size={14} className="text-accent" />
            <span>
              {startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              {' — '}
              {endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
          <div className="text-[11px] font-mono text-text-muted flex items-center gap-1.5 pt-1 border-t border-border/50">
            <Calendar size={12} />
            <span>{selectedEvent.startAt.substring(0, 10)}</span>
            <span className="opacity-60">({selectedEvent.timezone})</span>
          </div>
        </div>

        {/* Description */}
        {selectedEvent.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono text-text-muted tracking-wider">DESCRIPTION</h4>
            <p className="text-xs text-text-secondary leading-relaxed bg-surface/50 p-3 rounded-lg border border-border/50">
              {selectedEvent.description}
            </p>
          </div>
        )}

        {/* Overlap / Collision Warning */}
        {overlaps.length > 0 && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-warning text-xs font-semibold">
              <AlertTriangle size={14} />
              <span>Temporal Collision Detected</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Overlaps with {overlaps.length} other scheduled commitment(s).
            </p>
          </div>
        )}

        {/* Status Indicator */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-mono text-text-muted tracking-wider">STATUS</h4>
          <div className="flex items-center gap-2 text-xs font-mono text-text-primary capitalize">
            <div
              className={`w-2 h-2 rounded-full ${
                selectedEvent.status === 'completed'
                  ? 'bg-completed'
                  : selectedEvent.status === 'in_progress'
                  ? 'bg-accent animate-pulse'
                  : 'bg-future'
              }`}
            />
            <span>{selectedEvent.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t border-border">
        {/* Launch Focus */}
        <button
          onClick={() => setEnvironment('focus')}
          className="w-full py-2.5 px-3 rounded-lg bg-accent text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#e4b57e] transition-colors shadow-glow"
        >
          <Play size={14} fill="currentColor" />
          <span>Enter Focus Session</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit Event */}
          <button
            onClick={() => openEditor(selectedEvent)}
            className="flex-1 py-2 px-3 rounded-lg bg-surface border border-border hover:bg-surface-raised text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>

          {/* Delete Event */}
          <button
            onClick={handleDelete}
            className="py-2 px-3 rounded-lg bg-surface border border-border hover:bg-warning/20 hover:border-warning/40 text-xs text-warning flex items-center justify-center transition-colors"
            title="Delete Event"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};
