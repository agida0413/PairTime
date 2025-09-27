package com.kyj.backend.domain.file;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

/**
 * File Entity
 */
@Entity
public class File extends BaseEntity {
    @Id @GeneratedValue
    @Column(name = "file_id")
    private Long id;


    @Column(name="file_type",length = 40)
    private String fileType;
}
