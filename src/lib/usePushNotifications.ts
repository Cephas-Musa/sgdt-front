import { useEffect, useRef } from "react";
import { useAuth } from "./auth";
import {
  apiGetVapidPublicKey,
  apiSubscribePush,
  apiGetPushSubscriptions,
} from "./api";

const SW_URL = "/sw.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array(rawData.length).map((_, i) => rawData.charCodeAt(i));
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration(SW_URL);
    if (existing) return existing;
    return navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;

    let cancelled = false;

    async function init() {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await registerServiceWorker();
      if (cancelled || !registration) return;

      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        const subs = await apiGetPushSubscriptions();
        const stillValid = subs.some((s) => s.endpoint === existing.endpoint);
        if (stillValid) return;
        await existing.unsubscribe();
      }

      const { public_key } = await apiGetVapidPublicKey();
      if (cancelled || !public_key) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      });

      await apiSubscribePush(subscription.toJSON());
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
