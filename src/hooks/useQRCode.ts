import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRSettings } from '../types';
import { formatContent } from '../utils/contentFormatters';
import { buildQROptions } from '../utils/buildQROptions';

export function useQRCode(
  containerRef: React.RefObject<HTMLDivElement | null>,
  settings: QRSettings,
): QRCodeStyling | null {
  const qrRef = useRef<QRCodeStyling | null>(null);
  const mountedRef = useRef(false);
  // Track previous logo so we can detect when a logo is first added or swapped.
  // When the logo changes we recreate the instance  (calling update() with a new image
  // has an async gap that leaves the canvas white until the image loads).
  const prevLogoRef = useRef<string>('');

  const data = formatContent(settings.content) || ' ';

  useEffect(() => {
    if (!containerRef.current) return;

    const logoChanged = settings.logoDataUrl !== prevLogoRef.current;
    prevLogoRef.current = settings.logoDataUrl;

    // Recreate instance when: first mount OR logo changed (avoids async white-flash)
    if (!mountedRef.current || logoChanged) {
      let cancelled = false;

      const createInstance = () => {
        if (cancelled || !containerRef.current) return;
        // Clear any existing canvas/svg child appended by a prior instance
        containerRef.current.innerHTML = '';
        qrRef.current = new QRCodeStyling(buildQROptions(settings, data));
        qrRef.current.append(containerRef.current);
        mountedRef.current = true;
      };

      if (settings.logoDataUrl) {
        // Preload the image before creating the instance so qr-code-styling
        // never renders a blank center hole while it fetches the image async.
        // For data URLs this resolves in <1 ms (already in memory).
        const img = new Image();
        img.onload = () => {
          createInstance();
          // qr-code-styling creates its own Image internally and composites async.
          // By the time our Image fires onload the library's internal decode is also
          // done (same data URL, same browser decode pipeline). A single update()
          // call right after forces a synchronous re-composite with the cached bitmap.
          setTimeout(() => {
            if (!cancelled && qrRef.current) {
              console.debug('[useQRCode] logo loaded — forcing update to flush composite');
              qrRef.current.update(buildQROptions(settings, data));
            }
          }, 50);
        };
        img.onerror = createInstance; // still render QR if image somehow fails
        img.src = settings.logoDataUrl;
      } else {
        createInstance();
      }

      return () => { cancelled = true; };
    } else {
      qrRef.current?.update(buildQROptions(settings, data));
    }
  });

  return qrRef.current;
}
