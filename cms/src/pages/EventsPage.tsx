import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, saveEvents } from '@/lib/s3';
import { generateSlug } from '@/lib/slug';
import type { Event, EventCategory } from '@/lib/types';
import { EVENT_CATEGORIES } from '@/lib/types';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  weddings: 'Weddings',
  portraits: 'Portraits',
  families: 'Families',
  events: 'Events',
  other: 'Other',
};

// ── Blank form state ──────────────────────────────────────────────────────────
interface FormState {
  name: string;
  date: string;
  location: string;
  category: EventCategory;
  description: string;
  slug: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  date: '',
  location: '',
  category: 'other',
  description: '',
  slug: '',
};

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Auto-generate slug from name unless user has manually edited it
  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugEdited ? prev.slug : generateSlug(name),
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
    if (!form.name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const newEvent: Event = {
        id: crypto.randomUUID(),
        slug: form.slug || generateSlug(form.name),
        name: form.name.trim(),
        date: form.date,
        location: form.location.trim(),
        category: form.category,
        description: form.description.trim(),
        coverPhotoKey: '',
        photos: [],
        publishedAt: null,
      };
      const updated = [...events, newEvent];
      await saveEvents(updated);
      setEvents(updated);
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const updated = events.filter((ev) => ev.id !== id);
      await saveEvents(updated);
      setEvents(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus size={16} className="mr-1" />
          New Event
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* New event form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border bg-muted/30 p-5 space-y-4"
        >
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            New Event
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name *">
              <input
                required
                type="text"
                placeholder="Smith Wedding"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Slug">
              <input
                type="text"
                placeholder="smith-wedding"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <Field label="Location">
              <input
                type="text"
                placeholder="Albany, NY"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className={inputCls}
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value as EventCategory }))
                }
                className={inputCls}
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              placeholder="A short description of this shoot…"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Creating…' : 'Create Event'}
            </Button>
          </div>
        </form>
      )}

      {/* Event list */}
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No events yet. Click "New Event" to create your first one.
        </p>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              {/* Cover thumbnail */}
              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                {ev.coverPhotoKey ? (
                  <img
                    src={`https://photos.rachelkeysphotography.com/${ev.coverPhotoKey}`}
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
                  <span className="font-medium text-sm truncate">{ev.name}</span>
                  <Badge variant={ev.publishedAt ? 'default' : 'secondary'}>
                    {ev.publishedAt ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {CATEGORY_LABELS[ev.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ev.photos.length} photo{ev.photos.length !== 1 ? 's' : ''}
                  {ev.date ? ` · ${new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
                  {ev.location ? ` · ${ev.location}` : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(ev.id, ev.name)}
                  aria-label={`Delete ${ev.name}`}
                >
                  <Trash2 size={15} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/events/${ev.id}`)}
                  aria-label={`Open ${ev.name}`}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {children}
    </div>
  );
}
