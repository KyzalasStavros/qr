import { useState } from 'react';
import { ClipboardCopy, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { validateRedirectUrl } from '../utils/urlValidator';
import { sanitizeSlug, sanitizeLabel } from '../utils/sanitize';

interface SlugEntry {
  slug: string;
  url: string;
}

const STORAGE_KEY = 'qr-dynamic-slugs';

function loadSlugs(): SlugEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SlugEntry[];
  } catch {
    return [];
  }
}

function saveSlugs(slugs: SlugEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

interface Props {
  siteUrl: string;
  onEncodeUrl: (url: string) => void;
}

export function AdminHelper({ siteUrl, onEncodeUrl }: Props) {
  const [slugs, setSlugs] = useState<SlugEntry[]>(loadSlugs);
  const [newSlug, setNewSlug] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const base = siteUrl.replace(/\/$/, '');

  function redirectUrl(slug: string) {
    return `${base}/go/${slug}`;
  }

  function jsonSnippet() {
    const obj = Object.fromEntries(slugs.map((s) => [s.slug, s.url]));
    return JSON.stringify(obj, null, 2);
  }

  function addSlug() {
    setUrlError('');
    setSlugError('');

    const slug = sanitizeSlug(newSlug);
    if (!slug) {
      setSlugError('Slug cannot be empty. Use letters, numbers, and hyphens only.');
      return;
    }
    if (slugs.some((s) => s.slug === slug)) {
      setSlugError('That slug already exists. Choose a different name.');
      return;
    }
    const err = validateRedirectUrl(newUrl);
    if (err) {
      setUrlError(err);
      return;
    }

    const updated = [...slugs, { slug, url: newUrl.trim() }];
    setSlugs(updated);
    saveSlugs(updated);
    setNewSlug('');
    setNewUrl('');
  }

  function removeSlug(slug: string) {
    if (!confirm(`Delete slug "${slug}"?`)) return;
    const updated = slugs.filter((s) => s.slug !== slug);
    setSlugs(updated);
    saveSlugs(updated);
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback: select a textarea
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400';
  const errorCls = 'mt-1 text-xs text-red-600 dark:text-red-400';

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300 space-y-1">
        <p className="font-semibold">How dynamic mode works</p>
        <p>
          The QR code points to <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">{base}/go/your-slug</code>.
          That page reads <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">data/redirects.json</code> and redirects
          to the destination. To change the destination later, edit the JSON file and redeploy.
        </p>
      </div>

      {/* Add new slug */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Create redirect
        </p>
        <div>
          <label htmlFor="new-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <input
            id="new-slug"
            type="text"
            className={inputCls}
            placeholder="my-link"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          {slugError && <p className={errorCls}>{slugError}</p>}
          {newSlug && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono">
              {redirectUrl(sanitizeSlug(newSlug))}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="new-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination URL</label>
          <input
            id="new-url"
            type="url"
            className={inputCls}
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          {urlError && <p className={errorCls}>{urlError}</p>}
        </div>
        <button
          onClick={addSlug}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Add redirect
        </button>
      </div>

      {/* Slug list */}
      {slugs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Redirects ({slugs.length})
          </p>
          <ul className="space-y-2">
            {slugs.map((s) => {
              const qrUrl = redirectUrl(s.slug);
              return (
                <li key={s.slug} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{s.slug}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">→ {s.url}</p>
                    </div>
                    <button onClick={() => removeSlug(s.slug)} aria-label={`Delete ${s.slug}`} className="text-gray-400 hover:text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => onEncodeUrl(qrUrl)}
                      className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                    >
                      Generate QR
                    </button>
                    <button
                      onClick={() => copyText(qrUrl, s.slug)}
                      className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copied === s.slug ? (
                        <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied</>
                      ) : (
                        <><ClipboardCopy className="w-3.5 h-3.5" /> Copy URL</>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* JSON export */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                redirects.json snippet
              </p>
              <button
                onClick={() => copyText(jsonSnippet(), '__json')}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {copied === '__json' ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Copied</>
                ) : (
                  <><ClipboardCopy className="w-3.5 h-3.5" /> Copy</>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded-lg p-3 overflow-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              {jsonSnippet()}
            </pre>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Paste this into <code className="font-mono">public/data/redirects.json</code> in your repo and redeploy to activate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
