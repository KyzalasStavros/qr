import clsx from 'clsx';
import type {
  ContentType,
  QRContent,
  UrlContent,
  TextContent,
  EmailContent,
  PhoneContent,
  SmsContent,
  WifiContent,
  VCardContent,
} from '../types';
import { validateUrl } from '../utils/urlValidator';

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'url', label: 'URL' },
  { id: 'text', label: 'Text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'sms', label: 'SMS' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'vcard', label: 'vCard' },
];

function defaultForType(type: ContentType): QRContent {
  switch (type) {
    case 'url': return { type: 'url', url: 'https://' };
    case 'text': return { type: 'text', text: '' };
    case 'email': return { type: 'email', address: '', subject: '', body: '' };
    case 'phone': return { type: 'phone', number: '' };
    case 'sms': return { type: 'sms', number: '', message: '' };
    case 'wifi': return { type: 'wifi', ssid: '', password: '', encryption: 'WPA', hidden: false };
    case 'vcard': return { type: 'vcard', firstName: '', lastName: '', organization: '', title: '', phone: '', email: '', url: '', address: '' };
  }
}

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const inputCls =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400';
const errorCls = 'mt-1 text-xs text-red-600 dark:text-red-400';

interface Props {
  content: QRContent;
  onChange: (content: QRContent) => void;
}

