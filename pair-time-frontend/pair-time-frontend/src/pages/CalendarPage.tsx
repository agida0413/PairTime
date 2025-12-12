import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { LogoutButton } from '../components';
import { Plan, PlanType } from '../types/calendar';
import { FindCalendarInfoResponse, PlanCalendarUIType } from '../types';
import { toast } from 'react-toastify';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createPlan, fetchCalendarInfo, createPlanExp } from '../features/auth/authSlice';

const CalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux에서 mainInfo 가져오기
  const { mainInfo } = useAppSelector((state) => state.auth);

  // 달력 일정 데이터 상태 (기존 Plan 타입 유지)
  const [calendarPlans, setCalendarPlans] = useState<Plan[]>([]);

  // 기본 시간 계산 함수
  const getDefaultTimes = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 30 * 60000); // 현재 시간 + 30분
    const endDate = new Date(startDate.getTime() + 60 * 60000); // 시작 시간 + 1시간

    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return {
      startTime: formatTime(startDate),
      endTime: formatTime(endDate)
    };
  };

  const defaultTimes = getDefaultTimes();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDateForExpense, setSelectedDateForExpense] = useState<Date | null>(null);
  const [selectedDateForPlan, setSelectedDateForPlan] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showDailyExpenseModal, setShowDailyExpenseModal] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState(defaultTimes.startTime);
  const [endTime, setEndTime] = useState(defaultTimes.endTime);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>(PlanType.SOLO_ME);
  const [planTitle, setPlanTitle] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);

  // 지출 등록 관련 상태
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedPlanForExpense, setSelectedPlanForExpense] = useState<Plan | null>(null);

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

  // API 응답을 Plan 타입으로 변환하는 헬퍼 함수
  const convertToPlan = useCallback((apiPlan: FindCalendarInfoResponse): Plan => {
    // PlanCalendarUIType을 PlanType enum으로 매핑
    let planType: PlanType;
    switch (apiPlan.planCalendarUIType) {
      case PlanCalendarUIType.MY:
        planType = PlanType.SOLO_ME;
        break;
      case PlanCalendarUIType.OPPOSITE:
        planType = PlanType.SOLO_OPPONENT;
        break;
      case PlanCalendarUIType.COUPLE:
        planType = PlanType.COUPLE;
        break;
      default:
        planType = PlanType.SOLO_ME;
    }

    return {
      id: apiPlan.planId,
      title: apiPlan.title,
      content: apiPlan.content,
      startAt: apiPlan.startAt,
      endAt: apiPlan.endAt,
      planType: planType,
      opponentNickname: mainInfo?.opponentNickname,
      authorName: mainInfo?.nickname || '',
      createdAt: apiPlan.startAt,
      planPosts: [], // 추후 별도 API로 조회 필요
      planExps: [],  // 추후 별도 API로 조회 필요
      planReviews: [], // 추후 별도 API로 조회 필요
    };
  }, [mainInfo]);

  // 달력 정보 조회 (currentDate 변경 시)
  useEffect(() => {
    const loadCalendarInfo = async () => {
      if (!mainInfo?.planGrpId) {
        console.log('⚠️ planGrpId가 없어서 달력 정보를 조회하지 않습니다');
        return;
      }

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const targetYm = `${year}-${month}`;

      // 로컬 스토리지에서 userId 가져오기 (임시)
      // TODO: Redux에서 userId 관리하도록 수정 필요
      const userId = 1; // 임시로 1 사용

      console.log('📅 Loading calendar info for:', targetYm);

      const result = await dispatch(fetchCalendarInfo({
        targetYm,
        usrId: userId,
      }));

      if (fetchCalendarInfo.fulfilled.match(result)) {
        // API 응답을 Plan 타입으로 변환
        const plans = result.payload.map(convertToPlan);
        setCalendarPlans(plans);
        console.log('✅ Calendar plans loaded:', plans);
      }
    };

    loadCalendarInfo();
  }, [currentDate, mainInfo, dispatch, convertToPlan]);

  const previousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    // 이번 달이 아니면 1일로 설정
    const today = new Date();
    if (newDate.getMonth() !== today.getMonth() || newDate.getFullYear() !== today.getFullYear()) {
      setSelectedDay(1);
      setSelectedDateForPlan(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    } else {
      setSelectedDay(today.getDate());
      setSelectedDateForPlan(new Date(newDate.getFullYear(), newDate.getMonth(), today.getDate()));
    }
    setSelectedPlan(null);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    // 이번 달이 아니면 1일로 설정
    const today = new Date();
    if (newDate.getMonth() !== today.getMonth() || newDate.getFullYear() !== today.getFullYear()) {
      setSelectedDay(1);
      setSelectedDateForPlan(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    } else {
      setSelectedDay(today.getDate());
      setSelectedDateForPlan(new Date(newDate.getFullYear(), newDate.getMonth(), today.getDate()));
    }
    setSelectedPlan(null);
  };

  const getPlansForDate = (day: number): Plan[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarPlans
      .filter(plan => plan.startAt.startsWith(dateStr))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()); // 시간 빠른 순 정렬
  };

  const getTotalExpenseForDate = (day: number): number => {
    const plans = getPlansForDate(day);
    return plans.reduce((total, plan) => {
      const planTotal = plan.planExps.reduce((pTotal, exp) => {
        return pTotal + exp.planExpDetails.reduce((eTotal, detail) => eTotal + detail.expenditure, 0);
      }, 0);
      return total + planTotal;
    }, 0);
  };

  const getMonthlyTotalExpense = (): number => {
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      total += getTotalExpenseForDate(day);
    }
    return total;
  };

  const getMonthlyAverageRating = (): number => {
    let totalRating = 0;
    let ratingCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const plans = getPlansForDate(day);
      plans.forEach(plan => {
        if (plan.planReviews.length > 0) {
          plan.planReviews.forEach(review => {
            totalRating += review.rating;
            ratingCount++;
          });
        }
      });
    }

    return ratingCount > 0 ? totalRating / ratingCount : 0;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeRange = (startAt: string, endAt: string) => {
    return `${formatTime(startAt)} ~ ${formatTime(endAt)}`;
  };

  const handlePlanClick = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation();
    setSelectedPlan(plan);
    setSelectedDateForPlan(null);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDateForPlan(date);
    setSelectedPlan(null);
    setSelectedDay(day);
  };

  const handleExpenseClick = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDateForExpense(date);
    setShowDailyExpenseModal(true);
  };

  const handleLikeToggle = () => {
    if (selectedPlan && selectedPlan.planPosts.length > 0) {
      toast.success(selectedPlan.planPosts[0].isLiked ? '좋아요를 취소했습니다' : '좋아요를 눌렀습니다 ❤️');
    }
  };

  const handleAddMemory = () => {
    setShowAddMemoryModal(false);
    toast.success('추억이 등록되었습니다! 📸');
  };

  const handleAddExpense = async () => {
    // 필수 값 검증
    if (!expenseTitle.trim()) {
      toast.error('지출 항목을 입력해주세요');
      return;
    }
    if (!expenseAmount || parseFloat(expenseAmount) < 100) {
      toast.error('지출 금액은 100원 이상이어야 합니다');
      return;
    }
    if (!selectedPlanForExpense) {
      toast.error('지출을 등록할 일정을 선택해주세요');
      return;
    }

    const expenseRequest = {
      title: expenseTitle.trim(),
      expenditure: parseFloat(expenseAmount),
      planId: selectedPlanForExpense.id,
    };

    console.log('📤 Sending expense request:', expenseRequest);

    const result = await dispatch(createPlanExp(expenseRequest));

    if (createPlanExp.fulfilled.match(result)) {
      setShowAddExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setSelectedPlanForExpense(null);

      // 지출 등록 후 달력 정보 다시 조회
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const targetYm = `${year}-${month}`;
      const userId = 1; // 임시 사용

      const calendarResult = await dispatch(fetchCalendarInfo({
        targetYm,
        usrId: userId,
      }));

      if (fetchCalendarInfo.fulfilled.match(calendarResult)) {
        // API 응답을 Plan 타입으로 변환
        const plans = calendarResult.payload.map(convertToPlan);
        setCalendarPlans(plans);
        console.log('✅ Calendar refreshed after creating expense');
      }
    }
  };

  const resetExpenseForm = () => {
    setExpenseTitle('');
    setExpenseAmount('');
    setSelectedPlanForExpense(null);
  };

  const handleOpenExpenseModal = (plan: Plan) => {
    setSelectedPlanForExpense(plan);
    setShowAddExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowAddExpenseModal(false);
    resetExpenseForm();
  };

  const resetPlanForm = () => {
    const newDefaultTimes = getDefaultTimes();
    setIsAllDay(false);
    setStartTime(newDefaultTimes.startTime);
    setEndTime(newDefaultTimes.endTime);
    setSelectedPlanType(PlanType.SOLO_ME);
    setPlanTitle('');
    setPlanContent('');
    setHasAlarm(false);
  };

  const handleAddPlan = async () => {
    // 필수 값 검증
    if (!planTitle.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }
    if (!planContent.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }
    if (!mainInfo?.planGrpId) {
      toast.error('planGrpId를 찾을 수 없습니다');
      return;
    }
    if (!selectedDateForPlan) {
      toast.error('날짜를 선택해주세요');
      return;
    }

    // 시작/종료 날짜 생성
    const year = selectedDateForPlan.getFullYear();
    const month = selectedDateForPlan.getMonth();
    const day = selectedDateForPlan.getDate();

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startAt = new Date(year, month, day, startHour, startMinute);
    const endAt = new Date(year, month, day, endHour, endMinute);

    // ISO 8601 형식으로 변환 (YYYY-MM-DDTHH:mm:ss)
    const formatDateTime = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = '00';
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    };

    // PlanType 매핑: SOLO_ME | COUPLE -> SOLO | COUPLE
    const backendPlanType: 'COUPLE' | 'SOLO' = selectedPlanType === PlanType.COUPLE ? 'COUPLE' : 'SOLO';

    const planRequest = {
      planType: backendPlanType,
      title: planTitle.trim(),
      content: planContent.trim(),
      fullYn: isAllDay ? 'Y' as const : 'N' as const,
      alarmYn: hasAlarm ? 'Y' as const : 'N' as const,
      startAt: formatDateTime(startAt),
      endAt: formatDateTime(endAt),
      planGrpId: mainInfo.planGrpId,
    };

    console.log('📤 Sending plan request:', planRequest);

    const result = await dispatch(createPlan(planRequest));

    if (createPlan.fulfilled.match(result)) {
      setShowAddPlanModal(false);
      resetPlanForm();

      // 일정 등록 후 달력 정보 다시 조회
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const targetYm = `${year}-${month}`;
      const userId = 1; // 임시 사용

      const calendarResult = await dispatch(fetchCalendarInfo({
        targetYm,
        usrId: userId,
      }));

      if (fetchCalendarInfo.fulfilled.match(calendarResult)) {
        // API 응답을 Plan 타입으로 변환
        const plans = calendarResult.payload.map(convertToPlan);
        setCalendarPlans(plans);
        console.log('✅ Calendar refreshed after creating plan');
      }
    }
  };

  const handleClosePlanModal = () => {
    setShowAddPlanModal(false);
    resetPlanForm();
  };

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      setStartTime('00:00');
      setEndTime('23:59');
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    // 종료 시간이 시작 시간보다 빠르면 종료 시간을 시작 시간 + 1시간으로 설정
    if (time > endTime) {
      const [hours, minutes] = time.split(':').map(Number);
      const newEndDate = new Date();
      newEndDate.setHours(hours, minutes);
      newEndDate.setTime(newEndDate.getTime() + 60 * 60000); // +1시간
      const newEndTime = `${String(newEndDate.getHours()).padStart(2, '0')}:${String(newEndDate.getMinutes()).padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (time: string) => {
    // 종료 시간이 시작 시간보다 빠르면 설정하지 않음
    if (time >= startTime) {
      setEndTime(time);
    } else {
      toast.error('종료 시간은 시작 시간보다 빠를 수 없습니다.');
    }
  };


  const handleEditPlan = (plan: Plan) => {
    toast.success('일정이 수정되었습니다! ✏️');
  };

  const handleDeletePlan = (planId: number) => {
    toast.success('일정이 삭제되었습니다! 🗑️');
  };

  const handleEditExpense = (expenseId: number) => {
    toast.success('지출 정보가 수정되었습니다! ✏️');
  };

  const handleDeleteExpense = (expenseId: number) => {
    toast.success('지출 정보가 삭제되었습니다! 🗑️');
  };

  const handleEditMemory = (memoryId: number) => {
    toast.success('추억이 수정되었습니다! ✏️');
  };

  const handleDeleteMemory = (memoryId: number) => {
    toast.success('추억이 삭제되었습니다! 🗑️');
  };

  const handleRating = (rating: number) => {
    toast.success(`${rating}점으로 평가했습니다! ⭐`);
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

      const isSelected = day === selectedDay;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      dayDate.setHours(0, 0, 0, 0);
      const isPastDate = dayDate < today;

      // 요일 계산 (0: 일요일, 6: 토요일)
      const dayOfWeek = dayDate.getDay();

      const plansForDay = getPlansForDate(day);
      const totalExpense = getTotalExpenseForDate(day);

      days.push(
        <DayCell key={day} isSelected={isSelected} isPastDate={isPastDate} onClick={() => handleDayClick(day)}>
          <DayHeader>
            <DayNumber isToday={isToday} isSelected={isSelected} dayOfWeek={dayOfWeek}>{day}</DayNumber>
            {totalExpense > 0 && (
              <DayExpense onClick={(e) => handleExpenseClick(e, day)}>
                💰 {totalExpense.toLocaleString()}
              </DayExpense>
            )}
          </DayHeader>
          <PlanPreviewList>
            {plansForDay.map((plan) => (
              <PlanPreviewItem
                key={plan.id}
                planType={plan.planType}
                onClick={(e) => handlePlanClick(e, plan)}
              >
                <PlanTime>{formatTimeRange(plan.startAt, plan.endAt)}</PlanTime>
                <PlanTitle>{plan.title}</PlanTitle>
              </PlanPreviewItem>
            ))}
          </PlanPreviewList>
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
            <UserAvatar
              src={mainInfo?.profile || '/default-avatar.png'}
              alt="user"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
            <WelcomeText>
              <Greeting>안녕하세요! 👋</Greeting>
              <UserName>{mainInfo?.nickname || '커플'}님</UserName>
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
            <CoupleNames>
              {mainInfo?.nickname || '나'} & {mainInfo?.opponentNickname || '상대방'}
            </CoupleNames>
            <LoveDays>사랑한 지 {mainInfo?.loveDday || 0}일째 💖</LoveDays>
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
            <WeekDayHeader dayOfWeek={0}>일</WeekDayHeader>
            <WeekDayHeader dayOfWeek={1}>월</WeekDayHeader>
            <WeekDayHeader dayOfWeek={2}>화</WeekDayHeader>
            <WeekDayHeader dayOfWeek={3}>수</WeekDayHeader>
            <WeekDayHeader dayOfWeek={4}>목</WeekDayHeader>
            <WeekDayHeader dayOfWeek={5}>금</WeekDayHeader>
            <WeekDayHeader dayOfWeek={6}>토</WeekDayHeader>
            {renderDays()}
          </CalendarGrid>

          <QuickActions>
            <QuickActionButton primary onClick={() => setShowAddPlanModal(true)}>
              ➕ 일정 추가
            </QuickActionButton>
            <MonthlyExpenseCard>
              <MonthlyExpenseTitle>💰 이달 우리의 총지출</MonthlyExpenseTitle>
              <MonthlyExpenseAmount>{getMonthlyTotalExpense().toLocaleString()}원</MonthlyExpenseAmount>
            </MonthlyExpenseCard>
            <MonthlyRatingCard>
              <MonthlyRatingTitle>⭐ 이달 우리의 데이트 평점</MonthlyRatingTitle>
              <MonthlyRatingStars>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MonthlyRatingStar key={star} filled={star <= Math.round(getMonthlyAverageRating())}>
                    ⭐
                  </MonthlyRatingStar>
                ))}
              </MonthlyRatingStars>
              <MonthlyRatingValue>{getMonthlyAverageRating().toFixed(1)}점</MonthlyRatingValue>
            </MonthlyRatingCard>
          </QuickActions>
        </CalendarSection>

        <SidePanel>
          <SectionTitle>
            {selectedPlan
              ? '이날의 추억 📸'
              : selectedDateForPlan
              ? `${selectedDateForPlan.getMonth() + 1}월 ${selectedDateForPlan.getDate()}일 일정`
              : '📌 일정을 선택해주세요'}
          </SectionTitle>
          {selectedPlan ? (
            <>
              {selectedPlan.planType === PlanType.SOLO_ME || selectedPlan.planType === PlanType.SOLO_OPPONENT ? (
                <RestrictedSection>
                  <RestrictedIcon>🔒</RestrictedIcon>
                  <RestrictedText>개인 일정은 해당 탭을 이용할 수 없습니다</RestrictedText>
                  <PlanInfo>
                    <PlanInfoTitle>{selectedPlan.title}</PlanInfoTitle>
                    <PlanInfoContent>{selectedPlan.content}</PlanInfoContent>
                    <PlanInfoTime>
                      {formatTimeRange(selectedPlan.startAt, selectedPlan.endAt)}
                    </PlanInfoTime>
                  </PlanInfo>
                </RestrictedSection>
              ) : (
                <>
                  <MemorySection>
                    {selectedPlan.planPosts.length > 0 ? (
                      selectedPlan.planPosts.map((post) => (
                        <MemoryCard key={post.id}>
                          {post.images.map((img, idx) => (
                            <MemoryImage key={idx} src={img} alt="memory" />
                          ))}
                          <MemoryContent>
                            <MemoryTitle>{post.title}</MemoryTitle>
                            <MemoryDescription>{post.content}</MemoryDescription>
                            <MemoryActions>
                              <LikeButton isLiked={post.isLiked} onClick={handleLikeToggle}>
                                ❤️ {post.likes}
                              </LikeButton>
                              <MemoryActionButtons>
                                <MemoryActionButton edit onClick={() => handleEditMemory(post.id)}>
                                  ✏️ 수정
                                </MemoryActionButton>
                                <MemoryActionButton delete onClick={() => handleDeleteMemory(post.id)}>
                                  🗑️ 삭제
                                </MemoryActionButton>
                              </MemoryActionButtons>
                            </MemoryActions>
                          </MemoryContent>
                        </MemoryCard>
                      ))
                    ) : (
                      <EmptyState>
                        <EmptyIcon>📷</EmptyIcon>
                        <EmptyText>이날의 추억이 없습니다</EmptyText>
                        <AddMemoryButton onClick={() => setShowAddMemoryModal(true)}>
                          ➕ 추억 등록하기
                        </AddMemoryButton>
                      </EmptyState>
                    )}
                  </MemorySection>

                  {selectedPlan.planPosts.length > 0 && (
                    <>
                      <Divider />
                      <SectionTitle>⭐ 이 일정 평가하기</SectionTitle>
                      <RatingSection>
                        <RatingStars>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              selected={selectedPlan.planReviews.length > 0 && selectedPlan.planReviews[0].rating >= star}
                              onClick={() => handleRating(star)}
                            >
                              ⭐
                            </Star>
                          ))}
                        </RatingStars>
                        {selectedPlan.planReviews.length > 0 && (
                          <RatingDisplayStars>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avgRating = selectedPlan.planReviews.reduce((sum, r) => sum + r.rating, 0) / selectedPlan.planReviews.length;
                              return (
                                <DisplayStar key={star} filled={star <= Math.round(avgRating)}>
                                  ⭐
                                </DisplayStar>
                              );
                            })}
                            <RatingValue>{(selectedPlan.planReviews.reduce((sum, r) => sum + r.rating, 0) / selectedPlan.planReviews.length).toFixed(1)}점</RatingValue>
                          </RatingDisplayStars>
                        )}
                      </RatingSection>
                    </>
                  )}

                  <Divider />

                  <SectionTitle>💰 지출 정보</SectionTitle>
                  <ExpenseSection>
                    {selectedPlan.planExps.length > 0 &&
                    selectedPlan.planExps[0].planExpDetails.length > 0 ? (
                      <ExpenseList>
                        {selectedPlan.planExps[0].planExpDetails.map((exp) => (
                          <ExpenseItemWrapper key={exp.id}>
                            <ExpenseItem>
                              <ExpenseTitle>{exp.title}</ExpenseTitle>
                              <ExpenseAmount>
                                {exp.expenditure.toLocaleString()}원
                              </ExpenseAmount>
                            </ExpenseItem>
                            <ExpenseItemActions>
                              <ExpenseActionButton edit onClick={() => handleEditExpense(exp.id)}>
                                ✏️
                              </ExpenseActionButton>
                              <ExpenseActionButton delete onClick={() => handleDeleteExpense(exp.id)}>
                                🗑️
                              </ExpenseActionButton>
                            </ExpenseItemActions>
                          </ExpenseItemWrapper>
                        ))}
                        <TotalExpense>
                          <ExpenseTitle>총 지출</ExpenseTitle>
                          <ExpenseAmount>
                            {selectedPlan.planExps[0].planExpDetails
                              .reduce((sum, exp) => sum + exp.expenditure, 0)
                              .toLocaleString()}원
                          </ExpenseAmount>
                        </TotalExpense>
                        <AddExpenseButton onClick={() => handleOpenExpenseModal(selectedPlan)}>
                          ➕ 지출 추가하기
                        </AddExpenseButton>
                      </ExpenseList>
                    ) : (
                      <EmptyState>
                        <EmptyIcon>💸</EmptyIcon>
                        <EmptyText>지출 정보가 없습니다</EmptyText>
                        <AddExpenseButton onClick={() => handleOpenExpenseModal(selectedPlan)}>
                          ➕ 지출 정보 등록하기
                        </AddExpenseButton>
                      </EmptyState>
                    )}
                  </ExpenseSection>
                </>
              )}
            </>
          ) : selectedDateForPlan ? (
            <>
              {getPlansForDate(selectedDateForPlan.getDate()).length > 0 ? (
                <DayPlansSection>
                  <DayPlansHeader>
                    <DayPlansTitle>오늘 이런 일정이 있어요! 📅</DayPlansTitle>
                  </DayPlansHeader>
                  <DayPlansList>
                    {getPlansForDate(selectedDateForPlan.getDate()).map((plan) => (
                      <DayPlanCard
                        key={plan.id}
                        planType={plan.planType}
                      >
                        <DayPlanCardContent onClick={(e) => handlePlanClick(e, plan)}>
                          <DayPlanTime>{formatTimeRange(plan.startAt, plan.endAt)}</DayPlanTime>
                          <DayPlanTitle>{plan.title}</DayPlanTitle>
                          <DayPlanContent>{plan.content}</DayPlanContent>
                          <PlanTypeBadge planType={plan.planType}>
                            {plan.planType === PlanType.COUPLE
                              ? '💑 우리 일정'
                              : plan.planType === PlanType.SOLO_ME
                              ? '👤 내 일정'
                              : `👤 ${plan.opponentNickname}님의 일정`}
                          </PlanTypeBadge>
                        </DayPlanCardContent>
                        <PlanActions>
                          <PlanActionButton edit onClick={() => handleEditPlan(plan)}>
                            ✏️ 수정
                          </PlanActionButton>
                          <PlanActionButton delete onClick={() => handleDeletePlan(plan.id)}>
                            🗑️ 삭제
                          </PlanActionButton>
                        </PlanActions>
                      </DayPlanCard>
                    ))}
                  </DayPlansList>
                  <AddPlanFromDateButton onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(selectedDateForPlan);
                    selected.setHours(0, 0, 0, 0);

                    if (selected < today) {
                      toast.error('일정 등록은 오늘부터 가능합니다');
                      return;
                    }
                    setShowAddPlanModal(true);
                  }}>
                    ➕ 일정 추가하기
                  </AddPlanFromDateButton>
                </DayPlansSection>
              ) : (
                <EmptyState>
                  <EmptyIcon>📅</EmptyIcon>
                  <EmptyText>이 날은 아직 일정이 없습니다</EmptyText>
                  <EmptyDescription>
                    일정 추가 버튼을 클릭하여<br />새로운 일정을 등록해 보세요
                  </EmptyDescription>
                  <AddMemoryButton onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(selectedDateForPlan);
                    selected.setHours(0, 0, 0, 0);

                    if (selected < today) {
                      toast.error('일정 등록은 오늘부터 가능합니다');
                      return;
                    }
                    setShowAddPlanModal(true);
                  }}>
                    ➕ 일정 추가하기
                  </AddMemoryButton>
                </EmptyState>
              )}
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyText>일정을 클릭하여 상세 정보를 확인하세요</EmptyText>
            </EmptyState>
          )}
        </SidePanel>
      </MainContent>

      {/* 추억 등록 모달 */}
      {showAddMemoryModal && (
        <ModalOverlay onClick={() => setShowAddMemoryModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>📸 추억 등록하기</ModalTitle>
              <CloseButton onClick={() => setShowAddMemoryModal(false)}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              <InputGroup>
                <Label>제목</Label>
                <Input placeholder="추억의 제목을 입력하세요" />
              </InputGroup>
              <InputGroup>
                <Label>내용</Label>
                <Textarea placeholder="추억을 자세히 설명해주세요" rows={4} />
              </InputGroup>
              <InputGroup>
                <Label>사진</Label>
                <FileInputLabel>
                  📷 사진 선택하기
                  <FileInput type="file" accept="image/*" multiple />
                </FileInputLabel>
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={() => setShowAddMemoryModal(false)}>취소</CancelButton>
              <ConfirmButton onClick={handleAddMemory}>등록하기</ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 지출 등록 모달 */}
      {showAddExpenseModal && (
        <ModalOverlay onClick={handleCloseExpenseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>💰 지출 정보 등록하기</ModalTitle>
              <CloseButton onClick={handleCloseExpenseModal}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              {selectedPlanForExpense && (
                <SelectedPlanDisplay>
                  📌 {selectedPlanForExpense.title}
                </SelectedPlanDisplay>
              )}
              <InputGroup>
                <Label>지출 항목</Label>
                <Input
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="예: 저녁 식사, 영화 관람 등"
                />
              </InputGroup>
              <InputGroup>
                <Label>금액 (원)</Label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="최소 100원 이상"
                  min="100"
                />
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={handleCloseExpenseModal}>취소</CancelButton>
              <ConfirmButton onClick={handleAddExpense}>등록하기</ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 일정 추가 모달 */}
      {showAddPlanModal && (
        <ModalOverlay onClick={handleClosePlanModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>📅 일정 추가하기</ModalTitle>
              <CloseButton onClick={handleClosePlanModal}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              {selectedDateForPlan && (
                <SelectedDateDisplay>
                  📆 {selectedDateForPlan.getFullYear()}년 {selectedDateForPlan.getMonth() + 1}월 {selectedDateForPlan.getDate()}일
                </SelectedDateDisplay>
              )}
              <PlanTypeSection>
                <PlanTypeLabel>일정 유형을 선택하세요</PlanTypeLabel>
                <PlanTypeCards>
                  <PlanTypeCard
                    selected={selectedPlanType === PlanType.SOLO_ME}
                    onClick={() => setSelectedPlanType(PlanType.SOLO_ME)}
                    type="solo"
                  >
                    <PlanTypeIcon>👤</PlanTypeIcon>
                    <PlanTypeTitle>내 일정</PlanTypeTitle>
                    <PlanTypeDescription>개인 일정을 기록하고 연인에게 공유하세요</PlanTypeDescription>
                  </PlanTypeCard>
                  <PlanTypeCard
                    selected={selectedPlanType === PlanType.COUPLE}
                    onClick={() => setSelectedPlanType(PlanType.COUPLE)}
                    type="couple"
                  >
                    <PlanTypeIcon>💑</PlanTypeIcon>
                    <PlanTypeTitle>우리 일정</PlanTypeTitle>
                    <PlanTypeDescription>함께 할 일정을 계획해요</PlanTypeDescription>
                  </PlanTypeCard>
                </PlanTypeCards>
              </PlanTypeSection>

              <StyledInputGroup coupleMode={selectedPlanType === PlanType.COUPLE}>
                <StyledLabel coupleMode={selectedPlanType === PlanType.COUPLE}>
                  <LabelIcon>{selectedPlanType === PlanType.COUPLE ? '📌' : '📝'}</LabelIcon>
                  제목
                </StyledLabel>
                <StyledInput
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder={selectedPlanType === PlanType.COUPLE ? "함께 할 일정 제목을 입력하세요" : "일정 제목을 입력하세요"}
                  coupleMode={selectedPlanType === PlanType.COUPLE}
                />
              </StyledInputGroup>

              <StyledInputGroup coupleMode={selectedPlanType === PlanType.COUPLE}>
                <StyledLabel coupleMode={selectedPlanType === PlanType.COUPLE}>
                  <LabelIcon>{selectedPlanType === PlanType.COUPLE ? '📋' : '📄'}</LabelIcon>
                  내용
                </StyledLabel>
                <StyledTextarea
                  value={planContent}
                  onChange={(e) => setPlanContent(e.target.value)}
                  placeholder={selectedPlanType === PlanType.COUPLE ? "우리가 할 일정을 적어주세요" : "일정 내용을 입력하세요"}
                  rows={3}
                  coupleMode={selectedPlanType === PlanType.COUPLE}
                />
              </StyledInputGroup>

              <TimeSection coupleMode={selectedPlanType === PlanType.COUPLE}>
                <TimeSectionHeader>
                  <TimeSectionTitle coupleMode={selectedPlanType === PlanType.COUPLE}>
                    <TimeIcon>{selectedPlanType === PlanType.COUPLE ? '⏰' : '🕐'}</TimeIcon>
                    일정 시간
                  </TimeSectionTitle>
                  <AllDayToggle>
                    <AllDayCheckbox
                      type="checkbox"
                      id="allDay"
                      checked={isAllDay}
                      onChange={(e) => handleAllDayChange(e.target.checked)}
                      coupleMode={selectedPlanType === PlanType.COUPLE}
                    />
                    <AllDayLabel htmlFor="allDay" coupleMode={selectedPlanType === PlanType.COUPLE}>종일</AllDayLabel>
                  </AllDayToggle>
                </TimeSectionHeader>

                <TimePickerContainer>
                  <TimePickerBox disabled={isAllDay} coupleMode={selectedPlanType === PlanType.COUPLE}>
                    <TimePickerLabel coupleMode={selectedPlanType === PlanType.COUPLE}>시작</TimePickerLabel>
                    <TimePickerInput
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      disabled={isAllDay}
                    />
                  </TimePickerBox>

                  <TimeArrow coupleMode={selectedPlanType === PlanType.COUPLE}>→</TimeArrow>

                  <TimePickerBox disabled={isAllDay} coupleMode={selectedPlanType === PlanType.COUPLE}>
                    <TimePickerLabel coupleMode={selectedPlanType === PlanType.COUPLE}>종료</TimePickerLabel>
                    <TimePickerInput
                      type="time"
                      value={endTime}
                      min={startTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      disabled={isAllDay}
                    />
                  </TimePickerBox>
                </TimePickerContainer>
              </TimeSection>
              <InputGroup>
                <AlarmCheckboxWrapper>
                  <AlarmCheckbox
                    type="checkbox"
                    id="alarm"
                    checked={hasAlarm}
                    onChange={(e) => setHasAlarm(e.target.checked)}
                  />
                  <AlarmLabel htmlFor="alarm">🔔 알람 수신</AlarmLabel>
                </AlarmCheckboxWrapper>
              </InputGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={handleClosePlanModal}>취소</CancelButton>
              <ConfirmButton onClick={handleAddPlan}>등록하기</ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 이날의 총 지출 모달 */}
      {showDailyExpenseModal && selectedDateForExpense && (
        <ModalOverlay onClick={() => setShowDailyExpenseModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                💰 {selectedDateForExpense.getMonth() + 1}월 {selectedDateForExpense.getDate()}일 총 지출
              </ModalTitle>
              <CloseButton onClick={() => setShowDailyExpenseModal(false)}>✕</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DailyExpenseList>
                {getPlansForDate(selectedDateForExpense.getDate()).map((plan) => (
                  <div key={plan.id}>
                    <PlanExpenseTitle>{plan.title}</PlanExpenseTitle>
                    {plan.planExps.map((exp) =>
                      exp.planExpDetails.map((detail) => (
                        <ExpenseItem key={detail.id}>
                          <ExpenseTitle>{detail.title}</ExpenseTitle>
                          <ExpenseAmount>{detail.expenditure.toLocaleString()}원</ExpenseAmount>
                        </ExpenseItem>
                      ))
                    )}
                  </div>
                ))}
                <TotalExpense>
                  <ExpenseTitle>총 지출</ExpenseTitle>
                  <ExpenseAmount>
                    {getTotalExpenseForDate(selectedDateForExpense.getDate()).toLocaleString()}원
                  </ExpenseAmount>
                </TotalExpense>
              </DailyExpenseList>
            </ModalBody>
            <ModalFooter>
              <ConfirmButton onClick={() => setShowDailyExpenseModal(false)}>확인</ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default CalendarPage;

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

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
  grid-template-columns: 1fr 420px;
  gap: 24px;
  padding: 32px;
  max-width: 1600px;
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

interface WeekDayHeaderProps {
  dayOfWeek?: number;
}

const WeekDayHeader = styled.div<WeekDayHeaderProps>`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.dayOfWeek === 0
      ? '#ff4444'
      : props.dayOfWeek === 6
      ? '#4444ff'
      : '#666'
  };
  padding: 12px 0;
