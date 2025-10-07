import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) {
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
