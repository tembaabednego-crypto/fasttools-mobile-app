const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const toolSelect = document.getElementById("toolSelect");
const qualityInput = document.getElementById("qualityInput");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const subscribeForm = document.getElementById("subscribeForm");
const emailInput = document.getElementById("emailInput");
const toast = document.getElementById("toast");
const brandNameNode = document.getElementById("brandName");
const brandTaglineNode = document.getElementById("brandTagline");
const brandLogoNode = document.getElementById("brandLogo");
const brandCopyrightNode = document.getElementById("brandCopyright");
const themeColorMeta = document.getElementById("themeColorMeta");
const appDescriptionMeta = document.getElementById("appDescriptionMeta");
const API_BASE = (window.FasttoolsApi && window.FasttoolsApi.base) || "";
const BACKEND_ENABLED =
  window.FasttoolsApi && typeof window.FasttoolsApi.backendEnabled === "function"
    ? window.FasttoolsApi.backendEnabled()
    : API_BASE.length > 0;
const SENTRY_DSN = window.FASTTOOLS_SENTRY_DSN || "";
const GA_MEASUREMENT_ID = window.FASTTOOLS_GA_MEASUREMENT_ID || "";

function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  if (document.getElementById("ga4-script")) return;
  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GA_MEASUREMENT_ID
  )}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    if (themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
    return;
  }
  document.body.classList.remove("dark-mode");
  document.body.classList.add("light-mode");
  if (themeToggleBtn) themeToggleBtn.textContent = "Dark Mode";
}

function initTheme() {
  const savedTheme = localStorage.getItem("fasttools-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function applyBranding() {
  const brand = window.FASTTOOLS_BRAND || {};
  const name = brand.name || "FastTools";
  const tagline = brand.tagline || "Free Online Tools - Fast & Safe";
  const description = brand.description || `${name} - Fast and safe online conversion tools.`;
  const primaryColor = brand.primaryColor || "#0b63d1";
  const primaryColorDark = brand.primaryColorDark || "#094eac";
  const copyright =
    brand.copyright || `© ${new Date().getFullYear()} ${name}. All Rights Reserved.`;
  const logoUrl = brand.logoUrl || "";

  document.title = name;
  if (brandNameNode) brandNameNode.textContent = name;
  if (brandTaglineNode) brandTaglineNode.textContent = tagline;
  if (brandCopyrightNode) brandCopyrightNode.textContent = copyright;
  if (appDescriptionMeta) appDescriptionMeta.setAttribute("content", description);
  if (themeColorMeta) themeColorMeta.setAttribute("content", primaryColor);

  document.documentElement.style.setProperty("--blue", primaryColor);
  document.documentElement.style.setProperty("--blue-dark", primaryColorDark);

  if (brandLogoNode) {
    if (logoUrl) {
      brandLogoNode.src = logoUrl;
      brandLogoNode.classList.remove("hidden");
    } else {
      brandLogoNode.classList.add("hidden");
    }
  }
}

async function trackEvent(eventName, payload = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }
  if (!BACKEND_ENABLED) return;
  try {
    await window.FasttoolsApi.request("track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, payload })
    });
  } catch (_) {}
}

async function reportClientError(error, context = {}) {
  if (window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
  if (!BACKEND_ENABLED) return;
  try {
    await window.FasttoolsApi.request("client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error?.message || "Unknown frontend error",
        stack: error?.stack || "",
        context
      })
    });
  } catch (_) {}
}

function initSentry() {
  if (!SENTRY_DSN || !window.Sentry) return;
  window.Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2
  });
}

function initAds() {
  const adConfig = window.FASTTOOLS_ADS || {};
  const client = adConfig.client || "ca-pub-XXXXXXXXXXXXXXXX";
  const slots = adConfig.slots || {};
  const adUnits = Array.from(document.querySelectorAll("ins.adsbygoogle"));

  adUnits.forEach((unit, idx) => {
    unit.setAttribute("data-ad-client", client);
    if (idx === 0) unit.setAttribute("data-ad-slot", slots.hero || "1111111111");
    if (idx === 1) unit.setAttribute("data-ad-slot", slots.tools || "2222222222");
    if (idx === 2) unit.setAttribute("data-ad-slot", slots.articleRect || "3333333333");
    if (idx === 3) unit.setAttribute("data-ad-slot", slots.articleSmall || "4444444444");
  });

  if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
    adUnits.forEach(() => {
      try {
        window.adsbygoogle.push({});
      } catch (_) {}
    });
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getErrorMessage(error, fallback) {
  const msg = (error && error.message ? String(error.message) : "").trim();
  if (msg) return msg;
  return fallback;
}

convertBtn.addEventListener("click", async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    showToast("Please choose a file first.");
    return;
  }
  if (!BACKEND_ENABLED) {
    showToast("Backend not configured. Upload conversion requires a server API.");
    return;
  }

  const file = fileInput.files[0];
  const tool = toolSelect.value;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tool", tool);
  formData.append("quality", qualityInput.value || "75");
  formData.append("start", startInput.value || "0");
  formData.append("end", endInput.value || "10");

  try {
    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";
    const response = await window.FasttoolsApi.request("api/convert", {
      method: "POST",
      body: formData
    });
    const blob = await response.blob();
    const extensionMap = {
      pdf_to_word: "docx",
      image_compress: "jpg",
      audio_cutter: "mp3"
    };
    const extension = extensionMap[tool] || "bin";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "output";
    downloadBlob(blob, `${baseName}_converted.${extension}`);
    showToast("Conversion complete. Download started.");
    await trackEvent("convert_clicked", { tool, fileName: file.name });
  } catch (error) {
    console.error("[convert] Failed", { tool, error });
    showToast(getErrorMessage(error, "Conversion error. Please try again."));
    await reportClientError(error, { tool });
  } finally {
    convertBtn.disabled = false;
    convertBtn.textContent = "Convert Now";
  }
});

subscribeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!emailInput.value.trim()) {
    showToast("Please enter your email.");
    return;
  }

  if (!BACKEND_ENABLED) {
    showToast("Newsletter subscription requires the backend API.");
    return;
  }

  try {
    await window.FasttoolsApi.request("subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput.value.trim() })
    });
    await trackEvent("newsletter_subscribe", { email: emailInput.value.trim() });
    showToast("Subscribed successfully!");
    subscribeForm.reset();
  } catch (error) {
    console.error("[subscribe] Failed", { error });
    showToast(getErrorMessage(error, "Subscribe failed. Try again."));
    await reportClientError(error, { source: "subscribe_form" });
  }
});

window.addEventListener("load", () => {
  initGoogleAnalytics();
  initSentry();
  initAds();
  trackEvent("page_view", { page: "home" });
});

window.addEventListener("error", (event) => {
  reportClientError(event.error || new Error(event.message), {
    source: "window.error"
  });
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem("fasttools-theme", nextTheme);
    applyTheme(nextTheme);
    trackEvent("theme_toggled", { theme: nextTheme });
  });
}

applyBranding();
initTheme();

const backendNotice = document.getElementById("backendNotice");
if (backendNotice && !BACKEND_ENABLED) {
  backendNotice.hidden = false;
  backendNotice.textContent =
    "Conversion tools require a backend API. For now, conversions/newsletter are disabled because FASTTOOLS_API_BASE is empty in config.js.";
}
