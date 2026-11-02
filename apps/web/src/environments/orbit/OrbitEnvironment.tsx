import React, { useState } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  Orbit,
  GitBranch,
  Target,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  hoursCommitted: number;
  freeHours: number;
  contextSwitches: number;
  deepWorkBlocks: number;
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
  const { addEvent, goals, milestones, toggleMilestone } = useEventStore();

  const [activeTab, setActiveTab] = useState<'scenarios' | 'goals'>('scenarios');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-a');
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const scenarios: ScenarioDefinition[] = [
    {
      id: 'baseline',
      name: 'Baseline Reality',
      description: 'Your existing commitments as scheduled in NOW and recorded in historical memory.',
      hoursCommitted: 6.5,
      freeHours: 17.5,
      contextSwitches: 6,
      deepWorkBlocks: 1,
      status: 'baseline',
      eventsToApply: []
    },
    {
      id: 'scenario-a',
      name: 'Scenario Alpha: 4-Hour Deep Work Blocks',
      description: 'Consolidates scattered meetings into afternoon sprint and opens dedicated morning Deep Work blocks.',
      hoursCommitted: 8.0,
      freeHours: 16.0,
      contextSwitches: 2,
      deepWorkBlocks: 2,
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
      freeHours: 18.5,
      contextSwitches: 3,
      deepWorkBlocks: 2,
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
  const baseline = scenarios[0];

  const handleApplyScenario = () => {
    if (selectedScenario.eventsToApply.length === 0) return;

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
            <span>ORBIT · FUTURE COMMITMENTS, SCENARIOS & GOALS</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mt-1 tracking-tight">
            Trajectory Modeling & Milestone Structures
          </h2>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Model alternate futures without altering baseline schedule until explicitly applied
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-xs font-mono">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1 rounded-lg uppercase transition-all ${
              activeTab === 'scenarios'
                ? 'bg-surface-raised text-future font-semibold border border-future/30'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1 rounded-lg uppercase transition-all ${
              activeTab === 'goals'
                ? 'bg-surface-raised text-future font-semibold border border-future/30'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Goals & Milestones
          </button>
        </div>
      </div>

      {appliedMessage && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-completed/20 border border-completed/40 text-completed text-xs font-mono animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{appliedMessage}</span>
        </div>
      )}

      {activeTab === 'scenarios' ? (
        <>
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
                      ? 'bg-surface-raised border-future shadow-glow'
                      : 'bg-surface/70 border-border hover:border-[#3D4350]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        sc.status === 'baseline'
                          ? 'bg-surface text-text-muted border-border'
                          : 'bg-future/20 text-future border-future/30'
                      }`}>
                        {sc.status}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-future font-semibold">Focused Branch</span>
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
                    <span className="text-future hover:underline">Select Branch →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scenario Comparison Matrix (Section 4.6 & 11.3) */}
          <div className="bg-surface/60 border border-border rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-mono text-text-muted tracking-wider uppercase">
              Comparative Analysis vs Baseline Reality
            </h4>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="text-[10px] font-mono text-text-muted">COMMITTED TIME</div>
                <div className="text-xl font-bold font-mono text-text-primary">
                  {selectedScenario.hoursCommitted}h
                </div>
                <div className="text-[11px] font-mono text-future">
                  {selectedScenario.hoursCommitted >= baseline.hoursCommitted ? '+' : ''}
                  {(selectedScenario.hoursCommitted - baseline.hoursCommitted).toFixed(1)}h shift
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="text-[10px] font-mono text-text-muted">FREE SPACE</div>
                <div className="text-xl font-bold font-mono text-text-primary">
                  {selectedScenario.freeHours}h
                </div>
                <div className="text-[11px] font-mono text-neutral">
                  {(selectedScenario.freeHours - baseline.freeHours).toFixed(1)}h delta
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="text-[10px] font-mono text-text-muted">CONTEXT SWITCHES</div>
                <div className="text-xl font-bold font-mono text-accent">
                  {selectedScenario.contextSwitches}
                </div>
                <div className="text-[11px] font-mono text-accent">
                  {selectedScenario.contextSwitches < baseline.contextSwitches ? 'Lower fragmentation' : 'Higher switching'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="text-[10px] font-mono text-text-muted">DEEP FOCUS BLOCKS</div>
                <div className="text-xl font-bold font-mono text-completed">
                  {selectedScenario.deepWorkBlocks} blocks
                </div>
                <div className="text-[11px] font-mono text-completed">
                  {selectedScenario.deepWorkBlocks > baseline.deepWorkBlocks ? '+1 block gained' : 'Baseline level'}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-border">
              <div className="text-xs font-mono text-text-muted">
                Atomic Migration: Changes persist only upon explicit application.
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
        </>
      ) : (
        /* Goals & Milestones Structure (Section 6.10) */
        <div className="space-y-5">
          {goals.map(goal => {
            const goalMilestones = milestones.filter(m => m.goalId === goal.id);
            const completedCount = goalMilestones.filter(m => m.completedAt).length;
            const pct = goalMilestones.length > 0 ? Math.round((completedCount / goalMilestones.length) * 100) : 0;

            return (
              <div key={goal.id} className="p-6 bg-surface/70 border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-future/20 border border-future/40 flex items-center justify-center text-future">
                      <Target size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{goal.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{goal.description}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-future font-semibold">{pct}% Complete</span>
                    <div className="text-[10px] text-text-muted mt-0.5">{completedCount} of {goalMilestones.length} milestones</div>
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  {goalMilestones.map(ms => {
                    const isDone = Boolean(ms.completedAt);
                    return (
                      <div
                        key={ms.id}
                        onClick={() => toggleMilestone(ms.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isDone ? 'bg-completed/10 border-completed/30 text-completed' : 'bg-surface border-border text-text-primary hover:border-accent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-completed" />
                          ) : (
                            <Circle size={16} className="text-text-muted" />
                          )}
                          <span className={`text-xs ${isDone ? 'line-through opacity-80' : 'font-medium'}`}>
                            {ms.title}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted">
                          {isDone ? `Done at ${ms.completedAt?.substring(11, 16)}` : 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
