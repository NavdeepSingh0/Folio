import { useAuthStore } from '../store/authStore';

// Keys are scoped by the signed-in user's id so one user never reads another's
// cached notes on a shared browser. Everything lives under the `folio_` prefix
// so `clear()` (called on sign-out) wipes all users' entries, including legacy
// unscoped keys written by older builds.
const PREFIX = 'folio_';

const scopedKey = (key: string) => {
  const userId = useAuthStore.getState().user?.id ?? 'anon';
  return `${PREFIX}${userId}_${key}`;
};

export const cache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(scopedKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(scopedKey(key), JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to write to cache", e);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(scopedKey(key));
    } catch {}
  },
  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
  }
};
