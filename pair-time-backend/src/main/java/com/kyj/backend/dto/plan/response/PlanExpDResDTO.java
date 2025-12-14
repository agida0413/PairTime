package com.kyj.backend.dto.plan.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * 지출상세정보 DTO
 */
@Getter
@Setter
public class PlanExpDResDTO {
    private Long planExpDId;
    private String title;
    private BigDecimal expenditure;
}
