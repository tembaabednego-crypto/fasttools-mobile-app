// Centralized backend URL + request helpers (no build step required).
(function initFasttoolsApi() {
  const DEFAULT_API_BASE = "https://free-multi-tools-backend.onrender.com";
  const raw = (window.FASTTOOLS_API_BASE || DEFAULT_API_BASE).toString().trim();
  const base = raw.replace(/\/$/, "");

  function backendEnabled() {
    return base.length > 0;
  }

  function joinUrl(path) {
    if (!path) return base;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (!path.startsWith("/")) return `${base}/${path}`;
    return `${base}${path}`;
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

    const url = joinUrl(path);
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
    base,
    backendEnabled,
    joinUrl,
    request
  });
})();

