import { storageGet, storageSet, storageDel } from '@/src/lib/storage';

export async function getToken(): Promise<string | null> {
  return storageGet('auth_token');
}

export async function setToken(token: string): Promise<void> {
  return storageSet('auth_token', token);
}

export async function clearToken(): Promise<void> {
  return storageDel('auth_token');
}

export async function getUser<T = unknown>(): Promise<T | null> {
  const raw = await storageGet('auth_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function setUser(user: object): Promise<void> {
  return storageSet('auth_user', JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  return storageDel('auth_user');
}
