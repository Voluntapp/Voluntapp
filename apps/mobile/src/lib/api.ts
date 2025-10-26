import * as SecureStore from 'expo-secure-store';

const envBase = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE) as string | undefined;
export const API_BASE = envBase || 'http://localhost:5000';

type Options = { method?: string; body?: any; headers?: Record<string, string> };

const TOKEN_KEY = 'auth_token';
let memoryToken: string | null = null;

export async function setAuthToken(token: string | null) {
  memoryToken = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function getAuthToken(): Promise<string | null> {
  if (memoryToken !== null) return memoryToken;
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  memoryToken = stored || null;
  return memoryToken;
}

export async function api(path: string, opts: Options = {}) {
  const { method = 'GET', body, headers = {} } = opts;
  const token = await getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
