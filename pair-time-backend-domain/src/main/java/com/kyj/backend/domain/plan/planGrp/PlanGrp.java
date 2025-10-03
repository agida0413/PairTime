package com.kyj.backend.domain.plan.planGrp;

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

@Entity
@Getter
@Table(name = "PLAN_GRP",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id_1", "user_id_2"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanGrp extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_id")
    private Long id;

    @Column(name = "user_id_1",nullable = false)
    @NotNull
    private Long userId1;

    @Column(name = "user_id_2",nullable = false)
    @NotNull
    private Long userId2;

    @Column(name="love_start_at",nullable = false)
    @NotNull
    private LocalDate loveStartAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_grp_temp_id")
    private PlanGrpTemp planGrpTemp;


    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL)
    private List<PlanM> planMList = new ArrayList<>();

    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void addPlanM(PlanM planM){
        this.planMList.add(planM);
        planM.setPlanGrp(this);
    }

    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void removePlanM(PlanM planM){
        this.planMList.remove(planM);
        planM.setPlanGrp(null);
    }

    void setUserId1(Long userId1) {
        this.userId1 = userId1;
    }

    void setUserId2(Long userId2) {
        this.userId2 = userId2;
    }

    void setLoveStartAt(LocalDate loveStartAt) {
        this.loveStartAt = loveStartAt;
    }

    void setPlanGrpTemp(PlanGrpTemp planGrpTemp) {
        this.planGrpTemp = planGrpTemp;
    }

    private PlanGrp(Builder builder) {
        this.userId1 = builder.userId1;
        this.userId2 = builder.userId2;
        this.loveStartAt = builder.loveStartAt;
        this.planGrpTemp = builder.planGrpTemp;
    }

    static class Builder {
        private Long userId1;
        private Long userId2;
        private LocalDate loveStartAt;
        private PlanGrpTemp planGrpTemp;

        Builder() {}

        Builder userId1(Long userId1) {
            this.userId1 = userId1;
            return this;
        }

        Builder userId2(Long userId2) {
            this.userId2 = userId2;
            return this;
        }

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
