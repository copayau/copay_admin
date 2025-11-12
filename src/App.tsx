import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages';
// import DefaultLayout from '@/layouts/default';
import AdminLayout from '@/layouts/AdminLayout.tsx';
import LoginPage from '@/pages/auth/login.tsx';
import { ProtectedRoute } from '@/components/ProtectedRoute.tsx';
import BlogAllPage from '@/pages/BlogAllPage.tsx';
import BlogCreatePage from '@/pages/BlogCreatePage.tsx';
import BlogUpdatePage from '@/pages/BlogUpadatePage.tsx';
import AssetsPage from '@/pages/AssetsPage.tsx';
import CategoriesPage from '@/pages/CategoriesPage.tsx';
import AssetFormPage from '@/pages/AssetFormPage.tsx';
import ContactPage from '@/pages/ContactPage.tsx';

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
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/create" element={<AssetFormPage />} />
          <Route path="/assets/edit/:id" element={<AssetFormPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/updates/contacts" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogAllPage />} />
          <Route path="/blog/create" element={<BlogCreatePage />} />
          <Route path="/blog/update/:slug" element={<BlogUpdatePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
