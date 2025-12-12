package com.kyj.backend.domain.plan.planExp;

import com.kyj.backend.domain.plan.planExpD.PlanExpD;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 일정에 대한 지출 엔티티
 */
@Entity
@Table(name = "PLAN_EXP")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Setter
public class PlanExp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_exp_id")
    private Long id;

    @OneToMany(mappedBy = "planExp",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanExpD> planExpDList = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id",nullable = false)
    @NotNull
    private PlanM planM;


    private PlanExp(PlanM planM){
        planM.addPlanExp(this);
    }

    /**
     * 지출 마스터 생성
     */
    public static PlanExp createPlanExp(PlanM planM){
        PlanExp planExp = new PlanExp(planM);

        return planExp;
    }

    /**
     * 지출상세 추가
     * @param planExpD
     */
    public void addPlanExpD(PlanExpD planExpD){
        this.planExpDList.add(planExpD);
        planExpD.setPlanExp(this);
    }
//
//    /**
//     * 연관관계 편의메소드
//     * @param planExpD
//     */
//    public void addPlanExpD(PlanExpD planExpD){
//        this.planExpDList.add(planExpD);
//        planExpD.setPlanExp(this);
//    }
//
//    /**
//     * 연관관계 편의메소드
//     * @param planExpD
//     */
//    public void removePlanExpD(PlanExpD planExpD){
//        this.planExpDList.remove(planExpD);
//        planExpD.setPlanExp(null);
//    }

//    private PlanExp(Builder builder) {
//        this.planM = builder.planM;
//    }
//
//    static class Builder {
//        private PlanM planM;
//
//        Builder() {}
//
//        Builder planM(PlanM planM) {
//            this.planM = planM;
//            return this;
//        }
//
//        PlanExp build() {
//            return new PlanExp(this);
//        }
//    }
}
