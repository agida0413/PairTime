package com.kyj.backend.domain.plan.planGrpTemp;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.CacheMode;
import org.hibernate.annotations.LazyToOne;
import org.hibernate.annotations.LazyToOneOption;

import java.util.Set;

/**
 * 그룹 임시생성 엔티티(초대)
 */
@Entity
@Table(name = "PLAN_GRP_TEMP")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Slf4j
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


    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "plan_grp_id")
    private PlanGrp planGrp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id",nullable = false)
    @NotNull
    private Member sender;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id",nullable = true)
    private Member receiver;


    private PlanGrpTemp (String link,String receiveEmail , Member sender){
        this.link = link;
        this.receiveEmail = receiveEmail;
        this.sender = sender;
    }


    private PlanGrpTemp (String link,String receiveEmail , Member sender,Member receiver){
        this.link = link;
        this.receiveEmail = receiveEmail;
        this.sender = sender;
        this.receiver = receiver;
    }

    //--------DDD-------------------


    /**
     * 이메일 전송 시 업데이트
     * @param receiveEmail
     */
    public void updateReceiveEmail(String receiveEmail){
        this.receiveEmail = receiveEmail;
    }

    /**
     * 리시버 업데이트
     * @param receiver
     */
    public void updateReceiver(Member receiver){
        this.receiver = receiver;
    }

    /**
     * 그룹임시 생성
     * @param link
     * @param email
     * @param sender
     * @return
     */
    public static PlanGrpTemp createPlanGrpTemp(String link,String email, Member sender){

        PlanGrpTemp planGrpTemp = new PlanGrpTemp(link, email, sender);
        sender.getPlanGrpTempListByMe().add(planGrpTemp);

        return planGrpTemp;
    }

    /**
     * 초대 거절
     * @param sender
     */
    public void rejectInvite(Member sender){
          this.sender = null;
          sender.getPlanGrpTempListByMe().remove(this);
    }

    /**
     * 그룹임시 생성(리시버 포함)
     * @param link
     * @param email
     * @param sender
     * @param receiver
     * @return
     */
    public static PlanGrpTemp createPlanGrpTempWithReceiver(String link,String email, Member sender,Member receiver){

        PlanGrpTemp planGrpTemp = new PlanGrpTemp(link, email, sender,receiver);
        sender.getPlanGrpTempListByMe().add(planGrpTemp);
        receiver.getPlanGrpTempListByOther().add(planGrpTemp);

        return planGrpTemp;
    }
//
//    //DDD종료
//    private PlanGrpTemp(Builder builder) {
//        this.link = builder.link;
//        this.isCreated = builder.isCreated;
//        this.receiveEmail = builder.receiveEmail;
//        this.sender = builder.sender;
//        this.receiver = builder.receiver;
//        this.planGrp = builder.planGrp;
//    }
//
//    static class Builder {
//        private String link;
//        private String isCreated = "N";
//        private String receiveEmail;
//        private Member sender;
//        private Member receiver;
//        private PlanGrp planGrp;
//
//        Builder() {}
//
//        Builder link(String link) {
//            this.link = link;
//            return this;
//        }
//
//        Builder isCreated(String isCreated) {
//            this.isCreated = isCreated;
//            return this;
//        }
//
//        Builder receiveEmail(String receiveEmail) {
//            this.receiveEmail = receiveEmail;
//            return this;
//        }
//
//
//        Builder planGrp(PlanGrp planGrp) {
//            this.planGrp = planGrp;
//            return this;
//        }
//
//        Builder sender(Member member) {
//            this.sender = member;
//            return this;
//        }
//        Builder receiver(Member member) {
//            this.receiver = member;
//            return this;
//        }
//
//        PlanGrpTemp build() {
//            return new PlanGrpTemp(this);
//        }
//    }
}
