import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import axios from 'axios';
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
  UpdatePlanGrpTempRequest,
  MainInfoResponse,
  CreatePlanRequest,
  FindCalendarInfoRequest,
  FindCalendarInfoResponse,
  CreatePlanExpRequest,
  CreatePlanPostRequest,
  PlanExpDetailResponse,
  UpdatePlanExpRequest,
  UpdatePlanResponse,
  UpdatePlanRequest,
  PlanPostResponse,
} from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  mainUIType: null,
  planGrpTempId: null,
  mainInfo: null,
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

// 메인 정보 조회 (CALENDAR 타입일 때)
export const fetchMainInfo = createAsyncThunk<MainInfoResponse>(
  'auth/fetchMainInfo',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching mainInfo from API...');
      const response = await api.get<ApiResponse<MainInfoResponse>>(
        '/api/v1/plan/mainInfo'
      );
      console.log('✅ MainInfo API Response:', response.data);
      console.log('✅ MainInfo Data:', response.data.data);

      // 백엔드 응답 구조: { data: { planGrpId, profile, nickname, ... } }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ MainInfo API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch main info');
    }
  }
);

// 일정 추가
export const createPlan = createAsyncThunk<void, CreatePlanRequest>(
  'auth/createPlan',
  async (planRequest, { rejectWithValue }) => {
    try {
      console.log('📡 Creating new plan...', planRequest);
      const response = await api.post<ApiResponse<void>>(
        '/api/v1/plan',
        planRequest
      );
      console.log('✅ Create Plan API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Create Plan API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to create plan');
    }
  }
);

// 달력 정보 조회 (월별 일정 목록)
export const fetchCalendarInfo = createAsyncThunk<FindCalendarInfoResponse[], FindCalendarInfoRequest>(
  'auth/fetchCalendarInfo',
  async (request, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching calendar info...', request);
      const response = await api.get<ApiResponse<FindCalendarInfoResponse[]>>(
        '/api/v1/plan/calendarInfo',
        {
          params: {
            targetYm: request.targetYm,
            usrId: request.usrId,
          }
        }
      );
      console.log('✅ Calendar Info API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Calendar Info API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch calendar info');
    }
  }
);

// 지출 정보 등록
export const createPlanExp = createAsyncThunk<void, CreatePlanExpRequest>(
  'auth/createPlanExp',
  async (planExpRequest, { rejectWithValue }) => {
    try {
      console.log('📡 Creating plan expense...', planExpRequest);
      const response = await api.post<ApiResponse<void>>(
        '/api/v1/planExp',
        planExpRequest
      );
      console.log('✅ Create Plan Expense API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Create Plan Expense API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to create plan expense');
    }
  }
);

// 게시글 등록
export const createPlanPost = createAsyncThunk<void, CreatePlanPostRequest>(
  'auth/createPlanPost',
  async (planPostRequest, { rejectWithValue }) => {
    try {
      console.log('📡 Creating plan post...', planPostRequest);
      console.log('📷 Image file:', planPostRequest.image);

      // FormData 생성 - DTO의 각 필드를 개별 파트로 전송
      const formData = new FormData();

      // 각 필드를 개별적으로 추가 (Spring이 자동으로 DTO 객체로 바인딩)
      formData.append('planId', planPostRequest.planId.toString());
      formData.append('title', planPostRequest.title);
      formData.append('content', planPostRequest.content);
      formData.append('fileType', planPostRequest.fileType);

      // 이미지 파일 추가
      if (planPostRequest.image) {
        formData.append('image', planPostRequest.image);
        console.log('✅ Image added to FormData:', planPostRequest.image.name, planPostRequest.image.size, 'bytes');
      }

      // FormData 내용 확인
      console.log('📦 FormData entries:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, value);
      });

      console.log('🚀 Sending request to /api/v1/planPost...');

      // 인증 토큰 가져오기
      const token = localStorage.getItem('accessToken');

      // axios를 직접 사용하여 FormData 전송 (api 인스턴스의 기본 Content-Type을 우회)
      const response = await axios.post<ApiResponse<void>>(
        '/api/v1/planPost',
        formData,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            // Content-Type을 설정하지 않으면 axios가 자동으로 multipart/form-data와 boundary 설정
          },
        }
      );
      console.log('✅ Create Plan Post API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Create Plan Post API Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || error.message || 'Failed to create plan post');
    }
  }
);

// 게시글 조회
export const fetchPlanPost = createAsyncThunk<PlanPostResponse, number>(
  'auth/fetchPlanPost',
  async (planId, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching plan post for planId:', planId);
      const response = await api.get<ApiResponse<PlanPostResponse>>(
        `/api/v1/planPost/${planId}`
      );
      console.log('✅ Plan Post API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Plan Post API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch plan post');
    }
  }
);

