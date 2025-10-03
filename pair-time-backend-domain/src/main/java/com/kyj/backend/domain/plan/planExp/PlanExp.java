package com.kyj.backend.domain.plan.planExp;

import com.kyj.backend.domain.plan.planExpD.PlanExpD;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PLAN_EXP")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanExp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_exp_id")
    private Long id;

    @OneToMany(mappedBy = "planExp",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanExpD> planExpDList = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private PlanM planM;

    public void setPlanM(PlanM planM){
        this.planM = planM;
    }

    /**
     * 연관관계 편의메소드
     * @param planExpD
     */
    public void addPlanExpD(PlanExpD planExpD){
        this.planExpDList.add(planExpD);
        planExpD.setPlanExp(this);
    }

    /**
     * 연관관계 편의메소드
     * @param planExpD
     */
    public void removePlanExpD(PlanExpD planExpD){
        this.planExpDList.remove(planExpD);
        planExpD.setPlanExp(null);
    }

    private PlanExp(Builder builder) {
        this.planM = builder.planM;
    }

    static class Builder {
        private PlanM planM;

        Builder() {}

        Builder planM(PlanM planM) {
            this.planM = planM;
            return this;
        }

        PlanExp build() {
            return new PlanExp(this);
        }
    }
}
