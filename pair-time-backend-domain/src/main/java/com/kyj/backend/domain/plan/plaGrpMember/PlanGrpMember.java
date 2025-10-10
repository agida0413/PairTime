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

    // ---- 생성 로직 ----
    private PlanGrpMember(PlanGrp planGrp, Member member) {
        this.planGrp = planGrp;
        this.member = member;
    }

    // 연관관계 편의 메서드
    public static PlanGrpMember create(PlanGrp planGrp, Member member) {
        PlanGrpMember planGrpMember = new PlanGrpMember(planGrp, member);

        // 양방향 연관관계 설정
        planGrp.getPlanGrpMembers().add(planGrpMember);
        member.getPlanGrpMembers().add(planGrpMember);

        return planGrpMember;
    }


}
