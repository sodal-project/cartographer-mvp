import { Outlet, useNavigation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

function RootLayout() {
  const navigation = useNavigation();

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
      <main className="pl-12">
        <Outlet />
      </main>
      {/* {navigation.state === 'loading' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur">
          <p>Spinner</p>
          <img src="./ring-resize.svg" alt="loading" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150" />
        </div>
      )} */}
    </div>
  )
}

export default RootLayout;