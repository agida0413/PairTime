package com.kyj.backend.service.test;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 대량 테스트 데이터 생성 서비스
 * 각 테이블에 수천만 건의 의미있는 데이터를 생성합니다.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TestDataGenerationService {

    private final JdbcTemplate jdbcTemplate;
    private final Random random = new Random();

    // 배치 사이즈
    private static final int BATCH_SIZE = 1000;

    // 한국 성씨와 이름
    private static final String[] KOREAN_LAST_NAMES = {
        "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안",
        "송", "류", "전", "홍", "고", "문", "양", "손", "배", "백", "허", "유", "남", "심", "노", "하", "곽"
    };

    private static final String[] KOREAN_FIRST_NAMES = {
        "민준", "서준", "예준", "도윤", "시우", "주원", "하준", "지호", "지후", "준서",
        "서연", "서윤", "지우", "서현", "민서", "하은", "윤서", "지유", "채원", "지민",
        "현우", "건우", "우진", "선우", "연우", "정우", "승우", "승현", "시윤", "준혁",
        "수아", "소율", "아린", "다은", "예은", "수빈", "예린", "하윤", "채은", "지원"
    };

    // 이메일 도메인
    private static final String[] EMAIL_DOMAINS = {
        "gmail.com", "naver.com", "kakao.com", "daum.net", "hanmail.net", "outlook.com", "yahoo.com"
    };

    // OAuth Provider
    private static final String[] PROVIDERS = {"google", "kakao", "naver"};

    // 일정 제목 샘플
    private static final String[] PLAN_TITLES_COUPLE = {
        "데이트", "영화 관람", "맛집 탐방", "카페 투어", "산책", "드라이브", "쇼핑", "공연 관람",
        "전시회", "여행", "피크닉", "놀이공원", "운동", "요리", "게임", "독서 모임"
    };

    private static final String[] PLAN_TITLES_SOLO = {
        "개인 운동", "독서", "공부", "취미 활동", "친구 만남", "가족 모임", "병원", "회의",
        "개인 일정", "자기계발", "온라인 강의", "자격증 공부"
    };

    // 지출 항목
    private static final String[] EXPENSE_TITLES = {
        "식사", "카페", "교통비", "영화", "쇼핑", "선물", "간식", "술", "디저트", "주유비",
        "주차비", "입장료", "숙박비", "택시비", "배달음식", "편의점", "문화생활", "기타"
    };

    /**
     * 전체 테스트 데이터 생성
     */
    @Transactional
    public void generateAllTestData(long memberCount, long planGrpCount) {
        log.info("=== 대량 테스트 데이터 생성 시작 ===");
        long startTime = System.currentTimeMillis();

        try {
            // 0. 기존 데이터 삭제 (외래 키 역순)
            log.info("0. 기존 데이터 삭제 중...");
            clearAllTables();

            // 1. Member 생성
            log.info("1. Member 데이터 생성 시작... (목표: {}건)", memberCount);
            generateMembers(memberCount);

            // 2. PlanGrp 생성 (Member의 절반이 커플)
            log.info("2. PlanGrp 데이터 생성 시작... (목표: {}건)", planGrpCount);
            generatePlanGrps(planGrpCount);

            // 3. PlanGrpMember 생성 (각 그룹당 2명)
            log.info("3. PlanGrpMember 데이터 생성 시작...");
            generatePlanGrpMembers(planGrpCount);

            // 4. PlanM 생성 (그룹당 평균 20개)
            long planMCount = planGrpCount * 20;
            log.info("4. PlanM 데이터 생성 시작... (목표: {}건)", planMCount);
            generatePlanMs(planGrpCount, planMCount);

            // 5. PlanParticipant 생성
            log.info("5. PlanParticipant 데이터 생성 시작...");
            generatePlanParticipants(planMCount);

            // 6. PlanExp & PlanExpD 생성 (일정의 50%에 지출)
            long planExpCount = planMCount / 2;
            log.info("6. PlanExp & PlanExpD 데이터 생성 시작... (목표: {}건)", planExpCount);
            generatePlanExpsAndDetails(planExpCount);

            // 7. PlanPost 생성 (일정의 30%에 게시물)
            long planPostCount = planMCount * 3 / 10;
            log.info("7. PlanPost 데이터 생성 시작... (목표: {}건)", planPostCount);
            generatePlanPosts(planPostCount);

            // 8. PlanReview 생성 (일정의 40%에 리뷰, 참여자당)
            long planReviewCount = planMCount * 4 / 10 * 2;
            log.info("8. PlanReview 데이터 생성 시작... (목표: {}건)", planReviewCount);
            generatePlanReviews(planReviewCount);

            long endTime = System.currentTimeMillis();
            log.info("=== 대량 테스트 데이터 생성 완료! 소요시간: {}초 ===", (endTime - startTime) / 1000);

        } catch (Exception e) {
            log.error("테스트 데이터 생성 중 오류 발생", e);
            throw new RuntimeException("테스트 데이터 생성 실패", e);
        }
    }

    /**
     * Member 데이터 생성
     */
    private void generateMembers(long count) {
        String sql = "INSERT INTO MEMBER (username, email, profile, provider, nickname, role, created_date, last_modified_date) " +
                     "VALUES (?, ?, ?, ?, ?, 'ROLE_USER', NOW(), NOW())";

        long batchCount = (count / BATCH_SIZE) + 1;

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE;
            long endIdx = Math.min(startIdx + BATCH_SIZE, count);

            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    long idx = startIdx + i + 1;
                    String lastName = KOREAN_LAST_NAMES[random.nextInt(KOREAN_LAST_NAMES.length)];
                    String firstName = KOREAN_FIRST_NAMES[random.nextInt(KOREAN_FIRST_NAMES.length)];
                    String nickname = lastName + firstName;
                    String username = "user" + idx;
                    String email = "user" + idx + "@" + EMAIL_DOMAINS[random.nextInt(EMAIL_DOMAINS.length)];
                    String profile = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + idx;
                    String provider = PROVIDERS[random.nextInt(PROVIDERS.length)];

                    ps.setString(1, username);
                    ps.setString(2, email);
                    ps.setString(3, profile);
                    ps.setString(4, provider);
                    ps.setString(5, nickname);
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            if (batch % 100 == 0) {
                log.info("Member 생성 진행률: {}/{} ({}%)",
                    endIdx, count, (endIdx * 100 / count));
            }
        }

        log.info("Member 데이터 생성 완료: {}건", count);
    }

    /**
     * PlanGrp 데이터 생성
     */
    private void generatePlanGrps(long count) {
        String sql = "INSERT INTO PLAN_GRP (love_start_at, created_date, last_modified_date) VALUES (?, NOW(), NOW())";

        long batchCount = (count / BATCH_SIZE) + 1;
        LocalDate today = LocalDate.now();

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE;
            long endIdx = Math.min(startIdx + BATCH_SIZE, count);

            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    // 최근 5년 내 연애 시작일
                    int daysAgo = random.nextInt(365 * 5);
                    LocalDate loveStartAt = today.minusDays(daysAgo);

                    ps.setDate(1, java.sql.Date.valueOf(loveStartAt));
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            if (batch % 100 == 0) {
                log.info("PlanGrp 생성 진행률: {}/{} ({}%)",
                    endIdx, count, (endIdx * 100 / count));
            }
        }

        log.info("PlanGrp 데이터 생성 완료: {}건", count);
    }

    /**
     * PlanGrpMember 데이터 생성 (각 그룹당 2명)
     */
    private void generatePlanGrpMembers(long planGrpCount) {
        String sql = "INSERT INTO PLAN_GRP_MEMBER (plan_grp_id, user_id, created_date, last_modified_date) VALUES (?, ?, NOW(), NOW())";

        long totalCount = planGrpCount * 2;
        long batchCount = (totalCount / BATCH_SIZE) + 1;

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE;
            long endIdx = Math.min(startIdx + BATCH_SIZE, totalCount);

            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    long idx = startIdx + i;
                    long planGrpId = (idx / 2) + 1;  // 각 그룹에 2명
                    // user_id: 그룹1은 1,2 / 그룹2는 3,4 / 그룹3은 5,6 ...
                    long userId = idx + 1;

                    ps.setLong(1, planGrpId);
                    ps.setLong(2, userId);
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            if (batch % 100 == 0) {
                log.info("PlanGrpMember 생성 진행률: {}/{} ({}%)",
                    endIdx, totalCount, (endIdx * 100 / totalCount));
            }
        }

        log.info("PlanGrpMember 데이터 생성 완료: {}건", totalCount);
    }

    /**
     * PlanM 데이터 생성
     */
    private void generatePlanMs(long planGrpCount, long totalPlanCount) {
        String sql = "INSERT INTO PLAN_M (title, content, alarm_yn, full_yn, start_at, end_at, plan_type, plan_grp_id, del_yn, created_date, last_modified_date) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N', NOW(), NOW())";

        long batchCount = (totalPlanCount / BATCH_SIZE) + 1;
        LocalDateTime now = LocalDateTime.now();

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE;
            long endIdx = Math.min(startIdx + BATCH_SIZE, totalPlanCount);

            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    long idx = startIdx + i;
                    long planGrpId = (idx % planGrpCount) + 1;

                    // 30% SOLO, 70% COUPLE
                    boolean isSolo = random.nextInt(100) < 30;
                    String planType = isSolo ? "SOLO" : "COUPLE";

                    String[] titleSource = isSolo ? PLAN_TITLES_SOLO : PLAN_TITLES_COUPLE;
                    String title = titleSource[random.nextInt(titleSource.length)];
                    String content = title + " 계획입니다.";

                    // 최근 2년 내 일정
                    int daysOffset = random.nextInt(365 * 2) - 365;  // -365 ~ +365
                    LocalDateTime startAt = now.plusDays(daysOffset)
                        .withHour(random.nextInt(24))
                        .withMinute(random.nextInt(60))
                        .withSecond(0);

                    // 1~6시간 일정
                    LocalDateTime endAt = startAt.plusHours(random.nextInt(6) + 1);

                    String alarmYn = random.nextBoolean() ? "Y" : "N";
                    String fullYn = random.nextInt(100) < 10 ? "Y" : "N";  // 10% 하루종일

                    ps.setString(1, title);
                    ps.setString(2, content);
                    ps.setString(3, alarmYn);
                    ps.setString(4, fullYn);
                    ps.setObject(5, startAt);
                    ps.setObject(6, endAt);
                    ps.setString(7, planType);
                    ps.setLong(8, planGrpId);
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            if (batch % 100 == 0) {
                log.info("PlanM 생성 진행률: {}/{} ({}%)",
                    endIdx, totalPlanCount, (endIdx * 100 / totalPlanCount));
            }
        }

        log.info("PlanM 데이터 생성 완료: {}건", totalPlanCount);
    }

    /**
     * PlanParticipant 데이터 생성
     */
    private void generatePlanParticipants(long planMCount) {
        // COUPLE 일정은 2명, SOLO 일정은 1명
        // 평균 1.7명 (70% * 2 + 30% * 1 = 1.7)

        String insertSql = "INSERT INTO PLAN_PARTICIPANT (plan_m_id, participant_id, created_date, last_modified_date) VALUES (?, ?, NOW(), NOW())";

        AtomicLong totalInserted = new AtomicLong(0);
        List<Object[]> batchArgs = new ArrayList<>();

        // 배치 단위로 처리 (메모리 효율성)
        long pageSize = 10000;
        long totalPages = (planMCount / pageSize) + 1;

        for (long page = 0; page < totalPages; page++) {
            long offset = page * pageSize;
            String selectSql = "SELECT plan_id, plan_type, plan_grp_id FROM PLAN_M ORDER BY plan_id LIMIT " + pageSize + " OFFSET " + offset;
            String selectMembersSql = "SELECT user_id FROM PLAN_GRP_MEMBER WHERE plan_grp_id = ? LIMIT 2";

            jdbcTemplate.query(selectSql, rs -> {
                long planId = rs.getLong("plan_id");
                String planType = rs.getString("plan_type");
                long planGrpId = rs.getLong("plan_grp_id");

                // 해당 그룹의 멤버 조회
                List<Long> memberIds = jdbcTemplate.query(selectMembersSql,
                    (rs2, rowNum) -> rs2.getLong("user_id"),
                    planGrpId);

                if ("COUPLE".equals(planType)) {
                    // 둘 다 참여
                    for (Long memberId : memberIds) {
                        batchArgs.add(new Object[]{planId, memberId});
                    }
                } else {
                    // SOLO - 랜덤하게 1명
                    if (!memberIds.isEmpty()) {
                        Long memberId = memberIds.get(random.nextInt(memberIds.size()));
                        batchArgs.add(new Object[]{planId, memberId});
                    }
                }

                // 배치 실행
                if (batchArgs.size() >= BATCH_SIZE) {
                    jdbcTemplate.batchUpdate(insertSql, batchArgs);
                    totalInserted.addAndGet(batchArgs.size());

                    if (totalInserted.get() % 10000 == 0) {
                        log.info("PlanParticipant 생성 진행: {}건", totalInserted.get());
                    }

                    batchArgs.clear();
                }
            });

            if (page % 10 == 0) {
                log.info("PlanParticipant 페이지 처리 진행: {}/{} ({}%)",
                    page, totalPages, (page * 100 / totalPages));
            }
        }

        // 남은 배치 실행
        if (!batchArgs.isEmpty()) {
            jdbcTemplate.batchUpdate(insertSql, batchArgs);
            totalInserted.addAndGet(batchArgs.size());
        }

        log.info("PlanParticipant 데이터 생성 완료: {}건", totalInserted.get());
    }

    /**
     * PlanExp & PlanExpD 데이터 생성
     */
    private void generatePlanExpsAndDetails(long planExpCount) {
        String expSql = "INSERT INTO PLAN_EXP (plan_id, created_date, last_modified_date) VALUES (?, NOW(), NOW())";
        String expDSql = "INSERT INTO PLAN_EXP_D (expenditure, title, plan_exp_id, created_date, last_modified_date) VALUES (?, ?, ?, NOW(), NOW())";

        long batchCount = (planExpCount / BATCH_SIZE) + 1;

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE + 1;  // plan_id는 1부터 시작
            long endIdx = Math.min(startIdx + BATCH_SIZE, planExpCount + 1);

            // PlanExp 생성
            jdbcTemplate.batchUpdate(expSql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    long planId = startIdx + i;
                    ps.setLong(1, planId);
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            // 각 PlanExp에 대해 1~5개의 PlanExpD 생성
            List<Object[]> expDBatchArgs = new ArrayList<>();
            for (long planExpId = startIdx; planExpId < endIdx; planExpId++) {
                int detailCount = random.nextInt(5) + 1;
                for (int d = 0; d < detailCount; d++) {
                    String title = EXPENSE_TITLES[random.nextInt(EXPENSE_TITLES.length)];
                    // 1,000원 ~ 500,000원
                    BigDecimal amount = BigDecimal.valueOf((random.nextInt(500) + 1) * 1000);
                    expDBatchArgs.add(new Object[]{amount, title, planExpId});
                }
            }

            if (!expDBatchArgs.isEmpty()) {
                jdbcTemplate.batchUpdate(expDSql, expDBatchArgs);
            }

            if (batch % 100 == 0) {
                log.info("PlanExp 생성 진행률: {}/{} ({}%)",
                    endIdx - 1, planExpCount, ((endIdx - 1) * 100 / planExpCount));
            }
        }

        log.info("PlanExp & PlanExpD 데이터 생성 완료");
    }

    /**
     * PlanPost 데이터 생성
     */
    private void generatePlanPosts(long count) {
        String sql = "INSERT INTO PLAN_POST (title, content, plan_id, created_date, last_modified_date) VALUES (?, ?, ?, NOW(), NOW())";

        long batchCount = (count / BATCH_SIZE) + 1;

        for (long batch = 0; batch < batchCount; batch++) {
            long startIdx = batch * BATCH_SIZE + 1;
            long endIdx = Math.min(startIdx + BATCH_SIZE, count + 1);

            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    long planId = startIdx + i;
                    String title = "추억의 순간";
                    String content = "오늘 정말 즐거운 시간을 보냈습니다!";

                    ps.setString(1, title);
                    ps.setString(2, content);
                    ps.setLong(3, planId);
                }

                @Override
                public int getBatchSize() {
                    return (int)(endIdx - startIdx);
                }
            });

            if (batch % 100 == 0) {
                log.info("PlanPost 생성 진행률: {}/{} ({}%)",
                    endIdx - 1, count, ((endIdx - 1) * 100 / count));
            }
        }

        log.info("PlanPost 데이터 생성 완료: {}건", count);
    }

    /**
     * PlanReview 데이터 생성
     */
    private void generatePlanReviews(long count) {
        String insertSql = "INSERT INTO PLAN_REVIEW (rating, plan_id, reviewer_id, created_date, last_modified_date) VALUES (?, ?, ?, NOW(), NOW())";

        List<Object[]> batchArgs = new ArrayList<>();
        AtomicLong totalInserted = new AtomicLong(0);

        // 배치 단위로 처리 (메모리 효율성)
        long pageSize = 10000;
        long totalPages = (count / pageSize) + 1;

        for (long page = 0; page < totalPages; page++) {
            long offset = page * pageSize;
            long limit = Math.min(pageSize, count - offset);

            if (limit <= 0) break;

            String selectSql = "SELECT pp.plan_m_id, pp.participant_id FROM PLAN_PARTICIPANT pp LIMIT " + limit + " OFFSET " + offset;

            jdbcTemplate.query(selectSql, rs -> {
                long planId = rs.getLong("plan_m_id");
                long reviewerId = rs.getLong("participant_id");

                // 1.0 ~ 5.0 사이의 평점
                BigDecimal rating = BigDecimal.valueOf((random.nextInt(41) + 10) / 10.0);  // 1.0 ~ 5.0

                batchArgs.add(new Object[]{rating, planId, reviewerId});

                if (batchArgs.size() >= BATCH_SIZE) {
                    jdbcTemplate.batchUpdate(insertSql, batchArgs);
                    totalInserted.addAndGet(batchArgs.size());

                    if (totalInserted.get() % 10000 == 0) {
                        log.info("PlanReview 생성 진행: {}건", totalInserted.get());
                    }

                    batchArgs.clear();
                }
            });

            if (page % 10 == 0) {
                log.info("PlanReview 페이지 처리 진행: {}/{} ({}%)",
                    page, totalPages, (page * 100 / totalPages));
            }
        }

        if (!batchArgs.isEmpty()) {
            jdbcTemplate.batchUpdate(insertSql, batchArgs);
            totalInserted.addAndGet(batchArgs.size());
        }

        log.info("PlanReview 데이터 생성 완료: {}건", totalInserted.get());
    }

    /**
     * 테이블별 데이터 통계 조회
     */
    public Map<String, Object> getTableStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            stats.put("MEMBER", getTableCount("MEMBER"));
            stats.put("PLAN_GRP", getTableCount("PLAN_GRP"));
            stats.put("PLAN_GRP_MEMBER", getTableCount("PLAN_GRP_MEMBER"));
            stats.put("PLAN_M", getTableCount("PLAN_M"));
            stats.put("PLAN_PARTICIPANT", getTableCount("PLAN_PARTICIPANT"));
            stats.put("PLAN_EXP", getTableCount("PLAN_EXP"));
            stats.put("PLAN_EXP_D", getTableCount("PLAN_EXP_D"));
            stats.put("PLAN_POST", getTableCount("PLAN_POST"));
            stats.put("PLAN_REVIEW", getTableCount("PLAN_REVIEW"));

            long totalRecords = stats.values().stream()
                .filter(v -> v instanceof Long)
                .mapToLong(v -> (Long) v)
                .sum();

            stats.put("TOTAL_RECORDS", totalRecords);

            log.info("테이블 통계: {}", stats);

        } catch (Exception e) {
            log.error("통계 조회 중 오류 발생", e);
            stats.put("error", e.getMessage());
        }

        return stats;
    }

    /**
     * 특정 테이블의 레코드 수 조회
     */
    private Long getTableCount(String tableName) {
        String sql = "SELECT COUNT(*) FROM " + tableName;
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    /**
     * 모든 테이블 데이터 삭제 (외래 키 역순)
     */
    private void clearAllTables() {
        try {
            // 외래 키 제약조건 비활성화
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // 테이블 truncate (역순)
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_REVIEW");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_POST");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_EXP_D");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_EXP");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_PARTICIPANT");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_M");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_GRP_MEMBER");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_GRP");
            jdbcTemplate.execute("TRUNCATE TABLE PLAN_GRP_TEMP");
            jdbcTemplate.execute("TRUNCATE TABLE MEMBER");

            // 외래 키 제약조건 재활성화
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            log.info("기존 데이터 삭제 완료");
        } catch (Exception e) {
            log.error("데이터 삭제 중 오류 발생", e);
            throw new RuntimeException("데이터 삭제 실패", e);
        }
    }
}
