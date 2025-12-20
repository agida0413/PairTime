package com.kyj.backend.dto.plan.response;

import com.kyj.backend.domain.plan.planM.PlanType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PlanPostResDTO {
    private Long PlanPostId;
    private String title;
    private String content;
    private List<String> imageUrl;
}