`;

interface DayCellProps {
  isEmpty?: boolean;
  isSelected?: boolean;
  isPastDate?: boolean;
}

const DayCell = styled.div<DayCellProps>`
  min-height: 140px;
  max-height: 140px;
  padding: 8px;
  border-radius: 8px;
  background: ${(props) =>
    props.isSelected
      ? '#f0f7ff'
      : props.isEmpty
      ? 'transparent'
      : props.isPastDate
      ? '#f1f3f5'
      : '#ffffff'
  };
  border: ${(props) =>
    props.isSelected
      ? '2px solid #4a9eff'
      : props.isPastDate
      ? '1px solid #e9ecef'
      : '1px solid #dee2e6'
  };
  opacity: ${(props) => (props.isPastDate ? 0.6 : 1)};
  cursor: ${(props) => (props.isEmpty ? 'default' : 'pointer')};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${(props) => (props.isSelected ? '0 4px 12px rgba(74, 158, 255, 0.2)' : 'none')};

  &:hover {
    background: ${(props) =>
      props.isSelected
        ? '#f0f7ff'
        : !props.isEmpty && !props.isPastDate
        ? '#f8f9fa'
        : props.isPastDate
        ? '#f1f3f5'
        : '#e9ecef'
    };
    transform: ${(props) => !props.isEmpty && !props.isPastDate && 'scale(1.02)'};
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

interface DayNumberProps {
  isToday?: boolean;
  isSelected?: boolean;
  dayOfWeek?: number;
}

const DayNumber = styled.div<DayNumberProps>`
  font-size: 14px;
  font-weight: ${(props) => (props.isToday || props.isSelected ? '700' : '500')};
  color: ${(props) => {
    if (props.isSelected) return '#1a73e8';
    if (props.isToday) return '#4a9eff';
    if (props.dayOfWeek === 0) return '#ff4444';
    if (props.dayOfWeek === 6) return '#4444ff';
    return '#333';
  }};
`;

const DayExpense = styled.div`
  font-size: 10px;
  color: #4a5568;
  background: rgba(74, 85, 104, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(74, 85, 104, 0.2);
    transform: scale(1.05);
  }
`;

const PlanPreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

interface PlanPreviewItemProps {
  planType: PlanType;
  isSelected?: boolean;
}

const PlanPreviewItem = styled.div<PlanPreviewItemProps>`
  background: ${(props) =>
    props.planType === PlanType.COUPLE
      ? 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 100%)'
      : props.planType === PlanType.SOLO_ME
      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
  };
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid ${(props) =>
    props.planType === PlanType.COUPLE
      ? '#ff6b9d'
      : props.planType === PlanType.SOLO_ME
      ? '#4a5568'
      : '#9c27b0'
  };

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

interface PlanTextProps {
  isSelected?: boolean;
}

const PlanTime = styled.div<PlanTextProps>`
  font-weight: 600;
  color: #666;
  margin-bottom: 2px;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlanTitle = styled.div<PlanTextProps>`
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MorePlans = styled.div`
  font-size: 10px;
  color: #666;
  text-align: center;
  margin-top: 2px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: stretch;
`;

interface QuickActionButtonProps {
  primary?: boolean;
}

const QuickActionButton = styled.button<QuickActionButtonProps>`
  flex: 1;
  padding: 14px 20px;
  background: ${(props) => (props.primary ? 'white' : 'white')};
  color: ${(props) => (props.primary ? '#4a5568' : '#4a5568')};
  border: ${(props) => (props.primary ? '2px solid #4a5568' : '2px solid #4a5568')};
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    color: white;
  }
