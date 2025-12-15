package com.kyj.backend.dto.plan.response;

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
public class UpdatePlanMResDTO {


    private PlanType planType;


    private String title;


    private String content;


    private String fullYn;


    private String alarmYn;


    private LocalDateTime startAt;


    private LocalDateTime endAt;



}
