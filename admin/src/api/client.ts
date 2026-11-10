import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type Query = Record<string, string | number | boolean | undefined>;

type FetchInit = { method?: string; body?: unknown; query?: Query };

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

let forbiddenHandler: (() => void) | null = null;

export function setForbiddenHandler(handler: (() => void) | null) {
  forbiddenHandler = handler;
}

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value));
    }
  }
  const search = params.toString();
  return `/api/admin${path}${search ? `?${search}` : ""}`;
}

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const hasBody = init.body !== undefined;
  const response = await fetch(buildUrl(path, init.query), {
    method: init.method ?? "GET",
    credentials: "same-origin",
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init.body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const body = data as ApiErrorBody | undefined;
    if (response.status === 401 && path !== "/auth/login") unauthorizedHandler?.();
    const code = body?.error?.code ?? "UNKNOWN";
    if (
      response.status === 403 &&
      path !== "/auth/me" &&
      (code === "FORBIDDEN" || code === "PASSWORD_CHANGE_REQUIRED")
    ) {
      forbiddenHandler?.();
    }
    throw new ApiError(
      response.status,
      code,
      body?.error?.message ?? "Đã xảy ra lỗi, vui lòng thử lại",
      body?.error?.fields,
    );
  }
  return data as T;
}
