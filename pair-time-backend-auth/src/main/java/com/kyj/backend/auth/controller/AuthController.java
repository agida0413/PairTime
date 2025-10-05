package com.kyj.backend.auth.controller;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.request.InviteRequest;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.service.plan.PlanGrpService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.security.client.util.SecurityContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<?>> inviteMember(InviteRequest inviteRequest){
        Long userId = Long.parseLong(SecurityContext.getUserId());
        inviteRequest.setSender(userId);

        planService.inviteMember(inviteRequest);
        return ResponseEntity
                .ok(ApiResponse.ok());

    }

}
