import type { Options } from 'qr-code-styling';
import type { QRSettings } from '../types';

const EXPORT_SIZE = 1024;

/** Build QRCodeStyling Options from app settings. Used by the hook and export panel. */
export function buildQROptions(settings: QRSettings, data: string): Options {
  const {
    margin,
    errorCorrection,
    dotsColor,
    dotsType,
    dotsGradient,
    backgroundColor,
    backgroundTransparent,
    backgroundGradient,
    cornersSquareColor,
    cornersSquareType,
    cornersDotColor,
    cornersDotType,
    logoDataUrl,
    logoSize,
  } = settings;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dotsGrad = dotsGradient.enabled
    ? {
        type: dotsGradient.type,
        rotation: toRad(dotsGradient.rotation),
        colorStops: dotsGradient.stops.map((s) => ({ offset: s.offset, color: s.color })),
      }
    : undefined;

  const bgGrad =
    backgroundGradient.enabled && !backgroundTransparent
      ? {
          type: backgroundGradient.type,
          rotation: toRad(backgroundGradient.rotation),
          colorStops: backgroundGradient.stops.map((s) => ({ offset: s.offset, color: s.color })),
        }
      : undefined;

  return {
    width: EXPORT_SIZE,
    height: EXPORT_SIZE,
    type: 'canvas',
    data,
    image: logoDataUrl || undefined,
    // margin is stored as a percentage (0–50); convert to pixels for the library
    margin: Math.round((margin / 100) * EXPORT_SIZE),
    qrOptions: { errorCorrectionLevel: errorCorrection },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: logoSize,
      margin: 4,
    },
    dotsOptions: {
      type: dotsType,
      color: dotsGrad ? undefined : dotsColor,
      gradient: dotsGrad,
    },
    backgroundOptions: backgroundTransparent
      ? { color: 'rgba(0,0,0,0)' }
      : {
          color: bgGrad ? undefined : backgroundColor,
          gradient: bgGrad,
        },
    cornersSquareOptions: { type: cornersSquareType, color: cornersSquareColor },
    cornersDotOptions: { type: cornersDotType, color: cornersDotColor },
  };
}
