const apiUrl = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshRes = await fetch(`${apiUrl}/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            isRefreshing = false;
            onRefreshed(data.access_token);
          } else {
            throw new Error('Refresh failed');
          }
        } catch (error) {
          isRefreshing = false;
          // Refresh failed, clear session
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Optionally trigger a logout event here so App.tsx can react
          window.dispatchEvent(new Event('auth-expired'));
          throw error;
        }
      }

      // Wait for refresh to complete, then retry the request
      const retryOriginalRequest = new Promise<Response>((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          // Retry the request with the new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          };
          resolve(fetch(url, options));
        });
      });
      return retryOriginalRequest;
    } else {
      // 401 but no refresh token, just trigger logout
      localStorage.removeItem('access_token');
      window.dispatchEvent(new Event('auth-expired'));
    }
  }

  return response;
};
