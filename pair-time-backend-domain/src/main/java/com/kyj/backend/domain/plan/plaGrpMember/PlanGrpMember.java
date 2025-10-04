package com.kyj.backend.domain.plan.plaGrpMember;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "PLAN_GRP_MEMBER")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanGrpMember extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_grp_id")
    private PlanGrp planGrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Member member;


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
