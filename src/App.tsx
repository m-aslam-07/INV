import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastContainer } from './components/ui/Toast';
import { AuthProvider } from './components/auth/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  );
}
