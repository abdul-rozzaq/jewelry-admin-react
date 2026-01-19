import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertTriangle, Bell, BellOff, CheckCircle } from "lucide-react";
import { pushNotificationService } from "@/src/lib/pushNotification";
import { useToast } from "@/src/hooks/use-toast";

const PushNotificationManager: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    checkPushSupport();
    checkSubscriptionStatus();
  }, [isSupported]);

  const checkPushSupport = () => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported) return;

    const currentSubscription = await pushNotificationService.getSubscription();
    setSubscription(currentSubscription);
  };

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const newSubscription = await pushNotificationService.subscribeUser();

      if (newSubscription) {
        setSubscription(newSubscription);
        setPermission(Notification.permission);
        toast({
          title: "Push bildirishnomalar yoqildi!",
          description: "Endi sizga muhim yangiliklarni yuboramiz.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Xatolik yuz berdi",
        description: "Push bildirishnomalarni yoqishda muammo bo'ldi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const success = await pushNotificationService.unsubscribeUser();

      if (success) {
        setSubscription(null);
        toast({
          title: "Push bildirishnomalar o'chirildi",
          description: "Endi sizga bildirishnomalar kelmaydi.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Xatolik yuz berdi",
        description: "Push bildirishnomalarni o'chirishda muammo bo'ldi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    pushNotificationService.showNotification("Test bildirishnoma", {
      body: "Bu test bildirishnomasi. Push notification ishlayapti!",
      icon: "/pwa-192x192.png",
      tag: "test",
    });

    toast({
      title: "Test bildirishnoma yuborildi",
      description: "Brauzer bildirishnomalarini tekshiring.",
      variant: "default",
    });
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ruxsat berilgan
          </Badge>
        );
      case "denied":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rad etilgan
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Kutilmoqda
          </Badge>
        );
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Push bildirishnomalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sizning brauzeringiz push bildirishnomalarni qo'llab-quvvatlamaydi.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-blue-500" />
          Push bildirishnomalar
        </CardTitle>
        <CardDescription>Muhim yangiliklarni darhol oling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Holat:</span>
          {getPermissionBadge()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Obuna:</span>
          <Badge variant={subscription ? "default" : "secondary"}>{subscription ? "Faol" : "Nofaol"}</Badge>
        </div>

        <div className="space-y-2">
          {!subscription ? (
            <Button onClick={handleSubscribe} disabled={loading || permission === "denied"} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              {loading ? "Yuklanmoqda..." : "Bildirishnomalarni yoqish"}
            </Button>
          ) : (
            <Button onClick={handleUnsubscribe} variant="outline" disabled={loading} className="w-full">
              <BellOff className="w-4 h-4 mr-2" />
              {loading ? "Yuklanmoqda..." : "Bildirishnomalarni o'chirish"}
            </Button>
          )}

          {subscription && (
            <Button onClick={handleTestNotification} variant="secondary" className="w-full">
              Test bildirishnoma
            </Button>
          )}
        </div>

        {permission === "denied" && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-xs text-orange-800">Bildirishnomalar rad etilgan. Brauzer sozlamalarida ruxsatni yoqing.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;
