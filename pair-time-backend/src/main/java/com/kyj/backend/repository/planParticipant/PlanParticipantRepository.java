package com.kyj.backend.repository.planParticipant;

import com.kyj.backend.domain.plan.planParticipant.PlanParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
/**
 * 2025-10-08
 * @author 김용준
 * JPA PlanParticipant 리파지토리
 */
public interface PlanParticipantRepository extends JpaRepository<PlanParticipant,Long> {
}
