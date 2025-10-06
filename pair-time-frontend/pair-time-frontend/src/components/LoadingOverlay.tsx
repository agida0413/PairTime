import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = '처리 중...',
  children
}) => {
  return (
    <Container>
      {children}
      {isLoading && (
        <Overlay>
          <SpinnerWrapper>
            <Spinner />
            <Message>{message}</Message>
          </SpinnerWrapper>
        </Overlay>
      )}
    </Container>
  );
};

export default LoadingOverlay;

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

// Styled Components
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-in;
  border-radius: inherit;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4a5568;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Message = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;
