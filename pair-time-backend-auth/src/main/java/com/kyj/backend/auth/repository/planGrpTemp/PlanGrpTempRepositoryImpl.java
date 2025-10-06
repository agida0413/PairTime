package com.kyj.backend.auth.repository.planGrpTemp;

import com.kyj.backend.domain.member.Member;
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
     * 세션유저아이디가 초대한 가장 최신 링크 한건을 가져온다.
     * @param userId
     * @return
     */
    @Override
    public Optional<PlanGrpTemp> findFirstLinkPlanGrpTemp(Long userId) {

        return Optional.ofNullable(
               queryFactory
                .select(planGrpTemp)
                .from(planGrpTemp,planGrpTemp)
                .where(
                         planGrpTemp.sender.id.eq(userId)
                        ,planGrpTemp.isCreated.eq("N")
                )
                .orderBy(planGrpTemp.id.desc())
                .limit(1)
                .fetchOne()
       );

    }

    /**
     * 링크 기반으로 정보를 가져온다.
     * @param link
     * @return
     */
    public Optional<PlanGrpTemp> findByPlanGrpTempLink(String link){


        return Optional.ofNullable(
                queryFactory
                        .select(planGrpTemp)
                        .from(planGrpTemp)
                        .where(
                                 planGrpTemp.link.eq(link)
                                ,planGrpTemp.isCreated.eq("N")
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
