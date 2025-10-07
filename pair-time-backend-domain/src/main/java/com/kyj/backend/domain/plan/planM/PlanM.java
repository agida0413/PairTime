package com.kyj.backend.domain.plan.planM;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planExp.PlanExp;
import com.kyj.backend.domain.plan.planGrp.PlanGrp;
import com.kyj.backend.domain.plan.planParticipant.PlanParticipant;
import com.kyj.backend.domain.plan.planPost.PlanPost;
import com.kyj.backend.domain.plan.planReview.PlanReview;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;import jakarta.persistence.*;

/**
 * 계획 마스터
 */
@Entity
@Table(name = "PLAN_M")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanM extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long id;
    @Column(name = "title",length = 50,nullable = false)
    @NotNull
    private String title;

    @Column(name = "content",length = 300,nullable = false)
    @NotNull
    private String content;

    @Column(name = "alarm_yn",length = 1,nullable = false)
    @NotNull
    private String alarmYn = "N";

    @Column(name = "start_at",nullable = false)
    @NotNull
    private LocalDateTime startAt;

    @Column(name = "end_at",nullable = false)
    @NotNull
    private LocalDateTime endAt;

    @Column(name = "delYn",nullable = false,length = 1)
    @NotNull
    private String delYn = "N";

    @Column(name="plan_type",nullable = false)
    @Enumerated(EnumType.STRING)
    private PlanType planType;

    /** 조회용 가상컬럼
     * ALTER TABLE PLAN_M
     * ADD COLUMN start_ym VARCHAR(7)
     *     AS (DATE_FORMAT(start_at, '%Y-%m')) STORED,
     * ADD COLUMN start_ymd VARCHAR(10)
     *     AS (DATE_FORMAT(start_at, '%Y-%m-%d')) STORED;
     */

    @Column(name = "start_ym", insertable = false, updatable = false)
    private String startYm;

    @Column(name = "start_ymd", insertable = false, updatable = false)
    private String startYmd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_grp_id",nullable = false)
    @NotNull
    private PlanGrp planGrp;

    @OneToMany(mappedBy = "planM",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanPost> planPostList = new ArrayList<>();

    @OneToMany(mappedBy = "planM",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PlanExp> planExpList = new ArrayList<>();

    @OneToMany(mappedBy = "planM",cascade = CascadeType.ALL)
    private List<PlanReview> planReviewList = new ArrayList<>();

    @OneToMany(mappedBy = "planM",cascade = CascadeType.ALL , orphanRemoval = true)
    private List<PlanParticipant> planParticipants = new ArrayList<>();





    /**
     * 연관관계 편의 메소드
     * @param planPost
     */
    public void addPlanPost(PlanPost planPost){
        this.planPostList.add(planPost);
        planPost.setPlanM(this);
    }

    /**
     * 연관관계 편의 메소드
     * @param planPost
     */
    public void removePlanPost(PlanPost planPost){
        this.planPostList.remove(planPost);
        planPost.setPlanM(null);
    }

    /**
     * 연관관계 편의메소드
     * @param planExp
     */
    public void addPlanExp(PlanExp planExp){
        this.planExpList.add(planExp);
        planExp.setPlanM(this);
    }
    /**
     *
     * 연관관계 편의메소드
     * @param planExp
     */
    public void removePlanExp(PlanExp planExp){
        this.planExpList.remove(planExp);
        planExp.setPlanM(null);
    }

    /**
     * 연관관계 편의메소드
     * @param planReview
     */
    public void addPlanReview(PlanReview planReview){
        this.planReviewList.add(planReview);
        planReview.setPlanM(this);
    }
    /**
     * 연관관계 편의메소드
     * @param planReview
     */
    public void removePlanReview(PlanReview planReview){
        this.planReviewList.remove(planReview);
        planReview.setPlanM(null);
    }


    public void addPlanParticipant(PlanParticipant planParticipant){
        this.planParticipants.add(planParticipant);
        planParticipant.setPlanM(this);
    }

    public void removePlanParticipant(PlanParticipant planParticipant){
        this.planParticipants.remove(planParticipant);
        planParticipant.setPlanM(null);
    }


}
