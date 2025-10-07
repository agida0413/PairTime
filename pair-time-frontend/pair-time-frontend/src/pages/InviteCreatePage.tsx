import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { inviteMember, findMember, findMyInviteLink, resetMainUIType } from '../features/auth/authSlice';
import { InviteType } from '../types';
import { LoadingButton, LogoutButton } from '../components';

const InviteCreatePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<'link' | 'member'>('link');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [foundMember, setFoundMember] = useState<any>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateLink = async () => {
    setIsCreatingLink(true);
    try {
      // 1. 초대 링크 생성 (초대 페이지에서는 삭제하지 않음)
      await dispatch(
        inviteMember({
          inviteType: InviteType.LINK,
          isRequiredDel: false,
        })
      ).unwrap();

      // 2. 현재 세션 기반으로 생성된 링크 조회
      const linkData = await dispatch(findMyInviteLink()).unwrap();

      // 3. 조회된 링크를 화면에 세팅
      setInviteLink(linkData.link);
      toast.success('초대 링크가 생성되었습니다! 🔗');

      // 4. mainUIType 재조회 (상태 변경 반영)
      dispatch(resetMainUIType());
    } catch (error) {
      console.error('Failed to create invite link:', error);
      toast.error('초대 링크 생성에 실패했습니다.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    toast.success('링크가 클립보드에 복사되었습니다! 📋');
  };


  const handleSearchMember = async () => {
    if (!searchEmail) {
      toast.warning('이메일을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const result = await dispatch(
        findMember({ email: searchEmail })
      ).unwrap();

      setFoundMember(result.data);
      toast.success('회원을 찾았습니다! ✨');
    } catch (error) {
      console.error('Failed to find member:', error);
      setFoundMember(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteMember = async () => {
    if (!foundMember) return;

    setIsInviting(true);
    try {
      await dispatch(
        inviteMember({
          email: foundMember.email,
          inviteType: InviteType.SEND_REQUEST,
          isRequiredDel: false,
        })
      ).unwrap();

      toast.success('초대 요청을 성공적으로 전송했습니다! 💌');
      setFoundMember(null);
      setSearchEmail('');

      // mainUIType 재조회 (상태 변경 반영)
      dispatch(resetMainUIType());
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Container>
      <LogoutButton />
      <Card>
        <Header>
          <Title>💌 커플 초대하기</Title>
          <Subtitle>소중한 사람을 초대하여 함께 일정을 관리하세요</Subtitle>
        </Header>

        <TabContainer>
          <Tab $active={activeTab === 'link'} onClick={() => setActiveTab('link')}>
            링크 생성
          </Tab>
          <Tab $active={activeTab === 'member'} onClick={() => setActiveTab('member')}>
            회원 검색
          </Tab>
        </TabContainer>

        <ContentArea>
          {activeTab === 'link' && (
            <TabContent>
              <SectionTitle>초대 링크 생성</SectionTitle>
              <Description>
                초대 링크를 생성하여 상대방에게 공유하세요. 링크를 통해 쉽게 커플로 연결할 수 있습니다.
              </Description>

              {!inviteLink ? (
                <LoadingButton
                  onClick={handleCreateLink}
                  loading={isCreatingLink}
                  variant="primary"
                  size="large"
                  fullWidth
                >
                  🔗 초대 링크 생성하기
                </LoadingButton>
              ) : (
                <LinkResultArea>
                  <LinkBox>
                    <LinkText>{inviteLink}</LinkText>
                  </LinkBox>
                  <CopyButton onClick={handleCopyLink}>
                    {showCopied ? '✓ 복사됨!' : '📋 복사하기'}
                  </CopyButton>
                </LinkResultArea>
              )}
            </TabContent>
          )}

          {activeTab === 'member' && (
            <TabContent>
              <SectionTitle>가입된 회원 검색</SectionTitle>
              <Description>
                이미 PairTime에 가입한 회원을 이메일로 검색하여 바로 초대할 수 있습니다.
              </Description>

              <SearchArea>
                <Input
                  type="email"
                  placeholder="상대방의 이메일을 입력하세요"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSearching && handleSearchMember()}
                  disabled={isSearching}
                />
                <LoadingButton
                  onClick={handleSearchMember}
                  loading={isSearching}
                  disabled={!searchEmail}
                  variant="primary"
                  size="medium"
                >
                  🔍 검색
                </LoadingButton>
              </SearchArea>

              {foundMember && (
                <MemberCard>
                  <MemberAvatar src={foundMember.profile || '/default-avatar.png'} alt="profile" />
                  <MemberInfo>
                    <MemberName>{foundMember.nickname}</MemberName>
                    <MemberEmail>{foundMember.email}</MemberEmail>
                  </MemberInfo>
                  <LoadingButton
                    onClick={handleInviteMember}
                    loading={isInviting}
                    variant="primary"
                    size="medium"
                  >
                    💌 초대하기
                  </LoadingButton>
                </MemberCard>
              )}
            </TabContent>
          )}
        </ContentArea>
      </Card>
    </Container>
  );
};

export default InviteCreatePage;

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
  max-width: 600px;
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
  padding: 40px 40px 24px;
  text-align: center;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

interface TabProps {
  $active: boolean;
}

const Tab = styled.button<TabProps>`
  flex: 1;
  padding: 16px;
  background: ${(props) => (props.$active ? 'white' : '#f8f9fa')};
  color: ${(props) => (props.$active ? '#4a5568' : '#666')};
  border: none;
  border-bottom: ${(props) => (props.$active ? '3px solid #4a5568' : 'none')};
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? 'white' : '#f0f0f0')};
  }
`;

const ContentArea = styled.div`
  padding: 32px 40px 40px;
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

const LinkResultArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LinkBox = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
`;

const LinkText = styled.p`
  font-size: 14px;
  color: #495057;
  word-break: break-all;
  font-family: monospace;
`;

const CopyButton = styled.button`
  padding: 12px 20px;
  background: white;
  color: #4a5568;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4a5568;
    color: white;
  }
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a5568;
    outline: none;
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

const SearchArea = styled.div`
  display: flex;
  gap: 12px;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MemberAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const MemberEmail = styled.p`
  font-size: 14px;
  color: #666;
`;
