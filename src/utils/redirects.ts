import { isSafeRedirectUrl } from './urlValidator';

export type RedirectMap = Record<string, string>;

/**
 * Fetch and parse the static redirects.json file.
 * Returns null on fetch failure.
 */
export async function fetchRedirects(): Promise<RedirectMap | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/redirects.json`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    // Keep only string values that are safe redirect URLs
    const clean: RedirectMap = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string' && isSafeRedirectUrl(val)) {
        clean[key] = val;
      }
    }
    return clean;
  } catch {
    return null;
  }
}

/**
 * Look up a slug in the redirects map.
 * Returns the destination URL or null if not found / unsafe.
 */
export function resolveSlug(map: RedirectMap, slug: string): string | null {
  const dest = map[slug];
  if (!dest) return null;
  if (!isSafeRedirectUrl(dest)) return null;
  return dest;
}
