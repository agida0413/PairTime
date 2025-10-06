import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { OAUTH2_BASE_URL } from '../services/api';

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrlFromParams = searchParams.get('redirect');

  console.log('🔐 [LoginPage] ========================================');
  console.log('🔐 [LoginPage] Redirect URL from params:', redirectUrlFromParams);
  console.log('🔐 [LoginPage] Redirect URL from sessionStorage:', sessionStorage.getItem('redirectAfterLogin'));
  console.log('🔐 [LoginPage] Redirect URL from localStorage:', localStorage.getItem('redirectAfterLogin'));
  console.log('🔐 [LoginPage] ========================================');

  const handleOAuthLogin = (provider: 'google' | 'naver' | 'kakao') => {
    // 우선순위: URL params > sessionStorage > localStorage
    let redirectUrl = redirectUrlFromParams;
    if (!redirectUrl) {
      redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    }
    if (!redirectUrl) {
      redirectUrl = localStorage.getItem('redirectAfterLogin');
    }

    console.log('🔐 [LoginPage] Final redirect URL to save:', redirectUrl);

    // 리다이렉트 URL을 sessionStorage와 localStorage 모두에 저장 (OAuth 리다이렉트 시 유실 방지)
    if (redirectUrl) {
      console.log('🔐 [LoginPage] Saving redirect URL to storage:', redirectUrl);
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
      localStorage.setItem('redirectAfterLogin', redirectUrl);
      console.log('🔐 [LoginPage] Saved to sessionStorage:', sessionStorage.getItem('redirectAfterLogin'));
      console.log('🔐 [LoginPage] Saved to localStorage:', localStorage.getItem('redirectAfterLogin'));
    } else {
      console.log('🔐 [LoginPage] No redirect URL found, clearing storage');
      sessionStorage.removeItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
    }

    // OAuth2는 백엔드 서버(8080)로 직접 리디렉트
    console.log('🔐 [LoginPage] Starting OAuth with provider:', provider);
    window.location.href = `${OAUTH2_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <Container>
      <LoginCard>
        <LogoSection>
          <Logo>💑</Logo>
          <Title>PairTime</Title>
          <Subtitle>커플의 소중한 시간을 함께 관리하세요</Subtitle>
        </LogoSection>

        <LoginButtonGroup>
          <OAuthButton
            onClick={() => handleOAuthLogin('google')}
            $bgColor="#ffffff"
            $textColor="#333"
            $hoverColor="#f8f8f8"
          >
            <IconWrapper>
              <GoogleIcon />
            </IconWrapper>
            Google로 시작하기
          </OAuthButton>

          <OAuthButton
            onClick={() => handleOAuthLogin('naver')}
            $bgColor="#03C75A"
            $textColor="#ffffff"
            $hoverColor="#02b350"
          >
            <IconWrapper>
              <NaverIcon />
            </IconWrapper>
            네이버로 시작하기
          </OAuthButton>

          <OAuthButton
            onClick={() => handleOAuthLogin('kakao')}
            $bgColor="#FEE500"
            $textColor="#000000"
            $hoverColor="#fdd835"
          >
            <IconWrapper>
              <KakaoIcon />
            </IconWrapper>
            카카오로 시작하기
          </OAuthButton>
        </LoginButtonGroup>

        <Footer>
          <FooterText>로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.</FooterText>
        </Footer>
      </LoginCard>
    </Container>
  );
};

export default LoginPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Logo = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  font-weight: 400;
`;

const LoginButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

interface OAuthButtonProps {
  $bgColor: string;
  $textColor: string;
  $hoverColor: string;
}

const OAuthButton = styled.button<OAuthButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  background-color: ${(props) => props.$bgColor};
  color: ${(props) => props.$textColor};
  border: ${(props) => (props.$bgColor === '#ffffff' ? '1px solid #ddd' : 'none')};
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => props.$hoverColor};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const NaverIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="#ffffff" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
  </svg>
);

const KakaoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      fill="#000000"
      d="M12 3C6.477 3 2 6.477 2 10.75c0 2.743 1.766 5.151 4.418 6.564-.18.658-.936 3.422-1.068 3.933-.152.579.212.571.423.415.177-.131 2.847-1.947 3.962-2.708.753.103 1.527.156 2.315.156 5.523 0 10-3.477 10-7.75S17.523 3 12 3z"
    />
  </svg>
);

const Footer = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #eee;
`;

const FooterText = styled.p`
  font-size: 12px;
  color: #999;
  line-height: 1.5;
`;
