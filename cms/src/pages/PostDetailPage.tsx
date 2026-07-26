import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Star, Save } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getPosts, savePosts } from '@/lib/s3';
import type { Event, BlogPost } from '@/lib/types';
import { cn } from '@/lib/utils';

const CDN = 'https://photos.rachelkeysphotography.com';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setPost((prev) => prev ? { ...prev, bodyHtml: editor.getHTML() } : prev);
      setSaved(false);
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [posts, evts] = await Promise.all([getPosts(), getEvents()]);
      setAllPosts(posts);
      setEvents(evts);
      const found = posts.find((p) => p.id === postId) ?? null;
      setPost(found);
      if (found && editor) {
        editor.commands.setContent(found.bodyHtml || '');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [postId, editor]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, editor]);

  // ── Persist helper ─────────────────────────────────────────────────────────
  async function persistPost(updated: BlogPost) {
    const updatedAll = allPosts.map((p) => (p.id === updated.id ? updated : p));
    await savePosts(updatedAll);
    setAllPosts(updatedAll);
    setPost(updated);
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setError(null);
    try {
      const updatedPost: BlogPost = {
        ...post,
        bodyHtml: editor?.getHTML() ?? post.bodyHtml,
      };
      await persistPost(updatedPost);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Publish toggle ─────────────────────────────────────────────────────────
  async function handlePublishToggle() {
    if (!post) return;
    const updated: BlogPost = {
      ...post,
      bodyHtml: editor?.getHTML() ?? post.bodyHtml,
      publishedAt: post.publishedAt ? null : new Date().toISOString(),
    };
    setSaving(true);
    try {
      await persistPost(updated);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Photo selection ────────────────────────────────────────────────────────
  function togglePhoto(key: string) {
    if (!post) return;
    const already = post.photoKeys.includes(key);
    const photoKeys = already
      ? post.photoKeys.filter((k) => k !== key)
      : [...post.photoKeys, key];
    setPost({ ...post, photoKeys });
    setSaved(false);
  }

  function handleSetCover(key: string) {
    if (!post) return;
    setPost({ ...post, coverPhotoKey: key });
    setSaved(false);
  }

  // ── Linked event photos ────────────────────────────────────────────────────
  const linkedEvent = events.find((ev) => ev.id === post?.eventId);
  // Show photos from linked event first; fall back to all published event photos
  const availablePhotos: string[] = linkedEvent
    ? linkedEvent.photos
    : events.flatMap((ev) => (ev.publishedAt ? ev.photos : []));

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!post) return <div className="p-6 text-sm text-destructive">Post not found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Back to Posts
          </button>
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          {linkedEvent && (
            <p className="text-sm text-muted-foreground">Linked to: {linkedEvent.name}</p>
          )}
        </div>

        {/* Publish + save */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
          {saved && !saving && <span className="text-xs text-green-600">Saved</span>}
          <Badge variant={post.publishedAt ? 'default' : 'secondary'}>
            {post.publishedAt ? 'Published' : 'Draft'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save size={14} className="mr-1" /> Save
          </Button>
          <Button
            variant={post.publishedAt ? 'outline' : 'default'}
            size="sm"
            onClick={handlePublishToggle}
            disabled={saving}
          >
            {post.publishedAt ? (
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

      {/* Title / excerpt editor fields */}
      <div className="grid grid-cols-1 gap-4">
        <Field label="Title">
          <input
            type="text"
            value={post.title}
            onChange={(e) => { setPost({ ...post, title: e.target.value }); setSaved(false); }}
            className={inputCls}
          />
        </Field>
        <Field label="Excerpt (shown on listing page)">
          <textarea
            rows={2}
            value={post.excerpt}
            onChange={(e) => { setPost({ ...post, excerpt: e.target.value }); setSaved(false); }}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Rich text editor */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Body
        </label>
        <TipTapToolbar editor={editor} />
        <div className="border rounded-md min-h-[240px] bg-background [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Photo picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Photos
          </label>
          <span className="text-xs text-muted-foreground">
            {post.photoKeys.length} selected · Click to select, <Star size={10} className="inline" /> to set cover
          </span>
        </div>

        {availablePhotos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {linkedEvent
              ? 'The linked event has no photos yet.'
              : 'No published events with photos found. Create and publish an event first.'}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {availablePhotos.map((key) => {
              const selected = post.photoKeys.includes(key);
              const isCover = post.coverPhotoKey === key;
              return (
                <div
                  key={key}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-md cursor-pointer border-2 transition-all',
                    selected ? 'border-primary' : 'border-transparent',
                  )}
                  onClick={() => togglePhoto(key)}
                >
                  <img
                    src={`${CDN}/${key}`}
                    alt={key.split('/').pop()}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* Selected overlay */}
                  {selected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 z-10">
                      <Star size={9} fill="currentColor" />
                    </div>
                  )}

                  {/* Set cover button (visible on hover of selected photos) */}
                  {selected && !isCover && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetCover(key); }}
                      aria-label="Set as cover photo"
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-white rounded p-0.5 z-10"
                    >
                      <Star size={9} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TipTap toolbar ─────────────────────────────────────────────────────────────

function TipTapToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      'px-2 py-1 text-xs rounded transition-colors',
      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
    );

  return (
    <div className="flex flex-wrap gap-1 border rounded-md bg-muted/40 px-2 py-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
        aria-label="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive('heading', { level: 3 }))}
        aria-label="Heading 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
        aria-label="Bullet list"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
        aria-label="Numbered list"
      >
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
        aria-label="Blockquote"
      >
        ❝ Quote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className={btn(false)}
        aria-label="Line break"
      >
        ↵
      </button>
      <div className="mx-1 w-px bg-muted-foreground/20" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={btn(false)}
        aria-label="Undo"
        disabled={!editor.can().undo()}
      >
        ↩
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={btn(false)}
        aria-label="Redo"
        disabled={!editor.can().redo()}
      >
        ↪
      </button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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
