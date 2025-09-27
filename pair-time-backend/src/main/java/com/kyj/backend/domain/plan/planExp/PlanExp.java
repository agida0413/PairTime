package com.kyj.backend.domain.plan.planExp;

import com.kyj.core.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class PlanExp extends BaseEntity {

    @Id @GeneratedValue
    @Column(name = "plan_exp_id")
    private Long id;

}
