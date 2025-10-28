import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Read API URL from app.json extra config, fallback to env var, then localhost
const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;
const envBase = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE) as string | undefined;
export const API_BASE = apiUrlFromConfig || envBase || 'http://localhost:5000';

// Debug: Log the API base URL
console.log('🔗 API_BASE configured as:', API_BASE);

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
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    } as HeadersInit,
    body: body ? JSON.stringify(body) : undefined,
  });
}
