import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const WaitingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <AnimationSection>
          <WaitingIcon>⏰</WaitingIcon>
          <LoadingDots>
            <Dot delay={0} />
            <Dot delay={0.2} />
            <Dot delay={0.4} />
          </LoadingDots>
        </AnimationSection>

        <ContentSection>
          <Title>초대 응답 대기 중</Title>
          <Description>
            상대방이 초대를 수락하면 알림을 보내드릴게요.
            <br />
            조금만 기다려주세요!
          </Description>

          <StatusBox>
            <StatusLabel>초대 상태</StatusLabel>
            <StatusValue>대기 중</StatusValue>
          </StatusBox>

          <InfoSection>
            <InfoTitle>💡 대기하는 동안...</InfoTitle>
            <InfoList>
              <InfoItem>✓ 초대 링크를 다시 확인해보세요</InfoItem>
              <InfoItem>✓ 상대방에게 알림이 갔는지 확인해보세요</InfoItem>
              <InfoItem>✓ 새로운 초대 링크를 생성할 수도 있어요</InfoItem>
            </InfoList>
          </InfoSection>
        </ContentSection>

        <ButtonGroup>
          <SecondaryButton onClick={() => navigate('/invite/create')}>
            새 초대 만들기
          </SecondaryButton>
          <RefreshButton onClick={() => window.location.reload()}>
            🔄 상태 새로고침
          </RefreshButton>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default WaitingPage;

// Animations
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
`;

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
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
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

const AnimationSection = styled.div`
  padding: 48px 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
`;

const WaitingIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const LoadingDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

interface DotProps {
  delay: number;
}

const Dot = styled.div<DotProps>`
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;
`;

const ContentSection = styled.div`
  padding: 40px 40px 32px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const StatusBox = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
`;

const StatusLabel = styled.p`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
`;

const StatusValue = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: #fdcb6e;
`;

const InfoSection = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4a5568;
`;

const InfoTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoItem = styled.li`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  padding: 0 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SecondaryButton = styled.button`
  padding: 14px 24px;
  background: white;
  color: #4a5568;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4a5568;
    color: white;
  }
`;

const RefreshButton = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(45, 55, 72, 0.4);
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }

  &:active {
    transform: translateY(0);
  }
`;