`;

const MonthlyExpenseCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
`;

const MonthlyExpenseTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: white;
  opacity: 0.95;
`;

const MonthlyExpenseAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: white;
`;

const MonthlyRatingCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
`;

const MonthlyRatingTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  opacity: 0.95;
`;

const MonthlyRatingStars = styled.div`
  display: flex;
  gap: 4px;
`;

interface MonthlyRatingStarProps {
  filled: boolean;
}

const MonthlyRatingStar = styled.div<MonthlyRatingStarProps>`
  font-size: 20px;
  filter: ${(props) => (props.filled ? 'none' : 'grayscale(100%)')};
  opacity: ${(props) => (props.filled ? 1 : 0.3)};
`;

const MonthlyRatingValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
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

const MemorySection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const MemoryCard = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const MemoryImage = styled.img`
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
`;

const MemoryContent = styled.div``;

const MemoryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const MemoryDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
`;

const MemoryActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const MemoryActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

interface MemoryActionButtonProps {
  edit?: boolean;
  delete?: boolean;
}

const MemoryActionButton = styled.button<MemoryActionButtonProps>`
  padding: 6px 12px;
  background: ${(props) =>
    props.edit ? '#4a5568' : props.delete ? '#dc3545' : '#6c757d'
  };
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

interface LikeButtonProps {
  isLiked: boolean;
}

