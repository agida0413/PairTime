package com.kyj.backend.auth.repository.planGrpTemp;

import com.kyj.backend.domain.member.QMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planGrpTemp.QPlanGrpTemp;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import static com.kyj.backend.domain.member.QMember.*;
import static com.kyj.backend.domain.plan.planGrpTemp.QPlanGrpTemp.*;

/**
 *   2025-10-04
 *   @author 김용준
 *   JPA Repository 기본 메소드 외 동작 메소드를 구현한 구현체
 *   (Query DSL , Mybatis 등)
 *
 * */
public class PlanGrpTempRepositoryImpl implements PlanGrpTempQueryRepository{

    //querydsl
    private final JPAQueryFactory queryFactory;

    public PlanGrpTempRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    /**
     * 초대목록을 1건 가져오거나 , 초대한 목록 1건을 가져온다.
     * @return
     */
    public Optional<PlanGrpTemp> findFirstInvitePlanGrpTemp(Boolean isInvited,Long userId){

       return Optional.ofNullable(
               queryFactory
                        .selectFrom(planGrpTemp)
                        .where(
                              receiverEq(isInvited,userId)
                            , senderEq(isInvited,userId)
                            , planGrpTemp.isCreated.eq("N")
                        )
                       .orderBy(planGrpTemp.createdDate.desc())
                .limit(1)
                .fetchOne()
       );
    }

    /**
     * 초대 보낸이 혹은 받는이의 정보를 가져오기 위한 쿼리
     * @param isSender
     * @param planGrpTempId
     * @return
     */
    public Optional<PlanGrpTemp> findMemberInPlanGrpTemp(Boolean isSender, Long planGrpTempId){

        return Optional.ofNullable(
                queryFactory
                        .selectFrom(planGrpTemp)
                        .join(Boolean.TRUE.equals(isSender) ? planGrpTemp.sender : planGrpTemp.receiver,member)
                        .fetchJoin()
                        .where(
                                 planGrpTemp.id.eq(planGrpTempId)
                               , planGrpTemp.isCreated.eq("N")
                        )
                        .orderBy(planGrpTemp.createdDate.desc())
                        .limit(1)
                        .fetchOne()
        );
    }






    //------------------ 동적쿼리 소스 영역 -----------


    /**
     * 초대받은 조회 였을 때
     * @param isInvited
     * @param userId
     * @return
     */
    private BooleanExpression receiverEq(Boolean isInvited, Long userId) {
        return Boolean.TRUE.equals(isInvited) ? planGrpTemp.receiver.id.eq(userId) : null;
    }

    /**
     * 초대한 조회였을 때
     * @param isInvited
     * @param userId
     * @return
     */
    private BooleanExpression senderEq(Boolean isInvited, Long userId) {
        return Boolean.FALSE.equals(isInvited) ? planGrpTemp.sender.id.eq(userId) : null;
    }
}
