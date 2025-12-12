package com.kyj.backend.repository.planM;

import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.dto.plan.request.FindCalenderInfoDTO;

import java.util.List;
import java.util.Optional;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 쿼리 리파지토리
 *   (Query DSL , Mybatis 등)
 *
 * */
public interface PlanMQueryRepository {

    public List<PlanM> findCalendarInfoByYm(FindCalenderInfoDTO findCalenderInfoDTO);
}
