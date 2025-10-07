import React, { useState } from 'react';
import styled from 'styled-components';
import { LogoutButton } from '../components';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    const blanks = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      blanks.push(<DayCell key={`blank-${i}`} isEmpty />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <DayCell key={day} isToday={isToday}>
          <DayNumber isToday={isToday}>{day}</DayNumber>
          {/* TODO: 일정이 있을 경우 표시 */}
        </DayCell>
      );
    }

    return [...blanks, ...days];
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <Container>
      <LogoutButton />
      <Header>
        <TopBar>
          <UserSection>
            <UserAvatar src="/default-avatar.png" alt="user" />
            <WelcomeText>
              <Greeting>안녕하세요! 👋</Greeting>
              <UserName>커플님</UserName>
            </WelcomeText>
          </UserSection>
          <HeaderActions>
            <NotificationButton>
              🔔
              <NotificationBadge>3</NotificationBadge>
            </NotificationButton>
            <SettingsButton>⚙️</SettingsButton>
          </HeaderActions>
        </TopBar>

        <CoupleInfo>
          <HeartIcon>💕</HeartIcon>
          <CoupleText>
            <CoupleNames>홍길동 & 김철수</CoupleNames>
            <LoveDays>사랑한 지 100일째 💖</LoveDays>
          </CoupleText>
        </CoupleInfo>
      </Header>

      <MainContent>
        <CalendarSection>
          <CalendarHeader>
            <MonthNavButton onClick={previousMonth}>
              ◀
            </MonthNavButton>
            <CurrentMonth>
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </CurrentMonth>
            <MonthNavButton onClick={nextMonth}>
              ▶
            </MonthNavButton>
          </CalendarHeader>

          <CalendarGrid>
            <WeekDayHeader>일</WeekDayHeader>
            <WeekDayHeader>월</WeekDayHeader>
            <WeekDayHeader>화</WeekDayHeader>
            <WeekDayHeader>수</WeekDayHeader>
            <WeekDayHeader>목</WeekDayHeader>
            <WeekDayHeader>금</WeekDayHeader>
            <WeekDayHeader>토</WeekDayHeader>
            {renderDays()}
          </CalendarGrid>

          <QuickActions>
            <QuickActionButton primary>
              ➕ 일정 추가
            </QuickActionButton>
            <QuickActionButton>
              📝 메모 작성
            </QuickActionButton>
            <QuickActionButton>
              🎂 기념일 등록
            </QuickActionButton>
          </QuickActions>
        </CalendarSection>

        <SidePanel>
          <SectionTitle>📌 다가오는 일정</SectionTitle>
          <UpcomingEvents>
            <EventCard>
              <EventDate>
                <EventDay>15</EventDay>
                <EventMonth>10월</EventMonth>
              </EventDate>
              <EventInfo>
                <EventTitle>데이트 날 💑</EventTitle>
                <EventTime>오후 6:00</EventTime>
              </EventInfo>
            </EventCard>

            <EventCard>
              <EventDate>
                <EventDay>22</EventDay>
                <EventMonth>10월</EventMonth>
              </EventDate>
              <EventInfo>
                <EventTitle>영화 보기 🎬</EventTitle>
                <EventTime>오후 7:30</EventTime>
              </EventInfo>
            </EventCard>

            <EventCard>
              <EventDate>
                <EventDay>30</EventDay>
                <EventMonth>10월</EventMonth>
              </EventDate>
              <EventInfo>
                <EventTitle>기념일 🎉</EventTitle>
                <EventTime>종일</EventTime>
              </EventInfo>
            </EventCard>
          </UpcomingEvents>

          <Divider />

          <SectionTitle>📸 최근 추억</SectionTitle>
          <MemoryGallery>
            <MemoryCard>
              <MemoryImage src="https://via.placeholder.com/150" alt="memory" />
              <MemoryCaption>첫 데이트 💕</MemoryCaption>
            </MemoryCard>
            <MemoryCard>
              <MemoryImage src="https://via.placeholder.com/150" alt="memory" />
              <MemoryCaption>함께한 여행 ✈️</MemoryCaption>
            </MemoryCard>
          </MemoryGallery>
        </SidePanel>
      </MainContent>
    </Container>
  );
};

export default CalendarPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  padding: 24px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const WelcomeText = styled.div``;

const Greeting = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 2px;
`;

const UserName = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const NotificationButton = styled.button`
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #ff6b9d;
  color: white;
  font-size: 10px;
  font-weight: 600;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SettingsButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CoupleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const HeartIcon = styled.div`
  font-size: 48px;
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

const CoupleText = styled.div``;

const CoupleNames = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const LoveDays = styled.p`
  font-size: 14px;
  opacity: 0.9;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CalendarSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MonthNavButton = styled.button`
  background: #f8f9fa;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: scale(1.1);
  }
`;

const CurrentMonth = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #333;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 24px;
`;

const WeekDayHeader = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  padding: 12px 0;
`;

interface DayCellProps {
  isEmpty?: boolean;
  isToday?: boolean;
}

const DayCell = styled.div<DayCellProps>`
  aspect-ratio: 1;
  padding: 8px;
  border-radius: 8px;
  background: ${(props) => (props.isToday ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' : props.isEmpty ? 'transparent' : '#f8f9fa')};
  cursor: ${(props) => (props.isEmpty ? 'default' : 'pointer')};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => !props.isEmpty && !props.isToday && '#e9ecef'};
    transform: ${(props) => !props.isEmpty && 'scale(1.05)'};
  }
`;

interface DayNumberProps {
  isToday?: boolean;
}

const DayNumber = styled.div<DayNumberProps>`
  font-size: 14px;
  font-weight: ${(props) => (props.isToday ? '600' : '400')};
  color: ${(props) => (props.isToday ? 'white' : '#333')};
  text-align: center;
  margin-bottom: 4px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

interface QuickActionButtonProps {
  primary?: boolean;
}

const QuickActionButton = styled.button<QuickActionButtonProps>`
  flex: 1;
  min-width: 150px;
  padding: 14px 20px;
  background: ${(props) => (props.primary ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' : 'white')};
  color: ${(props) => (props.primary ? 'white' : '#4a5568')};
  border: ${(props) => (props.primary ? 'none' : '2px solid #4a5568')};
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) => (props.primary ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const UpcomingEvents = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 8px;
  background: white;
  border-radius: 8px;
`;

const EventDay = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4a5568;
`;

const EventMonth = styled.div`
  font-size: 12px;
  color: #666;
`;

const EventInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const EventTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const EventTime = styled.p`
  font-size: 13px;
  color: #666;
`;

const Divider = styled.div`
  height: 1px;
  background: #e9ecef;
`;

const MemoryGallery = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const MemoryCard = styled.div`
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const MemoryImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 8px;
`;

const MemoryCaption = styled.p`
  font-size: 12px;
  color: #666;
  text-align: center;
`;
