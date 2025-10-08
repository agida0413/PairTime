package com.kyj.backend.repository.planGrp;


import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 2025-10-04
 * @author 김용준
 * JPA 계획 그룹 리파지토리
 */
public interface PlanGrpRepository extends JpaRepository<PlanGrp,Long> , PlanGrpQueryRepository {


}
