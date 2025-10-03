package com.kyj.backend.domain.plan.planGrpTemp;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

@Entity
@Table(name = "PLAN_GRP_TEMP")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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


    public void setMember(Member member){
        this.member = member;
    }

    private PlanGrpTemp(Builder builder) {
        this.inviteToken = builder.inviteToken;
        this.isCreated = builder.isCreated;
        this.receiveEmail = builder.receiveEmail;
        this.member = builder.member;
    }

    static class Builder {
        private String inviteToken;
        private String isCreated = "N";
        private String receiveEmail;
        private Member member;

        Builder() {}

        Builder inviteToken(String inviteToken) {
            this.inviteToken = inviteToken;
            return this;
        }

        Builder isCreated(String isCreated) {
            this.isCreated = isCreated;
            return this;
        }

        Builder receiveEmail(String receiveEmail) {
            this.receiveEmail = receiveEmail;
            return this;
        }

        Builder member(Member member) {
            this.member = member;
            return this;
        }

        PlanGrpTemp build() {
            return new PlanGrpTemp(this);
        }
    }
}
