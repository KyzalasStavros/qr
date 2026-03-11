import type { QRSettings } from '../types';

export const DEFAULT_SETTINGS: QRSettings = {
  content: { type: 'url', url: 'https://example.com' },
  size: 400,
  margin: 4, // percentage (0–50%)
  errorCorrection: 'M',
  dotsColor: '#000000',
  dotsType: 'square',
  dotsGradient: {
    enabled: false,
    type: 'linear',
    rotation: 0,
    stops: [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#444444' },
    ],
  },
  backgroundColor: '#ffffff',
  backgroundTransparent: false,
  backgroundGradient: {
    enabled: false,
    type: 'linear',
    rotation: 0,
    stops: [
      { offset: 0, color: '#ffffff' },
      { offset: 1, color: '#f0f0f0' },
    ],
  },
  cornersSquareColor: '#000000',
  cornersSquareType: 'square',
  cornersDotColor: '#000000',
  cornersDotType: 'square',
  logoDataUrl: '',
  logoSize: 0.25,
};
