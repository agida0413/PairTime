package com.kyj.backend.auth.dto.planGrp.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
/**
 * 2025-10-04
 * @author 김용준
 * 링크를 통해 임시그룹테이블을 업데이트한다.
 *
 */
@Getter
@Setter
public class UpdatePlanGrpTempRequest {

    @NotNull
    private String link;
}
