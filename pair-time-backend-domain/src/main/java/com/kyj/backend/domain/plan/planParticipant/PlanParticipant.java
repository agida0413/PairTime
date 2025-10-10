package com.kyj.backend.domain.plan.planParticipant;


import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 계획 참여자 엔티티
 */
@Entity
@Getter
@Table(name = "PLAN_PARTICIPANT",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_PLAN_PARTICIPANT",
                columnNames = {"plan_m_id", "participant_id"}
        ))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanParticipant extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_participant_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_m_id",nullable = false)
    @NotNull
    private PlanM planM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id",nullable = false)
    @NotNull
    private Member participant;


    private PlanParticipant(PlanM planM,Member participant){
        this.planM = planM;
        this.participant = participant;
    }


    //---------- DDD----------

    /**
     * 일정 참가자 생성
     * @param planM
     * @param participant
     * @return
     */
    public static PlanParticipant createPlanParticipant(PlanM planM, Member participant){

        PlanParticipant planParticipant = new PlanParticipant(planM, participant);
        planM.getPlanParticipants().add(planParticipant);
        participant.getParticipatedList().add(planParticipant);

        return planParticipant;
    }

}

