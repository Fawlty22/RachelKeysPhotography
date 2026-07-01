import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LOCATIONS,
  type PhotoLocation,
  type PhotoObject,
  deletePhoto,
  listPhotos,
  uploadPhoto,
} from "@/lib/s3";
import { cn } from "@/lib/utils";

export function PhotosPage() {
  const [location, setLocation] = useState<PhotoLocation>("hero");
  const [photos, setPhotos] = useState<PhotoObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPhotos(await listPhotos(location));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadPhoto(location, f)),
      );
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await deletePhoto(key, location);
      setPhotos((prev) => prev.filter((p) => p.key !== key));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Photos</h1>

      {/* Location tabs */}
      <div className="flex gap-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocation(loc)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
              location === loc
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50",
        )}
      >
        <UploadCloud size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading ? "Uploading…" : "Drop photos here or click to browse"}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Photo grid */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No photos in {location} yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.key}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={photo.url}
                alt={photo.key.split("/").pop()}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(photo.key)}
                aria-label="Delete photo"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
