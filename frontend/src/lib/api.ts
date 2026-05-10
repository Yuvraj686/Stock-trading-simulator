/**
 * api.ts — Centralised API client for the FastAPI backend.
 *
 * All requests go through the Vite dev-server proxy (/api → localhost:8000)
 * in development, and directly to VITE_API_BASE_URL in production.
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const stocks = await api.get("/stocks");
 *   const result = await api.post("/buy", { stock_symbol: "AAPL", quantity: 5 });
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Read the auth token stored after login. */
function getToken(): string | null {
  return localStorage.getItem("token");
}

/** Build common request headers, injecting Bearer token when present. */
function headers(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** Generic fetch wrapper — throws on non-2xx responses. */
async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const url = `${BASE}/api${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(extraHeaders),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    // Try to parse FastAPI's { detail: "..." } error shape
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  // 204 No Content — return undefined
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T = unknown>(path: string)                       => request<T>("GET",    path),
  post:   <T = unknown>(path: string, body?: unknown)       => request<T>("POST",   path, body),
  patch:  <T = unknown>(path: string, body?: unknown)       => request<T>("PATCH",  path, body),
  put:    <T = unknown>(path: string, body?: unknown)       => request<T>("PUT",    path, body),
  delete: <T = unknown>(path: string)                       => request<T>("DELETE", path),
};

export default api;
