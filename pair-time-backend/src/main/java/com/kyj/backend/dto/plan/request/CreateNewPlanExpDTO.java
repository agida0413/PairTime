package com.kyj.backend.dto.plan.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateNewPlanExpDTO {
    @NotNull(message = "지출제목은 필수 값 입니다.")
    private String title;
    @Min(value = 100, message = "지출금액은 100이상 이여야 합니다.")
    private BigDecimal expenditure;
    @Min(value = 1, message = "고유번호는 1이상 이여야 합니다.")
    private Long planId;

}
