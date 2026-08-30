"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { selectNotifications, selectUnreadCount } from "@/store/notification/notificationSelectors";
import { fetchNotificationsThunk } from "@/store/notification/notificationThunks";
import { ameefarToast } from "./GlobalToaster";

export function NotificationPoller() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const unreadCount = useAppSelector(selectUnreadCount);
  const notifications = useAppSelector(selectNotifications);
  
  const prevUnreadCountRef = useRef<number>(unreadCount);
  const prevNotificationsRef = useRef<string[]>([]);
  const hasInitializedRef = useRef(false);

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (!token) return;

    // Initial fetch to populate the list and get baseline count
    void dispatch(fetchNotificationsThunk({ token, page: 1 }));

    const intervalId = setInterval(() => {
      void dispatch(fetchNotificationsThunk({ token, page: 1 }));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch, token]);

  // Check for new notifications to trigger toast
  useEffect(() => {
    if (!token) {
      hasInitializedRef.current = false;
      return;
    }

    if (!hasInitializedRef.current && notifications.length > 0) {
      // Setup baseline
      prevUnreadCountRef.current = unreadCount;
      prevNotificationsRef.current = notifications.map(n => n.id);
      hasInitializedRef.current = true;
      return;
    }

    if (hasInitializedRef.current) {
      // Find new unread notifications
      const prevIds = new Set(prevNotificationsRef.current);
      const newUnread = notifications.filter(n => !prevIds.has(n.id) && !n.is_read);

      if (newUnread.length > 0) {
        // Show toasts for up to 3 new notifications
        newUnread.slice(0, 3).forEach(n => {
          ameefarToast(n.title, n.message);
        });
        
        if (newUnread.length > 3) {
          ameefarToast(`And ${newUnread.length - 3} more new notifications...`);
        }
      }

      // Update refs
      prevUnreadCountRef.current = unreadCount;
      prevNotificationsRef.current = notifications.map(n => n.id);
    }
  }, [notifications, unreadCount, token]);

  return null;
}
