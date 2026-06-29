import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { ShellLayout } from '@/components/ShellLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { PhotosPage } from '@/pages/PhotosPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { ContentPage } from '@/pages/ContentPage';

export default function App() {
  return (
    <AuthGuard>
      <BrowserRouter>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="photos" element={<PhotosPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="content" element={<ContentPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGuard>
  );
}
