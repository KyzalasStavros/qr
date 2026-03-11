/**
 * Strip everything except alphanumerics, hyphens, and underscores.
 * Used for file names and localStorage keys.
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'qr-code';
}

/**
 * Sanitize a redirect slug: lowercase alphanumerics and hyphens only.
 */
export function sanitizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** Basic XSS-safe text: strip angle brackets and quotes. For display only. */
export function sanitizeLabel(raw: string): string {
  return raw.replace(/[<>"'`]/g, '').slice(0, 128);
}
