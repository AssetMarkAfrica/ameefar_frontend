import { configureStore } from "@reduxjs/toolkit";

import authReducer, {
  createInitialAuthState,
  type AuthState,
} from "./auth/authSlice";
import biddingReducer from "./bidding/biddingSlice";
import productReducer from "./product/productSlice";
import profileReducer from "./profile/profileSlice";
import type { User } from "@/types/auth";

const AUTH_STORAGE_KEY = "ameefar.auth.session";

type StoredAuthSession = {
  accessToken: string;
  refreshToken: string | null;
  user: User | null;
};

function readStoredAuthState(): AuthState | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      return undefined;
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!isStoredAuthSession(parsed)) {
      removeStoredAuthSession();
      return undefined;
    }

    return createInitialAuthState(parsed);
  } catch {
    removeStoredAuthSession();
    return undefined;
  }
}

function removeStoredAuthSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing or locked-down contexts.
  }
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<StoredAuthSession>;

  return (
    typeof session.accessToken === "string" &&
    session.accessToken.length > 0 &&
    (session.refreshToken === null || typeof session.refreshToken === "string") &&
    (session.user === null ||
      (Boolean(session.user) && typeof session.user === "object"))
  );
}

function getPersistableAuthSession(auth: AuthState): StoredAuthSession | null {
  if (!auth.accessToken) {
    return null;
  }

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    user: auth.user,
  };
}

const preloadedAuthState = readStoredAuthState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bidding: biddingReducer,
    product: productReducer,
    profile: profileReducer,
  },
  preloadedState: preloadedAuthState
    ? {
        auth: preloadedAuthState,
      }
    : undefined,
});

let lastPersistedAuthJson: string | null = null;

if (typeof window !== "undefined") {
  try {
    lastPersistedAuthJson = window.localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    lastPersistedAuthJson = null;
  }

  store.subscribe(() => {
    const session = getPersistableAuthSession(store.getState().auth);
    const nextPersistedAuthJson = session ? JSON.stringify(session) : null;

    if (nextPersistedAuthJson === lastPersistedAuthJson) {
      return;
    }

    lastPersistedAuthJson = nextPersistedAuthJson;

    try {
      if (nextPersistedAuthJson) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, nextPersistedAuthJson);
      } else {
        removeStoredAuthSession();
      }
    } catch {
      // Storage can be unavailable in private browsing or locked-down contexts.
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
