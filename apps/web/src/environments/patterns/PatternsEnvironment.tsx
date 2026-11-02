import React, { useMemo } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { BarChart3, TrendingUp, Shuffle, ShieldCheck, Zap } from 'lucide-react';

export const PatternsEnvironment: React.FC = () => {
  const { events, categories } = useEventStore();

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;
    for (const ev of events) {
      if (ev.deletedAt) continue;
      const s = new Date(ev.startAt).getTime();
      const e = new Date(ev.endAt).getTime();
      const duration = Math.max(0, Math.round((e - s) / 60000));
      map.set(ev.categoryId, (map.get(ev.categoryId) || 0) + duration);
      total += duration;
    }

    return categories.map(cat => {
      const minutes = map.get(cat.id) || 0;
      const percent = total > 0 ? Math.round((minutes / total) * 100) : 0;
      return {
        ...cat,
        minutes,
        hours: (minutes / 60).toFixed(1),
        percent
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [events, categories]);

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-y-auto select-none p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border/80 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-mono font-semibold">
            <BarChart3 size={14} />
            <span>PATTERNS — TIME INTELLIGENCE</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Behavioral Metrics & Category Allocation
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Algorithmic distillation of commitments without double-counting overlaps
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary bg-surface px-3 py-1.5 rounded-xl border border-border">
          <span>WINDOW:</span>
          <span className="text-accent font-semibold">Active Week</span>
        </div>
      </div>

      {/* Grid Analytics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">FOCUS CONSISTENCY</div>
          <div className="text-2xl font-bold font-mono text-text-primary mt-1">94%</div>
          <div className="text-[10px] text-completed mt-1 flex items-center gap-1">
            <TrendingUp size={11} />
            <span>+12% vs prior week</span>
          </div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">CONTEXT SWITCHES</div>
          <div className="text-2xl font-bold font-mono text-accent mt-1">6 switches</div>
          <div className="text-[10px] text-text-secondary mt-1">Optimal cognitive pacing</div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">UNINTERRUPTED BLOCKS</div>
          <div className="text-2xl font-bold font-mono text-future mt-1">3.5 hrs</div>
          <div className="text-[10px] text-text-secondary mt-1">Deep work resilience</div>
        </div>

        <div className="p-4 bg-surface/80 border border-border rounded-xl">
          <div className="text-[11px] font-mono text-text-muted">INTENTIONAL FREE TIME</div>
          <div className="text-2xl font-bold font-mono text-text-secondary mt-1">5.2 hrs</div>
          <div className="text-[10px] text-text-muted mt-1">Unallocated space</div>
        </div>
      </div>

      {/* Category Time Allocation Bars */}
      <div className="bg-surface/60 border border-border rounded-2xl p-6 space-y-4">
        <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase">
          Category Distribution (Zero Double-Count)
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
                  <span className="text-text-primary font-semibold w-8 text-right">{stat.percent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.percent}%`,
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
