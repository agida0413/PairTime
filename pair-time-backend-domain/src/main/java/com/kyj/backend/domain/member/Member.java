package com.kyj.backend.domain.member;

import com.kyj.backend.domain.plan.plaGrpMember.PlanGrpMember;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planParticipant.PlanParticipant;
import com.kyj.backend.domain.plan.planReview.PlanReview;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Getter;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 회원 엔티티
 */
@Entity
@Table(name = "MEMBER")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "username",length = 300 , nullable = false, unique = true)
    @NotNull
    private String username;

    @Column(name = "email",length = 100 , nullable = false, unique = true)
    @NotNull
    private String email;

    @Column(name="profile",length = 300 )
    private String profile;
    @Column(name = "provider",length = 50,nullable = false)
    @NotNull
    private String provider;

    @Column(name="nickname",length = 300 , nullable = false)
    @NotNull
    private String nickname;
    @Column(name = "role",length = 40 , nullable = false)
    @NotNull //따로 DDL문 작성
    private String role = "ROLE_USER";



    @OneToMany(mappedBy = "sender",cascade = CascadeType.ALL)
    private List<PlanGrpTemp> planGrpTempListByMe = new ArrayList<>();

    @OneToMany(mappedBy = "receiver",cascade = CascadeType.ALL)
    private List<PlanGrpTemp> planGrpTempListByOther = new ArrayList<>();

    @OneToMany(mappedBy = "reviewer",cascade = CascadeType.ALL)
    private List<PlanReview> planReviewList = new ArrayList<>();

    @OneToMany(mappedBy = "member",cascade = CascadeType.ALL)
    private List<PlanGrpMember> planGrpMembers  = new ArrayList<>();

    @OneToMany(mappedBy = "participant")
    private List<PlanParticipant> participatedList = new ArrayList<>();
    /**
     * 연관관계 편의메소드
     * @param planGrpTemp
     */
    public void addPlanGrpTempByMeList(PlanGrpTemp planGrpTemp){
        this.planGrpTempListByMe.add(planGrpTemp);
        planGrpTemp.setSender(this);
    }

    public void addPlanGrpTempByOtherList(PlanGrpTemp planGrpTemp){
        this.planGrpTempListByOther.add(planGrpTemp);
        planGrpTemp.setReceiver(this);
    }

    public void addPlanGrpMember(PlanGrpMember planGrpMember){
        this.planGrpMembers.add(planGrpMember);
        planGrpMember.setMember(this);
    }

    public void addParticipate(PlanParticipant planParticipant){
        this.participatedList.add(planParticipant);
        planParticipant.setParticipant(this);
    }
    /**
     * 연관관계 편의메소드
     * @param planGrpTemp
     */
    public void removePlanGrpTempByMeList(PlanGrpTemp planGrpTemp){
        this.planGrpTempListByMe.remove(planGrpTemp);

        planGrpTemp.setSender(null);
    }

    public void removePlanGrpTempByOtherList(PlanGrpTemp planGrpTemp){
        this.planGrpTempListByOther.remove(planGrpTemp);
        planGrpTemp.setReceiver(null);
    }
    public void removeParticipate(PlanParticipant planParticipant){
        this.participatedList.remove(planParticipant);
        planParticipant.setParticipant(null);
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

    void setUsername(String username) {
        this.username = username;
    }

    void setEmail(String email) {
        this.email = email;
    }

    void setProfile(String profile) {
        this.profile = profile;
    }

    void setRole(String role) {
        this.role = role;
    }
    void setNickname(String nickname){
        this.nickname = nickname;
    }
    void setProvider(String provider){
        this.provider = provider;
    }


    /**
     * 회원로그인 성공시 정보변경
     * @param nickname
     * @param profile
     * @param username
     */
    public void updateLoginInfo(String nickname,String profile,String username){
        this.nickname = nickname;
        this.profile = profile;
        this.username = username;
    }



    // -------------------------private Builder-------------------


    private Member(Builder builder) {
        this.username = builder.username;
        this.email = builder.email;
        this.profile = builder.profile;
        this.role = builder.role;
        this.nickname = builder.nickname;
        this.provider = builder.provider;

    }

    static class Builder {
        private String username;
        private String email;
        private String profile;
        private String nickname;
        private String provider;
        private String role = "ROLE_USER";


        Builder() {}

        Builder username(String username) {
            this.username = username;
            return this;
        }

        Builder email(String email) {
            this.email = email;
            return this;
        }

        Builder profile(String profile) {
            this.profile = profile;
            return this;
        }

        Builder role(String role) {
            this.role = role;
            return this;
        }
        Builder nickname(String nickname){
            this.nickname = nickname;
            return this;
        }
        Builder provider(String provider){
            this.provider = provider;
            return this;
        }
        Member build() {
            return new Member(this);
        }
    }
}
