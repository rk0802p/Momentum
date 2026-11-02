import React, { useMemo } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { formatMinutes } from '@momentum/temporal-engine';
import { Clock, AlertCircle } from 'lucide-react';

export const LinearCalendar: React.FC = () => {
  const { activeDate, selectedEventId, setSelectedEventId, openEditor } = useNavigationStore();
  const { events, categories, getOverlaps } = useEventStore();

  const dayEvents = useMemo(() => {
    return events.filter(e => {
      if (e.deletedAt) return false;
      const startDay = e.startAt.substring(0, 10);
      const endDay = e.endAt.substring(0, 10);
      return startDay === activeDate || endDay === activeDate;
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.endAt).getTime());
  }, [events, activeDate]);

  const overlaps = useMemo(() => getOverlaps(), [events, getOverlaps]);
  const collidingIds = useMemo(() => {
    const set = new Set<string>();
    for (const o of overlaps) {
      set.add(o.eventAId);
      set.add(o.eventBId);
    }
    return set;
  }, [overlaps]);

  // Generate 24 hours (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="w-full max-w-4xl h-full mx-auto p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary tracking-wide">
            Linear Chronology
          </h2>
          <p className="text-xs text-text-secondary font-mono">
            Deterministic sequence for {activeDate}
          </p>
        </div>
        <div className="text-xs font-mono text-accent">
          {dayEvents.length} events scheduled
        </div>
      </div>

      <div className="relative border-l border-border pl-6 ml-12 space-y-4">
        {hours.map(hour => {
          const hourLabel = `${String(hour).padStart(2, '0')}:00`;
          const matchingEvents = dayEvents.filter(ev => {
            const startHour = new Date(ev.startAt).getHours();
            return startHour === hour;
          });

          return (
            <div key={hour} className="relative group">
              {/* Hour Label */}
              <div className="absolute -left-16 -top-1 font-mono text-xs text-text-muted">
                {hourLabel}
              </div>

              {/* Node dot on timeline */}
              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-border group-hover:bg-accent transition-colors" />

              {matchingEvents.length > 0 ? (
                <div className="space-y-2">
                  {matchingEvents.map(ev => {
                    const isSelected = selectedEventId === ev.id;
                    const isColliding = collidingIds.has(ev.id);
                    const category = categories.find(c => c.id === ev.categoryId);
                    const color = category?.color || '#829AB9';

                    const startH = new Date(ev.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const endH = new Date(ev.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEventId(ev.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-raised border-accent shadow-glow'
                            : 'bg-surface border-border hover:border-[#3D4350]'
                        }`}
                        style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-text-primary">
                            {ev.title}
                          </h4>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {category?.name || 'Work'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs font-mono text-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-accent" />
                            <span>{startH} — {endH}</span>
                          </div>
                          {isColliding && (
                            <div className="flex items-center gap-1 text-warning text-[11px]">
                              <AlertCircle size={13} />
                              <span>Overlapping conflict</span>
                            </div>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div 
                  onClick={() => openEditor({
                    startAt: `${activeDate}T${String(hour).padStart(2, '0')}:00:00+05:30`,
                    endAt: `${activeDate}T${String((hour + 1) % 24).padStart(2, '0')}:00:00+05:30`
                  })}
                  className="h-7 border border-dashed border-border/40 rounded-lg hover:border-accent/50 hover:bg-surface/30 cursor-pointer flex items-center px-3 text-[11px] text-text-muted hover:text-accent transition-colors"
                >
                  + Add commitment at {hourLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
