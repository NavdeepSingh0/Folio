export const cache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`studyforge_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(`studyforge_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to write to cache", e);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(`studyforge_${key}`);
    } catch {}
  },
  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('studyforge_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }
};
