package com.kyj.backend.domain.plan.planGrp;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 그룹 마스터
 */
@Entity
@Getter
@Table(name = "PLAN_GRP")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanGrp extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_id")
    private Long id;



    @Column(name="love_start_at",nullable = false)
    @NotNull
    private LocalDate loveStartAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_grp_temp_id")
    private PlanGrpTemp planGrpTemp;


    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL)
    private List<PlanM> planMList = new ArrayList<>();


    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL)
    private List<PlanGrpMember> planGrpMembers = new ArrayList<>();

    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void addPlanM(PlanM planM){
        this.planMList.add(planM);
        planM.setPlanGrp(this);
    }

    public void addPlanGrpMember(PlanGrpMember planGrpMember ){
        this.planGrpMembers.add(planGrpMember);
        planGrpMember.setPlanGrp(this);
    }
    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void removePlanM(PlanM planM){
        this.planMList.remove(planM);
        planM.setPlanGrp(null);
    }

    public void removePlanGrpMember(PlanGrpMember planGrpMember ){
        this.planGrpMembers.remove(planGrpMember);
        planGrpMember.setPlanGrp(null);
    }

    void setLoveStartAt(LocalDate loveStartAt) {
        this.loveStartAt = loveStartAt;
    }

    void setPlanGrpTemp(PlanGrpTemp planGrpTemp) {
        this.planGrpTemp = planGrpTemp;
    }

    private PlanGrp(Builder builder) {
        this.loveStartAt = builder.loveStartAt;
        this.planGrpTemp = builder.planGrpTemp;
    }

    static class Builder {

        private LocalDate loveStartAt;
        private PlanGrpTemp planGrpTemp;

        Builder() {}


        Builder loveStartAt(LocalDate loveStartAt) {
            this.loveStartAt = loveStartAt;
            return this;
        }

        Builder planGrpTemp(PlanGrpTemp planGrpTemp) {
            this.planGrpTemp = planGrpTemp;
            return this;
        }

        PlanGrp build() {
            return new PlanGrp(this);
        }
    }
}
