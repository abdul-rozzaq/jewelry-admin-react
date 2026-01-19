/**
 * Notification Type Definitions
 */

type NotificationStatus = "unread" | "read";

export interface BackendNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  status: NotificationStatus;
  created_at: string;
}
