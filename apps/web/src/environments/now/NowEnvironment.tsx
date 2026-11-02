import React, { useMemo } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { RadialCalendar } from '../../rendering/radial/RadialCalendar';
import { LinearCalendar } from '../../rendering/linear/LinearCalendar';
import { EventInspector } from '../../components/inspector/EventInspector';
import { Clock, PieChart, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const NowEnvironment: React.FC = () => {
  const { spatialMode, activeDate, setActiveDate, selectedEventId } = useNavigationStore();
  const { events, getOverlaps } = useEventStore();

  const dayEvents = useMemo(() => {
    return events.filter(e => {
      if (e.deletedAt) return false;
      const startDay = e.startAt.substring(0, 10);
      const endDay = e.endAt.substring(0, 10);
      return startDay === activeDate || endDay === activeDate;
    });
  }, [events, activeDate]);

  // Total scheduled duration
  const totalScheduledMinutes = useMemo(() => {
    let total = 0;
    for (const ev of dayEvents) {
      const s = new Date(ev.startAt).getTime();
      const e = new Date(ev.endAt).getTime();
      total += Math.max(0, Math.round((e - s) / 60000));
    }
    return total;
  }, [dayEvents]);

  const freeMinutes = Math.max(0, 1440 - totalScheduledMinutes);
  const overlaps = useMemo(() => getOverlaps(), [events, getOverlaps]);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex overflow-hidden spatial-grid-bg relative">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Top Contextual Bar */}
        <div className="px-6 py-3 flex items-center justify-between text-xs font-mono text-text-secondary z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              NOW ENVIRONMENT
            </span>
            <span className="text-border">|</span>
            <span>24H SPATIAL PROJECTION</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">COMMITTED:</span>
              <span className="text-text-primary font-semibold">
                {Math.floor(totalScheduledMinutes / 60)}h {totalScheduledMinutes % 60}m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">UNALLOCATED:</span>
              <span className="text-neutral font-semibold">
                {Math.floor(freeMinutes / 60)}h {freeMinutes % 60}m
              </span>
            </div>
            {overlaps.length > 0 && (
              <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/30">
                <AlertCircle size={12} />
                <span>{overlaps.length} Overlap(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Visualization Stage */}
        <div className="flex-1 w-full flex items-center justify-center p-4">
          {spatialMode === 'radial' ? (
            <RadialCalendar size={680} />
          ) : (
            <LinearCalendar />
          )}
        </div>

        {/* Bottom Temporal Strip */}
        <div className="h-10 border-t border-border bg-[#0B0C0F]/80 backdrop-blur-sm px-6 flex items-center justify-between text-xs font-mono text-text-secondary z-10">
          <div className="flex items-center gap-4">
            <span className="text-text-muted text-[11px]">
              Direct Manipulation: Drag arc to move · Drag ends to resize · Double-click to create
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-text-muted">Temporal coordinate:</span>
            <span className="text-accent font-semibold">{activeDate}</span>
          </div>
        </div>
      </div>

      {/* Contextual Side Inspector when an event is selected */}
      {selectedEventId && <EventInspector />}
    </div>
  );
};
