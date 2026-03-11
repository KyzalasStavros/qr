import { useState, useRef } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import type { QRSettings } from '../types';
import { formatContent } from '../utils/contentFormatters';
import { sanitizeFilename } from '../utils/sanitize';
import { buildQROptions } from '../utils/buildQROptions';

interface Props {
  settings: QRSettings;
}

export function ExportPanel({ settings }: Props) {
  const [copied, setCopied] = useState(false);
  const [clipboardError, setClipboardError] = useState('');
  const filenameStem = sanitizeFilename(
    formatContent(settings.content).slice(0, 40) || 'qr-code',
  );

  async function download(ext: 'png' | 'svg') {
    const data = formatContent(settings.content) || ' ';
    const qr = new QRCodeStyling(buildQROptions(settings, data));
    await qr.download({ name: filenameStem, extension: ext });
  }

  async function copyToClipboard() {
    setClipboardError('');
    if (!navigator.clipboard || !window.ClipboardItem) {
      setClipboardError('Clipboard API not supported in this browser. Use Download PNG instead.');
      return;
    }
    try {
      const data = formatContent(settings.content) || ' ';
      const qr = new QRCodeStyling({ ...buildQROptions(settings, data), type: 'canvas' });
      const blob = await qr.getRawData('png');
      if (!blob || !(blob instanceof Blob)) throw new Error('Failed to get QR data.');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setClipboardError('Could not copy to clipboard. Try downloading instead.');
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Export
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => download('png')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
        <button
          onClick={() => download('svg')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy image
            </>
          )}
        </button>
      </div>
      {clipboardError && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{clipboardError}</p>
      )}
    </div>
  );
}
