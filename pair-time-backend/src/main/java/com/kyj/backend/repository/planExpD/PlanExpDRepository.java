package com.kyj.backend.repository.planExpD;

import com.kyj.backend.domain.plan.planExpD.PlanExpD;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 2025-12-12
 * @author 김용준
 * JPA 계획 지출 상세리파지토리
 */
public interface PlanExpDRepository extends JpaRepository<PlanExpD,Long> {
    /**
     * 지출정보 조회
     * @param planId
     * @return
     */
    List<PlanExpD> findByPlanExp_PlanM_Id(Long planId);
}
