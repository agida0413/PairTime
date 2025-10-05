package com.kyj.backend.domain.plan.planGrpTemp;

import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.domain.member.Member;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/**
 * 2025-10-03
 * @author 김용준
 * DDD를 위해 엔티티 객체의 세터를 막았고 , 같은 패키지 내 클래스들만 빌더를 통해 빌더클래스를 생성할 수 있게하였다 .
 * 현재 클래스에서만 도메인별 엔티티 객체를 생성할 수 있다.
 *
 */
@Slf4j
public class AuthPlanGrpTempEntityFactory {


    public static Optional<PlanGrpTemp> createPlanGrpTemp(InviteRequest inviteRequest,Member sender, Member receiver){
        return Optional.ofNullable(
                new PlanGrpTemp.Builder()
                        .link(inviteRequest.getLink())
                        .receiveEmail(inviteRequest.getReceiveEmail())
                        .receiver(receiver)
                        .sender(sender)
                        .build()
        );
    }


    public static Optional<PlanGrpTemp> createPlanGrpTemp(InviteRequest inviteRequest,Member sender){
        return Optional.ofNullable(
                new PlanGrpTemp.Builder()
                        .link(inviteRequest.getLink())
                        .receiveEmail(inviteRequest.getReceiveEmail())
                        .sender(sender)
                        .build()
        );
    }

}
