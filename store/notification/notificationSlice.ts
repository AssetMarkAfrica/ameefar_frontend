import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppNotification, PaginationMeta } from "@/types/notification";
import {
    fetchNotificationsThunk,
    fetchNotificationThunk,
    fetchUnreadCountThunk,
    markNotificationAsReadThunk,
    markAllNotificationsAsReadThunk,
    deleteNotificationThunk,
} from "./notificationThunks";

export type OperationStatus = "idle" | "loading" | "succeeded" | "failed";

export interface NotificationState {
    notifications: AppNotification[];
    selectedNotification: AppNotification | null; // ← added
    pagination: PaginationMeta | null;
    unreadCount: number;

    status: {
        fetch: OperationStatus;
        fetchOne: OperationStatus;                  // ← added
        fetchUnread: OperationStatus;
        markAsRead: OperationStatus;
        markAllAsRead: OperationStatus;
        delete: OperationStatus;
    };
    error: {
        fetch: string | null;
        fetchOne: string | null;                    // ← added
        fetchUnread: string | null;
        markAsRead: string | null;
        markAllAsRead: string | null;
        delete: string | null;
    };
}

const initialState: NotificationState = {
    notifications: [],
    selectedNotification: null,
    pagination: null,
    unreadCount: 0,

    status: {
        fetch: "idle",
        fetchOne: "idle",
        fetchUnread: "idle",
        markAsRead: "idle",
        markAllAsRead: "idle",
        delete: "idle",
    },
    error: {
        fetch: null,
        fetchOne: null,
        fetchUnread: null,
        markAsRead: null,
        markAllAsRead: null,
        delete: null,
    },
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        clearNotificationState(state) {
            state.notifications = [];
            state.selectedNotification = null;
            state.pagination = null;
            state.unreadCount = 0;
            state.status = initialState.status;
            state.error = initialState.error;
        },
        clearSelectedNotification(state) {          // ← added: useful on unmount
            state.selectedNotification = null;
            state.status.fetchOne = "idle";
            state.error.fetchOne = null;
        },
    },
    extraReducers: (builder) => {
        // ── Fetch List ───────────────────────────────────────────────
        builder.addCase(fetchNotificationsThunk.pending, (state) => {
            state.status.fetch = "loading";
            state.error.fetch = null;
        });
        builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
            state.status.fetch = "succeeded";
            const { results, pagination } = action.payload;
            if (pagination.current_page === 1) {
                state.notifications = results;
            } else {
                const existingIds = new Set(state.notifications.map((n) => n.id));
                const newUnique = results.filter((n) => !existingIds.has(n.id));
                state.notifications = [...state.notifications, ...newUnique];
            }
            state.pagination = pagination;
        });
        builder.addCase(fetchNotificationsThunk.rejected, (state, action) => {
            state.status.fetch = "failed";
            state.error.fetch = action.error.message ?? "Failed to fetch notifications";
        });

        // ── Fetch Single ─────────────────────────────────────────────
        builder.addCase(fetchNotificationThunk.pending, (state) => {
            state.status.fetchOne = "loading";
            state.error.fetchOne = null;
            state.selectedNotification = null;
        });
        builder.addCase(fetchNotificationThunk.fulfilled, (state, action) => {
            state.status.fetchOne = "succeeded";
            state.selectedNotification = action.payload;
            // Also sync is_read into the list if the notification is already there
            const inList = state.notifications.find((n) => n.id === action.payload.id);
            if (inList) inList.is_read = action.payload.is_read;
        });
        builder.addCase(fetchNotificationThunk.rejected, (state, action) => {
            state.status.fetchOne = "failed";
            state.error.fetchOne = action.error.message ?? "Failed to fetch notification";
        });

        // ── Fetch Unread Count ───────────────────────────────────────
        builder.addCase(fetchUnreadCountThunk.pending, (state) => {
            state.status.fetchUnread = "loading";
            state.error.fetchUnread = null;
        });
        builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
            state.status.fetchUnread = "succeeded";
            state.unreadCount = action.payload.data.unread_count;
        });
        builder.addCase(fetchUnreadCountThunk.rejected, (state, action) => {
            state.status.fetchUnread = "failed";
            state.error.fetchUnread = action.error.message ?? "Failed to fetch unread count";
        });

        // ── Mark Single As Read ──────────────────────────────────────
        builder.addCase(markNotificationAsReadThunk.pending, (state) => {
            state.status.markAsRead = "loading";
            state.error.markAsRead = null;
        });
        builder.addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
            state.status.markAsRead = "succeeded";
            const id = action.meta.arg.notificationId;
            const inList = state.notifications.find((n) => n.id === id);
            if (inList && !inList.is_read) {
                inList.is_read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            // Keep selectedNotification in sync too
            if (state.selectedNotification?.id === id) {
                state.selectedNotification.is_read = true;
            }
        });
        builder.addCase(markNotificationAsReadThunk.rejected, (state, action) => {
            state.status.markAsRead = "failed";
            state.error.markAsRead = action.error.message ?? "Failed to mark as read";
        });

        // ── Mark All As Read ─────────────────────────────────────────
        builder.addCase(markAllNotificationsAsReadThunk.pending, (state) => {
            state.status.markAllAsRead = "loading";
            state.error.markAllAsRead = null;
        });
        builder.addCase(markAllNotificationsAsReadThunk.fulfilled, (state) => {
            state.status.markAllAsRead = "succeeded";
            state.notifications.forEach((n) => { n.is_read = true; });
            if (state.selectedNotification) state.selectedNotification.is_read = true;
            state.unreadCount = 0;
        });
        builder.addCase(markAllNotificationsAsReadThunk.rejected, (state, action) => {
            state.status.markAllAsRead = "failed";
            state.error.markAllAsRead = action.error.message ?? "Failed to mark all as read";
        });

        // ── Delete ───────────────────────────────────────────────────
        builder.addCase(deleteNotificationThunk.pending, (state) => {
            state.status.delete = "loading";
            state.error.delete = null;
        });
        builder.addCase(deleteNotificationThunk.fulfilled, (state, action) => {
            state.status.delete = "succeeded";
            const id = action.meta.arg.notificationId;
            const idx = state.notifications.findIndex((n) => n.id === id);
            if (idx !== -1) {
                const [removed] = state.notifications.splice(idx, 1);
                if (!removed.is_read) state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            if (state.selectedNotification?.id === id) state.selectedNotification = null;
        });
        builder.addCase(deleteNotificationThunk.rejected, (state, action) => {
            state.status.delete = "failed";
            state.error.delete = action.error.message ?? "Failed to delete notification";
        });
    },
});

export const { clearNotificationState, clearSelectedNotification } = notificationSlice.actions;

export default notificationSlice.reducer;