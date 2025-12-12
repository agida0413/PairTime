package com.kyj.backend.controller.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanExpDTO;
import com.kyj.backend.dto.plan.request.CreateNewPlanMRequest;
import com.kyj.backend.service.plan.PlanService;
import com.kyj.core.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
/**
 * 2025-10-05
 * @author 김용준
 * 계획지출 과 관련된 APi컨트롤러
 *
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/planExp")
public class PlanExpController {

    private final PlanService planService;
    /**
     * 새로운 지출정보를 등록한다
     * @param createNewPlanExpDTO
     * @return
     */
    @PostMapping( consumes = MediaType.APPLICATION_JSON_VALUE
            , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> createNewPlanExp(@RequestBody @Valid CreateNewPlanExpDTO createNewPlanExpDTO){
        planService.createPlanExp(createNewPlanExpDTO);

        return ResponseEntity.ok(ApiResponse.ok());
    }
}
