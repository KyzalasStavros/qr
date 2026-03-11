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

  const data = formatContent(settings.content) || ' ';

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mountedRef.current) {
      qrRef.current = new QRCodeStyling(buildQROptions(settings, data));
      qrRef.current.append(containerRef.current);
      mountedRef.current = true;
    } else {
      qrRef.current?.update(buildQROptions(settings, data));
    }
  });

  return qrRef.current;
}
