package com.kyj.backend.repository.planPost;

import com.kyj.backend.domain.plan.planPost.PlanPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanPostRepository extends JpaRepository<PlanPost,Long>,PlanPostQueryRepository {
}
