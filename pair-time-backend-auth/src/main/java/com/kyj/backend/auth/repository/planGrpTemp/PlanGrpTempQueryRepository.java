package com.kyj.backend.auth.repository.planGrpTemp;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;

import java.util.Optional;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드 정의
 *   (Query DSL , Mybatis 등)
 *
 * */
public interface PlanGrpTempQueryRepository {
    public Optional<PlanGrpTemp> findFirstInvitePlanGrpTemp(Boolean isInvited,Long userId);
    public Optional<PlanGrpTemp> findFirstLinkPlanGrpTemp(Long userId);
    }
