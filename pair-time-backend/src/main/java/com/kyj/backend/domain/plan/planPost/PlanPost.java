package com.kyj.backend.domain.plan.planPost;

import com.kyj.backend.domain.file.File;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PLAN_POST")
@Getter
@Setter
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
    @JoinColumn(name = "plan_id")
    private PlanM planM;

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
}
