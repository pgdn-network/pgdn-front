import type { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'pgdn_access_token';
const REFRESH_TOKEN_KEY = 'pgdn_refresh_token';

class SecureStorage {
  private isSessionStorage: boolean = false;

  constructor() {
    this.checkStorageAvailability();
  }

  private checkStorageAvailability(): void {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch {
      console.warn('localStorage not available, falling back to sessionStorage');
      this.isSessionStorage = true;
    }
  }

  private getStorage(): Storage {
    return this.isSessionStorage ? sessionStorage : localStorage;
  }

  setTokens(tokens: AuthTokens): void {
    const storage = this.getStorage();
    storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  getAccessToken(): string | null {
    return this.getStorage().getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getStorage().getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    const storage = this.getStorage();
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  }

  setItem(key: string, value: string): void {
    this.getStorage().setItem(key, value);
  }

  getItem(key: string): string | null {
    return this.getStorage().getItem(key);
  }

  removeItem(key: string): void {
    this.getStorage().removeItem(key);
  }

  clear(): void {
    this.clearTokens();
  }
}

export const storage = new SecureStorage();