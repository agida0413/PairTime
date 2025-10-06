import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { inviteMember, inviteMemberByEmail, findMember } from '../features/auth/authSlice';
import { InviteType } from '../types';

const InviteCreatePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'member'>('link');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [foundMember, setFoundMember] = useState<any>(null);
  const [showCopied, setShowCopied] = useState(false);

  const handleCreateLink = async () => {
    try {
      await dispatch(
        inviteMember({
          inviteType: InviteType.LINK,
        })
      ).unwrap();

      // 실제로는 백엔드에서 생성된 링크를 받아와야 하지만,
      // 현재는 임시로 생성
      const mockLink = `${window.location.origin}/invite/accept?token=mock-token`;
      setInviteLink(mockLink);
      toast.success('초대 링크가 생성되었습니다! 🔗');
    } catch (error) {
      console.error('Failed to create invite link:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    toast.success('링크가 클립보드에 복사되었습니다! 📋');
  };

  const handleSendEmail = async () => {
    if (!inviteLink || !email) {
      toast.warning('초대 링크를 먼저 생성하고 이메일을 입력해주세요.');
      return;
    }

    try {
      await dispatch(
        inviteMemberByEmail({
          link: inviteLink,
          receiveEmail: email,
          inviteType: InviteType.LINK,
        })
      ).unwrap();

      toast.success('초대 이메일을 성공적으로 전송했습니다! 📧');
      setEmail('');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleSearchMember = async () => {
    if (!searchEmail) {
      toast.warning('이메일을 입력해주세요.');
      return;
    }

    try {
      const result = await dispatch(
        findMember({ email: searchEmail })
      ).unwrap();

      setFoundMember(result.data);
      toast.success('회원을 찾았습니다! ✨');
    } catch (error) {
      console.error('Failed to find member:', error);
      setFoundMember(null);
    }
  };

  const handleInviteMember = async () => {
    if (!foundMember) return;

    try {
      await dispatch(
        inviteMember({
          email: foundMember.email,
          inviteType: InviteType.SEND_REQUEST,
        })
      ).unwrap();

      toast.success('초대 요청을 성공적으로 전송했습니다! 💌');
      setFoundMember(null);
      setSearchEmail('');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Title>💌 커플 초대하기</Title>
          <Subtitle>소중한 사람을 초대하여 함께 일정을 관리하세요</Subtitle>
        </Header>

        <TabContainer>
          <Tab active={activeTab === 'link'} onClick={() => setActiveTab('link')}>
            링크 생성
          </Tab>
          <Tab active={activeTab === 'email'} onClick={() => setActiveTab('email')}>
            이메일 전송
          </Tab>
          <Tab active={activeTab === 'member'} onClick={() => setActiveTab('member')}>
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
                <ActionButton onClick={handleCreateLink} disabled={loading}>
                  {loading ? '생성 중...' : '🔗 초대 링크 생성하기'}
                </ActionButton>
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

          {activeTab === 'email' && (
            <TabContent>
              <SectionTitle>이메일로 초대하기</SectionTitle>
              <Description>
                먼저 초대 링크를 생성한 후, 이메일 주소를 입력하여 초대 메일을 전송하세요.
              </Description>

              {!inviteLink && (
                <InfoBox>
                  먼저 '링크 생성' 탭에서 초대 링크를 생성해주세요.
                </InfoBox>
              )}

              {inviteLink && (
                <>
                  <InputGroup>
                    <Label>받는 사람 이메일</Label>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>

                  <ActionButton onClick={handleSendEmail} disabled={loading || !email}>
                    {loading ? '전송 중...' : '📧 초대 이메일 전송'}
                  </ActionButton>
                </>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchMember()}
                />
                <SearchButton onClick={handleSearchMember} disabled={loading || !searchEmail}>
                  {loading ? '검색 중...' : '🔍 검색'}
                </SearchButton>
              </SearchArea>

              {foundMember && (
                <MemberCard>
                  <MemberAvatar src={foundMember.profile || '/default-avatar.png'} alt="profile" />
                  <MemberInfo>
                    <MemberName>{foundMember.nickname}</MemberName>
                    <MemberEmail>{foundMember.email}</MemberEmail>
                  </MemberInfo>
                  <InviteButton onClick={handleInviteMember} disabled={loading}>
                    {loading ? '전송 중...' : '💌 초대하기'}
                  </InviteButton>
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
  active: boolean;
}

const Tab = styled.button<TabProps>`
  flex: 1;
  padding: 16px;
  background: ${(props) => (props.active ? 'white' : '#f8f9fa')};
  color: ${(props) => (props.active ? '#4a5568' : '#666')};
  border: none;
  border-bottom: ${(props) => (props.active ? '3px solid #4a5568' : 'none')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.active ? 'white' : '#f0f0f0')};
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

const InfoBox = styled.div`
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(45, 55, 72, 0.4);
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a5568;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const SearchArea = styled.div`
  display: flex;
  gap: 12px;
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #2d3748;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const InviteButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 55, 72, 0.4);
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
