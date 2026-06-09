import { tokenStorage } from "./tokenStorage";

const API_BASE = import.meta.env.VITE_API_BASE_PATH;

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  token?: string | null;
  skipAuth?: boolean;
}

let onUnauthorized: (() => Promise<string | null>) | null = null;

export function setUnauthorizedHandler(
  handler: () => Promise<string | null>,
): void {
  onUnauthorized = handler;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, skipAuth = false } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const authToken = token ?? (skipAuth ? null : tokenStorage.get());
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const url = `${API_BASE}${path}`;

  let response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (response.status === 401 && !skipAuth && onUnauthorized) {
    const newToken = await onUnauthorized();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include",
      });
    }
  }

  const data = await parseJson<
    T & { success?: boolean; error?: { message: string } }
  >(response);

  if (!response.ok) {
    const message =
      data.error?.message ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}
