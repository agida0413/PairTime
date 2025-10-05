package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.repository.member.MemberRepository;
import com.kyj.backend.auth.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.auth.repository.planGrpTemp.PlanGrpTempRepository;
import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
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

    private final PlanGrpMemberRepository planGrpMemberRepository;
    private final PlanGrpTempRepository planGrpTempRepository;
    private final MemberRepository memberRepository;
    private final CustomMailSender customMailSender;
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


    @Transactional
    public void inviteMember(InviteRequest inviteRequest){

        //보내는 이
        Member sender = memberRepository.findById(inviteRequest.getSender())
                .orElseThrow(() -> new KyjBizException(CmErrCode.CM001, "보내는 이가 누락되었습니다."));


        switch (inviteRequest.getInviteType()){
            case LINK -> {

                UUID uuid = UUID.randomUUID();
                String link = sender.getEmail()+uuid.toString();
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
