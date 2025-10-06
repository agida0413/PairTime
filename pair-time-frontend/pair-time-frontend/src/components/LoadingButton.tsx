import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingButtonProps {
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  type = 'button'
}) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled || !onClick) return;

    e.preventDefault();
    await onClick();
  };

  return (
    <StyledButton
      onClick={handleClick}
      disabled={loading || disabled}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      type={type}
    >
      {loading && <ButtonSpinner />}
      <ButtonContent $isLoading={loading}>
        {children}
      </ButtonContent>
    </StyledButton>
  );
};

export default LoadingButton;

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled Components
interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'danger' | 'success';
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
}

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
    hoverBackground: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    color: 'white',
    shadow: 'rgba(45, 55, 72, 0.3)'
  },
  secondary: {
    background: 'white',
    hoverBackground: '#f8f9fa',
    color: '#4a5568',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  danger: {
    background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
    hoverBackground: 'linear-gradient(135deg, #c44569 0%, #8b2e4a 100%)',
    color: 'white',
    shadow: 'rgba(255, 107, 157, 0.3)'
  },
  success: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    hoverBackground: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
    color: 'white',
    shadow: 'rgba(72, 187, 120, 0.3)'
  }
};

const sizeStyles = {
  small: {
    padding: '8px 16px',
    fontSize: '14px'
  },
  medium: {
    padding: '12px 24px',
    fontSize: '16px'
  },
  large: {
    padding: '16px 32px',
    fontSize: '18px'
  }
};

const StyledButton = styled.button<StyledButtonProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  padding: ${props => sizeStyles[props.$size].padding};
  background: ${props => variantStyles[props.$variant].background};
  color: ${props => variantStyles[props.$variant].color};
  border: ${props => props.$variant === 'secondary' ? '2px solid #e2e8f0' : 'none'};
  border-radius: 12px;
  font-size: ${props => sizeStyles[props.$size].fontSize};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${props => variantStyles[props.$variant].shadow};
  overflow: hidden;

  &:hover:not(:disabled) {
    background: ${props => variantStyles[props.$variant].hoverBackground};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => variantStyles[props.$variant].shadow};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => variantStyles[props.$variant].shadow};
  }
`;

const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

interface ButtonContentProps {
  $isLoading: boolean;
}

const ButtonContent = styled.span<ButtonContentProps>`
  opacity: ${props => props.$isLoading ? 0.7 : 1};
  transition: opacity 0.2s ease;
`;
