package com.kyj.backend.domain.plan.planExpD;

import com.kyj.backend.domain.plan.planExp.PlanExp;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * 일정에 대한 지출 상세 엔티티
 */
@Entity
@Table(name = "PLAN_EXP_D")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    @JoinColumn(name = "plan_exp_id",nullable = false)
    @NotNull
    private PlanExp planExp;


    void setExpenditure(BigDecimal expenditure) {
        this.expenditure = expenditure;
    }

    void setTitle(String title) {
        this.title = title;
    }

    public void setPlanExp(PlanExp planExp){
        this.planExp = planExp;
    }

    private PlanExpD(Builder builder) {
        this.expenditure = builder.expenditure;
        this.title = builder.title;
        this.planExp = builder.planExp;
    }

    static class Builder {
        private BigDecimal expenditure;
        private String title;
        private PlanExp planExp;

        Builder() {}

        Builder expenditure(BigDecimal expenditure) {
            this.expenditure = expenditure;
            return this;
        }

        Builder title(String title) {
            this.title = title;
            return this;
        }

        Builder planExp(PlanExp planExp) {
            this.planExp = planExp;
            return this;
        }

        PlanExpD build() {
            return new PlanExpD(this);
        }
    }
}
