package com.kyj.backend.domain.plan.planGrp;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 2025-10-03
 * @author 김용준
 * DDD를 위해 엔티티 객체의 세터를 막았고 , 같은 패키지 내 클래스들만 빌더를 통해 빌더클래스를 생성할 수 있게하였다 .
 * 현재 클래스에서만 도메인별 엔티티 객체를 생성할 수 있다.
 *
 */
@Slf4j
public class AuthPlanGrpEntityFactory {
    /**
     * 신규 그룹생성 엔티티
     * @param loveStartedAt
     * @return
     */
    public static Optional<PlanGrp> createPlanGrp(LocalDate loveStartedAt){
        return Optional.ofNullable(
                new PlanGrp.Builder()
                        .loveStartAt(loveStartedAt)
                        .build()
        );
    }
}
