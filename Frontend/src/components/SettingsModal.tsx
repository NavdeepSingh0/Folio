import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomSelect } from "./CustomSelect";

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
          <CustomSelect
            value={model}
            onChange={(val) => setModel(val)}
            options={[
              { value: "gpt-oss-120b", label: "GPT OSS 120B (OpenRouter)" },
              { value: "deepseek-forced:latest", label: "DeepSeek Forced (Latest)" },
              { value: "qwen3", label: "qwen3 (8B)" },
              { value: "llama3.2", label: "llama3.2 (3B)" },
              { value: "llama3.2:1b", label: "llama3.2:1b (1B - Faster)" },
              { value: "qwen2.5:0.5b", label: "qwen2.5:0.5b (Fastest)" },
            ]}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Default Note Style
          </label>
          <CustomSelect
            value={style}
            onChange={(val) => setStyle(val)}
            options={[
              { value: "university_notes", label: "University Notes" },
              { value: "beginner_friendly", label: "Beginner Friendly" },
              { value: "revision_notes", label: "Revision Notes" },
              { value: "cheat_sheet", label: "Cheat Sheet" },
              { value: "interview_prep", label: "Interview Preparation" },
            ]}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-base)] hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ default_model: model, default_style: style })}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-base)] hover:bg-blue-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
