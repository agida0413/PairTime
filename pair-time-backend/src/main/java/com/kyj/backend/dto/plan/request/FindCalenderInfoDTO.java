package com.kyj.backend.dto.plan.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FindCalenderInfoDTO {
    /**
     * 대상월
     */
    @NotNull(message = "대상월은 필수값 입니다.")
    private String targetYm;


    private Long usrId;

}
