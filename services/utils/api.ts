type RequestOptions = {
  params?: Record<string, unknown>;
  body?: unknown;
};

type ErrorBody = {
  message?: string;
  detail?: string;
  [key: string]: unknown;
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("ameefar.auth.session");
    if (!stored) return null;
    return JSON.parse(stored).accessToken ?? null;
  } catch {
    return null;
  }
}

function formatError(body: ErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  return body.message ?? body.detail ?? fallback;
}

async function request<TResponse>(method: string, url: string, opts?: RequestOptions): Promise<{ data: TResponse }> {
  const token = getAuthToken();
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

  const fetchOpts: RequestInit = { method, headers };

  if (opts?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchOpts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(fullUrl, fetchOpts);
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
