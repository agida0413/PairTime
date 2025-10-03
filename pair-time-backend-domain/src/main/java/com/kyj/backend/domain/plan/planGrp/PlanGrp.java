package com.kyj.backend.domain.plan.planGrp;

import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

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

}
