package com.kyj.backend.auth.controller;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.member.request.MemberFindRequest;
import com.kyj.backend.auth.dto.member.response.MemberFindResponse;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.member.response.InviteMemberResponse;
import com.kyj.backend.auth.dto.planGrp.response.InviteLinkResponse;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.service.member.MemberService;
import com.kyj.backend.auth.service.plan.PlanGrpService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.security.client.util.SecurityContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 2025-10-04
 * @author 김용준
 * 인증과 관련된 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final PlanGrpService planService;
    private final MemberService memberService;

    /**
     * 메인화면의 타입을 결정하는 API
     * @return
     */
    @GetMapping("/mainUI")
    public ResponseEntity<ApiResponse<MainUIType>> selectMainUIType(){

        Long userId = Long.parseLong(SecurityContext.getUserId());

        MainUITypeResponse mainUITypeResponse = planService.determineMainUIType(userId);


        return ResponseEntity
                .ok(ApiResponse
                        .success()
                        .data(mainUITypeResponse)
                        .build());

    }

    /**
     * 회원 초대 API
     * @param inviteRequest
     * @return
     */
    @PostMapping(
              value = "/invite"
            , consumes = MediaType.APPLICATION_JSON_VALUE
            , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> inviteMember(@RequestBody InviteRequest inviteRequest){
        Long userId = Long.parseLong(SecurityContext.getUserId());
        inviteRequest.setSender(userId);

        planService.inviteMember(inviteRequest);
        return ResponseEntity
                .ok(ApiResponse.ok());

    }

    /**
     * 해당 링크에 대한 초대이메일 전송 API
     * @param inviteRequest
     * @return
     */
    @PostMapping(
               value = "/invite/email"
            , consumes = MediaType.APPLICATION_JSON_VALUE
            , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> inviteMemberToEmail(@RequestBody InviteRequest inviteRequest){

        planService.inviteMemberToEmail(inviteRequest);

        return ResponseEntity
                .ok(ApiResponse.ok());
    }

    /**
     * 회원을 조회하는 API
     * @param memberFindRequest
     * @return
     */
    @GetMapping("/member")
    public ResponseEntity<ApiResponse<MemberFindResponse>> findMember(@Valid MemberFindRequest memberFindRequest){

        MemberFindResponse member = memberService.findMember(memberFindRequest);

        return ResponseEntity
                .ok(ApiResponse.ok(member));
    }

    /**
     * 초대 메인UI Type에따라 내가 초대한 사람이나, 초대를 받았는데 누군가로부터 받았는지에 대한 회원정보를 받는 API이다.
     * @param planGrpTempId
     * @param mainUIType
     * @return
     */
    @GetMapping("/invite/member/{planGrpTempId}")
    public ResponseEntity<ApiResponse<InviteMemberResponse>> findMemberInPlanGrpTemp(
            @PathVariable Long planGrpTempId,MainUIType mainUIType){

        InviteMemberResponse inviteMemberResponse = memberService.findMemberInPlanGrpTemp(planGrpTempId,mainUIType);

        return ResponseEntity
                .ok(ApiResponse.ok(inviteMemberResponse));
    }

    /**
     * 이미 생성된 초대에 대한 링크정보를 제공한다.
     * @param planGrpTempId
     * @return
     */
    @GetMapping("/invite/link/{planGrpTempId}")
    public ResponseEntity<ApiResponse<InviteLinkResponse>> findLinkInPlanGrpTemp(@PathVariable Long planGrpTempId){
        InviteLinkResponse inviteLinkResponse = planService.findLinkByInvite(planGrpTempId);

        return ResponseEntity
                .ok(ApiResponse.ok(inviteLinkResponse));
    }

    /**
     * 현제 세션(초대한사람)의 링크정보를 제공한다.
     * @return
     */
    @GetMapping("/invite/member/link")
    public ResponseEntity<ApiResponse<InviteLinkResponse>> findLinkInMember(){
        Long id = Long.parseLong(SecurityContext.getUserId());

        InviteLinkResponse linkByMember = planService.findLinkByMember(id);

        return ResponseEntity
                .ok(ApiResponse.ok(linkByMember));
    }

}
