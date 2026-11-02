import React, { useState } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { Layers, Calendar, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';

export const FlowEnvironment: React.FC = () => {
  const { activeDate, setActiveDate, setEnvironment, setSelectedEventId } = useNavigationStore();
  const { events, categories } = useEventStore();
  const [elevationAngle, setElevationAngle] = useState(55); // Perspective degrees

  // Generate 7 days of the week around activeDate
  const currentD = new Date(activeDate);
  const dayOfWeek = currentD.getDay(); // 0 is Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentD);
    d.setDate(currentD.getDate() + mondayOffset + i);
    const dateStr = d.toISOString().substring(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const dayEvents = events.filter(e => !e.deletedAt && e.startAt.substring(0, 10) === dateStr);
    return { dateStr, dayName, dayNum, dayEvents, isSelected: dateStr === activeDate };
  });

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-hidden select-none">
      {/* FLOW Top Toolbar */}
      <div className="px-6 py-3 border-b border-border/80 bg-surface/40 backdrop-blur-md flex items-center justify-between text-xs font-mono text-text-secondary z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-future font-semibold">
            <Layers size={14} />
            FLOW SPATIAL ENVIRONMENT
          </span>
          <span className="text-border">|</span>
          <span>7-DAY CONNECTED TEMPORAL LANDSCAPE</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">PERSPECTIVE:</span>
            <input
              type="range"
              min="20"
              max="75"
              value={elevationAngle}
              onChange={(e) => setElevationAngle(Number(e.target.value))}
              className="w-24 accent-accent cursor-pointer"
            />
            <span className="text-text-primary">{elevationAngle}°</span>
          </div>

          <button
            onClick={() => setEnvironment('now')}
            className="px-3 py-1 rounded-lg bg-surface border border-border hover:border-accent text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <Eye size={12} />
            <span>Enter Selected Day in NOW</span>
          </button>
        </div>
      </div>

      {/* 3D Spatial Landscape Stage */}
      <div className="flex-1 w-full flex items-center justify-center p-8 overflow-x-auto perspective-1000">
        <div
          className="flex items-stretch gap-5 transition-transform duration-300 ease-out py-10"
          style={{
            transform: `rotateX(${elevationAngle}deg) rotateZ(-4deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {weekDays.map((day, idx) => (
            <div
              key={day.dateStr}
              onClick={() => setActiveDate(day.dateStr)}
              onDoubleClick={() => {
                setActiveDate(day.dateStr);
                setEnvironment('now');
              }}
              className={`w-48 min-h-[500px] rounded-2xl border transition-all duration-200 cursor-pointer p-4 flex flex-col justify-between ${
                day.isSelected
                  ? 'bg-surface-raised/90 border-accent shadow-glow-accent scale-105'
                  : 'bg-surface/60 border-border hover:border-border/90 hover:bg-surface/80'
              }`}
              style={{
                boxShadow: day.isSelected
                  ? '0 25px 50px -12px rgba(214, 166, 109, 0.25), 0 0 20px rgba(214, 166, 109, 0.2)'
                  : '0 20px 35px -10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Region Day Header */}
              <div className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-text-primary tracking-wider uppercase">
                    {day.dayName}
                  </span>
                  {day.isSelected && (
                    <span className="text-[10px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/40">
                      FOCUSED
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-text-muted mt-0.5">
                  {day.dayNum}
                </div>
              </div>

              {/* Spatial Event Pillars / Objects */}
              <div className="flex-1 py-4 space-y-2.5 overflow-y-auto">
                {day.dayEvents.length > 0 ? (
                  day.dayEvents.map(ev => {
                    const cat = categories.find(c => c.id === ev.categoryId);
                    const color = cat?.color || '#829AB9';
                    const startH = ev.startAt.substring(11, 16);
                    const endH = ev.endAt.substring(11, 16);

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventId(ev.id);
                        }}
                        className="p-2.5 rounded-xl border border-border/70 hover:border-accent bg-[#0B0C0F]/80 transition-all hover:translate-y-[-2px]"
                        style={{
                          borderLeftColor: color,
                          borderLeftWidth: '3px'
                        }}
                      >
                        <div className="text-[11px] font-medium text-text-primary truncate">
                          {ev.title}
                        </div>
                        <div className="text-[10px] font-mono text-text-muted mt-1">
                          {startH} — {endH}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-text-muted text-[11px] font-mono">
                    Open Temporal Space
                  </div>
                )}
              </div>

              {/* Bottom Region Metric */}
              <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-text-muted flex items-center justify-between">
                <span>{day.dayEvents.length} COMMITMENTS</span>
                <span className="text-accent hover:underline">Double-click NOW →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOW Bottom Bar */}
      <div className="h-10 border-t border-border bg-[#0B0C0F]/90 px-6 flex items-center justify-between text-xs font-mono text-text-secondary z-10">
        <span className="text-text-muted">
          Navigation: Click day to focus · Double-click day to enter NOW · Adjust Perspective slider
        </span>
        <div className="text-accent">
          Continuity Preserved across 7 Temporal Regions
        </div>
      </div>
    </div>
  );
};
