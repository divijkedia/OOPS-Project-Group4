import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('iitsm_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 & 403, and unpack backend ErrorResponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid: clear session and broadcast logout
        localStorage.removeItem('iitsm_token');
        localStorage.removeItem('iitsm_user');
        window.dispatchEvent(new Event('iitsm_auth_expired'));
      }

      const errorMessage = data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new Error(errorMessage));
    }

    if (error.request) {
      return Promise.reject(
        new Error('Cannot connect to backend server at ' + baseURL + '. Ensure Spring Boot is running on port 8080.')
      );
    }

    return Promise.reject(error);
  }
);
