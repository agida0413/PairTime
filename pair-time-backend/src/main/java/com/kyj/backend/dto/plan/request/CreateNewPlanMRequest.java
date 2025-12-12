package com.kyj.backend.dto.plan.request;

import com.kyj.backend.domain.plan.planM.PlanType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 2025-10-08
 * @author 김용준
 * 새로운 일정을 추가하는 DTO
 */
@Getter
@Setter
public class CreateNewPlanMRequest {

    /**
     * 일정 타입 (COUPLE, PERSONAL 등)
     */
    @NotNull(message = "일정 타입은 필수입니다.")
    private PlanType planType;

    /**
     * 일정 제목 (최대 50자)
     */
    @NotNull(message = "제목은 필수입니다.")
    @NotBlank(message = "제목은 공백일 수 없습니다.")
    @Size(max = 50, message = "제목은 최대 50자까지 입력 가능합니다.")
    private String title;

    /**
     * 일정 내용 (최대 300자)
     */
    @NotNull(message = "내용은 필수입니다.")
    @NotBlank(message = "내용은 공백일 수 없습니다.")
    @Size(max = 300, message = "내용은 최대 300자까지 입력 가능합니다.")
    private String content;

    /**
     * 하루종일 여부 (Y 또는 N만 가능)
     */
    @NotNull(message = "하루종일 여부는 필수입니다.")
    @NotBlank(message = "하루종일 여부는 공백일 수 없습니다.")
    @Pattern(regexp = "^[YN]$", message = "하루종일 여부는 Y 또는 N만 입력 가능합니다.")
    private String fullYn;

    /**
     * 알람 여부 (Y 또는 N만 가능)
     */
    @NotNull(message = "알람 여부는 필수입니다.")
    @NotBlank(message = "알람 여부는 공백일 수 없습니다.")
    @Pattern(regexp = "^[YN]$", message = "알람 여부는 Y 또는 N만 입력 가능합니다.")
    private String alarmYn;

    /**
     * 시작 일시 (현재 시간 이상)
     */
    @NotNull(message = "시작 일시는 필수입니다.")
//    @FutureOrPresent(message = "시작 일시는 현재 시간 이상이어야 합니다.")
    private LocalDateTime startAt;

    /**
     * 종료 일시 (현재 시간 이상)
     */
    @NotNull(message = "종료 일시는 필수입니다.")
    @FutureOrPresent(message = "종료 일시는 현재 시간 이상이어야 합니다.")
    private LocalDateTime endAt;


    @NotNull
    @Min(value = 1, message = "고유번호는 1이상이어야 합니다.")
    private Long planGrpId;
    /**
     * 비즈니스 규칙 검증: 종료 시간이 시작 시간보다 이후인지 확인
     */
    @AssertTrue(message = "종료 일시는 시작 일시보다 이후여야 합니다.")
    public boolean isEndAtAfterStartAt() {
        if (startAt == null || endAt == null) {
            return true; // null 체크는 @NotNull에서 처리
        }
        return endAt.isAfter(startAt) || endAt.isEqual(startAt);
    }

}
