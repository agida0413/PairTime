package com.kyj.backend.service.plan;

import com.kyj.backend.dto.plan.request.*;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.MainInfoResponse;
import com.kyj.backend.dto.plan.response.PlanExpDResDTO;
import com.kyj.backend.dto.plan.response.UpdatePlanMResDTO;

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

    public void deletePlanExpD(Long planExpDId);
    public void updatePlanExpD(UpdatePlanExpRequestDTO updatePlanExpDTO);

    public UpdatePlanMResDTO findUpdatePlanM(Long planId);
    public void updatePlanM(UpdatePlanMRequest updatePlanMRequest);
    public void deletePlanM(Long planId);

}
