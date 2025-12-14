package com.kyj.backend.repository.planExp;

import com.kyj.backend.domain.plan.planExp.PlanExp;
import com.kyj.backend.domain.plan.planExpD.PlanExpD;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 2025-12-12
 * @author 김용준
 * JPA 계획 지출 리파지토리
 */
public interface PlanExpRepository extends JpaRepository<PlanExp,Long> {

}
