export type ContentType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard';

export type DotType =
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

export type CornerSquareType =
  | 'dot'
  | 'square'
  | 'extra-rounded'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded';

export type CornerDotType =
  | 'dot'
  | 'square'
  | 'extra-rounded'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type GradientType = 'linear' | 'radial';
export type AppMode = 'static' | 'dynamic';

export interface GradientStop {
  offset: number; // 0–1
  color: string;
}

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  rotation: number; // degrees 0–360
  stops: [GradientStop, GradientStop];
}

// ── Content type payloads ──────────────────────────────────────────────────
export interface UrlContent {
  type: 'url';
  url: string;
}
export interface TextContent {
  type: 'text';
  text: string;
}
export interface EmailContent {
  type: 'email';
  address: string;
  subject: string;
  body: string;
}
export interface PhoneContent {
  type: 'phone';
  number: string;
}
export interface SmsContent {
  type: 'sms';
  number: string;
  message: string;
}
export interface WifiContent {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}
export interface VCardContent {
  type: 'vcard';
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
}

export type QRContent =
  | UrlContent
  | TextContent
  | EmailContent
  | PhoneContent
  | SmsContent
  | WifiContent
  | VCardContent;

// ── Full QR settings ───────────────────────────────────────────────────────
export interface QRSettings {
  content: QRContent;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
  dotsColor: string;
  dotsType: DotType;
  dotsGradient: GradientConfig;
  backgroundColor: string;
  backgroundTransparent: boolean;
  backgroundGradient: GradientConfig;
  cornersSquareColor: string;
  cornersSquareType: CornerSquareType;
  cornersDotColor: string;
  cornersDotType: CornerDotType;
  logoDataUrl: string;
  logoSize: number; // 0.1–0.4
}

export interface Preset {
  id: string;
  name: string;
  settings: QRSettings;
  createdAt: number;
}

export interface ScanWarning {
  level: 'warn' | 'error';
  message: string;
}
