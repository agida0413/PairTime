package com.kyj.backend.controller.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanExpDTO;
import com.kyj.backend.dto.plan.request.UpdatePlanExpRequestDTO;
import com.kyj.backend.dto.plan.response.PlanExpDResDTO;
import com.kyj.backend.service.plan.PlanService;
import com.kyj.core.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * 지출상세정보 조회
     * @param planId
     * @return
     */
    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<?>> findPlanExpD(@PathVariable Long planId){
        List<PlanExpDResDTO> planExpDList = planService.findPlanExpDList(planId);
        return ResponseEntity.ok(ApiResponse.ok(planExpDList));
    }


    /**
     * 지출정보 삭제
     * @param planExpDId
     * @return
     */
    @DeleteMapping("/{planExpDId}")
    public ResponseEntity<ApiResponse<?>> deletePlanExpD(@PathVariable Long planExpDId){
        planService.deletePlanExpD(planExpDId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    /**
     * 지출정보 업데이트
     * @param updatePlanExpDTO
     * @return
     */
    @PutMapping( consumes = MediaType.APPLICATION_JSON_VALUE
            , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> updatePlanExpD(@RequestBody @Valid UpdatePlanExpRequestDTO updatePlanExpDTO){
        planService.updatePlanExpD(updatePlanExpDTO);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
