import { useState, useEffect } from 'react';

export type WorkspaceMode = 'READING' | 'EDITING' | 'FOCUS';

interface WorkspaceSettings {
  zoomLevel: number;
  readingMode: WorkspaceMode;
  explorerWidth: number;
  previewWidth: number;
  isSidebarCollapsed: boolean;
}

const DEFAULT_SETTINGS: WorkspaceSettings = {
  zoomLevel: 1.0,
  readingMode: 'READING',
  explorerWidth: 20,
  previewWidth: 50,
  isSidebarCollapsed: false,
};

export function useWorkspaceSettings() {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem('studyforge_workspace_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('studyforge_workspace_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<WorkspaceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
