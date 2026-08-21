import { store } from "@/store";
import { refreshTokenSuccess, logout } from "@/store/auth/authSlice";
import { AuthService } from "@/services/auth/AuthService";

type RequestOptions = {
  params?: Record<string, unknown>;
  body?: unknown;
};

type ErrorBody = {
  message?: string;
  detail?: string;
  [key: string]: unknown;
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return store.getState().auth.accessToken ?? null;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return store.getState().auth.refreshToken ?? null;
}

function formatError(body: ErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  return body.message ?? body.detail ?? fallback;
}

async function request<TResponse>(method: string, url: string, opts?: RequestOptions): Promise<{ data: TResponse }> {
  let token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fullUrl = url;
  if (opts?.params) {
    const sp = new URLSearchParams();
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v != null) sp.set(k, String(v));
    });
    const qs = sp.toString();
    if (qs) fullUrl += `?${qs}`;
  }

  let fetchOpts: RequestInit = { method, headers };
  if (opts?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchOpts.body = JSON.stringify(opts.body);
  }

  let res = await fetch(fullUrl, fetchOpts);

  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const retryOriginalRequest = new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      if (!isRefreshing) {
        isRefreshing = true;
        AuthService.refreshToken({ refresh: refreshToken })
          .then((result) => {
            store.dispatch(refreshTokenSuccess({ access: result.access, refresh: result.refresh }));
            processQueue(null, result.access);
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            store.dispatch(logout());
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      try {
        token = await retryOriginalRequest;
        
        headers["Authorization"] = `Bearer ${token}`;
        fetchOpts = { ...fetchOpts, headers };
        res = await fetch(fullUrl, fetchOpts);
      } catch (err) {
        // Fall through to normal error handling if refresh fails
      }
    } else {
      store.dispatch(logout());
    }
  }

  const body = (await res.json().catch(() => null)) as ErrorBody | null;

  if (!res.ok) {
    throw new Error(formatError(body, res.statusText));
  }

  return { data: body as TResponse };
}

export const apiClient = {
  get: <T>(url: string, opts?: { params?: Record<string, unknown> }) => request<T>("GET", url, opts),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, { body }),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, { body }),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, { body }),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
