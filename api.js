// Centralized backend URL + request helpers (no build step required).
(function initFasttoolsApi() {
  const BASE_URL = (window.BASE_URL || "https://fasttools.onrender.com").toString().replace(/\/$/, "");

  function backendEnabled() {
    return BASE_URL.length > 0;
  }

  function buildApiUrl(path) {
    const normalized = (path || "").toString().replace(/^\/+/, "");
    if (!normalized) return `${BASE_URL}/api`;
    if (normalized.startsWith("api/")) return `${BASE_URL}/${normalized}`;
    return `${BASE_URL}/api/${normalized}`;
  }

  async function readErrorBody(response) {
    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        if (data && typeof data === "object") {
          return data.error || data.detail || data.message || JSON.stringify(data);
        }
      } catch (_) {}
    }

    try {
      const text = await response.text();
      return text || `Request failed (HTTP ${response.status})`;
    } catch (_) {
      return `Request failed (HTTP ${response.status})`;
    }
  }

  async function request(path, options = {}) {
    if (!backendEnabled()) {
      throw new Error("Backend not configured.");
    }

    const url = buildApiUrl(path);
    let res;
    try {
      res = await fetch(url, options);
    } catch (e) {
      console.error("[FasttoolsApi] Network error", { url, error: e });
      throw new Error("Network error. Please check your connection and try again.");
    }

    if (!res.ok) {
      const detail = await readErrorBody(res);
      console.error("[FasttoolsApi] Request failed", { url, status: res.status, detail });
      throw new Error(detail || "Request failed.");
    }

    return res;
  }

  window.FasttoolsApi = Object.freeze({
    BASE_URL,
    base: BASE_URL,
    backendEnabled,
    buildApiUrl,
    request
  });
})();

