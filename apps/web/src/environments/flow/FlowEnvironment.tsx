import React from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { FlowCanvas } from '../../rendering/spatial/FlowCanvas';
import { EventInspector } from '../../components/inspector/EventInspector';
import { Layers, ChevronLeft, ChevronRight, Eye, Calendar, Sparkles } from 'lucide-react';

export const FlowEnvironment: React.FC = () => {
  const { activeDate, setActiveDate, setEnvironment, selectedEventId, setSelectedEventId } = useNavigationStore();
  const { events } = useEventStore();

  const handlePrevWeek = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 7);
    setActiveDate(d.toISOString().substring(0, 10));
  };

  const handleNextWeek = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 7);
    setActiveDate(d.toISOString().substring(0, 10));
  };

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex overflow-hidden spatial-grid-bg relative select-none">
      <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
        {/* Top Spatial Toolbar */}
        <div className="h-12 border-b border-border bg-[#0B0C0F]/90 backdrop-blur-md px-6 flex items-center justify-between text-xs font-mono text-text-secondary z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-future font-semibold">
              <Layers size={15} />
              <span>FLOW · 3D TEMPORAL LANDSCAPE</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-text-primary"
                title="Previous Week"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-text-primary font-medium">Week of {activeDate}</span>
              <button
                onClick={handleNextWeek}
                className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-text-primary"
                title="Next Week"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-text-muted text-[11px]">
              Left-click + Drag to rotate · Right-click + Drag to pan · Scroll to zoom
            </span>
            <button
              onClick={() => setEnvironment('now')}
              className="px-3 py-1 rounded-lg bg-surface border border-border hover:border-accent text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <Eye size={12} />
              <span>Enter Focused Day in NOW</span>
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="flex-1 w-full relative">
          <FlowCanvas />
        </div>

        {/* Bottom Information Strip */}
        <div className="h-9 border-t border-border bg-[#0B0C0F]/90 backdrop-blur-sm px-6 flex items-center justify-between text-xs font-mono text-text-muted z-10">
          <div>
            <span>Interaction: Click event to inspect · Double-click day slab to transition to NOW</span>
          </div>
          <div className="text-accent">
            Deterministic 3D mapping: \(x = d \cdot S_d\), \(y = (t/24 - 0.5) \cdot S_t\)
          </div>
        </div>
      </div>

      {/* Contextual Inspector */}
      {selectedEventId && <EventInspector />}
    </div>
  );
};
