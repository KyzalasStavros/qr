import clsx from 'clsx';
import { Tooltip } from './Tooltip';
import type { AppMode } from '../types';

const MODE_INFO: Record<AppMode, string> = {
  static:
    'Static QR — the full content (URL, text, contact, etc.) is encoded directly in the QR code. No server required. Once printed, the destination cannot be changed.',
  dynamic:
    'Dynamic QR — the QR code encodes a short redirect URL on this site (e.g. /go/my-link). The destination can be changed later by editing redirects.json and redeploying. Useful for printed materials where the target URL may change.',
};

interface Props {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mode</span>
      <div className="relative flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5">
        {(['static', 'dynamic'] as AppMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={clsx(
              'relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              mode === m
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            )}
            aria-pressed={mode === m}
          >
            {m}
          </button>
        ))}
      </div>
      <Tooltip content={MODE_INFO[mode]} position="bottom" />
      {mode === 'dynamic' && (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          Requires redeploy to change destination
        </span>
      )}
    </div>
  );
}
