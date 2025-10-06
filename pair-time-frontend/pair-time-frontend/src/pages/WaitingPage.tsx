import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { findInviteMember, findInviteLink, inviteMemberByEmail, resetMainUIType } from '../features/auth/authSlice';
import { InviteMemberResponse, InviteLinkResponse, InviteType } from '../types';
import { toast } from 'react-toastify';
import { LoadingButton, InviteModal } from '../components';

const WaitingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mainUIType, planGrpTempId } = useAppSelector((state) => state.auth);

  const [invitedMember, setInvitedMember] = useState<InviteMemberResponse | null>(null);
  const [inviteLink, setInviteLink] = useState<InviteLinkResponse | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailToSend, setEmailToSend] = useState<string>('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    // 이미 데이터를 로드했거나 필요한 정보가 없으면 스킵
    if (!planGrpTempId || !mainUIType || hasLoadedDataRef.current) {
      return;
    }

    // 데이터 로드 시작
    hasLoadedDataRef.current = true;

    // 초대받은 회원 정보 조회 (실패는 정상 - 링크 초대일 수 있음)
    dispatch(findInviteMember({ planGrpTempId, mainUIType }))
      .unwrap()
      .then((data) => {
        console.log('✅ 초대받은 회원 정보 조회 성공:', data);
        setInvitedMember(data);
        setMemberError(null);
      })
      .catch((error) => {
        console.log('ℹ️ 초대받은 실존 회원 없음 (링크 초대일 수 있음)');
        setMemberError(error);
      });

    // 초대 링크 정보 조회 (실패는 정상 - 회원 초대일 수 있음)
    dispatch(findInviteLink(planGrpTempId))
      .unwrap()
      .then((data) => {
        console.log('✅ 초대 링크 정보 조회 성공:', data);
        setInviteLink(data);
        setLinkError(null);
      })
      .catch((error) => {
        console.log('ℹ️ 초대 링크 없음 (회원 초대일 수 있음)');
        setLinkError(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planGrpTempId, mainUIType]);

  const handleSendEmail = async () => {
    if (!emailToSend) {
      toast.warning('이메일 주소를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      toast.error('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await dispatch(
        inviteMemberByEmail({
          inviteType: InviteType.LINK,
          link: inviteLink?.link,
          receiveEmail: emailToSend,
        })
      ).unwrap();
      toast.success('이메일로 초대 링크가 전송되었습니다!');
      setEmailToSend(''); // 전송 후 입력창 비우기

      // mainUIType 재조회 (상태 변경 반영)
      dispatch(resetMainUIType());
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      toast.error('이메일 전송에 실패했습니다.');
    } finally {
      setIsSendingEmail(false);
    }
  };

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

          {/* 초대한 회원 정보 표시 (실존 회원이 있으면 링크는 숨김) */}
          {invitedMember && !memberError && (
            <InviteSection>
              <InviteSectionTitle>📧 초대한 회원</InviteSectionTitle>
              <InviteMemberCard>
                <Avatar src={invitedMember.profile || '/default-avatar.png'} alt="invited member" />
                <MemberInfo>
                  <MemberName>{invitedMember.nickname}</MemberName>
                  <MemberEmail>{invitedMember.email}</MemberEmail>
                </MemberInfo>
                <StatusBadge>대기 중</StatusBadge>
              </InviteMemberCard>
            </InviteSection>
          )}

          {/* 초대 링크 정보 표시 (실존 회원이 없을 때만) */}
          {!invitedMember && inviteLink && !linkError && (
            <InviteSection>
              <InviteSectionTitle>🔗 초대 링크</InviteSectionTitle>
              <LinkCard>
                <LinkText>{inviteLink.link}</LinkText>
                <CopyButton onClick={() => {
                  navigator.clipboard.writeText(inviteLink.link);
                  toast.success('링크가 복사되었습니다! 📋');
                }}>
                  복사
                </CopyButton>
              </LinkCard>
              <LinkDescription>이 링크를 공유하여 상대방을 초대하세요</LinkDescription>

              <EmailInputSection>
                <EmailLabel>이메일로 초대하기</EmailLabel>
                <EmailInputGroup>
                  <EmailInput
                    type="email"
                    placeholder="example@email.com"
                    value={emailToSend}
                    onChange={(e) => setEmailToSend(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendEmail()}
                  />
                  <LoadingButton
                    onClick={handleSendEmail}
                    loading={isSendingEmail}
                    disabled={!emailToSend}
                    variant="primary"
                    size="medium"
                  >
                    📧 전송
                  </LoadingButton>
                </EmailInputGroup>
              </EmailInputSection>
            </InviteSection>
          )}

          {/* 둘 다 없는 경우 */}
          {memberError && linkError && (
            <InfoSection>
              <InfoTitle>ℹ️ 초대 정보 없음</InfoTitle>
              <InfoList>
                <InfoItem>현재 조회된 초대 정보가 없습니다.</InfoItem>
              </InfoList>
            </InfoSection>
          )}

          <InfoSection>
            <InfoTitle>💡 대기하는 동안...</InfoTitle>
            <InfoList>
              <InfoItem>✓ 초대 링크를 다시 확인해보세요</InfoItem>
              <InfoItem>✓ 상대방에게 알림이 갔는지 확인해보세요</InfoItem>
              <InfoItem>✓ 새로운 초대 링크를 생성할 수도 있어요</InfoItem>
            </InfoList>
          </InfoSection>

          <NewInviteButtonWrapper>
            <LoadingButton
              onClick={() => setIsInviteModalOpen(true)}
              variant="primary"
              size="large"
              fullWidth
            >
              ➕ 새 초대 만들기
            </LoadingButton>
          </NewInviteButtonWrapper>
        </ContentSection>

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />

        <ButtonGroup>
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

// 추가 스타일 컴포넌트
const InviteSection = styled.div`
  margin: 24px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4a5568;
`;

const InviteSectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const InviteMemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const MemberEmail = styled.p`
  font-size: 13px;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  background: #ffeaa7;
  color: #333;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
`;

const LinkCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const LinkText = styled.p`
  flex: 1;
  font-size: 13px;
  color: #4a5568;
  word-break: break-all;
  font-family: monospace;
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2d3748;
  }
`;

const LinkDescription = styled.p`
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

const EmailInputSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
`;

const EmailLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const EmailInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 13px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4a5568;
  }

  &::placeholder {
    color: #adb5bd;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const NewInviteButtonWrapper = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;
