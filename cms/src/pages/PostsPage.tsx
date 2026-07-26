import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getPosts, savePosts } from '@/lib/s3';
import { generateSlug } from '@/lib/slug';
import type { Event, BlogPost } from '@/lib/types';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  eventId: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  eventId: '',
};

const inputCls =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function PostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getPosts(), getEvents()])
      .then(([p, e]) => { setPosts(p); setEvents(e); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugEdited ? prev.slug : generateSlug(title),
    }));
  }

  function handleSlugChange(slug: string) {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const newPost: BlogPost = {
        id: crypto.randomUUID(),
        slug: form.slug || generateSlug(form.title),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        bodyHtml: '',
        coverPhotoKey: '',
        photoKeys: [],
        eventId: form.eventId || null,
        publishedAt: null,
        createdAt: new Date().toISOString(),
      };
      const updated = [...posts, newPost];
      await savePosts(updated);
      setPosts(updated);
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const updated = posts.filter((p) => p.id !== id);
      await savePosts(updated);
      setPosts(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const publishedEvents = events.filter((ev) => ev.publishedAt);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus size={16} className="mr-1" />
          New Post
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* New post form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border bg-muted/30 p-5 space-y-4"
        >
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            New Post
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title *">
              <input
                required
                type="text"
                placeholder="Behind the Scenes: Smith Wedding"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Slug">
              <input
                type="text"
                placeholder="behind-the-scenes-smith-wedding"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Linked Event (optional)">
              <select
                value={form.eventId}
                onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value }))}
                className={inputCls}
              >
                <option value="">— None —</option>
                {publishedEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Excerpt">
            <textarea
              rows={2}
              placeholder="A short summary shown on the blog listing page…"
              value={form.excerpt}
              onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Creating…' : 'Create Post'}
            </Button>
          </div>
        </form>
      )}

      {/* Post list */}
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No posts yet. Click "New Post" to create your first one.
        </p>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => {
            const linkedEvent = events.find((ev) => ev.id === post.eventId);
            return (
              <li
                key={post.id}
                className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                {/* Cover thumbnail */}
                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  {post.coverPhotoKey ? (
                    <img
                      src={`https://photos.rachelkeysphotography.com/${post.coverPhotoKey}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{post.title}</span>
                    <Badge variant={post.publishedAt ? 'default' : 'secondary'}>
                      {post.publishedAt ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {post.excerpt || 'No excerpt'}
                    {linkedEvent ? ` · ${linkedEvent.name}` : ''}
                    {post.publishedAt
                      ? ` · ${new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                      : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id, post.title)}
                    aria-label={`Delete ${post.title}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/posts/${post.id}`)}
                    aria-label={`Open ${post.title}`}
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {children}
    </div>
  );
}
