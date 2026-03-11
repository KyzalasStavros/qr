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
      // Clear any existing canvas/svg child appended by a prior instance
      containerRef.current.innerHTML = '';
      qrRef.current = new QRCodeStyling(buildQROptions(settings, data));
      qrRef.current.append(containerRef.current);
      mountedRef.current = true;
    } else {
      qrRef.current?.update(buildQROptions(settings, data));
    }
  });

  return qrRef.current;
}
