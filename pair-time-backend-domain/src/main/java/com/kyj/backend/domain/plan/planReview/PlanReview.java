package com.kyj.backend.domain.plan.planReview;

import com.kyj.backend.domain.member.Member;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import jakarta.persistence.*;

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
    @JoinColumn(name = "plan_id")
    private PlanM planM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Member member;


    public void setPlanM(PlanM planM){
        this.planM = planM;
    }

    public void setMember(Member member){
        this.member = member;
    }

    private PlanReview(Builder builder) {
        this.rating = builder.rating;
        this.planM = builder.planM;
        this.member = builder.member;
    }

    static class Builder {
        private BigDecimal rating;
        private PlanM planM;
        private Member member;

        Builder() {}

        Builder rating(BigDecimal rating) {
            this.rating = rating;
            return this;
        }

        Builder planM(PlanM planM) {
            this.planM = planM;
            return this;
        }

        Builder member(Member member) {
            this.member = member;
            return this;
        }

        PlanReview build() {
            return new PlanReview(this);
        }
    }
}
