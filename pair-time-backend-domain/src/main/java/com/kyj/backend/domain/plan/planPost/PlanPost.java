package com.kyj.backend.domain.plan.planPost;

import com.kyj.backend.domain.file.File;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;


import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

/**
 * 계획(일정) 에 대한 게시물 엔티티
 */
@Entity
@Table(name = "PLAN_POST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlanPost extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_post_id")
    private Long id;

    @Column(name = "title",length = 40,nullable = false)
    @NotNull
    private String title;

    @Column(name = "content",length = 300,nullable = false)
    @NotNull
    private String content;

    @OneToMany(mappedBy = "planPost",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<File> files = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id",nullable = false)
    @NotNull
    private PlanM planM;

    void setTitle(String title) {
        this.title = title;
    }

    void setContent(String content) {
        this.content = content;
    }

    public void setPlanM(PlanM planM){
        this.planM = planM;
    }


    /**
     * 연관관계 편의메소드
     * @param file
     */
    public void addFile(File file) {
        files.add(file);
        file.setPlanPost(this);
    }

    /**
     * 연관관계 편의메소드
     * @param file
     */
    public void removeFile(File file) {
        files.remove(file);
        file.setPlanPost(null);
    }

    private PlanPost(Builder builder) {
        this.title = builder.title;
        this.content = builder.content;
        this.planM = builder.planM;
    }

    static class Builder {
        private String title;
        private String content;
        private PlanM planM;

        Builder() {}

        Builder title(String title) {
            this.title = title;
            return this;
        }

        Builder content(String content) {
            this.content = content;
            return this;
        }

        Builder planM(PlanM planM) {
            this.planM = planM;
            return this;
        }

        PlanPost build() {
            return new PlanPost(this);
        }
    }
}
