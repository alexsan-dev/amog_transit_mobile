import axios from 'axios';
import { storageGet, storageDel } from '@/src/lib/storage';
import { clearUser } from '@/src/api/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.amogtransit.com';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storageGet('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await storageDel('auth_token');
      await clearUser();
    }
    console.error(`[API ${error.config?.method?.toUpperCase()} ${error.config?.url}]`, error.response?.data ?? error.message);
    return Promise.reject(error);
  }
);
