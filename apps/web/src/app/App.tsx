import React from 'react';
import { useNavigationStore } from '../stores/navigationStore';
import { AppHeader } from '../components/shell/AppHeader';
import { NowEnvironment } from '../environments/now/NowEnvironment';
import { FlowEnvironment } from '../environments/flow/FlowEnvironment';
import { MemoryEnvironment } from '../environments/memory/MemoryEnvironment';
import { PatternsEnvironment } from '../environments/patterns/PatternsEnvironment';
import { OrbitEnvironment } from '../environments/orbit/OrbitEnvironment';
import { FocusEnvironment } from '../environments/focus/FocusEnvironment';
import { EventEditorModal } from '../components/overlays/EventEditorModal';
import { CommandPalette } from '../components/command-palette/CommandPalette';

export const App: React.FC = () => {
  const { environment } = useNavigationStore();

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0B0C0F] text-[#F1F0EB] select-none overflow-hidden font-sans">
      {/* Global Application Shell Header */}
      <AppHeader />

      {/* Dynamic Active Environment */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {environment === 'now' && <NowEnvironment />}
        {environment === 'flow' && <FlowEnvironment />}
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
