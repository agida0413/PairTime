package com.kyj.backend.auth.controller;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.member.request.MemberFindRequest;
import com.kyj.backend.auth.dto.member.response.MemberFindResponse;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.response.InviteMemberResponse;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.service.member.MemberService;
import com.kyj.backend.auth.service.plan.PlanGrpService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
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

    @GetMapping("/invite/member/{planGrpTempId}")
    public ResponseEntity<ApiResponse<InviteMemberResponse>> findMemberInPlanGrpTemp(
            @PathVariable Long planGrpTempId,Boolean isSender){
        InviteMemberResponse inviteMemberResponse = memberService.findMemberInPlanGrpTemp(planGrpTempId,isSender);

        return ResponseEntity.ok(ApiResponse.ok(inviteMemberResponse));
    }

}
