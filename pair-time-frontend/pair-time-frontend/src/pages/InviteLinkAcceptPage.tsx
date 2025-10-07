import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updatePlanGrpTempByLink, verifyAuthentication } from '../features/auth/authSlice';
import { LoadingSpinner, LogoutButton } from '../components';

const InviteLinkAcceptPage: React.FC = () => {
  const { link } = useParams<{ link: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const hasProcessed = useRef(false);

  // 컴포넌트가 로드되는지 확인
  console.log('🚨 [InviteLinkAcceptPage] ========================================');
  console.log('🚨 [InviteLinkAcceptPage] COMPONENT RENDERING START');
  console.log('🚨 [InviteLinkAcceptPage] Link from params:', link);
  console.log('🚨 [InviteLinkAcceptPage] Current URL:', window.location.href);
  console.log('🚨 [InviteLinkAcceptPage] Has token:', !!localStorage.getItem('accessToken'));
  console.log('🚨 [InviteLinkAcceptPage] ========================================');

  useEffect(() => {
    console.log('🔗 [InviteLinkAcceptPage] ========== useEffect TRIGGERED ==========');
    console.log('🔗 [InviteLinkAcceptPage] hasProcessed.current:', hasProcessed.current);
    console.log('🔗 [InviteLinkAcceptPage] Link param:', link);

    // 한 번만 실행되도록
    if (hasProcessed.current) {
      console.log('🔗 [InviteLinkAcceptPage] Already processed, skipping');
      return;
    }

    // 즉시 플래그 설정하여 재실행 방지
    hasProcessed.current = true;

    // 링크가 없으면 홈으로
    if (!link) {
      console.log('🔗 [InviteLinkAcceptPage] No link param, redirecting to home');
      toast.error('유효하지 않은 초대 링크입니다.');
      navigate('/');
      return;
    }

    console.log('🔗 [InviteLinkAcceptPage] Step 1: Verifying authentication...');

    // Step 1: 인증 확인 (401이면 api interceptor가 자동으로 redirect URL 저장 후 /login으로)
    dispatch(verifyAuthentication())
      .unwrap()
      .then(() => {
        console.log('✅ [InviteLinkAcceptPage] Step 1 Success: User is authenticated');
        console.log('🔗 [InviteLinkAcceptPage] Step 2: Calling update API...');

        // Step 2: 인증 성공 → update API 호출
        const fullLink = `${window.location.host}/invite/link/${link}`;
        return dispatch(updatePlanGrpTempByLink({ link: fullLink })).unwrap();
      })
      .then(() => {
        console.log('✅ [InviteLinkAcceptPage] Step 2 Success: Update completed');
        toast.success('새로운 초대가 있습니다! 💌');

        // Step 3: 루트 페이지로 이동 → AuthInitializer가 mainUIType 호출 및 자동 라우팅
        setTimeout(() => {
          console.log('🔗 [InviteLinkAcceptPage] Step 3: Navigating to root for mainUIType check');
          navigate('/', { replace: true });
        }, 1000);
      })
      .catch((error) => {
        console.error('❌ [InviteLinkAcceptPage] Error:', error);
        // 401/410 에러는 api 인터셉터가 자동으로 처리 (redirect URL 저장 + /login 이동)
        // 여기서는 다른 에러만 처리
        if (error !== 401 && error !== 410) {
          toast.error(typeof error === 'string' ? error : '초대 링크 처리에 실패했습니다.');
          navigate('/');
        }
        // 401/410은 인터셉터가 알아서 처리하므로 아무것도 안 함
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <LogoutButton />
      <Card>
        <LoadingSpinner fullscreen />
        <Message>초대를 처리하고 있습니다...</Message>
      </Card>
    </Container>
  );
};

export default InviteLinkAcceptPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
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

const Message = styled.p`
  margin-top: 24px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;
