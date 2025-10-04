package com.kyj.backend.auth.repository.planGrpTemp;

import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import org.springframework.data.jpa.repository.JpaRepository;
/**
 * 2025-10-04
 * @author 김용준
 * JPA 그룹임시 리파지토리
 */
public interface PlanGrpTempRepository extends JpaRepository<PlanGrpTemp,Long> ,PlanGrpTempQueryRepository{
}
