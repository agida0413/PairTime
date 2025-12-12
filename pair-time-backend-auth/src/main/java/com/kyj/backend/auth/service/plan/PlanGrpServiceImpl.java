package com.kyj.backend.auth.service.plan;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.request.CreatePlanGrpRequest;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.request.UpdatePlanGrpTempRequest;
import com.kyj.backend.auth.dto.planGrp.response.InviteLinkResponse;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.dto.mapper.PlanGrpTempEntityDTOMapper;
import com.kyj.backend.auth.repository.member.MemberRepository;
import com.kyj.backend.auth.repository.planGrp.PlanGrpRepository;
import com.kyj.backend.auth.repository.planGrpMember.PlanGrpMemberRepository;
import com.kyj.backend.auth.repository.planGrpTemp.PlanGrpTempRepository;
import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planParticipant.PlanParticipant;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.mail.CustomMailSender;
import com.kyj.core.mail.DynamicMailDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
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
                //ddd전환
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

        Member sender = planGrpTemp.getSender();
        String senderEmail = sender.getEmail();
        String senderNickname = sender.getNickname();
        String senderProfile = sender.getProfile();

        // 링크에 프로토콜이 없으면 추가
        String fullLink = link;
        if (!link.startsWith("http://") && !link.startsWith("https://")) {
            fullLink = link.startsWith("localhost") ? "http://" + link : "https://" + link;
        }

        String htmlTemplate = createMailTemplate(fullLink, senderNickname, senderEmail, senderProfile);
        String subject = String.format("%s님이 PairTime 초대를 보냈습니다", senderNickname);

        DynamicMailDTO dynamicMailDTO = new DynamicMailDTO(htmlTemplate, subject, inviteRequest.getReceiveEmail());
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
        if (planGrpTemp.getSender().getId().equals(userId)){
            log.error("본인이 보낸 링크는 접근할 수 없습니다. = {}, {}", userId,planGrpTemp.getSender().getId());
            throw new KyjBizException(CmErrCode.CM001,"본인이 보낸 링크는 접근할 수 없습니다.");

        }
        Member receiver = memberRepository.findById(userId).orElseThrow(() -> {
            log.error("조회된 회원이 없습니다.");
            return new KyjBizException(CmErrCode.CM002);
        });



        //업데이트
        planGrpTemp.updateReceiver(receiver);

    }

    /**
     * 실제 그룹 생성(초대 수락)
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

        PlanGrp planGrp = PlanGrp.createPlanGrp(planGrpTemp,createPlanGrpRequest.getLoveStartedAt());

        //실제 그룹테이블 생성
        planGrpRepository.save(planGrp);


    }

    /**
     * 초대 거절
     * @param planGrpTempID
     */
    @Transactional
    public void removePlanGrp(Long planGrpTempID){
        if(planGrpTempID ==null){
            log.error("planGrpTempID는 필수 값 입니다.");
            throw new KyjBizException(CmErrCode.CM002);
        }
        PlanGrpTemp planGrpTemp = planGrpTempRepository.findById(planGrpTempID)
                .orElseThrow(() -> {
                    log.error("조회된 임시그룹이 없습니다.");
                    return new KyjBizException(CmErrCode.CM002);
                });

        planGrpTemp.rejectInvite(planGrpTemp.getSender());

        planGrpTempRepository.delete(planGrpTemp);
    }

//----------------------- private 메소드 영역-------------




    /**
     * 초대 링크 생성을 위한 엔티티 세팅
     * @param inviteRequest
     * @param sender
     */
    private void inviteMemberByLink(InviteRequest inviteRequest,Member sender){


        PlanGrpTemp planGrpTemp = PlanGrpTemp.createPlanGrpTemp(inviteRequest.getLink(),inviteRequest.getEmail(),sender);


        planGrpTempRepository.save(planGrpTemp);

    }

    /**
     *  이미 가입중인 회원 초대 엔티티 세팅
     * @param inviteRequest
     * @param sender
     * @param receiver
     */
    private void inviteMemberBySendRequest(InviteRequest inviteRequest,Member sender,Member receiver){

        PlanGrpTemp planGrpTemp =PlanGrpTemp.createPlanGrpTempWithReceiver(inviteRequest.getLink(),inviteRequest.getEmail(),sender,receiver);

        planGrpTempRepository.save(planGrpTemp);
    }

    /**
     * 초대 이메일 HTML 템플릿 생성
     * @param inviteLink 초대 링크
     * @param senderNickname 보낸이 닉네임
     * @param senderEmail 보낸이 이메일
     * @param senderProfile 보낸이 프로필 이미지 URL
     * @return HTML 템플릿 문자열
     */
    private String createMailTemplate(String inviteLink, String senderNickname, String senderEmail, String senderProfile) {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>PairTime 초대</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

                                <!-- 헤더 -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 16px 16px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                            ⏰ PairTime
                                        </h1>
                                        <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                                            함께하는 시간, 더 특별하게
                                        </p>
                                    </td>
                                </tr>

                                <!-- 보낸 사람 정보 -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center;">
                                        <div style="display: inline-block;">
                                            %s
                                            <h2 style="margin: 15px 0 8px; color: #333333; font-size: 22px; font-weight: 600;">
                                                %s님이 초대했습니다
                                            </h2>
                                            <p style="margin: 0; color: #666666; font-size: 14px;">
                                                %s
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- 메시지 -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <div style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center;">
                                            <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                                                PairTime에서 함께 일정을 공유하고<br>
                                                소중한 시간을 계획해보세요! 💝
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- 초대 링크 버튼 -->
                                <tr>
                                    <td style="padding: 0 40px 40px; text-align: center;">
                                        <a href="%s"
                                           style="display: inline-block;
                                                  padding: 16px 48px;
                                                  background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                                                  color: #ffffff;
                                                  text-decoration: none;
                                                  border-radius: 50px;
                                                  font-size: 16px;
                                                  font-weight: 600;
                                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                                  transition: all 0.3s ease;">
                                            🔗 초대 링크로 이동하기
                                        </a>
                                        <p style="margin: 20px 0 0; color: #999999; font-size: 12px;">
                                            또는 아래 링크를 복사하세요
                                        </p>
                                        <p style="margin: 8px 0 0; color: #667eea; font-size: 13px; word-break: break-all;">
                                            %s
                                        </p>
                                    </td>
                                </tr>

                                <!-- 푸터 -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #eeeeee;">
                                        <p style="margin: 0 0 8px; color: #999999; font-size: 12px; text-align: center;">
                                            이 초대는 PairTime을 통해 발송되었습니다.
                                        </p>
                                        <p style="margin: 0; color: #cccccc; font-size: 11px; text-align: center;">
                                            © 2025 PairTime. All rights reserved.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(
                senderProfile != null && !senderProfile.isBlank()
                    ? "<img src=\"" + senderProfile + "\" alt=\"프로필\" style=\"width: 80px; height: 80px; border-radius: 50%%; object-fit: cover; border: 4px solid #667eea;\">"
                    : "<div style=\"width: 80px; height: 80px; margin: 0 auto; border-radius: 50%%; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; font-weight: 700;\">" + senderNickname.substring(0, 1) + "</div>",
                senderNickname,
                senderEmail,
                inviteLink,
                inviteLink
            );
    }
}
