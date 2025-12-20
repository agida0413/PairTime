package com.kyj.backend.repository.planPost;

import com.kyj.backend.domain.plan.planM.QPlanM;
import com.kyj.backend.domain.plan.planPost.PlanPost;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;

import static com.kyj.backend.domain.file.QFile.*;
import static com.kyj.backend.domain.plan.planM.QPlanM.*;
import static com.kyj.backend.domain.plan.planPost.QPlanPost.*;

public class PlanPostRepositoryImpl implements PlanPostQueryRepository{
    private final JPAQueryFactory queryFactory;

    public PlanPostRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }

    @Override
    public PlanPost findPlanPost(Long planId) {
        PlanPost planPostRes = queryFactory.selectFrom(planPost)
                .distinct()
                .join(planPost.planM, planM)
                .fetchJoin()
                .join(planPost.files, file)
                .fetchJoin()
                .where(planM.id.eq(planId))
                .fetchOne();

        return planPostRes;
    }
}
