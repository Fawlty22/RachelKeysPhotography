import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CONTENT, getContent, saveContent, type SiteContent } from '@/lib/s3';

export function ContentPage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getContent()
      .then(setContent)
      .catch(e => {
        console.error('Failed to load content from S3:', e);
        setLoadError((e as Error).message ?? 'Unknown error');
        // Keep DEFAULT_CONTENT in state so the form is still usable
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await saveContent(content);
      setSaved(true);
      setLoadError(null);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function set<S extends keyof SiteContent, F extends keyof SiteContent[S]>(
    section: S, field: F, value: string,
  ) {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setSaved(false);
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <strong>Could not load saved content.</strong> Showing defaults — check the browser
          console for details. Any saves here will overwrite the current S3 content.
        </div>
      )}

      <Section title="Hero">
        <Field label="Headline" value={content.hero.headline}
          onChange={v => set('hero', 'headline', v)} />
        <Field label="Subheading" value={content.hero.subheading}
          onChange={v => set('hero', 'subheading', v)} />
      </Section>

      <Section title="About">
        <Field label="Body" value={content.about.body}
          onChange={v => set('about', 'body', v)} multiline />
      </Section>

      <Section title="Contact">
        <Field label="Blurb" value={content.contact.blurb}
          onChange={v => set('contact', 'blurb', v)} multiline />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const base = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      {multiline
        ? <textarea rows={4} className={base} value={value} onChange={e => onChange(e.target.value)} />
        : <input type="text" className={base} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}
