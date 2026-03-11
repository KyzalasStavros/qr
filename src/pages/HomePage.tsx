import { useState } from 'react';
import { ContentForm } from '../components/ContentForm';
import { StylePanel } from '../components/StylePanel';
import { QRPreview } from '../components/QRPreview';
import { ExportPanel } from '../components/ExportPanel';
import { PresetManager } from '../components/PresetManager';
import { ModeToggle } from '../components/ModeToggle';
import { AdminHelper } from '../components/AdminHelper';
import { SiteUrlSetting, getSiteUrl } from '../components/SiteUrlSetting';
import { DEFAULT_SETTINGS } from '../utils/defaults';
import type { AppMode, QRSettings } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export function HomePage() {
  const [mode, setMode] = useState<AppMode>('static');
  const [settings, setSettings] = useState<QRSettings>(DEFAULT_SETTINGS);
  const [siteUrl, setSiteUrl] = useState(getSiteUrl);

  function patchSettings(patch: Partial<QRSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  // Called from AdminHelper when user clicks "Generate QR" for a slug
  function encodeUrl(url: string) {
    patchSettings({ content: { type: 'url', url } });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Mode toggle */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <ModeToggle mode={mode} onChange={setMode} />
          {mode === 'dynamic' && (
            <SiteUrlSetting value={siteUrl} onChange={setSiteUrl} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left column: controls */}
          <div className="space-y-4">
            {mode === 'static' ? (
              <>
                <Section title="Content">
                  <ContentForm
                    content={settings.content}
                    onChange={(content) => patchSettings({ content })}
                  />
                </Section>
                <Section title="Style" defaultOpen={false}>
                  <StylePanel settings={settings} onChange={patchSettings} />
                </Section>
                <Section title="Export" defaultOpen={true}>
                  <ExportPanel settings={settings} />
                </Section>
                <Section title="Presets" defaultOpen={false}>
                  <PresetManager
                    currentSettings={settings}
                    onLoad={(s) => setSettings(s)}
                  />
                </Section>
              </>
            ) : (
              <>
                <Section title="Dynamic redirects">
                  <AdminHelper siteUrl={siteUrl} onEncodeUrl={encodeUrl} />
                </Section>
                <Section title="Style" defaultOpen={false}>
                  <StylePanel settings={settings} onChange={patchSettings} />
                </Section>
                <Section title="Export" defaultOpen={true}>
                  <ExportPanel settings={settings} />
                </Section>
              </>
            )}
          </div>

          {/* Right column: live preview (sticky on desktop) */}
          <div className="lg:sticky lg:top-8 self-start">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Live preview
              </p>
              <QRPreview settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
