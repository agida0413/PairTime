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
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: Member | null;
  token: string | null;
  mainUIType: MainUIType | null;
  loading: boolean;
  error: string | null;
}
