import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Directory from './views/Directory';
import Risk from './views/Risk';
import Integrations from './views/Integrations';
import Setup from './views/Setup';

function App() {
  const [activeView, setActiveView] = useState('directory');

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div id="app">
      <div className="fixed inset-y-0 z-50 flex w-56 flex-col bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>
      <main className="ml-56">
        {activeView === 'directory' && <Directory />}
        {activeView === 'risk' && <Risk />}
        {activeView === 'integrations' && <Integrations />}
        {activeView === 'setup' && <Setup />}
      </main>
    </div>
  );
}

export default App;