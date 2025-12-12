import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStyles, theme } from './styles/GlobalStyles';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { fetchMainUIType, fetchMainInfo } from './features/auth/authSlice';
import { MainUIType } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import InviteCreatePage from './pages/InviteCreatePage';
import InviteReceivedPage from './pages/InviteReceivedPage';
import WaitingPage from './pages/WaitingPage';
import CalendarPage from './pages/CalendarPage';
import InviteLinkAcceptPage from './pages/InviteLinkAcceptPage';

// 전역 인증 초기화 컴포넌트
const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mainUIType, loading, error } = useAppSelector((state) => state.auth);
  const hasAttemptedFetch = useRef(false);
  const hasRedirectedToLogin = useRef(false);
  const hasCalledMainInfo = useRef(false);

  // mainUIType 가져오기 (로그인 페이지 제외, mainUIType이 null이면 호출)
  useEffect(() => {
    // 초대 링크 페이지에서는 완전히 무시
    const isInviteLinkPage = location.pathname.startsWith('/invite/link/');
    if (isInviteLinkPage) {
      console.log('⏭️ [AuthInitializer] Completely skipping on invite link page');
      return;
    }

    // 로그인 페이지나 인증 실패 페이지에서는 API 호출 안 함
    const isLoginPage = location.pathname === '/login' || location.pathname === '/loginpg' || location.pathname === '/auth/failure';

    if (isLoginPage) {
      console.log('⏭️ [AuthInitializer] Skipping fetch on login/auth page');
      hasAttemptedFetch.current = false; // 로그인 페이지에서는 리셋
      hasRedirectedToLogin.current = false; // 로그인 페이지 도착 시 리셋
      return;
    }

    // mainUIType이 null이고 아직 시도하지 않았으면 API 호출
    if (!mainUIType && !hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      console.log('🔄 [AuthInitializer] Fetching mainUIType...');
      dispatch(fetchMainUIType());
      return;
    }

    // mainUIType이 있으면 플래그 리셋 (다음 null 시 재조회 가능하도록)
    if (mainUIType && hasAttemptedFetch.current) {
      hasAttemptedFetch.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUIType, location.pathname]);

  // 에러 발생 시 로그인 페이지로 리다이렉트 (한 번만)
  useEffect(() => {
    // 초대 링크 페이지에서는 무시
    const isInviteLinkPage = location.pathname.startsWith('/invite/link/');
    if (isInviteLinkPage) {
      return;
    }

    if (error && !loading && !hasRedirectedToLogin.current) {
      console.log('❌ [AuthInitializer] Error occurred, redirecting to /login');

      if (location.pathname !== '/login' && location.pathname !== '/loginpg') {
        hasRedirectedToLogin.current = true; // 리다이렉트 실행 표시
        navigate('/login', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading, location.pathname]);

  // mainUIType이 업데이트되면 적절한 페이지로 리다이렉트 및 mainInfo 조회
  useEffect(() => {
    // 초대 링크 페이지에서는 완전히 무시
    const currentPath = location.pathname;
    if (currentPath.startsWith('/invite/link/')) {
      console.log('⏭️ [AuthInitializer] Completely skipping redirect on invite link page');
      return;
    }

    // 로딩 중이거나 mainUIType이 없으면 아무것도 하지 않음
    if (loading || !mainUIType) {
      return;
    }

    console.log('✅ [AuthInitializer] MainUIType:', mainUIType, 'Current path:', currentPath);

    // CALENDAR 타입이면 mainInfo 조회 (한 번만)
    if (mainUIType === MainUIType.CALENDAR && !hasCalledMainInfo.current) {
      console.log('📡 [AuthInitializer] Fetching mainInfo for CALENDAR type...');
      hasCalledMainInfo.current = true;
      dispatch(fetchMainInfo());
    }

    switch (mainUIType) {
      case MainUIType.CALENDAR:
        if (currentPath !== '/calendar') {
          console.log('📍 Navigating to /calendar');
          navigate('/calendar', { replace: true });
        }
        break;
      case MainUIType.REQUIRED_INVITE:
        if (currentPath !== '/invite/create') {
          console.log('📍 Navigating to /invite/create');
          navigate('/invite/create', { replace: true });
        }
        break;
      case MainUIType.ALREADY_INVITED_BY:
        if (currentPath !== '/invite/received') {
          console.log('📍 Navigating to /invite/received');
          navigate('/invite/received', { replace: true });
        }
        break;
      case MainUIType.ALREADY_INVITE:
        if (currentPath !== '/waiting') {
          console.log('📍 Navigating to /waiting');
          navigate('/waiting', { replace: true });
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUIType, loading, location.pathname]);

  return null; // 렌더링할 것 없음
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthInitializer />
        <Routes>
          {/* 로그인 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/loginpg" element={<LoginPage />} />

          {/* OAuth2 성공 후 리디렉트 */}
          <Route path="/" element={<RootHandler />} />

          {/* 인증 실패 페이지 */}
          <Route path="/auth/failure" element={<AuthFailurePage />} />

          {/* 개별 페이지 라우트 */}
          <Route path="/invite/create" element={<InviteCreatePage />} />
          <Route path="/invite/received" element={<InviteReceivedPage />} />
          <Route path="/invite/link/:link" element={<InviteLinkAcceptPage />} />
          <Route path="/waiting" element={<WaitingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />

          {/* 404 페이지 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 99999 }}
        />
      </Router>
    </ThemeProvider>
  );
};

// 루트 핸들러 - OAuth2 로그인 성공 후 리디렉트되는 곳
const RootHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { loading } = useAppSelector((state) => state.auth);
  const hasProcessedToken = useRef(false);

  // URL/쿠키에서 토큰 추출 (사파리 호환성)
  useEffect(() => {
    if (hasProcessedToken.current) return;

    console.log('🌐 RootHandler - Current URL:', window.location.href);
    console.log('🌐 RootHandler - Search params:', location.search);
    console.log('🌐 RootHandler - Cookies:', document.cookie);

    // 1. URL 파라미터에서 토큰 확인
    const searchParams = new URLSearchParams(location.search);
    let token = searchParams.get('token');

    // 2. 쿠키에서 토큰 확인 (백엔드가 쿠키로 전달한 경우)
    if (!token) {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
        console.log('🍪 Token found in cookie');
      }
    }

    if (token) {
      console.log('🔑 Token found, saving to localStorage');
      hasProcessedToken.current = true;

      // 토큰 저장
      localStorage.setItem('accessToken', token);

      // URL에서 토큰 제거
      if (searchParams.has('token')) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }

      // 로그인 후 원래 페이지로 리다이렉트 (sessionStorage 또는 localStorage 확인)
      console.log('🔍 [RootHandler] ========================================');
      console.log('🔍 [RootHandler] Checking redirect URL...');
      console.log('🔍 [RootHandler] sessionStorage redirectAfterLogin:', sessionStorage.getItem('redirectAfterLogin'));
      console.log('🔍 [RootHandler] localStorage redirectAfterLogin:', localStorage.getItem('redirectAfterLogin'));
      console.log('🔍 [RootHandler] All sessionStorage keys:', Object.keys(sessionStorage));
      console.log('🔍 [RootHandler] All localStorage keys:', Object.keys(localStorage));

      let redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('🔍 [RootHandler] Step 1 - from sessionStorage:', redirectUrl);

      if (!redirectUrl) {
        redirectUrl = localStorage.getItem('redirectAfterLogin');
        console.log('🔍 [RootHandler] Step 2 - from localStorage:', redirectUrl);
      }

      if (redirectUrl) {
        console.log('✅ [RootHandler] Redirect URL found! Redirecting to:', redirectUrl);
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        console.log('🔍 [RootHandler] Cleared storage, now redirecting...');

        // 초대 링크 페이지로 리다이렉트 시에는 mainUIType 조회 안 함
        window.location.href = redirectUrl;
        return;
      }

      console.log('ℹ️ [RootHandler] No redirect URL found, calling fetchMainUIType');
      console.log('🔍 [RootHandler] ========================================');

      // 일반 로그인인 경우만 mainUIType 조회
      dispatch(fetchMainUIType());
    } else {
      console.log('ℹ️ No token in URL or cookie, checking localStorage');
      const storedToken = localStorage.getItem('accessToken');
      console.log('🔑 Stored token exists:', !!storedToken);

      // 토큰이 없어도 redirect URL이 있는지 체크 (OAuth 로그인 후 토큰 전달 실패 케이스)
      console.log('🔍 [RootHandler] ========================================');
      console.log('🔍 [RootHandler] Checking redirect URL (no token case)...');
      console.log('🔍 [RootHandler] sessionStorage redirectAfterLogin:', sessionStorage.getItem('redirectAfterLogin'));
      console.log('🔍 [RootHandler] localStorage redirectAfterLogin:', localStorage.getItem('redirectAfterLogin'));

      let redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      console.log('🔍 [RootHandler] Step 1 - from sessionStorage:', redirectUrl);

      if (!redirectUrl) {
        redirectUrl = localStorage.getItem('redirectAfterLogin');
        console.log('🔍 [RootHandler] Step 2 - from localStorage:', redirectUrl);
      }

      if (redirectUrl) {
        console.log('✅ [RootHandler] Redirect URL found (no token)! Redirecting to:', redirectUrl);
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        console.log('🔍 [RootHandler] Cleared storage, now redirecting...');
        window.location.href = redirectUrl;
        return;
      }

      console.log('🔍 [RootHandler] ========================================');

      if (!storedToken) {
        console.log('❌ No token available, user needs to login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AuthInitializer가 처리하므로 여기서는 로딩 화면만 표시
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        color: '#2d3748',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        로그인 처리 중...
      </div>
    );
  }

  // AuthInitializer가 자동으로 리다이렉트하므로 여기서는 기본 로딩 화면만
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: '#2d3748',
      fontSize: '20px',
      fontWeight: '600'
    }}>
      페이지 이동 중...
    </div>
  );
};

// 인증 실패 페이지
const AuthFailurePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: '#2d3748',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>😢</div>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>로그인 실패</h1>
      <p style={{ fontSize: '16px', marginBottom: '32px', opacity: 0.8 }}>
        로그인 중 오류가 발생했습니다.
        <br />
        다시 시도해주세요.
      </p>
      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '14px 32px',
          background: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2d3748'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#4a5568'}
      >
        로그인 페이지로 돌아가기
      </button>
    </div>
  );
};

export default App;
