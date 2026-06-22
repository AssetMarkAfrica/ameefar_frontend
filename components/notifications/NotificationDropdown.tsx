"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  selectAccessToken,
  selectIsAdmin,
  selectIsSeller,
  selectIsBoth 
} from "@/store/auth/authSelectors";
import {
  selectNotifications,
  selectNotificationsPagination,
  selectUnreadCount,
  selectNotificationOpStatus,
} from "@/store/notification/notificationSelectors";
import {
  fetchNotificationsThunk,
  fetchNotificationThunk,
  fetchUnreadCountThunk,
  markNotificationAsReadThunk,
  markAllNotificationsAsReadThunk,
  deleteNotificationThunk,
} from "@/store/notification/notificationThunks";
import type { AppNotification } from "@/types/notification";

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: AppNotification) => void;
}) {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 cursor-pointer ${
        !notification.is_read ? "bg-[#f0f7ff]" : ""
      }`}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
      )}
      {notification.is_read && <span className="mt-2 h-2 w-2 shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? "font-semibold text-[#0b1c30]" : "font-medium text-[#404848]"}`}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#636d75] line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {formatTime(notification.timestamp)}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.is_read && (
          <button
            aria-label="Mark as read"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-[#002627]"
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
            title="Mark as read"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">done</span>
          </button>
        )}
        <button
          aria-label="Delete notification"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600"
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          title="Delete"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSeller = useAppSelector(selectIsSeller);
  const isBoth = useAppSelector(selectIsBoth);
  
  const notifications = useAppSelector(selectNotifications);
  const pagination = useAppSelector(selectNotificationsPagination);
  const unreadCount = useAppSelector(selectUnreadCount);
  const fetchStatus = useAppSelector((s) => selectNotificationOpStatus(s, "fetch"));

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount (only when authenticated)
  useEffect(() => {
    if (!token) return;
    void dispatch(fetchUnreadCountThunk({ token }));
  }, [dispatch, token]);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (!open || !token) return;
    void dispatch(fetchNotificationsThunk({ token, page: 1 }));
  }, [open, dispatch, token]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleMarkRead(id: string) {
    if (!token) return;
    void dispatch(markNotificationAsReadThunk({ token, notificationId: id }));
  }

  function handleDelete(id: string) {
    if (!token) return;
    void dispatch(deleteNotificationThunk({ token, notificationId: id }));
  }

  function handleMarkAllRead() {
    if (!token) return;
    void dispatch(markAllNotificationsAsReadThunk({ token }));
  }

  function handleLoadMore() {
    if (!token || !pagination?.next) return;
    void dispatch(
      fetchNotificationsThunk({ token, page: (pagination.current_page ?? 1) + 1 })
    );
  }

  async function handleNotificationClick(notification: AppNotification) {
    if (!token) return;
    try {
      // User specifically requested to fetch details via thunk when clicked
      const details = await dispatch(fetchNotificationThunk({ token, notificationId: notification.id })).unwrap();
      
      // If backend doesn't automatically mark as read, do it here
      if (!notification.is_read) {
        void dispatch(markNotificationAsReadThunk({ token, notificationId: notification.id }));
      }
      
      const tradeId = details.metadata?.trade_id || notification.metadata?.trade_id;
      const enquiryId = details.metadata?.enquiry_id || notification.metadata?.enquiry_id;
      const profileId = details.metadata?.profile_id || notification.metadata?.profile_id;
      
      if (enquiryId || tradeId || profileId) {
        let rolePath = "buyer";
        if (isAdmin) rolePath = "admin";
        else if (isBoth) rolePath = window.location.pathname.includes("/seller") ? "seller" : "buyer";
        else if (isSeller) rolePath = "seller";
        
        if (enquiryId) {
          router.push(`/bidding/${rolePath}/negotiation/${enquiryId}`);
        } else if (tradeId) {
          router.push(`/bidding/${rolePath}/trade/${tradeId}`);
        } else if (profileId && isAdmin) {
          router.push(`/profile/${profileId}`);
        }
      }
      setOpen(false);
    } catch (e) {
      console.error("Failed to fetch notification details", e);
    }
  }

  const hasMore = !!pagination?.next;
  const isLoading = fetchStatus === "loading";

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#002627]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-2 w-[380px] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-[var(--font-hanken)] text-base font-semibold text-[#002627]">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="text-xs font-semibold text-[#006d40] hover:underline underline-offset-2 transition"
                onClick={handleMarkAllRead}
                type="button"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="grid gap-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-200 animate-pulse" />
                    <div className="flex-1 grid gap-1.5">
                      <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                      <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
                      <div className="h-2 w-1/4 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-slate-300">
                  notifications_off
                </span>
                <p className="text-sm font-medium text-slate-400">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Load more / Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 p-3">
              {hasMore ? (
                <button
                  className="w-full rounded-lg py-2 text-sm font-semibold text-[#006d40] transition hover:bg-[#ecfdf5]"
                  disabled={isLoading}
                  onClick={handleLoadMore}
                  type="button"
                >
                  {isLoading ? "Loading…" : "Load more"}
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  All notifications loaded
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
