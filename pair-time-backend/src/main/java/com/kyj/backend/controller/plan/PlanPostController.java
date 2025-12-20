package com.kyj.backend.controller.plan;

import com.kyj.backend.dto.plan.request.CreateNewPlanExpDTO;
import com.kyj.backend.dto.plan.request.CreateNewPlanPostDTO;
import com.kyj.backend.dto.plan.response.PlanPostResDTO;
import com.kyj.backend.service.planPost.PlanPostService;
import com.kyj.core.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/planPost")
public class PlanPostController {

    private final PlanPostService planPostService;

    @PostMapping( consumes = MediaType.MULTIPART_FORM_DATA_VALUE
            , produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ApiResponse<?>> createNewPlanPost(@ModelAttribute @Valid CreateNewPlanPostDTO createNewPlanPostDTO){
            log.info("출력");
            log.info("planId: {}", createNewPlanPostDTO.getPlanId());
            log.info("title: {}", createNewPlanPostDTO.getTitle());
            log.info("content: {}", createNewPlanPostDTO.getContent());
            log.info("fileType: {}", createNewPlanPostDTO.getFileType());
            log.info("image: {}", createNewPlanPostDTO.getImage() != null ? createNewPlanPostDTO.getImage().getOriginalFilename() : "null");
        planPostService.savePlanPost(createNewPlanPostDTO);

        return ResponseEntity.ok(ApiResponse.ok());
    }


    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<PlanPostResDTO>> findPlanPost(@PathVariable Long planId){
        PlanPostResDTO planPost = planPostService.findPlanPost(planId);

        return ResponseEntity.ok(ApiResponse.ok(planPost));
    }
}
