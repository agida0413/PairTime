package com.kyj.backend.auth.repository.member;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.member.QMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;

import java.util.Optional;

import static com.kyj.backend.domain.plan.planGrpTemp.QPlanGrpTemp.planGrpTemp;

public class MemberRepositoryImpl implements MemberQueryRepository{

    //querydsl
    private final JPAQueryFactory queryFactory;

    public MemberRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    /**
     * 초대 보낸이 혹은 받는이의 정보를 가져오기 위한 쿼리
     * @param isSender
     * @param planGrpTempId
     * @return
     */
    public Optional<Member> findMemberInPlanGrpTemp(Boolean isSender, Long planGrpTempId){

        return Optional.ofNullable(
                queryFactory
                        .select(Boolean.TRUE.equals(isSender) ? planGrpTemp.sender : planGrpTemp.receiver)
                        .from(planGrpTemp)
                        .where(
                                planGrpTemp.id.eq(planGrpTempId)
                                , planGrpTemp.isCreated.eq("N")
                        )
                        .orderBy(planGrpTemp.createdDate.desc())
                        .limit(1)
                        .fetchOne()
        );
    }


}
