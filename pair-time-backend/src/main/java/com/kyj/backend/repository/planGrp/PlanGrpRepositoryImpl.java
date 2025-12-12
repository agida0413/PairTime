package com.kyj.backend.repository.planGrp;


import com.kyj.backend.domain.member.QMember;
import com.kyj.backend.domain.plan.plaGrpMember.QPlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planGrp.QPlanGrp;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.kyj.backend.domain.member.QMember.member;
import static com.kyj.backend.domain.plan.plaGrpMember.QPlanGrpMember.planGrpMember;
import static com.kyj.backend.domain.plan.planGrp.QPlanGrp.planGrp;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드를 구현한 구현체
 *   (Query DSL , Mybatis 등)
 *
 * */
public class PlanGrpRepositoryImpl implements PlanGrpQueryRepository {
    private final JPAQueryFactory queryFactory;

    public PlanGrpRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    /**
     * 일정을 생성하기 위한 조회
     * @param planGrpId
     * @return
     */
    public Optional<PlanGrp> findPlanGrpToCreateNewPlan(Long planGrpId){

     return Optional.ofNullable (
             queryFactory
                        .select(planGrp)
                        .from(planGrp)
                        .join(planGrp.planGrpMembers, planGrpMember).fetchJoin()
                        .join(planGrpMember.member, member).fetchJoin()
                        .where(planGrp.id.eq(planGrpId))
                        .fetchOne()
      );
    }

}
