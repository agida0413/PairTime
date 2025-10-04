package com.kyj.backend.domain.plan.planReview;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import jakarta.persistence.*;

/**
 * 계획에 대한 평점(리뷰) 엔티티
 */
@Entity
@Table(name = "PLAN_REVIEW")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanReview extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_review_id")
    private Long id;

    @Column(name = "rating", precision = 2, scale = 1)
    private BigDecimal rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id",nullable = false)
    @NotNull
    private PlanM planM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id",nullable = false)
    @NotNull
    private Member reviewer;


    void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public void setPlanM(PlanM planM){
        this.planM = planM;
    }

    public void setMember(Member member){
        this.reviewer = member;
    }

    private PlanReview(Builder builder) {
        this.rating = builder.rating;
        this.planM = builder.planM;
        this.reviewer = builder.reviewer;
    }

    static class Builder {
        private BigDecimal rating;
        private PlanM planM;
        private Member reviewer;

        Builder() {}

        Builder rating(BigDecimal rating) {
            this.rating = rating;
            return this;
        }

        Builder planM(PlanM planM) {
            this.planM = planM;
            return this;
        }

        Builder reviewer(Member member) {
            this.reviewer = member;
            return this;
        }

        PlanReview build() {
            return new PlanReview(this);
        }
    }
}
