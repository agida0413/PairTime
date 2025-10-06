package com.kyj.backend.domain.plan.plaGrpMember;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 계획 그룹 참여자 엔티티
 */
@Entity
@Getter
@Setter
@Table(name = "PLAN_GRP_MEMBER",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_PLAN_GRP_MEMBER",
                columnNames = {"plan_grp_id", "user_id"}
        ))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanGrpMember extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_grp_id",nullable = false)
    @NotNull
    private PlanGrp planGrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    @NotNull
    private Member member;

    public PlanGrpMember createPlanGrpMember(PlanGrp planGrp,Member member){

        this.planGrp = planGrp;
        this.member = member;

        return this;
    }

    private PlanGrpMember(PlanGrpMember.Builder builder) {
        this.planGrp = builder.planGrp;
        this.member = builder.member;
    }

    static class Builder {

        private PlanGrp planGrp;
        private Member member;

        Builder() {}


        PlanGrpMember.Builder planGrp(PlanGrp planGrp) {
            this.planGrp = planGrp;
            return this;
        }

        PlanGrpMember.Builder member(Member member) {
            this.member = member;
            return this;
        }

        PlanGrpMember build() {
            return new PlanGrpMember(this);
        }
    }
}
