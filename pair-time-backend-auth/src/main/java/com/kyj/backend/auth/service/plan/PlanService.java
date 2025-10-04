package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;

/**
 * 2025-10-03
 * @author 김용준
 * Auth 서버에서 회원의 일정관리 그룹을 관리하고 CRUD하는 서비스
 *
 */
public interface PlanService {

    public MainUITypeResponse determineMainUIType(Long userId);
}
