package com.kyj.backend.repository.planPost;

import com.kyj.backend.domain.plan.planPost.PlanPost;

import java.util.List;

public interface PlanPostQueryRepository {

    public PlanPost findPlanPost(Long planId);
}