// 지출 상세 정보 조회
export const fetchPlanExpDetails = createAsyncThunk<PlanExpDetailResponse[], number>(
  'auth/fetchPlanExpDetails',
  async (planId, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching plan expense details for planId:', planId);
      const response = await api.get<ApiResponse<PlanExpDetailResponse[]>>(
        `/api/v1/planExp/${planId}`
      );
      console.log('✅ Plan Expense Details API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Plan Expense Details API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch plan expense details');
    }
  }
);

// 지출 상세 정보 삭제
export const deletePlanExpDetail = createAsyncThunk<void, number>(
  'auth/deletePlanExpDetail',
  async (planExpDId, { rejectWithValue }) => {
    try {
      console.log('📡 Deleting plan expense detail for planExpDId:', planExpDId);
      const response = await api.delete<ApiResponse<void>>(
        `/api/v1/planExp/${planExpDId}`
      );
      console.log('✅ Delete Plan Expense Detail API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Delete Plan Expense Detail API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to delete plan expense detail');
    }
  }
);

// 지출 상세 정보 수정
export const updatePlanExpDetail = createAsyncThunk<void, UpdatePlanExpRequest>(
  'auth/updatePlanExpDetail',
  async (updateRequest, { rejectWithValue }) => {
    try {
      console.log('📡 Updating plan expense detail:', updateRequest);
      const response = await api.put<ApiResponse<void>>(
        '/api/v1/planExp',
        updateRequest
      );
      console.log('✅ Update Plan Expense Detail API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Update Plan Expense Detail API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to update plan expense detail');
    }
  }
);

// 일정 수정 정보 조회
export const fetchPlanUpdateInfo = createAsyncThunk<UpdatePlanResponse, number>(
  'auth/fetchPlanUpdateInfo',
  async (planId, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching plan update info for planId:', planId);
      const response = await api.get<ApiResponse<UpdatePlanResponse>>(
        `/api/v1/plan/updateInfo/${planId}`
      );
      console.log('✅ Plan Update Info API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Plan Update Info API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to fetch plan update info');
    }
  }
);

// 일정 수정
export const updatePlan = createAsyncThunk<void, UpdatePlanRequest>(
  'auth/updatePlan',
  async (updateRequest, { rejectWithValue }) => {
    try {
      console.log('📡 Updating plan:', updateRequest);
      const response = await api.put<ApiResponse<void>>(
        '/api/v1/plan',
        updateRequest
      );
      console.log('✅ Update Plan API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Update Plan API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to update plan');
    }
  }
);

