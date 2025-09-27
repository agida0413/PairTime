package com.kyj.backend.domain.plan.planGrp;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Entity
@Getter
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id_1", "user_id_2"})
        }
)
public class PlanGrp extends BaseEntity {

    @Id @GeneratedValue
    @Column(name = "plan_grp_id")
    private Long id;

    @Column(name = "user_id_1",nullable = false)
    @NotNull
    private Long userId1;

    @Column(name = "user_id_2",nullable = false)
    @NotNull
    private Long userId2;

    @Column(name="love_start_at",nullable = false)
    private LocalDate loveStartAt;

}
