import { useState, useRef } from 'react';
import { Save, Trash2, Download, Upload, Edit3, Check, X } from 'lucide-react';
import {
  getPresets,
  savePreset,
  renamePreset,
  deletePreset,
  exportPresetsJson,
  importPresetsJson,
} from '../utils/presets';
import type { Preset, QRSettings } from '../types';
import { sanitizeLabel } from '../utils/sanitize';

interface Props {
  currentSettings: QRSettings;
  onLoad: (settings: QRSettings) => void;
}

export function PresetManager({ currentSettings, onLoad }: Props) {
  const [presets, setPresets] = useState<Preset[]>(() => getPresets());
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setPresets(getPresets());
  }

  function handleSave() {
    const name = newName.trim() || 'My preset';
    savePreset(name, currentSettings);
    setNewName('');
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this preset?')) return;
    deletePreset(id);
    refresh();
  }

  function startEdit(p: Preset) {
    setEditingId(p.id);
    setEditName(p.name);
  }

  function commitEdit(id: string) {
    renamePreset(id, editName);
    setEditingId(null);
    refresh();
  }

  function handleExport() {
    const json = exportPresetsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== 'string') return;
      const { imported, errors } = importPresetsJson(text);
      refresh();
      setImportMsg(
        `Imported ${imported} preset${imported !== 1 ? 's' : ''}${errors.length ? '. Warnings: ' + errors.join('; ') : '.'}`,
      );
      setTimeout(() => setImportMsg(''), 4000);
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Presets
      </p>

      {/* Save new */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Preset name…"
          value={newName}
          onChange={(e) => setNewName(sanitizeLabel(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Preset list */}
      {presets.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No saved presets yet.</p>
      ) : (
        <ul className="space-y-1">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/50"
            >
              {editingId === p.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit(p.id)}
                    className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button onClick={() => commitEdit(p.id)} aria-label="Confirm rename" className="text-green-600 dark:text-green-400 hover:text-green-700">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} aria-label="Cancel rename" className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onLoad(p.settings)}
                    className="flex-1 text-left text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate focus:outline-none focus-visible:underline"
                    title={`Load "${p.name}"`}
                  >
                    {p.name}
                  </button>
                  <button onClick={() => startEdit(p)} aria-label={`Rename "${p.name}"`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} aria-label={`Delete "${p.name}"`} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Import / export */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleExport}
          disabled={presets.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </button>
        <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-500">
          <Upload className="w-3.5 h-3.5" />
          Import JSON
          <input ref={importRef} type="file" accept=".json,application/json" className="sr-only" onChange={handleImport} />
        </label>
      </div>
      {importMsg && <p className="text-xs text-green-600 dark:text-green-400">{importMsg}</p>}
    </div>
  );
}
