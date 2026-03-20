const DEV_ACCESS_TOKEN_STORAGE_KEY = 'myclup.dev.access_token';

export function getDevAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(DEV_ACCESS_TOKEN_STORAGE_KEY);
}

export function setDevAccessToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEV_ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearDevAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(DEV_ACCESS_TOKEN_STORAGE_KEY);
}

export function withDevAccessToken(headers?: HeadersInit): HeadersInit {
  const nextHeaders = new Headers(headers);
  const token = getDevAccessToken();

  if (token && !nextHeaders.has('Authorization')) {
    nextHeaders.set('Authorization', `Bearer ${token}`);
  }

  return nextHeaders;
}
