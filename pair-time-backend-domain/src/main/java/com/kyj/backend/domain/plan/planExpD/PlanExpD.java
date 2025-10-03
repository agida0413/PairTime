package com.kyj.backend.domain.plan.planExpD;

import com.kyj.backend.domain.plan.planExp.PlanExp;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "PLAN_EXP_D")
@Getter
@Setter
public class PlanExpD extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_exp_d_id")
    private Long id;

    @Column(name = "expenditure",precision = 15 , scale = 2,nullable = false)
    @NotNull
    private BigDecimal expenditure;

    @Column(name = "title",nullable = false,length = 50)
    @NotNull
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_exp_id")
    private PlanExp planExp;

}
