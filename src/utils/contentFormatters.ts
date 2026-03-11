import type { QRContent } from '../types';

/** Build the string that gets encoded in the QR code for each content type. */
export function formatContent(content: QRContent): string {
  switch (content.type) {
    case 'url':
      return content.url.trim();

    case 'text':
      return content.text;

    case 'email': {
      const params: string[] = [];
      if (content.subject) params.push(`subject=${encodeURIComponent(content.subject)}`);
      if (content.body) params.push(`body=${encodeURIComponent(content.body)}`);
      return `mailto:${content.address}${params.length ? '?' + params.join('&') : ''}`;
    }

    case 'phone':
      return `tel:${content.number.replace(/\s/g, '')}`;

    case 'sms': {
      const num = content.number.replace(/\s/g, '');
      return content.message
        ? `sms:${num}?body=${encodeURIComponent(content.message)}`
        : `sms:${num}`;
    }

    case 'wifi': {
      const enc = content.encryption === 'nopass' ? 'nopass' : content.encryption;
      const pw = content.encryption === 'nopass' ? '' : escapeWifi(content.password);
      return `WIFI:T:${enc};S:${escapeWifi(content.ssid)};P:${pw};${content.hidden ? 'H:true;' : ''}`;
    }

    case 'vcard': {
      const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcardEscape(content.lastName)};${vcardEscape(content.firstName)};;;`,
        `FN:${vcardEscape(content.firstName)} ${vcardEscape(content.lastName)}`,
      ];
      if (content.organization) lines.push(`ORG:${vcardEscape(content.organization)}`);
      if (content.title) lines.push(`TITLE:${vcardEscape(content.title)}`);
      if (content.phone) lines.push(`TEL:${content.phone}`);
      if (content.email) lines.push(`EMAIL:${content.email}`);
      if (content.url) lines.push(`URL:${content.url}`);
      if (content.address) lines.push(`ADR:;;${vcardEscape(content.address)};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
  }
}

function escapeWifi(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/"/g, '\\"');
}

function vcardEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
