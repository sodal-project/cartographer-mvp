import { useEffect, useState } from 'react';
import { Outlet, useNavigation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

function RootLayout({
  isManualLoading = false,
}) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isManualLoading || navigation.state === 'loading') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [navigation.state, isManualLoading]);

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
      <div className="fixed inset-y-0 z-30 flex w-16 flex-col bg-gray-900">
        <Sidebar />
      </div>
      <main className="pl-16">
        <Outlet />
      </main>
      <div className={`${isLoading ? 'opacity-1' : 'opacity-0'} fixed inset-0 z-50 delay-200 duration-500 transition-opacity pointer-events-none`}>
        <div className={`absolute inset-0 bg-gray-900`}>
          <img src="./ring-resize.svg" alt="loading" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150" />
        </div>
      </div>
    </div>
  )
}

export default RootLayout;