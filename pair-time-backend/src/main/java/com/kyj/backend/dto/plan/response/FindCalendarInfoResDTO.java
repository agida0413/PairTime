package com.kyj.backend.dto.plan.response;

import com.kyj.backend.domain.plan.planM.PlanType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class FindCalendarInfoResDTO {

    private PlanCalendarUIType planCalendarUIType;

    private Long planId;

    private String title;

    private String content;


    private String alarmYn;


    private String fullYn;


    private LocalDateTime startAt;


    private LocalDateTime endAt;



    private PlanType planType;




    private String startYm;


    private String startYmd;

}
