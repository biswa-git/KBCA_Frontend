const getApiBaseUrl = () => import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || '';

const resolveApiUrl = (url: string) => {
  if (!url) {
    return getApiBaseUrl();
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${getApiBaseUrl()}${url}`;
  }

  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/${url}` : `/${url}`;
};

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

let refreshPromise: Promise<string> | null = null;

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.dispatchEvent(new Event('auth-expired'));
};

const withAuthHeader = (options: RequestInit, token: string): RequestInit => {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...options, headers };
};

const refreshAccessToken = (refreshToken: string): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = fetch(resolveApiUrl('/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (refreshRes) => {
        if (!refreshRes.ok) {
          throw new Error('Refresh failed');
        }

        const data = await parseJsonResponse(refreshRes);
        if (!data?.access_token) {
          throw new Error('Unable to refresh session');
        }
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return data.access_token as string;
      })
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('access_token');
  const authenticatedOptions = token ? withAuthHeader(options, token) : options;
  const response = await fetch(resolveApiUrl(url), authenticatedOptions);

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    clearSession();
    return response;
  }

  const newToken = await refreshAccessToken(refreshToken);
  return fetch(resolveApiUrl(url), withAuthHeader(options, newToken));
};
