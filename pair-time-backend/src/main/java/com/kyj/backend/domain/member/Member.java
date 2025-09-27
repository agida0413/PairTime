package com.kyj.backend.domain.member;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Entity
@Getter
public class Member extends BaseEntity {
    @Id
    @GeneratedValue
    @Column(name = "user_id")
    private Long id;

    @Column(name = "username",length = 30 , nullable = false, unique = true)
    @NotNull
    private String username;

    @Column(name = "email",length = 100 , nullable = false, unique = true)
    @NotNull
    private String email;

    @Column(name="profile",length = 150 )
    private String profile;

    @Column(name = "role",length = 40 , nullable = false)
    @NotNull //따로 DDL문 작성
    private String role = "ROLE_USER";

}