const LikeButton = styled.button<LikeButtonProps>`
  padding: 8px 16px;
  background: ${(props) => (props.isLiked ? '#ff6b9d' : '#f8f9fa')};
  color: ${(props) => (props.isLiked ? 'white' : '#666')};
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const RatingSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 8px;
`;

interface StarProps {
  selected: boolean;
}

const Star = styled.div<StarProps>`
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: ${(props) => (props.selected ? 'none' : 'grayscale(100%)')};
  opacity: ${(props) => (props.selected ? 1 : 0.3)};

  &:hover {
    transform: scale(1.2);
  }
`;

const RatingText = styled.div`
  font-size: 14px;
  color: #666;
`;

const RatingDisplayStars = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
`;

interface DisplayStarProps {
  filled: boolean;
}

const DisplayStar = styled.div<DisplayStarProps>`
  font-size: 24px;
  filter: ${(props) => (props.filled ? 'none' : 'grayscale(100%)')};
  opacity: ${(props) => (props.filled ? 1 : 0.3)};
`;

const RatingValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-left: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const AddMemoryButton = styled.button`
  padding: 14px 28px;
  background: white;
  color: #4a5568;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    color: white;
  }
`;

const AddExpenseButton = styled.button`
  padding: 14px 28px;
  background: white;
  color: #4a5568;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    color: white;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e9ecef;
  margin: 24px 0;
