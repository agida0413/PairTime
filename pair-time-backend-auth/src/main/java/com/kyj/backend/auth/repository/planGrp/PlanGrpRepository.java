package com.kyj.backend.auth.repository.planGrp;

import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 2025-10-04
 * @author 김용준
 * JPA 계획 그룹 리파지토리
 */
public interface PlanGrpRepository extends JpaRepository<PlanGrp,Long> ,PlanGrpQueryRepository{

    /**
     * 이미 존재하는 그룹이 있는지 확인하는 메소드이다.
     * userId1  = x or userId2 = x --> limit 1반환
     * @param userId1
     * @param userId2
     * @return
     */
    Optional<PlanGrp> findFirstByUserId1OrUserId2(Long userId1, Long userId2);

}
