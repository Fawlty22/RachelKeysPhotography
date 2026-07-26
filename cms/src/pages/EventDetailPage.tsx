import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, saveEvents, uploadEventPhoto, deleteEventPhoto } from '@/lib/s3';
import type { Event } from '@/lib/types';
import { cn } from '@/lib/utils';

const CDN = 'https://photos.rachelkeysphotography.com';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await getEvents();
      setAllEvents(events);
      const found = events.find((ev) => ev.id === eventId) ?? null;
      setEvent(found);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Persist helper ───────────────────────────────────────────────────────────
  async function persistEvent(updated: Event) {
    const updatedAll = allEvents.map((ev) => (ev.id === updated.id ? updated : ev));
    await saveEvents(updatedAll);
    setAllEvents(updatedAll);
    setEvent(updated);
  }

  // ── Photo upload ─────────────────────────────────────────────────────────────
  async function handleFiles(files: FileList | null) {
    if (!files?.length || !event) return;
    setUploading(true);
    setError(null);
    try {
      const keys = await Promise.all(
        Array.from(files).map((f) => uploadEventPhoto(event.id, f)),
      );
      const updated: Event = {
        ...event,
        photos: [...event.photos, ...keys],
        // Auto-set cover if none set yet
        coverPhotoKey: event.coverPhotoKey || keys[0],
      };
      await persistEvent(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────
  async function handleDragEnd(dragEvent: DragEndEvent) {
    if (!event) return;
    const { active, over } = dragEvent;
    if (!over || active.id === over.id) return;

    const oldIndex = event.photos.indexOf(active.id as string);
    const newIndex = event.photos.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(event.photos, oldIndex, newIndex);
    const updated: Event = { ...event, photos: reordered };
    setSaving(true);
    try {
      await persistEvent(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Set cover ────────────────────────────────────────────────────────────────
  async function handleSetCover(key: string) {
    if (!event) return;
    const updated: Event = { ...event, coverPhotoKey: key };
    setSaving(true);
    try {
      await persistEvent(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete photo ─────────────────────────────────────────────────────────────
  async function handleDeletePhoto(key: string) {
    if (!event) return;
    if (!confirm('Delete this photo? It will be removed from S3.')) return;
    setError(null);
    try {
      await deleteEventPhoto(key);
      const updatedPhotos = event.photos.filter((k) => k !== key);
      const updated: Event = {
        ...event,
        photos: updatedPhotos,
        coverPhotoKey: event.coverPhotoKey === key
          ? (updatedPhotos[0] ?? '')
          : event.coverPhotoKey,
      };
      await persistEvent(updated);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // ── Publish toggle ───────────────────────────────────────────────────────────
  async function handlePublishToggle() {
    if (!event) return;
    const updated: Event = {
      ...event,
      publishedAt: event.publishedAt ? null : new Date().toISOString(),
    };
    setSaving(true);
    try {
      await persistEvent(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!event) return <div className="p-6 text-sm text-destructive">Event not found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Back to Events
          </button>
          <h1 className="text-2xl font-semibold">{event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {event.photos.length} photo{event.photos.length !== 1 ? 's' : ''}
            {event.location ? ` · ${event.location}` : ''}
            {event.date
              ? ` · ${new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`
              : ''}
          </p>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
          <Badge variant={event.publishedAt ? 'default' : 'secondary'}>
            {event.publishedAt ? 'Published' : 'Draft'}
          </Badge>
          <Button
            variant={event.publishedAt ? 'outline' : 'default'}
            size="sm"
            onClick={handlePublishToggle}
            disabled={saving}
          >
            {event.publishedAt ? (
              <><EyeOff size={14} className="mr-1" /> Unpublish</>
            ) : (
              <><Eye size={14} className="mr-1" /> Publish</>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-primary/50',
        )}
      >
        <UploadCloud size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading ? 'Uploading…' : 'Drop photos here or click to browse'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Helper text */}
      {event.photos.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag to reorder · Hover for actions · <Star size={11} className="inline" /> marks the cover photo
        </p>
      )}

      {/* Sortable photo grid */}
      {event.photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={event.photos} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {event.photos.map((key) => (
                <SortablePhoto
                  key={key}
                  photoKey={key}
                  url={`${CDN}/${key}`}
                  isCover={event.coverPhotoKey === key}
                  onSetCover={() => handleSetCover(key)}
                  onDelete={() => handleDeletePhoto(key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ── Sortable photo item ────────────────────────────────────────────────────────

interface SortablePhotoProps {
  photoKey: string;
  url: string;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}

function SortablePhoto({ photoKey, url, isCover, onSetCover, onDelete }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photoKey,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-grab active:cursor-grabbing"
    >
      {/* Drag handle covers the whole tile */}
      <div {...listeners} className="absolute inset-0 z-0" />

      <img
        src={url}
        alt={photoKey.split('/').pop()}
        className="h-full w-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full p-1 z-10">
          <Star size={11} fill="currentColor" />
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end justify-between p-2 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onSetCover(); }}
          title="Set as cover"
          aria-label="Set as cover photo"
          className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
            isCover
              ? 'bg-amber-500 text-white'
              : 'bg-white/20 text-white hover:bg-amber-500',
          )}
        >
          <Star size={11} />
          {isCover ? 'Cover' : 'Set cover'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete photo"
          aria-label="Delete photo"
          className="flex items-center justify-center w-7 h-7 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