export function ContentForm({ content, onChange }: Props) {
  function setType(type: ContentType) {
    if (type !== content.type) onChange(defaultForType(type));
  }
  function patch<T extends QRContent>(fields: Partial<T>) {
    onChange({ ...content, ...fields } as QRContent);
  }

  const urlError =
    content.type === 'url' ? validateUrl(content.url) : null;

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div>
        <label className={labelCls}>Content type</label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="QR content type">
          {CONTENT_TYPES.map(({ id, label }) => (
            <button
              key={id}
              role="radio"
              aria-checked={content.type === id}
              onClick={() => setType(id)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                content.type === id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Fields per type */}
      <div className="space-y-3">
        {content.type === 'url' && (
          <div>
            <label htmlFor="url-input" className={labelCls}>URL</label>
            <input
              id="url-input"
              type="url"
              className={clsx(inputCls, urlError && 'border-red-400 focus:ring-red-400')}
              value={(content as UrlContent).url}
              onChange={(e) => patch<UrlContent>({ url: e.target.value })}
              placeholder="https://example.com"
              autoComplete="url"
            />
            {urlError && <p className={errorCls}>{urlError}</p>}
          </div>
        )}

        {content.type === 'text' && (
          <div>
            <label htmlFor="text-input" className={labelCls}>Text</label>
            <textarea
              id="text-input"
              className={inputCls}
              rows={4}
              value={(content as TextContent).text}
              onChange={(e) => patch<TextContent>({ text: e.target.value })}
              placeholder="Enter any text…"
            />
          </div>
        )}

        {content.type === 'email' && (
          <>
            <div>
              <label htmlFor="email-addr" className={labelCls}>Email address</label>
              <input id="email-addr" type="email" className={inputCls}
                value={(content as EmailContent).address}
                onChange={(e) => patch<EmailContent>({ address: e.target.value })}
                placeholder="user@example.com" />
            </div>
            <div>
              <label htmlFor="email-subject" className={labelCls}>Subject <span className="text-gray-400">(optional)</span></label>
              <input id="email-subject" type="text" className={inputCls}
                value={(content as EmailContent).subject}
                onChange={(e) => patch<EmailContent>({ subject: e.target.value })}
                placeholder="Hello" />
            </div>
            <div>
              <label htmlFor="email-body" className={labelCls}>Body <span className="text-gray-400">(optional)</span></label>
              <textarea id="email-body" className={inputCls} rows={3}
                value={(content as EmailContent).body}
                onChange={(e) => patch<EmailContent>({ body: e.target.value })}
                placeholder="Message body…" />
            </div>
          </>
        )}

        {content.type === 'phone' && (
          <div>
            <label htmlFor="phone-num" className={labelCls}>Phone number</label>
            <input id="phone-num" type="tel" className={inputCls}
              value={(content as PhoneContent).number}
              onChange={(e) => patch<PhoneContent>({ number: e.target.value })}
              placeholder="+1 555 000 0000" />
          </div>
        )}

        {content.type === 'sms' && (
          <>
            <div>
              <label htmlFor="sms-num" className={labelCls}>Phone number</label>
              <input id="sms-num" type="tel" className={inputCls}
                value={(content as SmsContent).number}
                onChange={(e) => patch<SmsContent>({ number: e.target.value })}
                placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label htmlFor="sms-msg" className={labelCls}>Message <span className="text-gray-400">(optional)</span></label>
              <textarea id="sms-msg" className={inputCls} rows={3}
                value={(content as SmsContent).message}
                onChange={(e) => patch<SmsContent>({ message: e.target.value })}
                placeholder="Pre-filled message…" />
            </div>
          </>
        )}

        {content.type === 'wifi' && (
          <>
            <div>
              <label htmlFor="wifi-ssid" className={labelCls}>Network name (SSID)</label>
              <input id="wifi-ssid" type="text" className={inputCls}
                value={(content as WifiContent).ssid}
                onChange={(e) => patch<WifiContent>({ ssid: e.target.value })}
                placeholder="My WiFi Network" />
            </div>
            <div>
              <label htmlFor="wifi-enc" className={labelCls}>Security</label>
              <select id="wifi-enc" className={inputCls}
                value={(content as WifiContent).encryption}
                onChange={(e) => patch<WifiContent>({ encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password (Open)</option>
              </select>
            </div>
            {(content as WifiContent).encryption !== 'nopass' && (
              <div>
                <label htmlFor="wifi-pw" className={labelCls}>Password</label>
                <input id="wifi-pw" type="text" className={inputCls}
                  value={(content as WifiContent).password}
                  onChange={(e) => patch<WifiContent>({ password: e.target.value })}
                  placeholder="Network password" autoComplete="off" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox"
                checked={(content as WifiContent).hidden}
                onChange={(e) => patch<WifiContent>({ hidden: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              Hidden network
            </label>
          </>
        )}

        {content.type === 'vcard' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vc-first" className={labelCls}>First name</label>
                <input id="vc-first" type="text" className={inputCls}
                  value={(content as VCardContent).firstName}
                  onChange={(e) => patch<VCardContent>({ firstName: e.target.value })}
                  placeholder="Jane" />
              </div>
              <div>
                <label htmlFor="vc-last" className={labelCls}>Last name</label>
                <input id="vc-last" type="text" className={inputCls}
                  value={(content as VCardContent).lastName}
                  onChange={(e) => patch<VCardContent>({ lastName: e.target.value })}
                  placeholder="Smith" />
              </div>
            </div>
            <div>
              <label htmlFor="vc-org" className={labelCls}>Organisation <span className="text-gray-400">(optional)</span></label>
              <input id="vc-org" type="text" className={inputCls}
                value={(content as VCardContent).organization}
                onChange={(e) => patch<VCardContent>({ organization: e.target.value })}
                placeholder="Acme Ltd" />
            </div>
            <div>
              <label htmlFor="vc-title" className={labelCls}>Job title <span className="text-gray-400">(optional)</span></label>
              <input id="vc-title" type="text" className={inputCls}
                value={(content as VCardContent).title}
                onChange={(e) => patch<VCardContent>({ title: e.target.value })}
                placeholder="Product Designer" />
            </div>
            <div>
              <label htmlFor="vc-phone" className={labelCls}>Phone <span className="text-gray-400">(optional)</span></label>
              <input id="vc-phone" type="tel" className={inputCls}
                value={(content as VCardContent).phone}
                onChange={(e) => patch<VCardContent>({ phone: e.target.value })}
                placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label htmlFor="vc-email" className={labelCls}>Email <span className="text-gray-400">(optional)</span></label>
              <input id="vc-email" type="email" className={inputCls}
                value={(content as VCardContent).email}
                onChange={(e) => patch<VCardContent>({ email: e.target.value })}
                placeholder="jane@example.com" />
            </div>
            <div>
              <label htmlFor="vc-url" className={labelCls}>Website <span className="text-gray-400">(optional)</span></label>
              <input id="vc-url" type="url" className={inputCls}
                value={(content as VCardContent).url}
                onChange={(e) => patch<VCardContent>({ url: e.target.value })}
                placeholder="https://example.com" />
            </div>
            <div>
              <label htmlFor="vc-addr" className={labelCls}>Address <span className="text-gray-400">(optional)</span></label>
              <input id="vc-addr" type="text" className={inputCls}
                value={(content as VCardContent).address}
                onChange={(e) => patch<VCardContent>({ address: e.target.value })}
                placeholder="123 Main St, City" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
