package com.kyj.backend.service.plan;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.dto.plan.request.CreateNewPlanMRequest;
import com.kyj.backend.dto.plan.response.MainInfoResponse;
import com.kyj.backend.repository.planGrp.PlanGrpRepository;
import com.kyj.backend.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.repository.planM.PlanMRepository;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 2025-10-08
 * @author 김용준
 * 계획에 관한 서비스 구현체
 */
@RequiredArgsConstructor
@Service
@Slf4j
@Transactional(readOnly = true)
public class PlanServiceImpl implements PlanService{
    private final PlanMRepository planMRepository;
    private final PlanGrpRepository planGrpRepository;
    private final PlanGrpMemberRepository planGrpMemberRepository;
    /**
     * 새로운 일정을 등록한다.
     */
    @Transactional
    @Override
    public void createNewPlanM(CreateNewPlanMRequest createNewPlanMRequest) {

        PlanGrp planGrp = planGrpRepository.findById(createNewPlanMRequest.getPlanGrpId())
                .orElseThrow(() -> {
                    log.error("고유번호에 해당하는 그룹을 찾을 수 없습니다.");
                    return new KyjBizException(CmErrCode.CM002);
                });
        //새로운 일정 생성
        PlanM planM = PlanM.createPlanM(createNewPlanMRequest.getTitle(),createNewPlanMRequest.getContent(), createNewPlanMRequest.getAlarmYn()
                                    ,createNewPlanMRequest.getFullYn(),createNewPlanMRequest.getStartAt(),
                createNewPlanMRequest.getEndAt(),createNewPlanMRequest.getPlanType(), planGrp);
        //저장
        planMRepository.save(planM);
    }

    /**
     * 메인화면에서의 기본정보를 리턴한다.
     * @param userId
     * @return
     */
    public MainInfoResponse findMainInfo(Long userId){

        List<PlanGrpMember> mainInfo = planGrpMemberRepository.findMainInfo(userId);

        MainInfoResponse mainInfoResponse = new MainInfoResponse();

        if (mainInfo.size() !=2 ){
            log.error("mainInfo의 조회결과가 올바르지않음(없거나 2가 아님)");
            throw new KyjBizException(CmErrCode.CM002);
        }

        int stackCnt=0;

        for (PlanGrpMember planGrpMember : mainInfo) {


            if (planGrpMember.getMember().getId().equals(userId)){
                mainInfoResponse.setProfile(planGrpMember.getMember().getProfile());
                mainInfoResponse.setNickname(planGrpMember.getMember().getNickname());

                Long planGrpId = planGrpMember.getPlanGrp().getId();
                LocalDate now = LocalDate.now();
                LocalDate loveStartAt = planGrpMember.getPlanGrp().getLoveStartAt();

                Long loveDday = ChronoUnit.DAYS.between(loveStartAt, now);

                mainInfoResponse.setPlanGrpId(planGrpId);
                mainInfoResponse.setLoveDday(loveDday);
                stackCnt++;
            }else{
                mainInfoResponse.setOpponentProfile(planGrpMember.getMember().getProfile());
                mainInfoResponse.setOpponentNickname(planGrpMember.getMember().getNickname());
                stackCnt++;

            }
        }

        if(stackCnt != 2){
            log.error("mainInfoResponse DTO적재에 실패함 ");
            throw new KyjBizException(CmErrCode.CM002);
        }
        return mainInfoResponse;
    }
}
