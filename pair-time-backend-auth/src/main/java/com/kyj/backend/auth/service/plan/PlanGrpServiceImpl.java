package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.request.CreatePlanGrpRequest;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.request.UpdatePlanGrpTempRequest;
import com.kyj.backend.auth.dto.planGrp.response.InviteByLinkResponse;
import com.kyj.backend.auth.dto.planGrp.response.InviteLinkResponse;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.mapper.PlanGrpTempEntityDTOMapper;
import com.kyj.backend.auth.repository.member.MemberRepository;
import com.kyj.backend.auth.repository.planGrp.PlanGrpRepository;
import com.kyj.backend.auth.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.auth.repository.planGrpTemp.PlanGrpTempRepository;
import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.AuthPlanGrpEntityFactory;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planGrpTemp.AuthPlanGrpTempEntityFactory;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planGrpTemp.InviteType;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.mail.CustomMailSender;
import com.kyj.core.mail.DynamicMailDTO;
import com.kyj.core.mail.MailDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

/**
 * 2025-10-03
 * @author 김용준
 * Auth 서버에서 회원의 일정관리 그룹을 관리하고 CRUD하는 서비스 구현체
 *
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanGrpServiceImpl implements PlanGrpService {
    @Value("${kyj.security.auth.base-link-url}")
    private String baseLinkUrl;
    private final PlanGrpMemberRepository planGrpMemberRepository;
    private final PlanGrpTempRepository planGrpTempRepository;
    private final MemberRepository memberRepository;
    private final PlanGrpRepository planGrpRepository;
    private final CustomMailSender customMailSender;
    private final PlanGrpTempEntityDTOMapper planGrpTempEntityDTOMapper;
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
            return new MainUITypeResponse(MainUIType.CALENDAR,null);
        }

        log.info("그룹미존재");

        // 2. 초대받은 내역 먼저 조회
        Optional<PlanGrpTemp> invitedOpt = planGrpTempRepository.findFirstInvitePlanGrpTemp(Boolean.TRUE, userId);
        if (invitedOpt.isPresent()) {
            log.info("초대받은 내용 있음");
            return new MainUITypeResponse(MainUIType.ALREADY_INVITED_BY,invitedOpt.orElseThrow().getId());
        }

        // 3. 내가 초대한 내역 조회
        Optional<PlanGrpTemp> sentInviteOpt = planGrpTempRepository.findFirstInvitePlanGrpTemp(Boolean.FALSE, userId);
        if (sentInviteOpt.isPresent()) {
            log.info("초대한 내용 있음");

            return new MainUITypeResponse(MainUIType.ALREADY_INVITE,sentInviteOpt.orElseThrow().getId());
        }

        // 4. 어떤 내역도 없으면
        return new MainUITypeResponse(MainUIType.REQUIRED_INVITE,null);
    }


    /**
     * 회원을 초대하는 서비스
     * @param inviteRequest
     */
    @Transactional
    public void inviteMember(InviteRequest inviteRequest){

        //보내는 이
        Member sender = memberRepository.findById(inviteRequest.getSender())
                .orElseThrow(() -> new KyjBizException(CmErrCode.CM001, "보내는 이가 누락되었습니다."));

        //불리안 타입에 따라 기존 임시그룹 삭제
        if (inviteRequest.getIsRequiredDel()){
            if(inviteRequest.getPrevPlanGrpTempId() == null){
                log.error("이전 임시아이디가 존재하지 않습니다.");
                throw new KyjBizException(CmErrCode.CM002);
            }
            PlanGrpTemp planGrpTemp = planGrpTempRepository.findById(inviteRequest.getPrevPlanGrpTempId())
                    .orElseThrow(() -> {
                        log.error("이전 임시아이디에 대한 임시그룹을 찾지 못하였습니다.");
                        return new KyjBizException(CmErrCode.CM002);
                    });
            //이전 임시그룹 삭제
            planGrpTempRepository.delete(planGrpTemp);
        }

        switch (inviteRequest.getInviteType()){
            case LINK -> {

                UUID uuid = UUID.randomUUID();
                // UUID만 링크로 사용 (이메일은 링크에 포함하지 않음)
                String link = baseLinkUrl + uuid.toString();

                inviteRequest.setLink(link);

                this.inviteMemberByLink(inviteRequest,sender);
                log.info("초대링크 생성 완료 = {} ",link);

//                if(inviteRequest.getReceiveEmail() != null){
//                    log.info("이메일 초대 전송 ={}",inviteRequest.getReceiveEmail());
//                    this.inviteMemberByEmail(inviteRequest);
//                }

                log.info("정상 초대완료 = {} ",inviteRequest.getLink());

                break;
            }
            case SEND_REQUEST -> {

                if(inviteRequest.getEmail()== null){
                    log.error("초대 전송 에러 [받는 이 누락] --> 필수 값");
                    throw new KyjBizException(CmErrCode.CM001,"받는 이가 누락되었습니다.");
                }


                Member receiver = memberRepository.findByEmail(inviteRequest.getEmail())
                        .orElseThrow(() -> new KyjBizException(CmErrCode.CM001, "받는 이가 존재하지 않습니다."));

                this.inviteMemberBySendRequest(inviteRequest,sender,receiver);

                log.info("정상 초대완료 = {} ",inviteRequest.getEmail());
                break;
            }
            default -> {
                break;
            }


        }
    }


    /**
     * 초대 링크 이메일 전송
     * @param inviteRequest
     */
    @Transactional
    public void inviteMemberToEmail(InviteRequest inviteRequest){

        String link = inviteRequest.getLink();

        if(!StringUtils.hasText(link)){
            log.error("필수값이 누락 = link");
            throw new KyjBizException(CmErrCode.CM002);
        }

        if(!StringUtils.hasText(inviteRequest.getReceiveEmail())){
            log.error("필수값이 누락 = email");
            throw new KyjBizException(CmErrCode.CM002);
        }

        PlanGrpTemp planGrpTemp = planGrpTempRepository.findByLink(link)
                .orElseThrow(() -> {
                    log.error("해당 링크에 대한 엔티티가 조회되지 않았습니다. = {}", link);
                    return new KyjBizException(CmErrCode.CM002);
                });
        //테이블 업데이트
        planGrpTemp.updateReceiveEmail(inviteRequest.getReceiveEmail());

        DynamicMailDTO dynamicMailDTO = new DynamicMailDTO("Test","Test",inviteRequest.getReceiveEmail());
        customMailSender.send(dynamicMailDTO);
    }

    /**
     * 생성된 초대에 대한 링크를 제공한다.
     * @param planGrpTempId
     * @return
     */
    @Override
    public InviteLinkResponse findLinkByInvite(Long planGrpTempId) {
        if(planGrpTempId == null){
            throw new KyjBizException(CmErrCode.CM001,"필수값이 누락되었습니다.[그룹임시아이디]");
        }

        PlanGrpTemp planGrpTemp = planGrpTempRepository.findById(planGrpTempId)
                .orElseThrow(() -> {
                    log.error("그룹임시아이디에 대한 정보를 찾을수 없습니다.");
                    return new KyjBizException(CmErrCode.CM001, "조회결과가 없습니다.");
                });

        return planGrpTempEntityDTOMapper.toInviteLinkResponse(planGrpTemp) ;
    }

    /**
     * 세션회원의 정보를 바탕으로 링크정보를 제공한다.
     * @param userId
     * @return
     */
    @Override
    public InviteLinkResponse findLinkByMember(Long userId) {
        PlanGrpTemp planGrpTemp = planGrpTempRepository.findFirstLinkPlanGrpTemp(userId)
                .orElseThrow(() -> {
                    log.error("회원의 링크정보를 찾을 수 없습니다.");
                    return new KyjBizException(CmErrCode.CM001, "회원의 링크정보를 찾을 수 없습니다.");
                });

        return planGrpTempEntityDTOMapper.toInviteLinkResponse(planGrpTemp);
    }

    /**
     * 링크정보를 바탕으로 임시그룹테이블을 찾고 임시테이블의 리시버를 업데이트한다.-->mainuitype으로 조회가 가능해진다.
     * @param updatePlanGrpTempRequest
     */
    @Override
    @Transactional
    public void updatePlanGrpTempByLinkInvite(Long userId, UpdatePlanGrpTempRequest updatePlanGrpTempRequest) {
        if(updatePlanGrpTempRequest.getLink() == null){
            log.error("링크 정보가 없습니다.");
            throw new KyjBizException(CmErrCode.CM002);
        }
        if(userId == null){
            log.error("회원 정보가 없습니다.");
            throw new KyjBizException(CmErrCode.CM002);
        }

        PlanGrpTemp planGrpTemp = planGrpTempRepository.findByPlanGrpTempLink(updatePlanGrpTempRequest.getLink())
                .orElseThrow(() -> {
                    log.error("링크정보가 없습니다.");
                    return new KyjBizException(CmErrCode.CM002);
                });

        Member member = memberRepository.findById(userId).orElseThrow(() -> {
            log.error("조회된 회원이 없습니다.");
            return new KyjBizException(CmErrCode.CM002);
        });

        //업데이트
        planGrpTemp.updateReceiver(member);

    }

    /**
     * 실제 그룹 생성
     * @param createPlanGrpRequest
     */
    @Override
    @Transactional
    public void createPlanGrp(CreatePlanGrpRequest createPlanGrpRequest) {
        PlanGrpTemp planGrpTemp = planGrpTempRepository.findById(createPlanGrpRequest.getPlanGrpTempId())
                .orElseThrow(() -> {
                    log.error("planGrpTempId에 대한 조회결과가 없음");
                    return new KyjBizException(CmErrCode.CM002);
                });

        PlanGrp planGrp = AuthPlanGrpEntityFactory.createPlanGrp(createPlanGrpRequest.getLoveStartedAt())
                .orElseThrow(() -> {
                    log.error("PlanGrp 엔티티생성 실패");
                    return new KyjBizException(CmErrCode.CM002);
                });

        //실제 그룹테이블 생성

        PlanGrpMember member1 = new PlanGrpMember.Builder().createPlanGrpMember(planGrpTemp.getReceiver(), planGrp).build();
        PlanGrpMember member2 = new PlanGrpMember.Builder().createPlanGrpMember(planGrpTemp.getSender(), planGrp).build();



        planGrp.addPlanGrpMember(planGrpTemp.getSender());

        //임시테이블 업데이트
        planGrpTemp.createPlanGrp(planGrp);

    }


