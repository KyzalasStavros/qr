/** Protocols that are safe to encode in QR codes or use as redirect targets. */
const ALLOWED_PROTOCOLS = new Set([
  'https:',
  'http:',
  'mailto:',
  'tel:',
  'sms:',
]);

/** Protocols that must never be used, even if somehow formed by the user. */
const BLOCKED_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
]);

/**
 * Validate a URL entered in QR content forms (url type only).
 * Returns null if valid, or an error message string.
 */
export function validateUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'URL is required.';

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return 'Enter a valid URL (e.g. https://example.com).';
  }

  if (BLOCKED_PROTOCOLS.has(url.protocol)) {
    return `Protocol "${url.protocol}" is not allowed.`;
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return `Protocol "${url.protocol}" is not supported. Use https:, http:, mailto:, tel:, or sms:.`;
  }

  return null;
}

/**
 * Validate a redirect destination URL (for dynamic QR mode and /go/:slug).
 * Only https: and http: are allowed — other protocols should be encoded as
 * static QR content instead.
 */
export function validateRedirectUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Destination URL is required.';

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return 'Enter a valid URL (e.g. https://example.com).';
  }

  if (BLOCKED_PROTOCOLS.has(url.protocol)) {
    return `Protocol "${url.protocol}" is not allowed.`;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'Redirect destinations must use https: or http:.';
  }

  return null;
}

/** Returns true if a string is a safe redirect destination. */
export function isSafeRedirectUrl(raw: string): boolean {
  return validateRedirectUrl(raw) === null;
}
