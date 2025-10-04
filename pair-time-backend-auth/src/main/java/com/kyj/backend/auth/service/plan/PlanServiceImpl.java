package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.auth.repository.planGrpTemp.PlanGrpTempRepository;
import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 2025-10-03
 * @author 김용준
 * Auth 서버에서 회원의 일정관리 그룹을 관리하고 CRUD하는 서비스 구현체
 *
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService {

    private final PlanGrpMemberRepository planGrpMemberRepository;
    private final PlanGrpTempRepository planGrpTempRepository;
    /**
     * 메인UI타입을 결정하는 서비스 메소드
     * @param userId
     * @return
     */
    @Override
    public MainUITypeResponse determineMainUIType(Long userId) {

        // 1. 먼저 그룹에 속한 멤버인지 체크
        Optional<PlanGrpMember> memberOpt = planGrpMemberRepository.findFirstByMember_Id(userId);

        if (memberOpt.isPresent()) {
            log.info("그룹존재[그룹멤버아이디] = {}", memberOpt.get().getId());
            return new MainUITypeResponse(MainUIType.CALENDAR);
        }

        log.info("그룹미존재");

        // 2. 초대받은 내역 먼저 조회
        Optional<PlanGrpTemp> invitedOpt = planGrpTempRepository.findFirstInvitePlanGrpTemp(Boolean.TRUE, userId);
        if (invitedOpt.isPresent()) {
            log.info("초대받은 내용 있음");
            return new MainUITypeResponse(MainUIType.ALREADY_INVITED_BY);
        }

        // 3. 내가 초대한 내역 조회
        Optional<PlanGrpTemp> sentInviteOpt = planGrpTempRepository.findFirstInvitePlanGrpTemp(Boolean.FALSE, userId);
        if (sentInviteOpt.isPresent()) {
            log.info("초대한 내용 있음");
            return new MainUITypeResponse(MainUIType.ALREADY_INVITE);
        }

        // 4. 어떤 내역도 없으면
        return new MainUITypeResponse(MainUIType.REQUIRED_INVITE);
    }
}
