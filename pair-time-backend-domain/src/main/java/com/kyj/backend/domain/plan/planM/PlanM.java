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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
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

    @Column(name = "full_yn",length = 1,nullable = false)
    @NotNull
    private String fullYn = "N";

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


    private PlanM(String title,String content,String alarmYn,String fullYn,LocalDateTime startAt,LocalDateTime endAt
                 , PlanType planType,PlanGrp planGrp)
    {
        this.title =title;
        this.content = content;
        this.alarmYn =alarmYn;
        this.fullYn = fullYn;
        this.startAt = startAt;
        this.endAt = endAt;
        this.planType = planType;
        this.planGrp = planGrp;
    }

// ---DDD-------------

    /**
     * 기념일 일정 생성
     * @return
     */
    public static PlanM createAnniversary( LocalDate anniversary, PlanGrp planGrp){
        // 만난 날
        LocalDate loveStartDate = planGrp.getLoveStartAt();

        // 며칠째 되는 날인지 계산
        long days = ChronoUnit.DAYS.between(loveStartDate, anniversary);

        String title = "";
        String content = "";

        // 타이틀/내용 설정
        if(days % 365==0){
            title="우리의 "+ days/365 +"주년";
            content=title+"이에요! 💖";
        }else{
             title = "우리의 " + days + "일";
             content = title + "이에요! 💖";

        }

        // 하루 전체를 커버하는 시간 설정 (00:00 ~ 23:59)
        LocalDateTime startAt = anniversary.atStartOfDay(); // 00:00
        LocalDateTime endAt = anniversary.atTime(LocalTime.of(23, 59)); // 23:59

        // 일정 생성
        PlanM planM = new PlanM(title, content, "Y", "Y", startAt, endAt, PlanType.COUPLE, planGrp);

        // 그룹에 추가
        planGrp.getPlanMList().add(planM);

        return planM;
    }

//    /**
//     * 연관관계 편의 메소드
//     * @param planPost
//     */
//    public void addPlanPost(PlanPost planPost){
//        this.planPostList.add(planPost);
//        planPost.setPlanM(this);
//    }
//
//    /**
//     * 연관관계 편의 메소드
//     * @param planPost
//     */
//    public void removePlanPost(PlanPost planPost){
//        this.planPostList.remove(planPost);
//        planPost.setPlanM(null);
//    }
//
//    /**
//     * 연관관계 편의메소드
//     * @param planExp
//     */
//    public void addPlanExp(PlanExp planExp){
//        this.planExpList.add(planExp);
//        planExp.setPlanM(this);
//    }
//    /**
//     *
//     * 연관관계 편의메소드
//     * @param planExp
//     */
//    public void removePlanExp(PlanExp planExp){
//        this.planExpList.remove(planExp);
//        planExp.setPlanM(null);
//    }
//
//    /**
//     * 연관관계 편의메소드
//     * @param planReview
//     */
//    public void addPlanReview(PlanReview planReview){
//        this.planReviewList.add(planReview);
//        planReview.setPlanM(this);
//    }
//    /**
//     * 연관관계 편의메소드
//     * @param planReview
//     */
//    public void removePlanReview(PlanReview planReview){
//        this.planReviewList.remove(planReview);
//        planReview.setPlanM(null);
//    }
//
//
//    public void addPlanParticipant(PlanParticipant planParticipant){
//        this.planParticipants.add(planParticipant);
//        planParticipant.setPlanM(this);
//    }
//
//    public void removePlanParticipant(PlanParticipant planParticipant){
//        this.planParticipants.remove(planParticipant);
//        planParticipant.setPlanM(null);
//    }


}
