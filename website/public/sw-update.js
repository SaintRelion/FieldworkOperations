// Refresh legacy tabs whose registration script did not listen for updates.
const replacesExistingWorker = Boolean(self.registration.active);
self.addEventListener("activate", (event) => {
  if (!replacesExistingWorker) return;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) =>
      Promise.all(clients.filter((client) => client.url.startsWith(self.registration.scope)).map((client) => client.navigate(client.url).catch(() => undefined))),
    ),
  );
});
