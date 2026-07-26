/**
 * Converts a display name into a URL-safe slug.
 * e.g. "Smith & Jones Wedding 2025!" → "smith-jones-wedding-2025"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')           // ampersand → "and"
    .replace(/[^a-z0-9\s-]/g, '')  // strip non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-')           // collapse repeated hyphens
    .replace(/^-|-$/g, '');        // trim leading/trailing hyphens
}
