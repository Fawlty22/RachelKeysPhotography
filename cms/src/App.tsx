import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { ShellLayout } from '@/components/ShellLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { PhotosPage } from '@/pages/PhotosPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { ContentPage } from '@/pages/ContentPage';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { PostsPage } from '@/pages/PostsPage';
import { PostDetailPage } from '@/pages/PostDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="photos" element={<PhotosPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="posts/:postId" element={<PostDetailPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}
