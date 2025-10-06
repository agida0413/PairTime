import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#4a5568',
  fullscreen = false
}) => {
  if (fullscreen) {
    return (
      <FullscreenContainer>
        <SpinnerWrapper>
          <Spinner size={size} color={color} />
          <LoadingText>로딩 중...</LoadingText>
        </SpinnerWrapper>
      </FullscreenContainer>
    );
  }

  return <Spinner size={size} color={color} />;
};

export default LoadingSpinner;

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled Components
const FullscreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LoadingText = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

interface SpinnerProps {
  size: 'small' | 'medium' | 'large';
  color: string;
}

const sizeMap = {
  small: '20px',
  medium: '40px',
  large: '60px',
};

const borderMap = {
  small: '2px',
  medium: '3px',
  large: '4px',
};

const Spinner = styled.div<SpinnerProps>`
  width: ${props => sizeMap[props.size]};
  height: ${props => sizeMap[props.size]};
  border: ${props => borderMap[props.size]} solid #f3f4f6;
  border-top: ${props => borderMap[props.size]} solid ${props => props.color};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
