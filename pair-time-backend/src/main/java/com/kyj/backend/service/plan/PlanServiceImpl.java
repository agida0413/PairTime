package com.kyj.backend.service.plan;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planExp.PlanExp;
import com.kyj.backend.domain.plan.planExpD.PlanExpD;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.dto.plan.request.*;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.MainInfoResponse;
import com.kyj.backend.dto.plan.response.PlanExpDResDTO;
import com.kyj.backend.dto.plan.response.UpdatePlanMResDTO;
import com.kyj.backend.mapper.PlanExpDEntityDTOMapper;
import com.kyj.backend.mapper.PlanMEntityDTOMapper;
import com.kyj.backend.repository.planExp.PlanExpRepository;
import com.kyj.backend.repository.planExpD.PlanExpDRepository;
import com.kyj.backend.repository.planGrp.PlanGrpRepository;
import com.kyj.backend.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.repository.planM.PlanMRepository;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.security.client.util.SecurityContext;
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
    private final PlanMEntityDTOMapper planMEntityDTOMapper;
    private final PlanExpRepository planExpRepository;
    private final PlanExpDRepository planExpDRepository;
    private final PlanExpDEntityDTOMapper planExpDEntityDTOMapper;
    /**
     * 대상월에 대한 일정의 전체 리스트를 리턴한다.
     * @param findCalenderInfoDTO
     * @return
     */
    @Override
    public List<FindCalendarInfoResDTO> findCalendarInfoByYm(FindCalenderInfoDTO findCalenderInfoDTO) {
        List<PlanM> calendarInfoByYm = planMRepository.findCalendarInfoByYm(findCalenderInfoDTO);


        return  planMEntityDTOMapper.toFindCalendarInfoResDTOList(calendarInfoByYm);
    }

    /**
     * 일정지출정보를 등록한다.
     * @param createNewPlanExpDTO
     */
    @Override
    @Transactional
    public void createPlanExp(CreateNewPlanExpDTO createNewPlanExpDTO) {
        PlanM planM = planMRepository.findById(createNewPlanExpDTO.getPlanId())
                .orElseThrow(() -> {
            log.error("고유번호에 해당하는 플랜을 찾을 수 없습니다.");
            return new KyjBizException(CmErrCode.CM002);
        });
        //지출 엔티티 생성
        PlanExp planExp = PlanExp.createPlanExp(planM);
        //지출 상세 엔티티 생성
        PlanExpD planExpD = PlanExpD.createPlanExpD(createNewPlanExpDTO.getExpenditure(), createNewPlanExpDTO.getTitle(), planExp);
        //연관관계 생성
        planExp.addPlanExpD(planExpD);

        planExpRepository.save(planExp);

    }

    private final PlanGrpMemberRepository planGrpMemberRepository;
    /**
     * 새로운 일정을 등록한다.
     */
    @Transactional
    @Override
    public void createNewPlanM(CreateNewPlanMRequest createNewPlanMRequest) {
        Long userId =Long.parseLong( SecurityContext.getUserId());
        PlanGrp planGrp = planGrpRepository.findPlanGrpToCreateNewPlan(createNewPlanMRequest.getPlanGrpId())
                .orElseThrow(() -> {
                    log.error("고유번호에 해당하는 그룹을 찾을 수 없습니다.");
                    return new KyjBizException(CmErrCode.CM002);
                });
        //새로운 일정 생성
        PlanM planM = PlanM.createPlanM(createNewPlanMRequest.getTitle(),createNewPlanMRequest.getContent(), createNewPlanMRequest.getAlarmYn()
                                    ,createNewPlanMRequest.getFullYn(),createNewPlanMRequest.getStartAt(),
                createNewPlanMRequest.getEndAt(),createNewPlanMRequest.getPlanType(), planGrp,userId);
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

    /**
     * 지출 상세정보 조회
     * @param planId
     * @return
     */
    @Override
    public List<PlanExpDResDTO> findPlanExpDList(Long planId) {
        List<PlanExpD> byPlanExpPlanMPlanId = planExpDRepository.findByPlanExp_PlanM_Id(planId);
        return planExpDEntityDTOMapper.toPlanExpDResDTOList(byPlanExpPlanMPlanId);
    }

    /**
     * 계획지출상세 삭제
     * @param planExpDId
     */
    @Override
    @Transactional
    public void deletePlanExpD(Long planExpDId) {
        PlanExpD planExpD = planExpDRepository.findById(planExpDId)
                .orElseThrow(() -> {
                    log.error("planExpDID에 해당하는 지출정보가 없음 = {}", planExpDId);
                    return  new KyjBizException(CmErrCode.CM002);
                });

        // 직접 삭제 - orphanRemoval과 cascade 설정으로 인해 연관관계 자동 정리
        planExpDRepository.delete(planExpD);
    }

    /**
     * 계획지출수정
     * @param updatePlanExpDTO
     */
    @Override
    @Transactional
    public void updatePlanExpD(UpdatePlanExpRequestDTO updatePlanExpDTO) {
        PlanExpD planExpD = planExpDRepository.findById(updatePlanExpDTO.getPlanExpDId())
                .orElseThrow(() -> {
                    log.error("planExpDID에 해당하는 지출정보가 없음 = {}", updatePlanExpDTO.getPlanExpDId());
                    return  new KyjBizException(CmErrCode.CM002);
                });

        planExpD.changePlanExpD(updatePlanExpDTO.getTitle(), updatePlanExpDTO.getExpenditure());

    }


    @Override
    @Transactional
    public UpdatePlanMResDTO findUpdatePlanM(Long planId) {
        PlanM planM = planMRepository.findById(planId)
                .orElseThrow(() -> {
                    log.error("계획 마스터를 찾을수 없습니다 = {}", planId);
                    return new KyjBizException(CmErrCode.CM002);
                });
        return planMEntityDTOMapper.toUpdatePlanMResDTO(planM);
    }

    @Override
    @Transactional
    public void updatePlanM(UpdatePlanMRequest updatePlanMRequest) {
        PlanM planM = planMRepository.findById(updatePlanMRequest.getPlanId())
                .orElseThrow(() -> {
                    log.error("계획 마스터를 찾을수 없습니다 ");
                    return new KyjBizException(CmErrCode.CM002);
                });
        planM.changePlanM(updatePlanMRequest.getTitle(),
                updatePlanMRequest.getContent(),
                updatePlanMRequest.getFullYn(),
                updatePlanMRequest.getAlarmYn(),
                updatePlanMRequest.getStartAt(),
                updatePlanMRequest.getEndAt());
    }

    @Override
    @Transactional
    public void deletePlanM(Long planId) {
        PlanM planM = planMRepository.findById(planId)
                .orElseThrow(() -> {
                    log.error("계획 마스터를 찾을수 없습니다 = {}", planId);
                    return new KyjBizException(CmErrCode.CM002);
                });

        planMRepository.delete(planM);
    }
}
