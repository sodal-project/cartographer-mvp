import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Directory from './Directory';
import Risk from './Risk';
import Integrations from './Integrations';
import Setup from './Setup';

function App() {
  const [activeView, setActiveView] = useState('directory');

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div id="app">
      <div className="fixed inset-y-0 z-50 flex w-56 flex-col">
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