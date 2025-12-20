package com.kyj.backend.service.planPost;

import com.kyj.backend.dto.plan.request.CreateNewPlanPostDTO;
import com.kyj.backend.dto.plan.response.PlanPostResDTO;

/**
 * 2025-12-20
 * @author 김용준
 * 계획 게시글에 관한 서비스
 */
public interface PlanPostService {

    public void savePlanPost(CreateNewPlanPostDTO createNewPlanPostDTO);
    public PlanPostResDTO findPlanPost(Long planId);
}
