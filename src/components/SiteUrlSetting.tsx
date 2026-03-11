import { useState } from 'react';
import { Settings, Check } from 'lucide-react';

const STORAGE_KEY = 'qr-site-url';
const DEFAULT_URL = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '');

export function getSiteUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function SiteUrlSetting({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    const clean = draft.replace(/\/$/, '').trim();
    localStorage.setItem(STORAGE_KEY, clean);
    onChange(clean);
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => { setDraft(value); setOpen(!open); }}
        className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:underline"
      >
        <Settings className="w-3.5 h-3.5" />
        Site URL: <span className="font-mono">{value}</span>
      </button>
      {open && (
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://yoursite.com"
          />
          <button
            onClick={save}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      )}
    </div>
  );
}
