"use strict";
(() => {
  // src/sw.ts
  self.__WB_MANIFEST = self.__WB_MANIFEST || [];
  self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};
    const title = data.title ?? "Douanes SGDT";
    const options = {
      body: data.body ?? "",
      icon: data.icon ?? "/assets/Logo-dgda.png",
      badge: data.badge ?? "/assets/Logo-dgda.png",
      tag: data.tag ?? "default",
      data: data.data ?? {}
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? "/app/alertes";
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
    );
  });
  self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
  });
})();
