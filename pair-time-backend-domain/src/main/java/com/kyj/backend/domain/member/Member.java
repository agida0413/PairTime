package com.kyj.backend.domain.member;

import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planReview.PlanReview;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;

import lombok.Getter;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "MEMBER")
@Getter
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "username",length = 30 , nullable = false, unique = true)
    @NotNull
    private String username;

    @Column(name = "email",length = 100 , nullable = false, unique = true)
    @NotNull
    private String email;

    @Column(name="profile",length = 150 )
    private String profile;

    @Column(name = "role",length = 40 , nullable = false)
    @NotNull //따로 DDL문 작성
    private String role = "ROLE_USER";

    @OneToMany(mappedBy = "member",cascade = CascadeType.ALL)
    private List<PlanM> planMList = new ArrayList<>();

    @OneToMany(mappedBy = "member",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanGrpTemp> planGrpTempList = new ArrayList<>();

    @OneToMany(mappedBy = "member",cascade = CascadeType.ALL)
    private List<PlanReview> planReviewList = new ArrayList<>();
    /**
     * 연관관계 편의메소드
     * @param planGrpTemp
     */
    public void addPlanGrpTemp(PlanGrpTemp planGrpTemp){
        this.planGrpTempList.add(planGrpTemp);
        planGrpTemp.setMember(this);
    }

    /**
     * 연관관계 편의메소드
     * @param planGrpTemp
     */
    public void removePlanGrpTemp(PlanGrpTemp planGrpTemp){
        this.planGrpTempList.remove(planGrpTemp);
        planGrpTemp.setMember(null);
    }

    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void addPlanM(PlanM planM){
        this.planMList.add(planM);
        planM.setMember(this);
    }

    /**
     * 연관관계 편의메소드
     * @param planM
     */
    public void removePlanM(PlanM planM){
        this.planMList.remove(planM);
        planM.setMember(null);
    }

    /**
     * 연관관계 편의메소드
     * @param planReview
     */
    public void addPlanReview(PlanReview planReview){
        this.planReviewList.add(planReview);
        planReview.setMember(this);
    }
    /**
     * 연관관계 편의메소드
     * @param planReview
     */
    public void removePlanReview(PlanReview planReview){
        this.planReviewList.remove(planReview);
        planReview.setMember(null);
    }

}
