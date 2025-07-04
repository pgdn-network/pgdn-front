import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import config from '@/config';
import { storage } from '@/utils/storage';
import type { AuthTokens } from '@/types/auth';

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private refreshTokenPromise: Promise<void> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${config.apiUrl}${config.apiPrefix}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Handle concurrent requests
            if (!this.refreshTokenPromise) {
              this.refreshTokenPromise = this.refreshAccessToken();
            }

            await this.refreshTokenPromise;
            this.refreshTokenPromise = null;

            // Retry original request with new token
            const token = storage.getAccessToken();
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            storage.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = storage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${config.apiUrl}${config.apiPrefix}/refresh`,
        JSON.stringify(refreshToken),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.getAccessToken()}`,
          },
        }
      );

      const tokens: AuthTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };

      storage.setTokens(tokens);
    } catch (error) {
      storage.clearTokens();
      throw error;
    }
  }

  // Public methods
  get<T = any>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
export default apiService;