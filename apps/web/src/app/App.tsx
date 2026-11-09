import React, { Suspense, lazy } from 'react';
import { useNavigationStore } from '../stores/navigationStore';
import { AppHeader } from '../components/shell/AppHeader';
import { NowEnvironment } from '../environments/now/NowEnvironment';
import { MemoryEnvironment } from '../environments/memory/MemoryEnvironment';
import { PatternsEnvironment } from '../environments/patterns/PatternsEnvironment';
import { OrbitEnvironment } from '../environments/orbit/OrbitEnvironment';
import { FocusEnvironment } from '../environments/focus/FocusEnvironment';
import { EventEditorModal } from '../components/overlays/EventEditorModal';
import { CommandPalette } from '../components/command-palette/CommandPalette';

// Section 10.4 Progressive Loading: Lazy load Three.js 3D environment only when entered
const FlowEnvironment = lazy(() => import('../environments/flow/FlowEnvironment'));

export const App: React.FC = () => {
  const { environment } = useNavigationStore();

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0B0C0F] text-[#F1F0EB] select-none overflow-hidden font-sans">
      {/* Global Application Shell Header */}
      <AppHeader />

      {/* Dynamic Active Environment */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {environment === 'now' && <NowEnvironment />}
        {environment === 'flow' && (
          <Suspense
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B0C0F] text-xs font-mono text-text-secondary gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-future/20 border-t-future animate-spin" />
                <span>INITIALIZING 3D SPATIAL LANDSCAPE...</span>
              </div>
            }
          >
            <FlowEnvironment />
          </Suspense>
        )}
        {environment === 'memory' && <MemoryEnvironment />}
        {environment === 'patterns' && <PatternsEnvironment />}
        {environment === 'orbit' && <OrbitEnvironment />}
        {environment === 'focus' && <FocusEnvironment />}
      </main>

      {/* Global Overlays */}
      <EventEditorModal />
      <CommandPalette />
    </div>
  );
};

export default App;
