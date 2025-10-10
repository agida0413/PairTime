package com.kyj.backend.service.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanMRequest;
import com.kyj.backend.dto.plan.response.MainInfoResponse;

/**
 * 2025-10-08
 * @author 김용준
 * 계획에 관한 서비스
 */
public interface PlanService {
    public void createNewPlanM(CreateNewPlanMRequest createNewPlanMRequest);
    public MainInfoResponse findMainInfo(Long userId);
}
