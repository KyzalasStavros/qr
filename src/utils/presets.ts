import type { Preset, QRSettings } from '../types';
import { sanitizeLabel } from './sanitize';

const STORAGE_KEY = 'qr-presets';

function loadAll(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

function saveAll(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function getPresets(): Preset[] {
  return loadAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function savePreset(name: string, settings: QRSettings): Preset {
  const existing = loadAll();
  const preset: Preset = {
    id: crypto.randomUUID(),
    name: sanitizeLabel(name) || 'Untitled',
    settings,
    createdAt: Date.now(),
  };
  saveAll([...existing, preset]);
  return preset;
}

export function renamePreset(id: string, newName: string): void {
  const presets = loadAll().map((p) =>
    p.id === id ? { ...p, name: sanitizeLabel(newName) || 'Untitled' } : p,
  );
  saveAll(presets);
}

export function deletePreset(id: string): void {
  saveAll(loadAll().filter((p) => p.id !== id));
}

export function exportPresetsJson(): string {
  return JSON.stringify(loadAll(), null, 2);
}

export function importPresetsJson(json: string): { imported: number; errors: string[] } {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { imported: 0, errors: ['Invalid JSON file.'] };
  }
  if (!Array.isArray(parsed)) {
    return { imported: 0, errors: ['Expected a JSON array of presets.'] };
  }

  const existing = loadAll();
  const existingIds = new Set(existing.map((p) => p.id));
  const toAdd: Preset[] = [];

  for (const item of parsed) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'settings' in item
    ) {
      const p = item as Preset;
      if (!existingIds.has(p.id)) {
        toAdd.push({ ...p, name: sanitizeLabel(p.name) });
      }
    } else {
      errors.push('Skipped an invalid preset entry.');
    }
  }

  saveAll([...existing, ...toAdd]);
  return { imported: toAdd.length, errors };
}