// 일정 삭제
export const deletePlan = createAsyncThunk<void, number>(
  'auth/deletePlan',
  async (planId, { rejectWithValue }) => {
    try {
      console.log('📡 Deleting plan for planId:', planId);
      const response = await api.delete<ApiResponse<void>>(
        `/api/v1/plan/${planId}`
      );
      console.log('✅ Delete Plan API Response:', response.data);
      return;
    } catch (error: any) {
      console.error('❌ Delete Plan API Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Failed to delete plan');
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

// 인증 확인 API 호출
export const verifyAuthentication = createAsyncThunk<void>(
  'auth/verifyAuthentication',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 [verifyAuthentication] Checking authentication...');
      await api.post('/api/v1/auth/client/verify');
      console.log('✅ [verifyAuthentication] Authenticated');
    } catch (error: any) {
      console.error('❌ [verifyAuthentication] Not authenticated:', error.response?.status);
      return rejectWithValue(error.response?.status || 401);
    }
  }
);

// 링크 초대 수락 - PlanGrpTemp의 receiver 업데이트
export const updatePlanGrpTempByLink = createAsyncThunk<void, UpdatePlanGrpTempRequest>(
  'auth/updatePlanGrpTempByLink',
  async (updateRequest, { rejectWithValue }) => {
    try {
      console.log('📡 [updatePlanGrpTempByLink] Updating with link:', updateRequest.link);
      await api.put('/api/v1/auth/invite/update', updateRequest);
      console.log('✅ [updatePlanGrpTempByLink] Update successful');
    } catch (error: any) {
      console.error('❌ [updatePlanGrpTempByLink] Error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.msg || error.response?.data?.message || '초대 링크 처리에 실패했습니다.'
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
      state.mainInfo = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    // mainUIType 초기화 (재조회를 위해)
    resetMainUIType: (state) => {
      state.mainUIType = null;
      state.planGrpTempId = null;
      state.mainInfo = null;
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
      // findMember (실패해도 글로벌 에러 설정 안함 - 정상 시나리오)
      .addCase(findMember.pending, (state) => {
        state.loading = true;
        // error는 건드리지 않음
      })
      .addCase(findMember.fulfilled, (state) => {
        state.loading = false;
        // 성공 메시지는 컴포넌트에서 처리
      })
      .addCase(findMember.rejected, (state, action) => {
        state.loading = false;
        // 조회 실패는 정상 상황이므로 글로벌 error 설정 안함
        // toast는 컴포넌트에서 처리
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
      })
      // fetchMainInfo
      .addCase(fetchMainInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainInfo.fulfilled, (state, action) => {
        console.log('🎯 Redux fetchMainInfo fulfilled with payload:', action.payload);
        state.loading = false;
        state.mainInfo = action.payload;
        console.log('🎯 State updated - mainInfo:', state.mainInfo);
      })
      .addCase(fetchMainInfo.rejected, (state, action) => {
        console.log('⚠️ Redux fetchMainInfo rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '메인 정보를 가져오는데 실패했습니다.');
      })
      // createPlan
      .addCase(createPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state) => {
        console.log('✅ Redux createPlan fulfilled');
        state.loading = false;
        toast.success('일정이 등록되었습니다! 📅');
      })
      .addCase(createPlan.rejected, (state, action) => {
        console.log('⚠️ Redux createPlan rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '일정 등록에 실패했습니다.');
      })
      // fetchCalendarInfo
      .addCase(fetchCalendarInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarInfo.fulfilled, (state) => {
        console.log('✅ Redux fetchCalendarInfo fulfilled');
        state.loading = false;
      })
      .addCase(fetchCalendarInfo.rejected, (state, action) => {
        console.log('⚠️ Redux fetchCalendarInfo rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '달력 정보 조회에 실패했습니다.');
      })
      // createPlanExp
      .addCase(createPlanExp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlanExp.fulfilled, (state) => {
        console.log('✅ Redux createPlanExp fulfilled');
        state.loading = false;
        toast.success('지출 정보가 등록되었습니다! 💰');
      })
      .addCase(createPlanExp.rejected, (state, action) => {
        console.log('⚠️ Redux createPlanExp rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '지출 등록에 실패했습니다.');
      })
      // fetchPlanExpDetails
      .addCase(fetchPlanExpDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanExpDetails.fulfilled, (state) => {
        console.log('✅ Redux fetchPlanExpDetails fulfilled');
        state.loading = false;
      })
      .addCase(fetchPlanExpDetails.rejected, (state, action) => {
        console.log('⚠️ Redux fetchPlanExpDetails rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '지출 상세 정보 조회에 실패했습니다.');
      })
      // deletePlanExpDetail
      .addCase(deletePlanExpDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlanExpDetail.fulfilled, (state) => {
        console.log('✅ Redux deletePlanExpDetail fulfilled');
        state.loading = false;
        toast.success('지출 정보가 삭제되었습니다! 🗑️');
      })
      .addCase(deletePlanExpDetail.rejected, (state, action) => {
        console.log('⚠️ Redux deletePlanExpDetail rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '지출 삭제에 실패했습니다.');
      })
      // updatePlanExpDetail
      .addCase(updatePlanExpDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlanExpDetail.fulfilled, (state) => {
        console.log('✅ Redux updatePlanExpDetail fulfilled');
        state.loading = false;
        toast.success('지출 정보가 수정되었습니다! ✏️');
      })
      .addCase(updatePlanExpDetail.rejected, (state, action) => {
        console.log('⚠️ Redux updatePlanExpDetail rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '지출 수정에 실패했습니다.');
      })
      // fetchPlanUpdateInfo
      .addCase(fetchPlanUpdateInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanUpdateInfo.fulfilled, (state) => {
        console.log('✅ Redux fetchPlanUpdateInfo fulfilled');
        state.loading = false;
      })
      .addCase(fetchPlanUpdateInfo.rejected, (state, action) => {
        console.log('⚠️ Redux fetchPlanUpdateInfo rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '일정 정보 조회에 실패했습니다.');
      })
      // updatePlan
      .addCase(updatePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state) => {
        console.log('✅ Redux updatePlan fulfilled');
        state.loading = false;
        toast.success('일정이 수정되었습니다! 📅');
      })
      .addCase(updatePlan.rejected, (state, action) => {
        console.log('⚠️ Redux updatePlan rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '일정 수정에 실패했습니다.');
      })
      // deletePlan
      .addCase(deletePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state) => {
        console.log('✅ Redux deletePlan fulfilled');
        state.loading = false;
        toast.success('일정이 삭제되었습니다! 🗑️');
      })
      .addCase(deletePlan.rejected, (state, action) => {
        console.log('⚠️ Redux deletePlan rejected with payload:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || '일정 삭제에 실패했습니다.');
      });
  },
});

export const { setAuthenticated, setUser, setToken, logout, clearError, resetMainUIType } = authSlice.actions;
export default authSlice.reducer;
