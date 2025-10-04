package com.kyj.backend.auth.service.planGrp;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.repository.planGrp.PlanGrpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 2025-10-03
 * @author 김용준
 * Auth 서버에서 회원의 일정관리 그룹을 관리하고 CRUD하는 서비스 구현체
 *
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanGrpServiceImpl implements PlanGrpService{

    private final PlanGrpRepository planGrpRepository;

    /**
     * 메인UI타입을 결정하는 서비스 메소드
     * @param userId
     * @return
     */
    @Override
    public MainUITypeResponse determineMainUIType(Long userId) {



//        planGrpRepository.findFirstByUserId1OrUserId2(userId,userId)
//                .map(planGrp -> {
//                    log.info("그룹존재[그룹아이디] ={}",planGrp.getId());
//                    return new MainUITypeResponse(MainUIType.CALENDAR);
//                })
//                .orElseGet(()->{
//                    log.info("그룹미존재");
//
//                });
//        return null;
    }
}
