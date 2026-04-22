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
