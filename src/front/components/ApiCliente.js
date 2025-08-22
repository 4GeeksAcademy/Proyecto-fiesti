const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const resp = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return resp;
}