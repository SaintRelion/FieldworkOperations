// ============================================================
// MARK: Release updates
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  void navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      const checkForUpdate = () => {
        if (navigator.onLine) void registration.update().catch(() => undefined);
      };
      checkForUpdate();
      window.setInterval(checkForUpdate, 60_000);
      window.addEventListener("online", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
    })
    .catch((error: unknown) => console.error("App update registration failed", error));
}
