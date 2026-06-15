import { RootState } from "../index";

export const selectNotificationsState = (state: RootState) => state.notification;

export const selectNotifications = (state: RootState) => state.notification.notifications;

export const selectSelectedNotification = (state: RootState) => state.notification.selectedNotification; // ← added

export const selectNotificationsPagination = (state: RootState) => state.notification.pagination;

export const selectUnreadCount = (state: RootState) => state.notification.unreadCount;

export const selectNotificationOpStatus = (
  state: RootState,
  operation: keyof RootState["notification"]["status"]
) => state.notification.status[operation];

export const selectNotificationError = (
  state: RootState,
  operation: keyof RootState["notification"]["error"]
) => state.notification.error[operation];