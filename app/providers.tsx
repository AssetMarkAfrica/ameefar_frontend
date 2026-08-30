"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { GlobalToaster } from "@/components/notifications/GlobalToaster";
import { NotificationPoller } from "@/components/notifications/NotificationPoller";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <GlobalToaster />
      <NotificationPoller />
    </Provider>
  );
}
