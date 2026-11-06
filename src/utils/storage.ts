/**
 * Safe storage wrapper with seamless in-memory fallback.
 * Prevents DOMException / SecurityError crashes when the application
 * runs in cross-origin iframes (like AI Studio preview), sandboxed containers,
 * or private browsing modes where window.localStorage is restricted.
 */

const memoryStorage: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__nexus_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fall back to memory on dynamic failure
      }
    }
    return memoryStorage[key] ?? null;
  },

  setItem(key: string, value: string): void {
    if (hasStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Fall back to memory if quota exceeded or restricted
      }
    }
    memoryStorage[key] = String(value);
  },

  removeItem(key: string): void {
    if (hasStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    delete memoryStorage[key];
  },

  clear(): void {
    if (hasStorage) {
      try {
        window.localStorage.clear();
      } catch {}
    }
    for (const key of Object.keys(memoryStorage)) {
      delete memoryStorage[key];
    }
  },
};
