import type {
    NotificationsResponse,
    NotificationDetailResponse,
    UnreadCountResponse,
    MarkAllReadResponse,
    BaseNotificationResponse,
} from "@/types/notification";

type ErrorBody = {
    message?: string;
    detail?: string;
    error?: string;
    errors?: Record<string, unknown>;
    [key: string]: unknown;
};

const configuredNotificationUrl =
    process.env.NEXT_PUBLIC_NOTIFICATION_API ??
    process.env.NEXT_PUBLIC_NOTIFICATIONS_API ??
    process.env.NEXT_PUBLIC_NOTIFICATION_URL ??
    process.env.NEXT_PUBLIC_NOTIFICATIONS_URL;

const NOTIFICATION_API =
    configuredNotificationUrl ??
    (process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/notifications`
        : "http://localhost:82/api/notifications");

function getNotificationUrl(endpoint: string): string {
    return `${NOTIFICATION_API.replace(/\/$/, "")}${endpoint}`;
}

function getAuthHeaders(token: string): HeadersInit {
    return {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
}

async function requestJson<TResponse, TPayload = undefined>({
    endpoint,
    method,
    payload,
    token,
}: {
    endpoint: string;
    method: "GET" | "POST" | "DELETE" | "PATCH";
    payload?: TPayload;
    token: string;
}): Promise<TResponse> {
    const response = await fetch(getNotificationUrl(endpoint), {
        method,
        headers: {
            ...getAuthHeaders(token),
            ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: payload === undefined ? undefined : JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as ErrorBody | null;

    if (!response.ok) {
        throw new Error(
            body?.message || body?.detail || body?.error || response.statusText
        );
    }

    return body as TResponse;
}

export const NotificationService = {
    getNotifications(token: string, page = 1): Promise<NotificationsResponse> {
        return requestJson<NotificationsResponse>({
            endpoint: `/?page=${page}`,
            method: "GET",
            token,
        });
    },

    getNotification(token: string, notificationId: string): Promise<NotificationDetailResponse> {
        return requestJson<NotificationDetailResponse>({
            endpoint: `/${notificationId}/`,
            method: "GET",
            token,
        });
    },

    getUnreadCount(token: string): Promise<UnreadCountResponse> {
        return requestJson<UnreadCountResponse>({
            endpoint: "/unread-count/",
            method: "GET",
            token,
        });
    },

    markAsRead(token: string, notificationId: string): Promise<BaseNotificationResponse> {
        return requestJson<BaseNotificationResponse>({
            endpoint: `/${notificationId}/read/`,
            method: "POST",
            token,
        });
    },

    markAllAsRead(token: string): Promise<MarkAllReadResponse> {
        return requestJson<MarkAllReadResponse>({
            endpoint: "/read-all/",
            method: "POST",
            token,
        });
    },

    deleteNotification(token: string, notificationId: string): Promise<BaseNotificationResponse> {
        return requestJson<BaseNotificationResponse>({
            endpoint: `/${notificationId}/delete/`,
            method: "DELETE",
            token,
        });
    },
};
