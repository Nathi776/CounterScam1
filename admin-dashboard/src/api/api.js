
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://counterscam1-1.onrender.com";

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

// ---- Login ----
export async function login(email, password) {
  return request("/admin/login", {
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

export async function getReports() {
  return request("/admin/reports");
}

export async function confirmReport(reportId) {
  return request(`/admin/reports/${reportId}/confirm`, {
    method: "PATCH",
  });
}

export async function markReportSafe(reportId) {
  return request(`/admin/reports/${reportId}/safe`, {
    method: "PATCH",
  });
}

export async function deleteReport(reportId) {
  return request(`/admin/reports/${reportId}`, {
    method: "DELETE",
  });
}

export async function getIntelligence() {
  return request("/admin/intelligence");
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
  getReports,
  getIntelligence,
  confirmReport,
  markReportSafe,
  deleteReport,
  createApiKey,
  listApiKeys,
};

export default api;