/**
 * Central place for API base URL when moving from local mock services to HTTP.
 * Set Vite env: VITE_API_BASE_URL=http://localhost:3001
 * Services can branch: if (API_BASE_URL) fetch(...) else existing mock.
 */
export const API_BASE_URL: string | null =
  typeof import.meta.env?.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL.trim()
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '')
    : null;

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error('API_BASE_URL not set');
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}
