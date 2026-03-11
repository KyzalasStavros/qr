import type { ErrorCorrectionLevel, ScanWarning } from '../types';

/** Parse a hex colour (#rgb or #rrggbb) to [r, g, b] (0–255). */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

/** Relative luminance per WCAG. */
function luminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/** WCAG contrast ratio between two colours. */
function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;
  const l1 = luminance(...fgRgb);
  const l2 = luminance(...bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ScanQualityInput {
  dotsColor: string;
  backgroundColor: string;
  backgroundTransparent: boolean;
  logoDataUrl: string;
  logoSize: number;
  errorCorrection: ErrorCorrectionLevel;
  dataLength: number;
}

export function getScanWarnings(input: ScanQualityInput): ScanWarning[] {
  const warnings: ScanWarning[] = [];

  // Contrast check (skip when background is transparent — contrast unknown)
  if (!input.backgroundTransparent) {
    const ratio = contrastRatio(input.dotsColor, input.backgroundColor);
    if (ratio !== null && ratio < 3) {
      warnings.push({
        level: 'error',
        message: `Low contrast between QR dots and background (${ratio.toFixed(1)}:1). Most scanners need at least 3:1.`,
      });
    } else if (ratio !== null && ratio < 4.5) {
      warnings.push({
        level: 'warn',
        message: `Contrast ratio is ${ratio.toFixed(1)}:1. Higher contrast improves scan reliability.`,
      });
    }
  }

  // Logo + error correction
  if (input.logoDataUrl) {
    if (input.errorCorrection !== 'H') {
      warnings.push({
        level: 'warn',
        message:
          'Error correction has been automatically set to H (High) because a logo is present. A logo covers part of the QR code, requiring maximum data recovery.',
      });
    }
    if (input.logoSize > 0.3) {
      warnings.push({
        level: 'warn',
        message:
          'Logo size exceeds 30% of the QR code area. Some scanners may struggle even at error correction H. Try reducing logo size.',
      });
    }
  }

  // Data length vs error correction
  if (input.dataLength > 300 && (input.errorCorrection === 'L' || input.errorCorrection === 'M')) {
    warnings.push({
      level: 'warn',
      message:
        'QR data is long. Use error correction Q or H for better reliability, or shorten the content.',
    });
  }

  if (input.dataLength > 500) {
    warnings.push({
      level: 'warn',
      message:
        'Very long QR content creates a dense code that some older scanners may not read. Consider shortening the URL or using a dynamic redirect.',
    });
  }

  return warnings;
}
