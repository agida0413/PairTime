package com.kyj.backend.domain.plan.planExpD;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;

import java.math.BigDecimal;

@Entity
@Getter
public class PlanExpD extends BaseEntity {

    @Id @GeneratedValue
    @Column(name = "plan_exp_d_id")
    private Long id;

    @Column(name = "expenditure",precision = 15 , scale = 2,nullable = false)
    private BigDecimal expenditure;

    @Column(name = "title",nullable = false,length = 50)
    private String title;

}
