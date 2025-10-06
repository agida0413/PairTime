package com.kyj.backend.auth.dto.planGrp.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePlanGrpTempRequest {

    @NotNull
    private String link;
}
