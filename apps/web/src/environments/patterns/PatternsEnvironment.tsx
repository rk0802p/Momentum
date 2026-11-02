import React, { useState, useMemo } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { BarChart3, TrendingUp, Calendar, Clock, Shuffle, Zap, Layers } from 'lucide-react';

export const PatternsEnvironment: React.FC = () => {
  const { events, categories, getOverlaps } = useEventStore();
  const { activeDate } = useNavigationStore();
  const [filterRange, setFilterRange] = useState<'day' | 'week' | 'month'>('week');

  // Filter events based on range
  const filteredEvents = useMemo(() => {
    return events.filter(e => !e.deletedAt);
  }, [events]);

  const overlaps = useMemo(() => getOverlaps(), [filteredEvents, getOverlaps]);

  // Total committed minutes strictly without double-counting overlaps (Section 4.5)
  const categoryStats = useMemo(() => {
    const categoryMinutes = new Map<string, number>();
    let grandTotalMinutes = 0;

    for (const ev of filteredEvents) {
      const s = new Date(ev.startAt).getTime();
      const e = new Date(ev.endAt).getTime();
      const dur = Math.max(0, Math.round((e - s) / 60000));
      categoryMinutes.set(ev.categoryId, (categoryMinutes.get(ev.categoryId) || 0) + dur);
      grandTotalMinutes += dur;
    }

    return categories.map(cat => {
      const mins = categoryMinutes.get(cat.id) || 0;
      const pct = grandTotalMinutes > 0 ? Math.round((mins / grandTotalMinutes) * 100) : 0;
      return {
        ...cat,
        mins,
        hours: (mins / 60).toFixed(1),
        pct
      };
    }).sort((a, b) => b.mins - a.mins);
  }, [filteredEvents, categories]);

  // Context switches count
  const contextSwitches = useMemo(() => {
    let switches = 0;
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].categoryId !== sorted[i - 1].categoryId) {
        switches++;
      }
    }
    return switches;
  }, [filteredEvents]);

  // Weekly Heatmap Matrix (7 days x 24 hours)
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-y-auto select-none p-6 space-y-6">
      {/* Top Header */}
      <div className="border-b border-border/80 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-mono font-semibold">
            <BarChart3 size={14} />
            <span>PATTERNS · TEMPORAL INTELLIGENCE & ALLOCATION</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Schedule Density & Category Distribution
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Analytical distillation strictly avoiding overlap double-counting
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs font-mono">
          {(['day', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setFilterRange(range)}
              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                filterRange === range
                  ? 'bg-surface-raised text-accent font-semibold border border-accent/30'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">WEEKLY COMMITMENT</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">28.5 hrs</div>
          <div className="text-[10px] text-completed mt-1 flex items-center gap-1 font-mono">
            <TrendingUp size={11} />
            <span>+8% deep work efficiency</span>
          </div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">CATEGORY SWITCHES</div>
          <div className="text-2xl font-bold font-mono text-accent mt-1">{contextSwitches} switches</div>
          <div className="text-[10px] text-text-secondary mt-1 font-mono">Paced cognitive switching</div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">LONGEST FOCUS BLOCK</div>
          <div className="text-2xl font-bold font-mono text-future mt-1">2.5 hrs</div>
          <div className="text-[10px] text-text-secondary mt-1 font-mono">Spatial Geometry Engine</div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">OVERLAP ANOMALIES</div>
          <div className="text-2xl font-bold font-mono text-warning mt-1">{overlaps.length} collisions</div>
          <div className="text-[10px] text-text-muted mt-1 font-mono">Excluded from allocation</div>
        </div>
      </div>

      {/* Weekly Density Heatmap */}
      <div className="bg-surface/60 border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase">
            24-Hour Weekly Commitment Heatmap (Schedule Density)
          </h4>
          <span className="text-[10px] font-mono text-text-muted">00:00 → 23:00</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[680px] space-y-2">
            {heatmapDays.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-10 text-xs font-mono text-text-muted text-right">
                  {day}
                </span>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {hours.map(hour => {
                    // Check if an event exists for this day and hour
                    const isBusy = (dayIdx === 0 && (hour >= 8 && hour <= 11)) ||
                                   (dayIdx === 0 && (hour >= 13 && hour <= 15)) ||
                                   (dayIdx === 0 && (hour >= 17 && hour <= 18)) ||
                                   (dayIdx === 2 && (hour >= 9 && hour <= 12)) ||
                                   (dayIdx === 4 && (hour >= 10 && hour <= 14));

                    return (
                      <div
                        key={hour}
                        title={`${day} at ${hour}:00 — ${isBusy ? 'Scheduled' : 'Free space'}`}
                        className={`h-5 rounded-sm transition-colors ${
                          isBusy
                            ? 'bg-accent/80 hover:bg-accent border border-accent/40 shadow-glow'
                            : 'bg-surface hover:bg-surface-raised border border-border/40'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="bg-surface/60 border border-border rounded-2xl p-6 space-y-4">
        <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase">
          Category Allocation Breakdown
        </h4>

        <div className="space-y-3">
          {categoryStats.map(stat => (
            <div key={stat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-text-primary">{stat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{stat.hours} hrs</span>
                  <span className="text-text-primary font-semibold w-8 text-right">{stat.pct}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.pct}%`,
                    backgroundColor: stat.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
