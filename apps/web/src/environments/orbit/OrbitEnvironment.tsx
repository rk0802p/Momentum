import React, { useState } from 'react';
import { Orbit, GitBranch, Layers, CheckCircle, Sparkles, Plus, AlertCircle } from 'lucide-react';

export const OrbitEnvironment: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'scenario-a' | 'scenario-b'>('baseline');

  const scenarios = [
    {
      id: 'baseline',
      name: 'Baseline Schedule',
      desc: 'Active production commitments and scheduled routines.',
      hours: '32.5 hrs committed',
      status: 'Active'
    },
    {
      id: 'scenario-a',
      name: 'Scenario Alpha: 80% Deep Focus',
      desc: 'Replaces recurring sync meetings with consolidated 4-hour morning focus blocks.',
      hours: '36.0 hrs committed',
      status: 'Simulation'
    },
    {
      id: 'scenario-b',
      name: 'Scenario Beta: Creative Sprint',
      desc: 'Dedicates Wednesday and Friday exclusively to graphics shader research.',
      hours: '28.0 hrs committed',
      status: 'Simulation'
    }
  ];

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-y-auto select-none p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border/80 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-future text-xs font-mono font-semibold">
            <Orbit size={14} />
            <span>ORBIT — FUTURE COMMITMENTS & SCENARIOS</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Scenario Branching & Temporal Trajectories
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Branch, evaluate, and compare future schedule variations in total isolation
          </p>
        </div>

        <button className="px-3.5 py-1.5 rounded-lg bg-surface border border-border hover:border-accent text-xs font-mono text-text-primary hover:text-accent transition-colors flex items-center gap-1.5">
          <Plus size={14} />
          <span>Branch New Scenario</span>
        </button>
      </div>

      {/* Scenario Selector Cards */}
      <div className="grid grid-cols-3 gap-5">
        {scenarios.map((sc) => {
          const isSelected = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setActiveScenario(sc.id as any)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-raised border-accent shadow-glow'
                  : 'bg-surface/70 border-border hover:border-[#3D4350]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                    {sc.status}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-accent">Active Branch</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mt-3">
                  {sc.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">{sc.hours}</span>
                <span className="text-accent hover:underline">Select Branch →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orbital Preview Visual Area */}
      <div className="bg-surface/50 border border-border rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-future/20 animate-spin" style={{ animationDuration: '30s' }} />
          <div className="absolute inset-6 rounded-full border border-dashed border-accent/30 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
          <div className="absolute inset-12 rounded-full border border-border" />
          <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent flex items-center justify-center shadow-glow">
            <Orbit size={20} className="text-accent" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary">
            Orbital Trajectory Preview: {scenarios.find(s => s.id === activeScenario)?.name}
          </h4>
          <p className="text-xs text-text-muted font-mono max-w-md mx-auto mt-1">
            Isolated future sandbox. Applying this scenario replaces baseline via atomic transactional migration.
          </p>
        </div>
      </div>
    </div>
  );
};
