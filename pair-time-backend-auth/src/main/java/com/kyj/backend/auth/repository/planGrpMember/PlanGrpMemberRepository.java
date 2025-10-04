package com.kyj.backend.auth.repository.planGrpMember;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 2025-10-04
 * @author 김용준
 * JPA 계획 그룹맴버 리파지토리
 */
public interface PlanGrpMemberRepository extends JpaRepository<PlanGrpMember,Long>,PlanGrpMemberQueryRepository {
    public Optional<PlanGrpMember> findFirstByMember_Id(Long userId);

}
