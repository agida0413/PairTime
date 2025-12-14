package com.kyj.backend.controller.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanMRequest;
import com.kyj.backend.dto.plan.request.FindCalenderInfoDTO;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.MainInfoResponse;
import com.kyj.backend.service.plan.PlanService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.security.client.util.SecurityContext;
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
 * 계획 M 과 관련된 APi컨트롤러
 *
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/plan")
public class PlanMController {
    private final PlanService planService;

    /**
     * 로그인 후 CALENDAR타입일 경우 기본정보를 리턴한다.
     * @return
     */
    @GetMapping("/mainInfo")
    public ResponseEntity<ApiResponse<MainInfoResponse>> findMainInfo(){
        Long userId = Long.parseLong(SecurityContext.getUserId());
        log.info("maininfoId ={}",userId);
        MainInfoResponse mainInfoResponse = planService.findMainInfo(userId);
        return ResponseEntity
                .ok(ApiResponse.ok(mainInfoResponse));
    }

    /**
     * 대상월에 대한 일정을 리턴한다.
     * @return
     */
    @GetMapping("/calendarInfo")
    public ResponseEntity<ApiResponse<List<FindCalendarInfoResDTO>>> findMainInfo(FindCalenderInfoDTO findCalenderInfoDTO){
        Long userId = Long.parseLong(SecurityContext.getUserId());
        findCalenderInfoDTO.setUsrId(userId);
        List<FindCalendarInfoResDTO> list = planService.findCalendarInfoByYm(findCalenderInfoDTO);
        return ResponseEntity
                .ok(ApiResponse.ok(list));
    }

    /**
     * 새로운 일정을 등록한다.
     * @param createNewPlanMRequest
     * @return
     */
    @PostMapping( consumes = MediaType.APPLICATION_JSON_VALUE
                , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> createNewPlanM(@RequestBody @Valid CreateNewPlanMRequest createNewPlanMRequest){
        planService.createNewPlanM(createNewPlanMRequest);

        return ResponseEntity.ok(ApiResponse.ok());
    }
}
