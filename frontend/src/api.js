export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

const ACCESS = "edincart_access";
const REFRESH = "edincart_refresh";

export const tokens = {
  get access() {
    return localStorage.getItem(ACCESS);
  },
  get refresh() {
    return localStorage.getItem(REFRESH);
  },
  set(access, refresh) {
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

export class ApiError extends Error {
  constructor(status, data) {
    super(errorMessage(data, status));
    this.status = status;
    this.data = data;
  }
}

function errorMessage(data, status) {
  if (!data) return `Request failed (${status})`;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const text = Array.isArray(value) ? value.join(" ") : String(value);
        return key === "non_field_errors" ? text : `${key}: ${text}`;
      })
      .join(" ");
  }
  return `Request failed (${status})`;
}

async function refreshAccess() {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const res = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    tokens.clear();
    return false;
  }
  const data = await res.json();
  tokens.set(data.access, data.refresh);
  return true;
}

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const send = () => {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await send();
  if (res.status === 401 && auth && (await refreshAccess())) {
    res = await send();
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
