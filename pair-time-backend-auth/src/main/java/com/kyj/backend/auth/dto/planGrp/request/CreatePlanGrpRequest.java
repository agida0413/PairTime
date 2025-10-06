package com.kyj.backend.auth.dto.planGrp.request;

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
    private LocalDate loveStartedAt;
    private Long planGrpTempId;
}
