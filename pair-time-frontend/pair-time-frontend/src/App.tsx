import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStyles, theme } from './styles/GlobalStyles';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { fetchMainUIType } from './features/auth/authSlice';
import { MainUIType } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import InviteCreatePage from './pages/InviteCreatePage';
import InviteReceivedPage from './pages/InviteReceivedPage';
import WaitingPage from './pages/WaitingPage';
import CalendarPage from './pages/CalendarPage';

// 전역 인증 초기화 컴포넌트
const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mainUIType, loading, error } = useAppSelector((state) => state.auth);
  const hasAttemptedFetch = useRef(false);
  const hasRedirectedToLogin = useRef(false);

  // mainUIType 가져오기 (한 번만, 로그인 페이지에서는 호출 안 함)
  useEffect(() => {
    // 로그인 페이지나 인증 실패 페이지에서는 API 호출 안 함
    const isLoginPage = location.pathname === '/login' || location.pathname === '/loginpg' || location.pathname === '/auth/failure';

    if (isLoginPage) {
      console.log('⏭️ [AuthInitializer] Skipping fetch on login/auth page');
      hasAttemptedFetch.current = false; // 로그인 페이지에서는 리셋
      hasRedirectedToLogin.current = false; // 로그인 페이지 도착 시 리셋
      return;
    }

    if (mainUIType || hasAttemptedFetch.current) {
      return;
    }

    hasAttemptedFetch.current = true;
    console.log('🔄 [AuthInitializer] Fetching mainUIType...');
    dispatch(fetchMainUIType());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUIType, location.pathname]);

  // 에러 발생 시 로그인 페이지로 리다이렉트 (한 번만)
  useEffect(() => {
    if (error && !loading && !hasRedirectedToLogin.current) {
      console.log('❌ [AuthInitializer] Error occurred, redirecting to /login');

      if (location.pathname !== '/login' && location.pathname !== '/loginpg') {
        hasRedirectedToLogin.current = true; // 리다이렉트 실행 표시
        navigate('/login', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading]);

  // mainUIType이 업데이트되면 적절한 페이지로 리다이렉트
  useEffect(() => {
    // 로딩 중이거나 mainUIType이 없으면 아무것도 하지 않음
    if (loading || !mainUIType) {
      return;
    }

    // 이미 올바른 페이지에 있으면 리다이렉트하지 않음
    const currentPath = location.pathname;

    console.log('✅ [AuthInitializer] MainUIType:', mainUIType, 'Current path:', currentPath);

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
        />
      </Router>
    </ThemeProvider>
  );
};

// 루트 핸들러 - OAuth2 로그인 성공 후 리디렉트되는 곳
const RootHandler: React.FC = () => {
  const { loading } = useAppSelector((state) => state.auth);

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
