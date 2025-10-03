package com.kyj.backend.domain.file;

import com.kyj.backend.domain.plan.planPost.PlanPost;
import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

/**
 * File Entity
 */
@Entity
@Table(name = "FILE", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "obj_id","priority"
        })
})
@Getter
public class File extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long id;


    @Column(name="file_type",length = 40,nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(name = "file_url",length = 300,nullable = false)
    @NotNull
    private String fileUrl;

    @Column(name = "filename",length = 100 , nullable = false)
    @NotNull
    private String filename;


    @Column(name = "priority",nullable = false)
    @NotNull
    private int priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obj_id")
    private PlanPost planPost;

    void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    void setFilename(String filename) {
        this.filename = filename;
    }

    void setPriority(int priority) {
        this.priority = priority;
    }

    private File(Builder builder) {
        this.fileType = builder.fileType;
        this.fileUrl = builder.fileUrl;
        this.filename = builder.filename;
        this.priority = builder.priority;
        this.planPost = builder.planPost;
    }

    static class Builder {
        private FileType fileType;
        private String fileUrl;
        private String filename;
        private int priority;
        private PlanPost planPost;

        Builder() {}

        Builder fileType(FileType fileType) {
            this.fileType = fileType;
            return this;
        }

        Builder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        Builder filename(String filename) {
            this.filename = filename;
            return this;
        }

        Builder priority(int priority) {
            this.priority = priority;
            return this;
        }

        Builder planPost(PlanPost planPost) {
            this.planPost = planPost;
            return this;
        }

        File build() {
            return new File(this);
        }
    }
}
