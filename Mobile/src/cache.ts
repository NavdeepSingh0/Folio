import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();
// Cache is considered fresh for 5 minutes, but we keep the data forever for offline fallback
const FRESH_TTL_MS = 5 * 60 * 1000;

export const cache = {
  // get returns the cache if it's fresh.
  get<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    
    try {
      const entry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > FRESH_TTL_MS) {
        return null; // Stale, let the UI fetch fresh data
      }
      return entry.data as T;
    } catch (e) {
      return null;
    }
  },

  // getOfflineFallback always returns data if it exists, regardless of age
  getOfflineFallback<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      const entry = JSON.parse(raw);
      return entry.data as T;
    } catch (e) {
      return null;
    }
  },

  set(key: string, data: any): void {
    const entry = { data, timestamp: Date.now() };
    storage.set(key, JSON.stringify(entry));
  },

  invalidate(...keys: string[]): void {
    if (keys.length === 0) {
      storage.clearAll();
    } else {
      keys.forEach(k => storage.remove(k));
    }
  },
};
