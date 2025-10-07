import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { findInviteMember, resetMainUIType } from '../features/auth/authSlice';
import { InviteMemberResponse } from '../types';
import { LoadingButton, LogoutButton } from '../components';
import axios from 'axios';

const InviteReceivedPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mainUIType, planGrpTempId } = useAppSelector((state) => state.auth);

  const [isAccepting, setIsAccepting] = useState(false);
  const [inviterInfo, setInviterInfo] = useState<InviteMemberResponse | null>(null);
  const [loveStartedAt, setLoveStartedAt] = useState<Date | null>(null);
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    // 이미 데이터를 로드했거나 필요한 정보가 없으면 스킵
    if (!planGrpTempId || !mainUIType || hasLoadedDataRef.current) {
      return;
    }

    // 데이터 로드 시작
    hasLoadedDataRef.current = true;

    // 초대한 회원 정보 조회
    dispatch(findInviteMember({ planGrpTempId, mainUIType }))
      .unwrap()
      .then((data) => {
        console.log('✅ 초대한 회원 정보 조회 성공:', data);
        setInviterInfo(data);
      })
      .catch((error) => {
        console.log('ℹ️ 초대한 회원 정보 조회 실패:', error);
        // 실패해도 토스트 메시지 표시 안함 (정상 시나리오일 수 있음)
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planGrpTempId, mainUIType]);

  const handleAccept = async () => {
    if (!loveStartedAt) {
      toast.warning('우리가 만난 날을 선택해주세요! 📅');
      return;
    }

    if (!planGrpTempId) {
      toast.error('초대 정보가 없습니다.');
      return;
    }

    setIsAccepting(true);
    try {
      // ISO 8601 형식으로 날짜 변환 (YYYY-MM-DDTHH:mm:ss)
      const formattedDate = loveStartedAt.toISOString().split('.')[0];

      await axios.post('/api/v1/auth/group', {
        planGrpTempId,
        loveStartedAt: formattedDate
      });

      toast.success('초대를 수락했습니다! 이제 함께 일정을 관리할 수 있습니다. 💕');

      // mainUIType 재조회
      dispatch(resetMainUIType());

      navigate('/calendar');
    } catch (error) {
      console.error('Failed to accept invite:', error);
      toast.error('초대 수락에 실패했습니다.');
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('정말로 초대를 거절하시겠습니까?')) {
      return;
    }

    if (!planGrpTempId) {
      toast.error('초대 정보가 없습니다.');
      return;
    }

    try {
      await axios.delete(`/api/v1/auth/group/${planGrpTempId}`);

      toast.info('초대를 거절했습니다.');

      // mainUIType 재조회
      dispatch(resetMainUIType());

      navigate('/invite/create');
    } catch (error) {
      console.error('초대 거절 실패:', error);
      toast.error('초대 거절에 실패했습니다.');
    }
  };

  return (
    <Container>
      <LogoutButton />
      <Card>
        <Header>
          <HeartIcon>💕</HeartIcon>
          <Title>커플 초대를 받았어요!</Title>
          <Subtitle>함께 특별한 시간을 만들어가세요</Subtitle>
        </Header>

        <InviterSection>
          <InviterLabel>초대한 사람</InviterLabel>
          {inviterInfo ? (
            <InviterCard>
              <Avatar src={inviterInfo.profile || '/default-avatar.png'} alt="inviter" />
              <InviterInfo>
                <InviterName>{inviterInfo.nickname}</InviterName>
                <InviterEmail>{inviterInfo.email}</InviterEmail>
              </InviterInfo>
            </InviterCard>
          ) : (
            <InviterCard>
              <InviterInfo>
                <InviterName>정보를 불러오는 중...</InviterName>
              </InviterInfo>
            </InviterCard>
          )}
        </InviterSection>

        <DateSection>
          <DateLabel>💝 우리가 만난 날은 언제인가요?</DateLabel>
          <DatePickerWrapper>
            <DatePicker
              selected={loveStartedAt ?? undefined}
              onChange={(date: Date | null) => setLoveStartedAt(date)}
              dateFormat="yyyy년 MM월 dd일"
              placeholderText="날짜를 선택해주세요"
              maxDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              className="custom-datepicker"
            />
            <CalendarIcon>📅</CalendarIcon>
          </DatePickerWrapper>
          {loveStartedAt && (
            <SelectedDateText>
              선택된 날짜: {loveStartedAt.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </SelectedDateText>
          )}
        </DateSection>

        <FeatureSection>
          <FeatureTitle>함께 할 수 있는 것들</FeatureTitle>
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>📅</FeatureIcon>
              <FeatureText>
                <FeatureName>공유 캘린더</FeatureName>
                <FeatureDesc>서로의 일정을 실시간으로 확인하고 관리하세요</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>💑</FeatureIcon>
              <FeatureText>
                <FeatureName>기념일 관리</FeatureName>
                <FeatureDesc>소중한 날들을 기록하고 함께 기억하세요</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>💰</FeatureIcon>
              <FeatureText>
                <FeatureName>지출 관리</FeatureName>
                <FeatureDesc>함께하는 지출을 기록하고 관리하세요</FeatureDesc>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✨</FeatureIcon>
              <FeatureText>
                <FeatureName>추억 저장</FeatureName>
                <FeatureDesc>특별한 순간들을 기록하고 공유하세요</FeatureDesc>
              </FeatureText>
            </FeatureItem>
          </FeatureList>
        </FeatureSection>

        <ButtonGroup>
          <LoadingButton
            onClick={handleAccept}
            loading={isAccepting}
            variant="danger"
            size="large"
            fullWidth
          >
            💖 초대 수락하기
          </LoadingButton>
          <LoadingButton
            onClick={handleReject}
            disabled={isAccepting}
            variant="secondary"
            size="medium"
            fullWidth
          >
            거절하기
          </LoadingButton>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default InviteReceivedPage;

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

const Header = styled.div`
  padding: 40px 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
`;

const HeartIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  animation: heartbeat 1.5s ease-in-out infinite;

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(1);
    }
  }
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;

const InviterSection = styled.div`
  padding: 32px 40px;
  border-bottom: 1px solid #f0f0f0;
`;

const InviterLabel = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
`;

const InviterCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InviterInfo = styled.div`
  flex: 1;
`;

const InviterName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const InviterEmail = styled.p`
  font-size: 14px;
  color: #666;
`;

const FeatureSection = styled.div`
  padding: 32px 40px;
  background: #fafbfc;
`;

const FeatureTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const FeatureIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const FeatureDesc = styled.p`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DateSection = styled.div`
  padding: 32px 40px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
`;

const DateLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
`;

const DatePickerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .custom-datepicker {
    width: 100%;
    max-width: 300px;
    padding: 14px 44px 14px 16px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    color: #333;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      border-color: #ff6b9d;
    }

    &:focus {
      outline: none;
      border-color: #ff6b9d;
      box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
    }

    &::placeholder {
      color: #adb5bd;
    }
  }

  .react-datepicker-wrapper {
    width: 100%;
    max-width: 300px;
  }

  .react-datepicker__input-container {
    width: 100%;
  }
`;

const CalendarIcon = styled.span`
  position: absolute;
  right: calc(50% - 140px);
  font-size: 20px;
  pointer-events: none;
`;

const SelectedDateText = styled.p`
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: #ff6b9d;
  font-weight: 600;
`;
