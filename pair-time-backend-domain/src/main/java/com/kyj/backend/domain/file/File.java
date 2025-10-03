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
@Setter
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
}
