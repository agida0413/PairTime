import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // 커스텀 토스트 확인 모달
    const confirmLogout = () => new Promise<boolean>((resolve) => {
      toast(
        <ConfirmToastContent>
          <ConfirmMessage>로그아웃 하시겠습니까?</ConfirmMessage>
          <ConfirmButtons>
            <ConfirmButton
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              확인
            </ConfirmButton>
            <CancelButton
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              취소
            </CancelButton>
          </ConfirmButtons>
        </ConfirmToastContent>,
        {
          position: 'top-center',
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          draggable: false,
          style: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            padding: '24px',
            width: '360px',
            maxWidth: '90vw',
          },
        }
      );
    });

    const confirmed = await confirmLogout();
    if (!confirmed) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await axios.post('/api/v1/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast.error('로그아웃에 실패했습니다.');
      setIsLoggingOut(false);
      return;
    }

    // 로그아웃 성공 후 처리
    toast.success('로그아웃 되었습니다.');

    // 로컬 스토리지 및 세션 스토리지 클리어
    localStorage.clear();
    sessionStorage.clear();

    // 로그인 페이지로 이동
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  return (
    <LogoutBtn onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? '로그아웃 중...' : '🚪 로그아웃'}
    </LogoutBtn>
  );
};

export default LogoutButton;

const LogoutBtn = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ConfirmMessage = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
  text-align: center;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #f8f9fa;
  color: #4a5568;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
