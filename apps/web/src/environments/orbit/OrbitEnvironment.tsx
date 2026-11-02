import React, { useState } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import { Orbit, GitBranch, CheckCircle2, Plus, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';

interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  hoursCommitted: number;
  status: 'baseline' | 'draft' | 'ready';
  eventsToApply: {
    title: string;
    startAt: string;
    endAt: string;
    categoryId: string;
  }[];
}

export const OrbitEnvironment: React.FC = () => {
  const { activeDate, setEnvironment } = useNavigationStore();
  const { addEvent } = useEventStore();

  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-a');
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const scenarios: ScenarioDefinition[] = [
    {
      id: 'baseline',
      name: 'Baseline Reality',
      description: 'Your existing commitments as scheduled in NOW and recorded in historical memory.',
      hoursCommitted: 6.5,
      status: 'baseline',
      eventsToApply: []
    },
    {
      id: 'scenario-a',
      name: 'Scenario Alpha: 4-Hour Deep Work Blocks',
      description: 'Consolidates scattered meetings into afternoon sprint and opens a dedicated morning Deep Work block.',
      hoursCommitted: 8.0,
      status: 'ready',
      eventsToApply: [
        {
          title: 'Quantum Spatial Geometry (Deep Block)',
          startAt: `${activeDate}T08:00:00+05:30`,
          endAt: `${activeDate}T12:00:00+05:30`,
          categoryId: 'cat-work'
        },
        {
          title: 'Focused Review & Synthesis',
          startAt: `${activeDate}T14:00:00+05:30`,
          endAt: `${activeDate}T16:00:00+05:30`,
          categoryId: 'cat-learning'
        }
      ]
    },
    {
      id: 'scenario-b',
      name: 'Scenario Beta: Creative Sound & Shaders',
      description: 'Prioritizes modular synthesis and WebGL shader R&D with extended rest breaks.',
      hoursCommitted: 5.5,
      status: 'ready',
      eventsToApply: [
        {
          title: 'Modular Analog Sound Design',
          startAt: `${activeDate}T10:00:00+05:30`,
          endAt: `${activeDate}T13:00:00+05:30`,
          categoryId: 'cat-creative'
        },
        {
          title: 'Raymarching Shader Experimentation',
          startAt: `${activeDate}T15:00:00+05:30`,
          endAt: `${activeDate}T17:30:00+05:30`,
          categoryId: 'cat-creative'
        }
      ]
    }
  ];

  const selectedScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const handleApplyScenario = () => {
    if (selectedScenario.eventsToApply.length === 0) return;

    // Apply new scenario commitments transactionally
    selectedScenario.eventsToApply.forEach(ev => {
      addEvent({
        userId: 'default-user',
        title: ev.title,
        description: `Applied from ${selectedScenario.name}`,
        categoryId: ev.categoryId,
        startAt: ev.startAt,
        endAt: ev.endAt,
        timezone: 'Asia/Kolkata',
        allDay: false,
        status: 'planned',
        recurrenceId: null,
        parentEventId: null
      });
    });

    setAppliedMessage(`Successfully applied "${selectedScenario.name}" to your schedule!`);
    setTimeout(() => {
      setAppliedMessage(null);
      setEnvironment('now');
    }, 1800);
  };

  return (
    <div className="flex-1 w-full h-[calc(100vh-3.5rem)] flex flex-col justify-between spatial-grid-bg relative overflow-y-auto select-none p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-border/80 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-future text-xs font-mono font-semibold">
            <Orbit size={14} />
            <span>ORBIT — FUTURE SCENARIOS & BRANCHING</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Alternate Timeline Engine
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Model alternate futures without altering your baseline schedule until explicitly applied
          </p>
        </div>

        {appliedMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-completed/20 border border-completed/40 text-completed text-xs font-mono animate-in fade-in">
            <CheckCircle2 size={14} />
            <span>{appliedMessage}</span>
          </div>
        )}
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-5">
        {scenarios.map((sc) => {
          const isSelected = activeScenarioId === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-surface-raised border-accent shadow-glow'
                  : 'bg-surface/70 border-border hover:border-[#3D4350]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    sc.status === 'baseline' ? 'bg-surface text-text-muted border-border' : 'bg-future/20 text-future border-future/30'
                  }`}>
                    {sc.status}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-accent">Focused Branch</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mt-3">
                  {sc.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">{sc.hoursCommitted}h committed</span>
                <span className="text-accent hover:underline">Inspect →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orbital Preview & Action Panel */}
      <div className="bg-surface/60 border border-border rounded-2xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs font-mono text-text-muted">ACTIVE SELECTION</div>
          <h4 className="text-base font-semibold text-text-primary">
            {selectedScenario.name}
          </h4>
          <p className="text-xs text-text-secondary max-w-xl">
            {selectedScenario.eventsToApply.length > 0
              ? `Contains ${selectedScenario.eventsToApply.length} proposed commitments for ${activeDate}. Applying this scenario will commit these blocks to your calendar.`
              : 'Current schedule baseline. Select Scenario Alpha or Beta to simulate alternate allocations.'}
          </p>
        </div>

        {selectedScenario.status !== 'baseline' && (
          <button
            onClick={handleApplyScenario}
            className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs flex items-center gap-2 hover:bg-[#e4b57e] transition-colors shadow-glow"
          >
            <span>Apply Scenario to Real Calendar</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
