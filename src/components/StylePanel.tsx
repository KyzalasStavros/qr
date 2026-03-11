import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Tooltip } from './Tooltip';
import type {
  QRSettings,
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
  GradientConfig,
  GradientType,
} from '../types';

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const inputCls =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const sectionCls = 'space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700';
const sectionTitle = 'text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400';

const DOT_TYPES: DotType[] = ['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded'];
const CORNER_SQUARE_TYPES: CornerSquareType[] = ['square', 'dot', 'extra-rounded', 'rounded', 'dots', 'classy', 'classy-rounded'];
const CORNER_DOT_TYPES: CornerDotType[] = ['square', 'dot', 'extra-rounded', 'rounded', 'dots', 'classy', 'classy-rounded'];
const EC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
const EC_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: 'L – Low (7%)',
  M: 'M – Medium (15%)',
  Q: 'Q – Quartile (25%)',
  H: 'H – High (30%)',
};

function GradientEditor({
  label,
  config,
  onChange,
}: {
  label: string;
  config: GradientConfig;
  onChange: (c: GradientConfig) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        {label}
      </label>
      {config.enabled && (
        <div className="pl-6 space-y-2">
          <div className="flex gap-2">
            {(['linear', 'radial'] as GradientType[]).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...config, type: t })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  config.type === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {config.type === 'linear' && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Rotation: {config.rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={config.rotation}
                onChange={(e) => onChange({ ...config, rotation: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Start colour</label>
              <div className="flex gap-1 mt-1">
                <input
                  type="color"
                  value={config.stops[0].color}
                  onChange={(e) => onChange({ ...config, stops: [{ offset: 0, color: e.target.value }, config.stops[1]] })}
                  className="h-8 w-8 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={config.stops[0].color}
                  onChange={(e) => onChange({ ...config, stops: [{ offset: 0, color: e.target.value }, config.stops[1]] })}
                  className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">End colour</label>
              <div className="flex gap-1 mt-1">
                <input
                  type="color"
                  value={config.stops[1].color}
                  onChange={(e) => onChange({ ...config, stops: [config.stops[0], { offset: 1, color: e.target.value }] })}
                  className="h-8 w-8 rounded cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={config.stops[1].color}
                  onChange={(e) => onChange({ ...config, stops: [config.stops[0], { offset: 1, color: e.target.value }] })}
                  className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  settings: QRSettings;
  onChange: (patch: Partial<QRSettings>) => void;
}

export function StylePanel({ settings, onChange }: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        // Auto-enforce H error correction when logo is added
        onChange({ logoDataUrl: result, errorCorrection: 'H' });
      }
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    onChange({ logoDataUrl: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      {/* Size & margin */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Canvas</p>
        <div>
          <label className={labelCls}>Size: {settings.size}px</label>
          <input
            type="range" min={128} max={1024} step={8}
            value={settings.size}
            onChange={(e) => onChange({ size: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <label className={labelCls}>Margin: {settings.margin}%</label>
          <input
            type="range" min={0} max={50} step={1}
            value={settings.margin}
            onChange={(e) => onChange({ margin: Number(e.target.value) })}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label htmlFor="ec-level" className="text-sm font-medium text-gray-700 dark:text-gray-300">Error correction</label>
            <Tooltip
              content={
                <>
                  <p className="font-semibold mb-1">Error correction level</p>
                  <p className="mb-1">Controls how much of the QR code can be damaged or obscured and still scan correctly.</p>
                  <ul className="space-y-0.5">
                    <li><strong>L (7%)</strong> — smallest code, least robust</li>
                    <li><strong>M (15%)</strong> — good default for clean prints</li>
                    <li><strong>Q (25%)</strong> — better for slightly worn surfaces</li>
                    <li><strong>H (30%)</strong> — required when adding a logo</li>
                  </ul>
                </>
              }
            />
          </div>
          <select
            id="ec-level"
            className={inputCls}
            value={settings.errorCorrection}
            onChange={(e) => onChange({ errorCorrection: e.target.value as ErrorCorrectionLevel })}
          >
            {EC_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{EC_LABELS[lvl]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-1.5">
          <p className={sectionTitle}>Dots</p>
          <Tooltip
            content={
              <>
                <p className="font-semibold mb-1">Dot style</p>
                <p>Controls the shape of every data module in the QR code. More decorative shapes still scan correctly — just ensure good contrast.</p>
              </>
            }
          />
        </div>
        <div>
          <label className={labelCls}>Style</label>
          <div className="flex flex-wrap gap-2">
            {DOT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ dotsType: t })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  settings.dotsType === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {!settings.dotsGradient.enabled && (
          <div>
            <label className={labelCls}>Colour</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.dotsColor}
                onChange={(e) => onChange({ dotsColor: e.target.value })}
                className="h-9 w-9 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.dotsColor}
                onChange={(e) => onChange({ dotsColor: e.target.value })}
                className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
        <GradientEditor
          label="Use gradient"
          config={settings.dotsGradient}
          onChange={(c) => onChange({ dotsGradient: c })}
        />
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-1.5">
          <p className={sectionTitle}>Background</p>
          <Tooltip
            content="Controls the QR code background. Use transparent for PNGs you want to overlay on coloured surfaces. Transparency is not supported in SVG exports."
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.backgroundTransparent}
            onChange={(e) => onChange({ backgroundTransparent: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Transparent background <span className="text-gray-400 text-xs">(PNG only)</span>
        </label>
        {!settings.backgroundTransparent && !settings.backgroundGradient.enabled && (
          <div>
            <label className={labelCls}>Colour</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="h-9 w-9 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
        {!settings.backgroundTransparent && (
          <GradientEditor
            label="Use gradient"
            config={settings.backgroundGradient}
            onChange={(c) => onChange({ backgroundGradient: c })}
          />
        )}
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-1.5">
          <p className={sectionTitle}>Corner squares</p>
          <Tooltip
            content={
              <>
                <p className="font-semibold mb-1">Corner squares</p>
                <p>The three large squares in the corners of the QR code. Scanners use them to locate and orient the code.</p>
              </>
            }
          />
        </div>
        <div>
          <label className={labelCls}>Style</label>
          <div className="flex flex-wrap gap-2">
            {CORNER_SQUARE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ cornersSquareType: t })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  settings.cornersSquareType === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Colour</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.cornersSquareColor}
              onChange={(e) => onChange({ cornersSquareColor: e.target.value })}
              className="h-9 w-9 rounded cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={settings.cornersSquareColor}
              onChange={(e) => onChange({ cornersSquareColor: e.target.value })}
              className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <p className={sectionTitle}>Corner dots</p>
          <Tooltip
            content={
              <>
                <p className="font-semibold mb-1">Corner dots</p>
                <p>The small square or dot inside each corner square. Independent style control lets you create contrast between the inner and outer parts of the corner markers.</p>
              </>
            }
          />
        </div>
        <div>
          <label className={labelCls}>Style</label>
          <div className="flex flex-wrap gap-2">
            {CORNER_DOT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ cornersDotType: t })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  settings.cornersDotType === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Colour</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.cornersDotColor}
              onChange={(e) => onChange({ cornersDotColor: e.target.value })}
              className="h-9 w-9 rounded cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={settings.cornersDotColor}
              onChange={(e) => onChange({ cornersDotColor: e.target.value })}
              className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-1.5">
          <p className={sectionTitle}>Logo</p>
          <Tooltip
            content={
              <>
                <p className="font-semibold mb-1">Logo overlay</p>
                <ul className="space-y-1">
                  <li>• Error correction is automatically set to <strong>H</strong> when a logo is added, since the logo covers part of the code.</li>
                  <li>• Keep logo size below 30% for best scan reliability.</li>
                  <li>• Logos appear in both PNG and SVG exports.</li>
                </ul>
              </>
            }
          />
        </div>
        {settings.logoDataUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoDataUrl}
                alt="Logo preview"
                className="w-12 h-12 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
              />
              <button
                onClick={removeLogo}
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                <X className="w-4 h-4" /> Remove logo
              </button>
            </div>
            <div>
              <label className={labelCls}>Logo size: {Math.round(settings.logoSize * 100)}%</label>
              <input
                type="range" min={0.1} max={0.4} step={0.01}
                value={settings.logoSize}
                onChange={(e) => onChange({ logoSize: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        ) : (
          <>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              id="logo-upload"
              onChange={handleLogoUpload}
            />
            <label
              htmlFor="logo-upload"
              className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload logo (max 5 MB)
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Adding a logo automatically sets error correction to H (High).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
