package com.kyj.backend.repository.planGrpMember;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;

import java.util.List;
import java.util.Optional;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드 정의
 *   (Query DSL , Mybatis 등)
 *
 * */
public interface PlanGrpMemberQueryRepository {

    public List<PlanGrpMember> findMainInfo(Long usrId);


}
