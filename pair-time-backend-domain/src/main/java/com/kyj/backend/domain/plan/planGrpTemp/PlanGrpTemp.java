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

/**
 * 그룹 임시생성 엔티티(초대)
 */
@Entity
@Table(name = "PLAN_GRP_TEMP")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanGrpTemp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_grp_temp_id")
    private Long id;

    @Column(name = "link",length = 300,nullable = true,unique = true)
    private String link;

    @Column(name="receive_email",nullable = true,length = 100)
    private String receiveEmail;

    @Column(name = "is_created" ,nullable = false, length = 1)
    @NotNull
    private String isCreated = "N";


    @OneToOne(mappedBy = "planGrpTemp",fetch = FetchType.LAZY)
    private PlanGrp planGrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id",nullable = false)
    @NotNull
    private Member sender;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id",nullable = true)
    private Member receiver;

    void setLink(String link) {
        this.link = link;
    }

    void setIsCreated(String isCreated) {
        this.isCreated = isCreated;
    }

    void setReceiveEmail(String receiveEmail) {
        this.receiveEmail = receiveEmail;
    }

    public void setSender(Member member){
        this.sender = member;
    }

    public void setReceiver(Member member){
        this.receiver = member;
    }


    //--------DDD-------------------

    /**
     * 이메일 전송 시 업데이트
     * @param receiveEmail
     */
    public void updateReceiveEmail(String receiveEmail){
        this.receiveEmail = receiveEmail;
    }

    //DDD종료
    private PlanGrpTemp(Builder builder) {
        this.link = builder.link;
        this.isCreated = builder.isCreated;
        this.receiveEmail = builder.receiveEmail;
        this.sender = builder.sender;
        this.receiver = builder.receiver;
    }

    static class Builder {
        private String link;
        private String isCreated = "N";
        private String receiveEmail;
        private Member sender;
        private Member receiver;

        Builder() {}

        Builder link(String link) {
            this.link = link;
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

        Builder sender(Member member) {
            this.sender = member;
            return this;
        }
        Builder receiver(Member member) {
            this.receiver = member;
            return this;
        }

        PlanGrpTemp build() {
            return new PlanGrpTemp(this);
        }
    }
}