//----------------------- private 메소드 영역-------------

    /**
     * 초대 링크 생성을 위한 엔티티 세팅
     * @param inviteRequest
     * @param sender
     */
    private void inviteMemberByLink(InviteRequest inviteRequest,Member sender){

        PlanGrpTemp planGrpTemp = AuthPlanGrpTempEntityFactory.createPlanGrpTemp(inviteRequest, sender)
                .orElseThrow(() -> {
                    log.error("초대 링크 생성을 위한 엔티티 생성 실패");
                    return new KyjBizException(CmErrCode.CM002);
                });

        planGrpTempRepository.save(planGrpTemp);

    }

    /**
     *  이미 가입중인 회원 초대 엔티티 세팅
     * @param inviteRequest
     * @param sender
     * @param receiver
     */
    private void inviteMemberBySendRequest(InviteRequest inviteRequest,Member sender,Member receiver){
        PlanGrpTemp planGrpTemp = AuthPlanGrpTempEntityFactory.createPlanGrpTemp(inviteRequest, sender, receiver)
                .orElseThrow(() -> {
                    log.error("이미 가입중인 회원 초대 엔티티 생성 실패");
                    return new KyjBizException(CmErrCode.CM002);
                });

        planGrpTempRepository.save(planGrpTemp);
    }
}
