import { createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationService } from "@/services/notification/NotificationService";
import type {
    NotificationsResponse,
    NotificationDetailResponse,
    UnreadCountResponse,
    MarkAllReadResponse,
    BaseNotificationResponse,
} from "@/types/notification";

type TokenArg = {
    token: string;
};

type NotificationIdArg = {
    notificationId: string;
};

export const fetchNotificationsThunk = createAsyncThunk<
    NotificationsResponse,
    TokenArg & { page?: number }
>("notification/fetchNotifications", ({ token, page = 1 }) =>
    NotificationService.getNotifications(token, page)
);

export const fetchNotificationThunk = createAsyncThunk<NotificationDetailResponse, TokenArg & NotificationIdArg>("notification/fetchNotification", ({ token, notificationId }) => NotificationService.getNotification(token, notificationId));

export const fetchUnreadCountThunk = createAsyncThunk<
    UnreadCountResponse,
    TokenArg
>("notification/fetchUnreadCount", ({ token }) =>
    NotificationService.getUnreadCount(token)
);

export const markNotificationAsReadThunk = createAsyncThunk<
    BaseNotificationResponse,
    TokenArg & NotificationIdArg
>("notification/markAsRead", ({ token, notificationId }) =>
    NotificationService.markAsRead(token, notificationId)
);

export const markAllNotificationsAsReadThunk = createAsyncThunk<
    MarkAllReadResponse,
    TokenArg
>("notification/markAllAsRead", ({ token }) =>
    NotificationService.markAllAsRead(token)
);

export const deleteNotificationThunk = createAsyncThunk<
    BaseNotificationResponse,
    TokenArg & NotificationIdArg
>("notification/delete", ({ token, notificationId }) =>
    NotificationService.deleteNotification(token, notificationId)
);
