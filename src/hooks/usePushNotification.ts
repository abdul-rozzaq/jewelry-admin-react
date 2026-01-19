import { useEffect, useState } from "react";
import { pushNotificationService } from "@/src/lib/pushNotification";

interface UsePushNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  loading: boolean;
}

export const usePushNotification = (): UsePushNotificationReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        checkSubscription();
      }
    };

    const checkSubscription = async () => {
      const currentSubscription = await pushNotificationService.getSubscription();
      setSubscription(currentSubscription);
    };

    checkSupport();
  }, []);

  const subscribe = async (): Promise<PushSubscription | null> => {
    setLoading(true);
    try {
      const newSubscription = await pushNotificationService.subscribeUser();
      if (newSubscription) {
        setSubscription(newSubscription);
        setPermission(Notification.permission);
      }
      return newSubscription;
    } catch (error) {
      console.error("Subscription error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await pushNotificationService.unsubscribeUser();
      if (success) {
        setSubscription(null);
      }
      return success;
    } catch (error) {
      console.error("Unsubscription error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title: string, options: NotificationOptions = {}) => {
    pushNotificationService.showNotification(title, options);
  };

  return {
    isSupported,
    permission,
    subscription,
    subscribe,
    unsubscribe,
    showNotification,
    loading,
  };
};
