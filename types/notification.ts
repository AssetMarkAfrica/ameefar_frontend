export type NotificationType = "GENERAL" | string;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  metadata: Record<string, any>;
  is_read: boolean;
  timestamp: string;
}

export interface PaginationMeta {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  pagination: PaginationMeta;
  results: AppNotification[];
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  data: {
    updated_count: number;
  };
}

export interface BaseNotificationResponse {
  success: boolean;
  message: string;
}


// Add this type to your notification types file
export type NotificationDetailResponse = {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  timestamp: string;
};