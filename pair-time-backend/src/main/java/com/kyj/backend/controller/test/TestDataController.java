package com.kyj.backend.controller.test;

import com.kyj.backend.service.test.TestDataGenerationService;
import com.kyj.core.api.ApiResponse;
import com.kyj.core.security.client.annotation.PublicEndpoint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 테스트 데이터 생성 컨트롤러
 *
 * 주의: 이 컨트롤러는 개발/테스트 환경에서만 사용해야 합니다!
 * 프로덕션 환경에서는 비활성화하세요.
 */
@RestController
@RequestMapping("/api/v1/test/data")
@RequiredArgsConstructor
@Slf4j
public class TestDataController {

    private final TestDataGenerationService testDataGenerationService;

    /**
     * 대량 테스트 데이터 생성
     *
     * @param memberCount 생성할 회원 수 (기본값: 1,000,000)
     * @param planGrpCount 생성할 커플 그룹 수 (기본값: 500,000)
     * @return 생성 결과
     *
     * 예시:
     * - 소규모 테스트: /api/v1/test/data/generate?memberCount=10000&planGrpCount=5000
     * - 중규모 테스트: /api/v1/test/data/generate?memberCount=1000000&planGrpCount=500000
     * - 대규모 테스트: /api/v1/test/data/generate?memberCount=10000000&planGrpCount=5000000
     */
    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_JSON_VALUE)
    @PublicEndpoint
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateTestData(
            @RequestParam(defaultValue = "1000000") long memberCount,
            @RequestParam(defaultValue = "500000") long planGrpCount) {

        log.info("=== 테스트 데이터 생성 요청 ===");
        log.info("회원 수: {}", memberCount);
        log.info("커플 그룹 수: {}", planGrpCount);

        // 입력값 검증
        if (memberCount < 1000 || memberCount > 50_000_000) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "회원 수는 1,000 ~ 50,000,000 사이여야 합니다.");
            return ResponseEntity.badRequest()
                .body(ApiResponse.ok(errorResult));
        }

        if (planGrpCount < 500 || planGrpCount > 25_000_000) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "커플 그룹 수는 500 ~ 25,000,000 사이여야 합니다.");
            return ResponseEntity.badRequest()
                .body(ApiResponse.ok(errorResult));
        }

        if (planGrpCount * 2 > memberCount) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "커플 그룹 수는 회원 수의 절반 이하여야 합니다.");
            return ResponseEntity.badRequest()
                .body(ApiResponse.ok(errorResult));
        }

        long startTime = System.currentTimeMillis();

        try {
            // 비동기로 실행하는 것을 권장하지만, 여기서는 동기로 실행
            testDataGenerationService.generateAllTestData(memberCount, planGrpCount);

            long endTime = System.currentTimeMillis();
            long durationSeconds = (endTime - startTime) / 1000;

            Map<String, Object> result = new HashMap<>();
            result.put("memberCount", memberCount);
            result.put("planGrpCount", planGrpCount);
            result.put("estimatedPlanMCount", planGrpCount * 20);
            result.put("estimatedPlanExpCount", planGrpCount * 10);
            result.put("estimatedPlanPostCount", planGrpCount * 6);
            result.put("estimatedPlanReviewCount", planGrpCount * 16);
            result.put("durationSeconds", durationSeconds);
            result.put("message", "테스트 데이터 생성 완료!");

            return ResponseEntity.ok(ApiResponse.ok(result));

        } catch (Exception e) {
            log.error("테스트 데이터 생성 중 오류 발생", e);
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "테스트 데이터 생성 실패: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(ApiResponse.ok(errorResult));
        }
    }

    /**
     * 소규모 테스트 데이터 생성 (빠른 테스트용)
     * 회원 10,000명, 커플 5,000쌍
     */
    @PostMapping(value = "/generate/small", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateSmallTestData() {
        return generateTestData(10_000, 5_000);
    }

    /**
     * 중규모 테스트 데이터 생성
     * 회원 1,000,000명, 커플 500,000쌍
     */
    @PostMapping(value = "/generate/medium", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateMediumTestData() {
        return generateTestData(1_000_000, 500_000);
    }

    /**
     * 대규모 테스트 데이터 생성 (성능 테스트용)
     * 회원 10,000,000명, 커플 5,000,000쌍
     *
     * 주의: 이 작업은 매우 오래 걸릴 수 있습니다!
     */
    @PostMapping(value = "/generate/large", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateLargeTestData() {
        return generateTestData(10_000_000, 5_000_000);
    }

    /**
     * 초대규모 테스트 데이터 생성 (극한 성능 테스트용)
     * 회원 30,000,000명, 커플 15,000,000쌍
     *
     * 경고: 이 작업은 수 시간이 걸릴 수 있으며, 충분한 디스크 공간이 필요합니다!
     */
    @PostMapping(value = "/generate/xlarge", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateXLargeTestData() {
        log.warn("!!! 초대규모 테스트 데이터 생성 시작 - 이 작업은 수 시간이 걸릴 수 있습니다 !!!");
        return generateTestData(30_000_000, 15_000_000);
    }

    /**
     * 현재 데이터베이스 통계 조회
     */
    @GetMapping(value = "/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDataStats() {
        Map<String, Object> stats = testDataGenerationService.getTableStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
