package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.domain.plan.planGrpTemp.InviteType;

/**
 * 2025-10-03
 * @author 김용준
 * Auth 서버에서 회원의 일정관리 그룹을 관리하고 CRUD하는 서비스
 *
 */
public interface PlanGrpService {

    public MainUITypeResponse determineMainUIType(Long userId);
    public void inviteMember(InviteRequest inviteRequest);
    public void inviteMemberToEmail(InviteRequest inviteRequest);
}
