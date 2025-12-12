package com.kyj.backend.domain.plan.planGrp;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planParticipant.PlanParticipant;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanGrpTemp> planGrpTempList = new ArrayList<>();


    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanM> planMList = new ArrayList<>();


    @OneToMany(mappedBy = "planGrp",cascade = CascadeType.ALL)
    private List<PlanGrpMember> planGrpMembers = new ArrayList<>();

    private PlanGrp (LocalDate loveStartAt){
        this.loveStartAt = loveStartAt;
    }


    /**
     * 그룹 생성
     * @param planGrpTemp
     */
    public static PlanGrp createPlanGrp(PlanGrpTemp planGrpTemp,LocalDate loveStartAt){
        PlanGrp planGrp = new PlanGrp(loveStartAt);

        // Setter 대신 도메인 메서드 사용
        planGrpTemp.associateWithPlanGrp(planGrp);
        planGrp.planGrpTempList.add(planGrpTemp);

        //그룹 멤버 생성
        PlanGrpMember.create(planGrp,planGrpTemp.getReceiver());
        PlanGrpMember.create(planGrp,planGrpTemp.getSender());

        //기념일 일정 생성
        createDefaultPlanM(planGrp);

        return planGrp;
    }

    /**
     * 그룹 해체
     * @param planGrpTemp
     */
    public void removePlanGrp(PlanGrpTemp planGrpTemp ){
        this.planGrpTempList.remove(planGrpTemp);
        planGrpTemp.dissociateFromPlanGrp();
    }




    /**
     * 그룹 생성 시 기본 일정 생성(기념일 등 )
     * @param planGrp
     */
    private static void createDefaultPlanM(PlanGrp planGrp){

        //  주요 일 단위 기념일
        int[] daysList = {
                100, 200, 300, 365,
                500, 365 * 2, 1000,
                365*3, 1500,
                365 * 4 ,
                365*5, 2000,
                365*6,
                365*7,
                365*8,
                365*9,
                365*10
        };

        for (int day : daysList) {
            LocalDate anniversary = planGrp.getLoveStartAt().plusDays(day);
            PlanM anniversaryPlan = PlanM.createAnniversary(anniversary, planGrp);
            //그룹 참여자 리스트
            List<PlanGrpMember> planGrpMembers = planGrp.getPlanGrpMembers();

            for (PlanGrpMember planGrpMember : planGrpMembers) {
                //계획 참여자 리스트 생성
                PlanParticipant.createPlanParticipant(anniversaryPlan,planGrpMember.getMember());
            }
        }

        // 크리스마스, 발렌타인 데이 등...고도화 떄


    }

}
