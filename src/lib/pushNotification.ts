import { axiosClient } from "./axios-client";

// Web Push Notification Service
class PushNotificationService {
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

  // Check if browser supports push notifications
  isSupported(): boolean {
    return "Notification" in window && "PushManager" in window && "serviceWorker" in navigator;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported");
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Register service worker and subscribe to push
  async subscribeUser(): Promise<PushSubscription | null> {
    try {
      // First request permission
      const permission = await this.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as any,
      });

      // Send subscription to your server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeUser(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return false;

      const success = await subscription.unsubscribe();

      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(subscription);
      }

      return success;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }

  // Send subscription to your backend server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await axiosClient.post("/notifications/subscribe/", {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        p256dh: subscription.toJSON().keys?.p256dh,
        auth: subscription.toJSON().keys?.auth,
      });
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await axiosClient.post("/notifications/unsubscribe/", { endpoint: subscription.endpoint });
    } catch (error) {
      console.error("Error removing subscription from server:", error);
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification (for testing)
  showNotification(title: string, options: NotificationOptions = {}): void {
    console.log({ perms: Notification.permission });

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: options.body || "Default notification message",
        icon: options.icon || "/pwa-192x192.png",
        badge: options.badge || "/pwa-192x192.png",
        tag: options.tag || "default",
        ...options,
      });
    }
  }

  // Check subscription status
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) return null;

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }
}

export const pushNotificationService = new PushNotificationService();

export default PushNotificationService;
