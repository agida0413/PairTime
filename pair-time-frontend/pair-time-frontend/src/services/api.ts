import axios, { AxiosInstance } from 'axios';

// OAuth2 Base URL
// development: 빈 문자열 (프록시 사용, Same-Origin)
// production: 실제 서버 URL
export const OAUTH2_BASE_URL = process.env.REACT_APP_OAUTH2_URL || '';

// API Base URL
// development: 빈 문자열 (setupProxy.js를 통해 80포트로 프록시)
// production: 실제 서버 URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // 환경 변수로 withCredentials 제어 (로컬: false, 운영: true)
    const withCredentials = process.env.REACT_APP_WITH_CREDENTIALS === 'true';

    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials, // 환경 변수로 제어
    });

    console.log('🔧 API Service initialized with withCredentials:', withCredentials);

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
      (response) => {
        // 사파리 호환: 응답 헤더에서 토큰 추출
        const newToken = response.headers['x-auth-token'] || response.headers['authorization'];
        if (newToken) {
          const token = newToken.replace('Bearer ', '');
          localStorage.setItem('accessToken', token);
          console.log('🔄 Token updated from response header');
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // 410: Refresh Token 만료 → 재발급 시도
        if (error.response?.status === 410 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('🔄 [API] 410 error, attempting token reissue...');

          try {
            // /api/v1/auth/reissue 호출하여 토큰 재발급
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/reissue`, {}, {
              withCredentials: true,
            });

            console.log('✅ [API] Token reissued successfully');

            // 원래 요청 재시도
            return axios(originalRequest);
          } catch (reissueError) {
            console.error('❌ [API] Token reissue failed:', reissueError);
            // Reissue 실패 → 로그인 페이지로
            localStorage.removeItem('accessToken');

            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/invite/link/')) {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }

            window.location.href = '/login';
            return Promise.reject(reissueError);
          }
        }

        // 401: 인증 실패 → 로그인 페이지로
        if (error.response?.status === 401) {
          console.log('❌ [API] 401 Unauthorized - redirecting to login');
          localStorage.removeItem('accessToken');

          // 초대 링크 페이지에서 401 발생 시 현재 경로 저장
          const currentPath = window.location.pathname;
          console.log('🔍 [API] Current path:', currentPath);
          if (currentPath.startsWith('/invite/link/')) {
            console.log('💾 [API] Saving redirect URL to storage:', currentPath);
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            localStorage.setItem('redirectAfterLogin', currentPath);
            console.log('💾 [API] Saved to sessionStorage:', sessionStorage.getItem('redirectAfterLogin'));
            console.log('💾 [API] Saved to localStorage:', localStorage.getItem('redirectAfterLogin'));
          }

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