`;

const ExpenseSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExpenseItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExpenseItem = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ExpenseItemActions = styled.div`
  display: flex;
  gap: 4px;
`;

interface ExpenseActionButtonProps {
  edit?: boolean;
  delete?: boolean;
}

const ExpenseActionButton = styled.button<ExpenseActionButtonProps>`
  padding: 8px 10px;
  background: ${(props) =>
    props.edit ? '#4a5568' : props.delete ? '#dc3545' : '#6c757d'
  };
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ExpenseTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const ExpenseAmount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #4a5568;
`;

const TotalExpense = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border-radius: 8px;
  margin-top: 8px;

  ${ExpenseTitle}, ${ExpenseAmount} {
    color: white;
    font-weight: 700;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  justify-content: flex-end;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a5568;
    outline: none;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a5568;
    outline: none;
  }
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 12px 24px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    border-color: #4a5568;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PlanTypeSection = styled.div`
  margin-bottom: 24px;
`;

const PlanTypeLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  text-align: center;
`;

const PlanTypeCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

interface PlanTypeCardProps {
  selected: boolean;
  type: 'solo' | 'couple';
}

const PlanTypeCard = styled.div<PlanTypeCardProps>`
  padding: 14px 12px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${(props) =>
    props.selected
      ? props.type === 'couple'
        ? '#ff6b9d'
        : '#4a5568'
      : 'transparent'
  };
  background: ${(props) =>
    props.selected
      ? props.type === 'couple'
        ? 'linear-gradient(135deg, #fff0f6 0%, #ffe4f1 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      : '#f8f9fa'
  };
  box-shadow: ${(props) =>
    props.selected
      ? '0 4px 12px rgba(0, 0, 0, 0.1)'
      : '0 2px 8px rgba(0, 0, 0, 0.06)'
  };
  transform: ${(props) => (props.selected ? 'scale(1.02)' : 'scale(1)')};

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PlanTypeIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
`;

const PlanTypeTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 3px;
`;

const PlanTypeDescription = styled.div`
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  line-height: 1.3;
`;

interface CoupleModeProps {
  coupleMode?: boolean;
}

const StyledInputGroup = styled.div<CoupleModeProps>`
  margin-bottom: 20px;
  padding: ${(props) => (props.coupleMode ? '16px' : '0')};
  border-radius: ${(props) => (props.coupleMode ? '12px' : '0')};
  background: ${(props) =>
    props.coupleMode
      ? 'linear-gradient(135deg, #fff5f8 0%, #ffe8f0 100%)'
      : 'transparent'
  };
  border: ${(props) => (props.coupleMode ? '2px solid #ffcce0' : 'none')};
`;

const StyledLabel = styled.label<CoupleModeProps>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#2d3748')};
  margin-bottom: 8px;
`;

const LabelIcon = styled.span`
  font-size: 16px;
`;

const StyledInput = styled.input<CoupleModeProps>`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${(props) => (props.coupleMode ? '#ffb3d1' : '#e9ecef')};
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: ${(props) =>
    props.coupleMode
      ? '0 2px 8px rgba(255, 107, 157, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  &:focus {
    border-color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#4a5568')};
    outline: none;
    box-shadow: ${(props) =>
      props.coupleMode
        ? '0 4px 16px rgba(255, 107, 157, 0.2)'
        : '0 2px 8px rgba(74, 85, 104, 0.2)'
    };
  }

  &::placeholder {
    color: ${(props) => (props.coupleMode ? '#ffb3d1' : '#adb5bd')};
  }
`;

