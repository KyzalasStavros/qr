import { useRef } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useQRCode } from '../hooks/useQRCode';
import { getScanWarnings } from '../utils/scanQuality';
import { formatContent } from '../utils/contentFormatters';
import type { QRSettings } from '../types';

interface Props {
  settings: QRSettings;
}

export function QRPreview({ settings }: Props) {

  const containerRef = useRef<HTMLDivElement>(null);
  useQRCode(containerRef, settings);

  const data = formatContent(settings.content);
  const warnings = getScanWarnings({
    dotsColor: settings.dotsColor,
    backgroundColor: settings.backgroundColor,
    backgroundTransparent: settings.backgroundTransparent,
    logoDataUrl: settings.logoDataUrl,
    logoSize: settings.logoSize,
    errorCorrection: settings.errorCorrection,
    dataLength: data.length,
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas container — scales down to fit the panel, never overflows.
          The actual export size is controlled by settings.size; this is display only. */}
      <div className="w-full flex justify-center">
        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 [&_canvas]:!max-w-full [&_canvas]:!h-auto [&_svg]:!max-w-full [&_svg]:!h-auto"
          style={{ lineHeight: 0, maxWidth: '100%' }}
        />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="w-full space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex gap-2 rounded-lg p-3 text-sm ${
                w.level === 'error'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {w.level === 'error' ? (
                <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
              ) : (
                <AlertTriangle className="shrink-0 w-4 h-4 mt-0.5" />
              )}
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Data preview */}
      <p className="text-xs text-gray-400 dark:text-gray-500 break-all text-center max-w-xs">
        {data.slice(0, 120)}
        {data.length > 120 ? '…' : ''}
      </p>
    </div>
  );
}
