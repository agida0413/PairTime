import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import {
  AuthState,
  MainUITypeResponse,
  ApiResponse,
  Member,
  InviteRequest,
  MemberFindRequest,
  MainUIType,
  InviteMemberResponse,
  InviteLinkResponse,
} from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  mainUIType: null,
  planGrpTempId: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchMainUIType = createAsyncThunk<MainUITypeResponse>(
  'auth/fetchMainUIType',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching mainUIType from API...');
      const response = await api.get<any>(
        '/api/v1/auth/mainUI'
      );
      console.log('✅ API Response:', response.data);
      console.log('✅ Data.data:', response.data.data);

      // 백엔드 응답 구조: { data: { mainUIType: 'XXX' } }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch UI type');
    }
  }
);

export const inviteMember = createAsyncThunk<ApiResponse<void>, InviteRequest>(
  'auth/inviteMember',
  async (inviteRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<void>>('/api/v1/auth/invite', inviteRequest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to invite member');
    }
  }
);

export const inviteMemberByEmail = createAsyncThunk<ApiResponse<void>, InviteRequest>(
  'auth/inviteMemberByEmail',
  async (inviteRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<void>>('/api/v1/auth/invite/email', inviteRequest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to send email invitation');
    }
  }
);

export const findMember = createAsyncThunk<{ data: Member; msg: string }, MemberFindRequest>(
  'auth/findMember',
  async (memberFindRequest, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Member>>('/api/v1/auth/member', {
        params: memberFindRequest,
      });
      return { data: response.data.data, msg: response.data.msg };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to find member');
    }
  }
);

// 초대 회원 정보 조회 (초대한 사람 또는 초대받은 사람)
export const findInviteMember = createAsyncThunk<
  InviteMemberResponse,
  { planGrpTempId: number; mainUIType: MainUIType }
>(
  'auth/findInviteMember',
  async ({ planGrpTempId, mainUIType }, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<InviteMemberResponse>>(
        `/api/v1/auth/invite/member/${planGrpTempId}`,
        { params: { mainUIType } }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || error.response?.data?.message || 'Failed to find invite member'
      );
    }
  }
);

// 초대 링크 정보 조회 (planGrpTempId 기반)
export const findInviteLink = createAsyncThunk<InviteLinkResponse, number>(
  'auth/findInviteLink',
  async (planGrpTempId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<InviteLinkResponse>>(
        `/api/v1/auth/invite/link/${planGrpTempId}`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || error.response?.data?.message || 'Failed to find invite link'
      );
    }
  }
);

// 현재 세션(초대한 사람) 기반 링크 정보 조회
export const findMyInviteLink = createAsyncThunk<InviteLinkResponse>(
  'auth/findMyInviteLink',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<InviteLinkResponse>>(
        '/api/v1/auth/invite/member/link'
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.msg || error.response?.data?.message || 'Failed to find my invite link'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<Member | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.mainUIType = null;
      state.planGrpTempId = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMainUIType
      .addCase(fetchMainUIType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainUIType.fulfilled, (state, action) => {
        console.log('🎯 Redux fulfilled with payload:', action.payload);
        state.loading = false;
        state.mainUIType = action.payload.mainUIType;
        state.planGrpTempId = action.payload.planGrpTempId;
        console.log('🎯 State updated - mainUIType:', state.mainUIType, 'planGrpTempId:', state.planGrpTempId);
      })
      .addCase(fetchMainUIType.rejected, (state, action) => {
        console.log('⚠️ Redux rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '인증 정보를 가져오는데 실패했습니다.');
      })
      // inviteMember
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state) => {
        state.loading = false;
        // 성공 메시지는 컴포넌트에서 처리
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '초대 전송에 실패했습니다.');
      })
      // inviteMemberByEmail
      .addCase(inviteMemberByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteMemberByEmail.fulfilled, (state) => {
        state.loading = false;
        // 성공 메시지는 컴포넌트에서 처리
      })
      .addCase(inviteMemberByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '이메일 전송에 실패했습니다.');
      })
      // findMember
      .addCase(findMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findMember.fulfilled, (state) => {
        state.loading = false;
        // 성공 메시지는 컴포넌트에서 처리
      })
      .addCase(findMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '회원을 찾을 수 없습니다.');
      })
      // findInviteMember (실패해도 글로벌 에러 설정 안함 - 정상 시나리오)
      .addCase(findInviteMember.pending, (state) => {
        state.loading = true;
        // error는 건드리지 않음
      })
      .addCase(findInviteMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(findInviteMember.rejected, (state) => {
        state.loading = false;
        // 조회 실패는 정상 상황이므로 글로벌 error 설정 안함
      })
      // findInviteLink (실패해도 글로벌 에러 설정 안함 - 정상 시나리오)
      .addCase(findInviteLink.pending, (state) => {
        state.loading = true;
        // error는 건드리지 않음
      })
      .addCase(findInviteLink.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(findInviteLink.rejected, (state) => {
        state.loading = false;
        // 조회 실패는 정상 상황이므로 글로벌 error 설정 안함
      })
      // findMyInviteLink (실패해도 글로벌 에러 설정 안함)
      .addCase(findMyInviteLink.pending, (state) => {
        state.loading = true;
        // error는 건드리지 않음
      })
      .addCase(findMyInviteLink.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(findMyInviteLink.rejected, (state) => {
        state.loading = false;
        // 조회 실패는 정상 상황이므로 글로벌 error 설정 안함
      });
  },
});

export const { setAuthenticated, setUser, setToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
