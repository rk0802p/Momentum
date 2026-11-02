import React from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import type { EnvironmentType, SpatialMode, SnapInterval } from '@momentum/shared-types';
import {
  Compass,
  RotateCcw,
  RotateCw,
  Plus,
  Command,
  Sun,
  Layers,
  CircleDot,
  AlignLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const ENVIRONMENTS: { id: EnvironmentType; label: string; shortcut: string }[] = [
  { id: 'now', label: 'NOW', shortcut: '1' },
  { id: 'flow', label: 'FLOW', shortcut: '2' },
  { id: 'memory', label: 'MEMORY', shortcut: '3' },
  { id: 'patterns', label: 'PATTERNS', shortcut: '4' },
  { id: 'orbit', label: 'ORBIT', shortcut: '5' },
  { id: 'focus', label: 'FOCUS', shortcut: '6' }
];

export const AppHeader: React.FC = () => {
  const {
    environment,
    setEnvironment,
    activeDate,
    setActiveDate,
    spatialMode,
    setSpatialMode,
    snapMinutes,
    setSnapMinutes,
    openEditor,
    setCommandPaletteOpen
  } = useNavigationStore();

  const { undo, redo, undoStack, redoStack } = useEventStore();

  // Date manipulation helpers
  const handlePrevDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d.toISOString().substring(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d.toISOString().substring(0, 10));
  };

  const handleToday = () => {
    setActiveDate('2026-11-02');
  };

  return (
    <header className="h-14 border-b border-border bg-[#0B0C0F]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Today */}
      <div className="flex items-center gap-6">
        <div 
          onClick={() => setEnvironment('now')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-accent/40 group-hover:border-accent animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-accent shadow-glow" />
          </div>
          <span className="font-semibold tracking-[0.2em] text-sm text-text-primary group-hover:text-accent transition-colors">
            MOMENTUM
          </span>
          <span className="text-[10px] tracking-wider text-text-muted px-1.5 py-0.5 rounded bg-surface border border-border">
            v1.0
          </span>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1.5 bg-surface rounded-lg px-2 py-1 border border-border text-xs font-mono">
          <button
            onClick={handlePrevDay}
            className="p-1 hover:text-accent hover:bg-surface-raised rounded transition-colors"
            title="Previous Day (Left Arrow)"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleToday}
            className="px-2 py-0.5 font-medium hover:text-accent transition-colors"
            title="Jump to Today (Home)"
          >
            {activeDate}
          </button>
          <button
            onClick={handleNextDay}
            className="p-1 hover:text-accent hover:bg-surface-raised rounded transition-colors"
            title="Next Day (Right Arrow)"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Central Environment Switcher */}
      <nav className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
        {ENVIRONMENTS.map((env) => {
          const isActive = environment === env.id;
          return (
            <button
              key={env.id}
              onClick={() => setEnvironment(env.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wider transition-all duration-150 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-surface-raised text-accent shadow-glow border border-accent/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/50'
              }`}
            >
              <span>{env.label}</span>
              <span className="text-[9px] font-mono opacity-50 bg-black/30 px-1 rounded">
                {env.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Mode, Snapping, Undo/Redo, Actions */}
      <div className="flex items-center gap-3">
        {/* Spatial / Linear mode toggle */}
        {environment === 'now' && (
          <div className="flex items-center bg-surface rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setSpatialMode('radial')}
              className={`p-1.5 rounded text-xs transition-colors ${
                spatialMode === 'radial'
                  ? 'bg-surface-raised text-accent border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Radial 24h Spatial View"
            >
              <CircleDot size={14} />
            </button>
            <button
              onClick={() => setSpatialMode('linear')}
              className={`p-1.5 rounded text-xs transition-colors ${
                spatialMode === 'linear'
                  ? 'bg-surface-raised text-accent border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Linear Accessible Timeline"
            >
              <AlignLeft size={14} />
            </button>
          </div>
        )}

        {/* Snap Interval */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-text-secondary bg-surface px-2 py-1 rounded-lg border border-border">
          <span className="text-text-muted">Snap:</span>
          {([5, 15, 30] as SnapInterval[]).map((snap) => (
            <button
              key={snap}
              onClick={() => setSnapMinutes(snap)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                snapMinutes === snap ? 'bg-surface-raised text-accent font-semibold' : 'hover:text-text-primary'
              }`}
            >
              {snap}m
            </button>
          ))}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised disabled:opacity-30 disabled:hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised disabled:opacity-30 disabled:hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-xs text-text-secondary hover:text-text-primary transition-colors"
          title="Command Palette (Ctrl+K)"
        >
          <Command size={13} />
          <span className="font-mono text-[10px]">⌘K</span>
        </button>

        {/* Add Event */}
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-black font-medium text-xs hover:bg-[#e4b57e] transition-colors shadow-glow"
        >
          <Plus size={14} />
          <span>New Event</span>
        </button>
      </div>
    </header>
  );
};
