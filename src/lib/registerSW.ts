// Service worker registration with strict guards for Lovable preview/iframe.
// Only registers when:
//  - running in a browser
//  - not inside an iframe
//  - not on a Lovable preview / lovableproject host
// Never blocks app startup — registration is fire-and-forget.

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const host = window.location.hostname;
  const isPreview =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("-dev.lovable.app");

  if (inIframe || isPreview) {
    // Clean up any previously registered SW in preview to avoid stale caches.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
    return;
  }

  // Only register in production deploys.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
