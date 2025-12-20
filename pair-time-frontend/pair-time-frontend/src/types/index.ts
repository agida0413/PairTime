// API Response Types
export interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
  code: string | null;
  resTime: string;
  success: boolean;
}

// Member Types
export interface Member {
  profile: string;
  nickname: string;
  email: string;
}

export interface MemberFindRequest {
  email: string;
}

// Main UI Type Enum
export enum MainUIType {
  CALENDAR = 'CALENDAR',
  REQUIRED_INVITE = 'REQUIRED_INVITE',
  ALREADY_INVITED_BY = 'ALREADY_INVITED_BY',
  ALREADY_INVITE = 'ALREADY_INVITE',
}

export interface MainUITypeResponse {
  mainUIType: MainUIType;
  planGrpTempId: number;
}

// Invite Member Response - 초대한/받은 회원 정보
export interface InviteMemberResponse {
  email: string;
  nickname: string;
  profile: string;
}

// Invite Link Response - 초대 링크 정보
export interface InviteLinkResponse {
  link: string;
}

// Update PlanGrpTemp Request - 링크 초대 수락 시 receiver 업데이트
export interface UpdatePlanGrpTempRequest {
  link: string;
}

// Invite Types
export enum InviteType {
  LINK = 'LINK',
  SEND_REQUEST = 'SEND_REQUEST',
}

export interface InviteRequest {
  link?: string;
  email?: string;
  sender?: number;
  receiveEmail?: string;
  inviteType: InviteType;
  isRequiredDel?: boolean;  // 기존 임시 그룹 삭제 여부
  prevPlanGrpTempId?: number;  // 삭제할 기존 임시 그룹 ID
}

// Main Info Response - 캘린더 메인 정보
export interface MainInfoResponse {
  planGrpId: number;
  profile: string;
  nickname: string;
  opponentNickname: string;
  opponentProfile: string;
  loveDday: number;
}

// Create Plan Request - 일정 추가 요청
export interface CreatePlanRequest {
  planType: 'COUPLE' | 'SOLO';  // 일정 타입
  title: string;
  content: string;
  fullYn: 'Y' | 'N';  // 하루종일 여부
  alarmYn: 'Y' | 'N';  // 알람 여부
  startAt: string;  // ISO 8601 형식 (YYYY-MM-DDTHH:mm:ss)
  endAt: string;  // ISO 8601 형식 (YYYY-MM-DDTHH:mm:ss)
  planGrpId: number;
}

// Calendar Info Request - 달력 정보 조회 요청
export interface FindCalendarInfoRequest {
  targetYm: string;  // YYYY-MM 형식
  usrId: number;
}

// Calendar UI Type - 달력에서 구분하는 일정 타입
export enum PlanCalendarUIType {
  MY = 'MY',
  OPPOSITE = 'OPPOSITE',
  COUPLE = 'COUPLE'
}

// Calendar Info Response - 달력 정보 조회 응답
export interface FindCalendarInfoResponse {
  planCalendarUIType: PlanCalendarUIType;
  planId: number;
  title: string;
  content: string;
  alarmYn: string;
  fullYn: string;
  startAt: string;  // ISO 8601 형식
  endAt: string;    // ISO 8601 형식
  planType: 'COUPLE' | 'SOLO';
  startYm: string;  // YYYY-MM 형식
  startYmd: string; // YYYY-MM-DD 형식
}

// Create Plan Expense Request - 지출 정보 등록 요청
export interface CreatePlanExpRequest {
  title: string;        // 지출제목 (필수)
  expenditure: number;  // 지출금액 (최소 100)
  planId: number;       // 일정 고유번호 (최소 1)
}

// Plan Expense Detail Response - 지출 상세 정보 조회 응답
export interface PlanExpDetailResponse {
  planExpDId: number;   // 지출 상세 고유번호
  title: string;        // 지출 항목 제목
  expenditure: number;  // 지출 금액
}

// Update Plan Expense Request - 지출 정보 수정 요청
export interface UpdatePlanExpRequest {
  planExpDId: number;   // 지출 상세 고유번호 (최소 1)
  title: string;        // 지출제목 (필수)
  expenditure: number;  // 지출금액 (최소 100)
}

// Update Plan Response - 일정 수정 정보 조회 응답
export interface UpdatePlanResponse {
  planType: 'COUPLE' | 'SOLO';
  title: string;
  content: string;
  fullYn: 'Y' | 'N';
  alarmYn: 'Y' | 'N';
  startAt: string;  // ISO 8601 형식
  endAt: string;    // ISO 8601 형식
}

// File Type Enum
export enum FileType {
  IMG = 'IMG',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

// Create Plan Post Request - 게시글 등록 요청
export interface CreatePlanPostRequest {
  planId: number;       // 일정 고유번호 (최소 1)
  title: string;        // 제목 (필수)
  content: string;      // 내용 (필수)
  image?: File;         // 이미지 파일 (선택)
  fileType: FileType;   // 파일 타입 (필수)
}

// Update Plan Request - 일정 수정 요청
export interface UpdatePlanRequest {
  planId: number;       // 일정 고유번호 (최소 1)
  planType: 'COUPLE' | 'SOLO';
  title: string;        // 제목 (최대 50자)
  content: string;      // 내용 (최대 300자)
  fullYn: 'Y' | 'N';    // 하루종일 여부
  alarmYn: 'Y' | 'N';   // 알람 여부
  startAt: string;      // ISO 8601 형식
  endAt: string;        // ISO 8601 형식
}

// Plan Post Response - 게시글 조회 응답
export interface PlanPostResponse {
  PlanPostId: number;   // 게시글 고유번호
  title: string;        // 제목
  content: string;      // 내용
  imageUrl: string[];   // 이미지 URL 목록
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: Member | null;
  token: string | null;
  mainUIType: MainUIType | null;
  planGrpTempId: number | null;
  mainInfo: MainInfoResponse | null;
  loading: boolean;
  error: string | null;
}
