import React from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Bell, Check } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { useGetNotificationsQuery, useMarkAsReadMutation } from "@/src/lib/service/notificationsApi";
import { BackendNotification } from "@/src/types/notification";
import { pushNotificationService } from "@/src/lib/pushNotification";
import { useState, useEffect } from "react";

const NotificationsPage: React.FC = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery({});
  const [markAsRead] = useMarkAsReadMutation();

  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const checkSupport = () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);
      if (supported) {
        checkSubscription();
      }
    };

    const checkSubscription = async () => {
      const currentSubscription = await pushNotificationService.getSubscription();
      setSubscription(currentSubscription);
    };

    checkSupport();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId).unwrap();

      toast({
        title: "Muvaffaqiyat",
        description: "Bildirishnoma o'qildi deb belgilandi",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Belgilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleTogglePush = async () => {
    setLoading(true);

    try {
      if (subscription) {
        const success = await pushNotificationService.unsubscribeUser();
        if (success) {
          setSubscription(null);
          toast({
            title: "Push bildirishnomalar o'chirildi",
            description: "Endi sizga bildirishnomalar kelmaydi.",
          });
        }
      } else {
        const newSubscription = await pushNotificationService.subscribeUser();
        if (newSubscription) {
          setSubscription(newSubscription);
          toast({
            title: "Push bildirishnomalar yoqildi!",
            description: "Endi sizga muhim yangiliklarni yuboramiz.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Xatolik yuz berdi",
        description: "Bildirishnomalarni boshqarishda muammo bo'ldi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="text-blue-500" />
          Bildirishnomalar
        </h1>
        <p className="text-muted-foreground mt-1">Sizga yuborilgan barcha bildirishnomalarni ko'rish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-5">
          <div className="rounded-md border bg-background divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-3 py-2">
                  <Skeleton className="h-10 w-full rounded-sm" />
                </div>
              ))
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification: BackendNotification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">Bildirishnomalar yo'q</div>
            )}
          </div>
        </div>

        {isSupported && (
          <div className="lg:col-span-2">
            <Card className="sticky top-6">
              <CardContent>
                <div className="flex flex-col gap-2 mb-2">
                  <CardTitle className="text-base">Push Bildirishnomalar</CardTitle>
                  <Badge variant={subscription ? "default" : "secondary"}>{subscription ? "Yoqilgan" : "O'chirilgan"}</Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Bildirishnomalarni yoqish yoki o'chirishni boshqaring</p>
                  <Button
                    onClick={handleTogglePush}
                    disabled={loading}
                    variant={subscription ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {loading ? "Yuklanmoqda..." : subscription ? "O'chirish" : "Yoqish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "transaction_created":
    case "transaction_accepted":
    case "transaction_rejected":
      return "💳";

    default:
      return "🔔";
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Shu zaman";
  if (diffMins < 60) return `${diffMins} minut oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays < 7) return `${diffDays} kun oldin`;

  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationItem = ({ notification, onMarkAsRead }: { notification: BackendNotification; onMarkAsRead: (id: number) => void }) => {
  return (
    <div
      key={notification.id}
      className={`flex items-start gap-2 px-3 py-2 text-sm transition ${notification.status === "unread" ? "bg-blue-50 dark:bg-blue-950" : "opacity-70"}`}
    >
      <div className="mt-0.5 text-base">{getTypeIcon(notification.notification_type)}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-medium truncate text-base">{notification.title}</p>
          {notification.status === "unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>

        {notification.message && <p className="text-sm text-muted-foreground truncate">{notification.message}</p>}

        <span className="block mt-0.5 text-xs text-muted-foreground">{formatTime(notification.created_at)}</span>
      </div>

      {notification.status === "unread" && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMarkAsRead(notification.id)} title="O'qildi deb belgilash">
          <Check className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default NotificationsPage;
