// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// export async function apiRequest<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const url = `${API_URL}${path}`;

//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     ...(options.headers || {}),
//   };

//   // TODO: wire real auth token from your auth state
//   const token = localStorage.getItem('fintrack_token');
//   if (token) {
//     (headers as any).Authorization = `Bearer ${token}`;
//   }

//   const res = await fetch(url, {
//     ...options,
//     headers,
//   });

//   if (!res.ok) {
//     const errorText = await res.text().catch(() => '');
//     throw new Error(errorText || `Request failed with status ${res.status}`);
//   }

//   if (res.status === 204) {
//     return undefined as T;
//   }

//   return (await res.json()) as T;
// }

// export const api = {
//   get: <T>(path: string) => apiRequest<T>(path),
//   post: <T>(path: string, body: unknown) =>
//     apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
//   put: <T>(path: string, body: unknown) =>
//     apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
//   del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
// };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Normalize the path - remove leading slash if API_URL already ends with slash
  let normalizedPath = path;
  const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  if (path.startsWith('/')) {
    normalizedPath = path.substring(1);
  }
  
  const url = `${apiUrl}/${normalizedPath}`;
  
  console.log('API Request:', { 
    url, 
    path: normalizedPath, 
    method: options.method,
    originalPath: path 
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('fintrack_token');
  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  console.log('API Response:', {
    status: res.status,
    statusText: res.statusText,
    url: res.url
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Handle authentication errors
      if (res.status === 401) {
        localStorage.removeItem('fintrack_token');
        // You might want to redirect to login here
        // window.location.href = '/login';
      }
      
      throw new Error(errorMessage);
    } catch {
      const errorText = await res.text().catch(() => '');
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};