import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages';
// import DefaultLayout from '@/layouts/default';
import AdminLayout from '@/layouts/AdminLayout.tsx';
import LoginPage from '@/pages/auth/login.tsx';
import { ProtectedRoute } from '@/components/ProtectedRoute.tsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
