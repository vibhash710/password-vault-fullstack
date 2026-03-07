import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle token expiration and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const message = error.response.data?.message || 'Too many requests. Please try again later.';
      toast.error(message);
      return Promise.reject(error);
    }

    // DON'T try to refresh on login/register/refresh routes
    const noRefreshRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];

    const isNoRefreshRoute = noRefreshRoutes.some(route =>
      originalRequest.url.includes(route)
    );

    // Handle 401 (token expired)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRefreshRoute
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await api.post('/auth/refresh');

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        // window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    // For all other errors (including login errors), just reject
    return Promise.reject(error);
  }
);

export default api;