const StyledTextarea = styled.textarea<CoupleModeProps>`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${(props) => (props.coupleMode ? '#ffb3d1' : '#e9ecef')};
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  box-shadow: ${(props) =>
    props.coupleMode
      ? '0 2px 8px rgba(255, 107, 157, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  &:focus {
    border-color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#4a5568')};
    outline: none;
    box-shadow: ${(props) =>
      props.coupleMode
        ? '0 4px 16px rgba(255, 107, 157, 0.2)'
        : '0 2px 8px rgba(74, 85, 104, 0.2)'
    };
  }

  &::placeholder {
    color: ${(props) => (props.coupleMode ? '#ffb3d1' : '#adb5bd')};
  }
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const ConfirmButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.4);
  }
`;

const SelectedDateDisplay = styled.div`
  padding: 14px 20px;
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(74, 85, 104, 0.3);
`;

const SelectedPlanDisplay = styled.div`
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
`;

const TimeInputWrapper = styled.div`
  flex: 1;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a5568;
    outline: none;
  }

  &:disabled {
    background-color: #f5f7fa;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TimeSeparator = styled.div`
  padding: 12px 8px;
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
`;

const AlarmCheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const AlarmCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #4a5568;
`;

const AlarmLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
`;

const TimeSection = styled.div<CoupleModeProps>`
  background: ${(props) =>
    props.coupleMode
      ? 'linear-gradient(135deg, #fff5f8 0%, #ffe8f0 100%)'
      : '#f8f9fa'
  };
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: ${(props) =>
    props.coupleMode ? '2px solid #ffcce0' : '1px solid #e9ecef'
  };
