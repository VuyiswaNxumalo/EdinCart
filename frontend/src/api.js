export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}
