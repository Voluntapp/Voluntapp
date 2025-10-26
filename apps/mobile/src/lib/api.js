export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000';
export function api(path, opts = {}) {
    const { method = 'GET', body, headers = {} } = opts;
    return fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });
}
