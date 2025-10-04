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
@Setter
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


    private PlanParticipant(PlanParticipant.Builder builder) {
        this.planM = builder.planM;
        this.participant = builder.participant;
    }

    static class Builder {

        private PlanM planM;
        private Member participant;

        Builder() {}


        Builder planGrp(PlanM planM) {
            this.planM = planM;
            return this;
        }

        Builder member(Member member) {
            this.participant = member;
            return this;
        }

        PlanParticipant build() {
            return new PlanParticipant(this);
        }
    }
}

