package com.kyj.backend.domain.plan.planGrpTemp;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

@Entity
@Table(name = "PLAN_GRP_TEMP")
@Getter
@Setter
public class PlanGrpTemp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_temp_id")
    private Long id;

    @Column(name = "invite_token",length = 300,nullable = false)
    @NotNull
    private String inviteToken;

    @Column(name = "is_created" ,nullable = false, length = 1)
    @NotNull
    private String isCreated = "N";

    @Column(name="receive_email",nullable = false,length = 100)
    @NotNull
    private String receiveEmail;

    @OneToOne(mappedBy = "planGrpTemp")
    private PlanGrp planGrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Member member;

}
