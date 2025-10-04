package com.kyj.backend.auth.controller;

import com.kyj.backend.auth.constants.MainUIType;
import com.kyj.backend.auth.dto.planGrp.response.MainUITypeResponse;
import com.kyj.backend.auth.service.plan.PlanService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.security.client.annotation.PublicEndpoint;
import com.kyj.core.security.client.util.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

    private final PlanService planService;

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

}
