'use client';

/**
 * Auth API client.
 *
 * A thin, typed wrapper over the auth endpoints. Every call sends cookies
 * (credentials: 'include') and surfaces the server's structured error body so
 * forms can show per-field validation messages.
 */

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  districtSlug: string;
  houseNumber: number;
  street: string;
};

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

/** Error thrown by every auth client function. */
export class AuthApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(message: string, code: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

async function parseErrorResponse(response: Response): Promise<AuthApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new AuthApiError(
      body.error?.message ?? 'Something went wrong.',
      body.error?.code ?? 'UNKNOWN',
      response.status,
      body.error?.fields ?? {},
    );
  } catch {
    return new AuthApiError('Something went wrong.', 'UNKNOWN', response.status);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });

  if (!response.ok) throw await parseErrorResponse(response);
  return (await response.json()) as T;
}

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  displayName: string;
  districtSlug: string;
  houseNumber: number;
};

export type LoginPayload = { identifier: string; password: string };

export async function registerUser(payload: RegisterPayload): Promise<SessionUser> {
  const { user } = await request<{ user: SessionUser }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return user;
}

export async function loginUser(payload: LoginPayload): Promise<SessionUser> {
  const { user } = await request<{ user: SessionUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return user;
}

export async function logoutUser(): Promise<void> {
  await request<{ ok: true }>('/api/v1/auth/logout', { method: 'POST' });
}

/** Fetches the current session user, or null when signed out. Never throws. */
export async function fetchCurrentUser(): Promise<SessionUser | null> {
  try {
    const { user } = await request<{ user: SessionUser | null }>('/api/v1/auth/me');
    return user;
  } catch {
    return null;
  }
}
