export const cache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`folio_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(`folio_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to write to cache", e);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(`folio_${key}`);
    } catch {}
  },
  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('folio_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }
};
