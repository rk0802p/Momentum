import React, { useState, useEffect } from 'react';
import { useNavigationStore } from '../../stores/navigationStore';
import { useEventStore } from '../../stores/eventStore';
import {
  Search,
  Calendar,
  Compass,
  Layers,
  History,
  BarChart3,
  Orbit,
  Play,
  RotateCcw,
  Plus,
  Clock
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setEnvironment,
    setActiveDate,
    openEditor,
    setSpatialMode,
    setSelectedEventId
  } = useNavigationStore();

  const { events, resetToFixtures, undo } = useEventStore();
  const [query, setQuery] = useState('');

  // Global keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if inside input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && !isCommandPaletteOpen) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      } else if (!isCommandPaletteOpen) {
        // Number shortcuts 1-6 for environments
        if (e.key === '1') setEnvironment('now');
        else if (e.key === '2') setEnvironment('flow');
        else if (e.key === '3') setEnvironment('memory');
        else if (e.key === '4') setEnvironment('patterns');
        else if (e.key === '5') setEnvironment('orbit');
        else if (e.key === '6') setEnvironment('focus');
        else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          openEditor();
        } else if (e.key === 'Home') {
          setActiveDate('2026-11-02');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen, setEnvironment, setActiveDate, openEditor]);

  if (!isCommandPaletteOpen) return null;

  const matchedEvents = events.filter(e =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-xl bg-surface-raised border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search size={18} className="text-text-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search events... (e.g. 'flow', 'deep work', 'today')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results / Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Quick Navigation Commands */}
          <div className="text-[10px] font-mono text-text-muted px-3 py-1.5 uppercase">
            Environments & Navigation
          </div>

          <button
            onClick={() => { setEnvironment('now'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Compass size={14} className="text-accent" />
              <span>Switch to NOW (Radial Calendar)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">1</kbd>
          </button>

          <button
            onClick={() => { setEnvironment('flow'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Layers size={14} className="text-future" />
              <span>Switch to FLOW (Spatial Landscape)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">2</kbd>
          </button>

          <button
            onClick={() => { setEnvironment('memory'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History size={14} className="text-completed" />
              <span>Switch to MEMORY (Historical Reconstruction)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">3</kbd>
          </button>

          <button
            onClick={() => { setEnvironment('patterns'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 size={14} className="text-accent" />
              <span>Switch to PATTERNS (Time Intelligence)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">4</kbd>
          </button>

          <button
            onClick={() => { setEnvironment('orbit'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Orbit size={14} className="text-future" />
              <span>Switch to ORBIT (Future Scenarios)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">5</kbd>
          </button>

          <button
            onClick={() => { setEnvironment('focus'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Play size={14} className="text-accent" />
              <span>Switch to FOCUS (Execution Session)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">6</kbd>
          </button>

          {/* Actions */}
          <div className="text-[10px] font-mono text-text-muted px-3 py-1.5 uppercase mt-2">
            Calendar Actions
          </div>

          <button
            onClick={() => { openEditor(); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Plus size={14} className="text-accent" />
              <span>Create New Temporal Commitment</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">N</kbd>
          </button>

          <button
            onClick={() => { setActiveDate('2026-11-02'); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-text-secondary" />
              <span>Return to Today (2026-11-02)</span>
            </div>
            <kbd className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">Home</kbd>
          </button>

          <button
            onClick={() => { resetToFixtures(); setCommandPaletteOpen(false); }}
            className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center gap-2.5 text-text-primary hover:bg-surface hover:text-accent group transition-colors"
          >
            <RotateCcw size={14} className="text-warning" />
            <span>Reset Demo Fixtures</span>
          </button>

          {/* Matched Events */}
          {matchedEvents.length > 0 && (
            <>
              <div className="text-[10px] font-mono text-text-muted px-3 py-1.5 uppercase mt-2">
                Matching Events ({matchedEvents.length})
              </div>
              {matchedEvents.slice(0, 5).map(ev => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setActiveDate(ev.startAt.substring(0, 10));
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between text-text-primary hover:bg-surface hover:text-accent transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Clock size={13} className="text-accent shrink-0" />
                    <span className="truncate">{ev.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">
                    {ev.startAt.substring(11, 16)}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
