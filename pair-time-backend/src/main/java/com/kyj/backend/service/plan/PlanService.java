package com.kyj.backend.service.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanExpDTO;
import com.kyj.backend.dto.plan.request.CreateNewPlanMRequest;
import com.kyj.backend.dto.plan.request.FindCalenderInfoDTO;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.MainInfoResponse;
import com.kyj.backend.dto.plan.response.PlanExpDResDTO;

import java.util.List;

/**
 * 2025-10-08
 * @author 김용준
 * 계획에 관한 서비스
 */
public interface PlanService {
    public void createNewPlanM(CreateNewPlanMRequest createNewPlanMRequest);
    public MainInfoResponse findMainInfo(Long userId);

    public void createPlanExp(CreateNewPlanExpDTO createNewPlanExpDTO);
    public List<FindCalendarInfoResDTO> findCalendarInfoByYm(FindCalenderInfoDTO findCalenderInfoDTO);
    public List<PlanExpDResDTO> findPlanExpDList(Long planId);
}
