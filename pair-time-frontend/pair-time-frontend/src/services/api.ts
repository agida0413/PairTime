import axios, { AxiosInstance } from 'axios';

// OAuth2 Base URL (백엔드 직접 연결)
export const OAUTH2_BASE_URL = process.env.REACT_APP_OAUTH2_URL || 'http://localhost:8080';

// API Base URL (Nginx 프록시 경유)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:80';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // OAuth2 쿠키 전달을 위해 필요
    });

    // Request Interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired - redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getInstance();
