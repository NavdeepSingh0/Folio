import { X } from "lucide-react";
import { useState, useEffect } from "react";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { default_model: string; default_style: string }) => void;
  initialSettings: { default_model: string; default_style: string };
}

export function SettingsModal({ isOpen, onClose, onSave, initialSettings }: SettingsModalProps) {
  const [model, setModel] = useState(initialSettings.default_model);
  const [style, setStyle] = useState(initialSettings.default_style);

  useEffect(() => {
    setModel(initialSettings.default_model);
    setStyle(initialSettings.default_style);
  }, [initialSettings, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] w-full max-w-md rounded-[var(--radius-base)] border border-[var(--color-border)] shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Default Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-base)] outline-none focus:border-[var(--color-primary)] text-[var(--color-text-primary)]"
          >
            <option value="qwen3">qwen3 (8B)</option>
            <option value="llama3.2">llama3.2 (3B)</option>
            <option value="llama3.2:1b">llama3.2:1b (1B - Faster)</option>
            <option value="qwen2.5:0.5b">qwen2.5:0.5b (Fastest)</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Default Note Style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-base)] outline-none focus:border-[var(--color-primary)] text-[var(--color-text-primary)]"
          >
            <option value="university_notes">University Notes</option>
            <option value="beginner_friendly">Beginner Friendly</option>
            <option value="revision_notes">Revision Notes</option>
            <option value="cheat_sheet">Cheat Sheet</option>
            <option value="interview_prep">Interview Preparation</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-base)] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ default_model: model, default_style: style })}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-base)] hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
