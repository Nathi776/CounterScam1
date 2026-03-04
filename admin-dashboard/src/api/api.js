// admin-dashboard/src/api/api.js

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

// ---- helper ----
async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ---- AUTH ----
export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- DASHBOARD ----
export async function getStats() {
  return request("/admin/stats");
}

export async function getRecentChecks() {
  return request("/admin/recent-checks");
}

export async function getAnalytics() {
  return request("/admin/analytics");
}

// ---- API KEYS ----
export async function createApiKey(owner_email, plan = "free") {
  return request("/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({ owner_email, plan }),
  });
}

export async function listApiKeys() {
  return request("/admin/api-keys");
}

const api = {
  login,
  getStats,
  getRecentChecks,
  getAnalytics,
  createApiKey,
  listApiKeys,
};

export default api;