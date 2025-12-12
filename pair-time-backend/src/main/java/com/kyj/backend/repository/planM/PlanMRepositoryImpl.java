package com.kyj.backend.repository.planM;

import com.kyj.backend.domain.plan.plaGrpMember.QPlanGrpMember;
import com.kyj.backend.domain.plan.planExp.QPlanExp;
import com.kyj.backend.domain.plan.planExpD.QPlanExpD;
import com.kyj.backend.domain.plan.planGrp.QPlanGrp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planM.QPlanM;
import com.kyj.backend.domain.plan.planParticipant.QPlanParticipant;
import com.kyj.backend.dto.plan.request.FindCalenderInfoDTO;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;

import java.util.List;

import static com.kyj.backend.domain.plan.planExp.QPlanExp.*;
import static com.kyj.backend.domain.plan.planExpD.QPlanExpD.*;
import static com.kyj.backend.domain.plan.planM.QPlanM.*;
import static com.querydsl.jpa.JPAExpressions.*;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드를 구현한 구현체
 *   (Query DSL , Mybatis 등)
 *
 * */
public class PlanMRepositoryImpl implements PlanMQueryRepository{
    private final JPAQueryFactory queryFactory;

    public PlanMRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }
    /**
     * 대상월에 대한 일정 전체를 보여준다.
     * @param findCalenderInfoDTO
     * @return
     */
    @Override
    public List<PlanM> findCalendarInfoByYm(FindCalenderInfoDTO findCalenderInfoDTO) {

        QPlanGrp subQplanGrp = new QPlanGrp("subQplanGrp");
        QPlanGrpMember subQplanGrpMember = new QPlanGrpMember("subQplanGrpMember");



        return queryFactory
                .selectFrom(planM)
                .join(planM.planParticipants,QPlanParticipant.planParticipant).fetchJoin()
                .where(planM.startYm.eq(findCalenderInfoDTO.getTargetYm())
                        , planM.planGrp.id.eq(
                                        select(subQplanGrp.id)
                                        .from(subQplanGrp)
                                        .join(subQplanGrp.planGrpMembers,subQplanGrpMember)
                                        .where(subQplanGrpMember.member.id.eq(findCalenderInfoDTO.getUsrId()))
                                        .orderBy(subQplanGrp.createdDate.desc())
                                        .limit(1)
                        )
                        ,planM.delYn.eq("N")
                )
                .fetch();

    }
}