`;

const TimeSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TimeSectionTitle = styled.div<CoupleModeProps>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#2d3748')};
`;

const TimeIcon = styled.span`
  font-size: 16px;
`;

const AllDayToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AllDayCheckbox = styled.input<CoupleModeProps>`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#4a5568')};
`;

const AllDayLabel = styled.label<CoupleModeProps>`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#4a5568')};
  cursor: pointer;
`;

const TimePickerContainer = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
`;

interface TimePickerBoxProps {
  disabled?: boolean;
  coupleMode?: boolean;
}

const TimePickerBox = styled.div<TimePickerBoxProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: ${(props) => (props.disabled ? '#e9ecef' : 'white')};
  border: 2px solid ${(props) =>
    props.disabled
      ? '#dee2e6'
      : props.coupleMode
      ? '#ffb3d1'
      : '#4a5568'
  };
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 0;
  box-shadow: ${(props) =>
    props.coupleMode && !props.disabled
      ? '0 2px 8px rgba(255, 107, 157, 0.1)'
      : 'none'
  };

  &:hover {
    border-color: ${(props) =>
      props.disabled
        ? '#dee2e6'
        : props.coupleMode
        ? '#ff6b9d'
        : '#2d3748'
    };
    box-shadow: ${(props) =>
      !props.disabled && props.coupleMode
        ? '0 4px 12px rgba(255, 107, 157, 0.2)'
        : 'none'
    };
  }
`;

const TimePickerLabel = styled.div<CoupleModeProps>`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#6c757d')};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const TimePickerInput = styled.input`
  background: transparent;
  border: none;
  color: ${(props) => (props.disabled ? '#6c757d' : '#2d3748')};
  font-size: 18px;
  font-weight: 600;
  outline: none;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  padding: 0;
  width: 100%;

  &::-webkit-calendar-picker-indicator {
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.3 : 0.6)};
  }
`;

const TimeArrow = styled.div<CoupleModeProps>`
  display: flex;
  align-items: center;
  font-size: ${(props) => (props.coupleMode ? '20px' : '18px')};
  color: ${(props) => (props.coupleMode ? '#ff6b9d' : '#6c757d')};
  font-weight: 600;
  padding-top: 18px;
`;

const DailyExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PlanExpenseTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
`;

const RestrictedSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const RestrictedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const RestrictedText = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  font-weight: 500;
`;

const PlanInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  text-align: left;
`;

const PlanInfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const PlanInfoContent = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
`;

const PlanInfoTime = styled.div`
  font-size: 14px;
  color: #4a5568;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const DayPlansSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const DayPlansHeader = styled.div`
  margin-bottom: 20px;
`;

const DayPlansTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
`;

const DayPlansList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

interface DayPlanCardProps {
  planType: PlanType;
}

const DayPlanCard = styled.div<DayPlanCardProps>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: ${(props) =>
    props.planType === PlanType.COUPLE
      ? 'linear-gradient(135deg, #ffeef8 0%, #ffe0f0 100%)'
      : props.planType === PlanType.SOLO_ME
      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
  };
  border-radius: 12px;
  border-left: 4px solid ${(props) =>
    props.planType === PlanType.COUPLE
      ? '#ff6b9d'
      : props.planType === PlanType.SOLO_ME
      ? '#4a5568'
      : '#9c27b0'
  };
  transition: all 0.3s ease;
`;

const DayPlanCardContent = styled.div`
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const DayPlanTime = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
`;

const DayPlanTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const DayPlanContent = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

interface PlanTypeBadgeProps {
  planType: PlanType;
}

const PlanTypeBadge = styled.div<PlanTypeBadgeProps>`
  display: inline-block;
  padding: 4px 12px;
  background: ${(props) =>
    props.planType === PlanType.COUPLE
      ? '#ff6b9d'
      : props.planType === PlanType.SOLO_ME
      ? '#4a5568'
      : '#9c27b0'
  };
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const AddPlanFromDateButton = styled.button`
  width: 100%;
  padding: 14px;
  background: white;
  color: #4a5568;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 85, 104, 0.3);
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    color: white;
  }
`;

const PlanActions = styled.div`
  display: flex;
  gap: 8px;
`;

interface PlanActionButtonProps {
  edit?: boolean;
  delete?: boolean;
}

const PlanActionButton = styled.button<PlanActionButtonProps>`
  flex: 1;
  padding: 8px 12px;
  background: ${(props) =>
    props.edit ? '#4a5568' : props.delete ? '#dc3545' : '#6c757d'
  };
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;
