import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages';
import PropertiesPage from '@/pages/PropertiesPage.tsx';
// import DefaultLayout from '@/layouts/default';
import AdminLayout from '@/layouts/AdminLayout.tsx';
import LoginPage from '@/pages/auth/login.tsx';
import { ProtectedRoute } from '@/components/ProtectedRoute.tsx';
import BlogAllPage from '@/pages/BlogAllPage.tsx';
import BlogCreatePage from '@/pages/BlogCreatePage.tsx';
import BlogUpdatePage from '@/pages/BlogUpadatePage.tsx';

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
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/blogs" element={<BlogAllPage />} />
          <Route path="/blog/create" element={<BlogCreatePage />} />
          <Route path="/blog/update" element={<BlogUpdatePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
