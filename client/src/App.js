import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Directory from './views/Directory';
import Risk from './views/Risk';
import Integrations from './views/Integrations';
import Setup from './views/Setup';

function App() {
  const [activeView, setActiveView] = useState('directory');
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    const setupFolders = async () => {
      try {
        await fetch(`http://localhost:3001/setup-folders`);
        setSetup(true);
      } catch (error) {
        console.error(error);
      }
    };
    if (!setup) {
      setupFolders(true);
    }
  });

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div id="app">
      <div className="fixed inset-y-0 z-30 flex w-56 flex-col bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>
      <main className="pl-56">
        {activeView === 'directory' && <Directory />}
        {activeView === 'risk' && <Risk />}
        {activeView === 'integrations' && <Integrations />}
        {activeView === 'setup' && <Setup />}
      </main>
    </div>
  );
}

export default App;