package com.kyj.backend.auth.dto.planGrp.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
/**
 * 2025-10-04
 * @author 김용준
 * 실제 그룹을 생성하는 DTO
 *
 */
@Getter
@Setter
public class CreatePlanGrpRequest {
    @NotNull
    private LocalDate loveStartedAt;
    @NotNull
    private Long planGrpTempId;
}
