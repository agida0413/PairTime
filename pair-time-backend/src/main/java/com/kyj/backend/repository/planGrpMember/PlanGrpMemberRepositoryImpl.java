package com.kyj.backend.repository.planGrpMember;


import com.kyj.backend.domain.member.QMember;
import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.plaGrpMember.QPlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.QPlanGrp;
import com.kyj.backend.domain.plan.planGrpTemp.QPlanGrpTemp;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import static com.kyj.backend.domain.member.QMember.member;
import static com.kyj.backend.domain.plan.plaGrpMember.QPlanGrpMember.planGrpMember;
import static com.kyj.backend.domain.plan.planGrp.QPlanGrp.planGrp;
import static com.kyj.backend.domain.plan.planGrpTemp.QPlanGrpTemp.planGrpTemp;
import static com.querydsl.jpa.JPAExpressions.*;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드를 구현한 구현체
 *   (Query DSL , Mybatis 등)
 *
 * */
public class PlanGrpMemberRepositoryImpl implements PlanGrpMemberQueryRepository {
    private final JPAQueryFactory queryFactory;

    public PlanGrpMemberRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    /**
     * 메인화면에서 기본정보를 제공
     * @param usrId
     * @return
     */
    public List<PlanGrpMember> findMainInfo(Long usrId){

        QPlanGrpMember subQPlanGrpMember = new QPlanGrpMember("subQPlanGrpMember");

        return  queryFactory
                .select(planGrpMember)
                .from(planGrpMember)
                .join(planGrpMember.planGrp,planGrp).fetchJoin()
                .join(planGrpMember.member, member).fetchJoin()
                .where(planGrpMember.planGrp.eq(
                                     select(subQPlanGrpMember.planGrp)
                                    .from(subQPlanGrpMember)
                                    .where(subQPlanGrpMember.member.id.eq(usrId))
                ))
                .fetch();
    }
}
