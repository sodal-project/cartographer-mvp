import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Directory from './views/Directory';
import Risk from './views/Risk';
import Integrations from './views/Integrations';
import Setup from './views/Setup';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeView, setActiveView] = useState('directory');
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <div>
        <Toaster
          toastOptions={{
            style: {
              background: '#121723',
              color: 'white',
              border: '1px solid #303947',
              padding: '8px',
              fontSize: '15px'
            },
          }}
        />
      </div>
      <div className="fixed inset-y-0 z-30 flex w-56 flex-col bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>
      <main className="pl-56">
        {activeView === 'directory' && <Directory />}
        {activeView === 'risk' && <Risk />}
        {activeView === 'integrations' && <Integrations />}
        {activeView === 'setup' && <Setup setLoading={setLoading} />}
      </main>
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur">
          <p>Spinner</p>
          <img src="./ring-resize.svg" alt="loading" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150" />
        </div>
      )}
    </div>
  );
}

export default App;