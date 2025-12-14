# 대량 테스트 데이터 생성 가이드

## 개요

이 시스템은 PairTime 애플리케이션의 성능 테스트와 부하 테스트를 위해 **수천만 건의 의미있는 테스트 데이터**를 자동으로 생성합니다.

### 주요 기능

- ✅ **대규모 데이터 생성**: 테이블당 수천만 건 이상의 데이터 생성 가능
- ✅ **의미있는 데이터**: 랜덤이 아닌 실제 사용 패턴을 반영한 데이터
- ✅ **엔티티 관계 유지**: FK 제약조건과 비즈니스 로직을 준수
- ✅ **배치 처리**: JdbcTemplate Batch Insert로 고속 처리
- ✅ **진행률 표시**: 실시간 로그로 생성 진행 상황 확인
- ✅ **통계 조회**: 현재 데이터베이스 상태 확인

---

## 엔티티 구조 분석

### 엔티티 관계도

```
Member (회원)
  ├─ 1:N → PlanGrpMember (그룹 멤버)
  ├─ 1:N → PlanParticipant (일정 참여자)
  ├─ 1:N → PlanReview (리뷰)
  └─ 1:N → PlanGrpTemp (초대)

PlanGrp (커플 그룹)
  ├─ 1:N → PlanGrpMember (2명의 멤버)
  ├─ 1:N → PlanM (일정)
  └─ love_start_at (연애 시작일)

PlanM (일정)
  ├─ 1:N → PlanParticipant (참여자)
  ├─ 1:N → PlanExp (지출)
  ├─ 1:N → PlanPost (게시물)
  ├─ 1:N → PlanReview (리뷰)
  └─ planType: COUPLE | SOLO

PlanExp (지출 마스터)
  └─ 1:N → PlanExpD (지출 상세)
```

### 데이터 생성 규칙

| 엔티티 | 생성 규칙 | 비율/개수 |
|--------|----------|-----------|
| **Member** | 기본 | 입력값 그대로 |
| **PlanGrp** | 커플 그룹 | 입력값 그대로 |
| **PlanGrpMember** | 그룹당 2명 | PlanGrp × 2 |
| **PlanM** | 그룹당 20개 일정 | PlanGrp × 20 |
| **PlanParticipant** | COUPLE: 2명, SOLO: 1명 | 평균 1.7명 |
| **PlanExp** | 일정의 50% | PlanM × 0.5 |
| **PlanExpD** | 지출당 1~5개 | 평균 2.5개 |
| **PlanPost** | 일정의 30% | PlanM × 0.3 |
| **PlanReview** | 일정의 40%, 참여자당 | PlanM × 0.4 × 2 |

---

## API 사용 방법

### 1. 기본 사용법

```bash
# 커스텀 데이터 생성
POST /api/v1/test/data/generate?memberCount=1000000&planGrpCount=500000
```

**파라미터:**
- `memberCount`: 생성할 회원 수 (1,000 ~ 50,000,000)
- `planGrpCount`: 생성할 커플 그룹 수 (500 ~ 25,000,000)
  - ⚠️ `planGrpCount * 2 ≤ memberCount` 제약 조건

**응답 예시:**
```json
{
  "status": 200,
  "msg": "성공",
  "data": {
    "memberCount": 1000000,
    "planGrpCount": 500000,
    "estimatedPlanMCount": 10000000,
    "estimatedPlanExpCount": 5000000,
    "estimatedPlanPostCount": 3000000,
    "estimatedPlanReviewCount": 8000000,
    "durationSeconds": 1250,
    "message": "테스트 데이터 생성 완료!"
  }
}
```

### 2. 사전 정의된 크기별 생성

#### 소규모 (빠른 테스트용)
```bash
POST /api/v1/test/data/generate/small
```
- 회원: 10,000명
- 커플 그룹: 5,000쌍
- 예상 총 레코드: ~약 100만 건
- 예상 소요 시간: ~1-2분

#### 중규모 (기본 테스트)
```bash
POST /api/v1/test/data/generate/medium
```
- 회원: 1,000,000명
- 커플 그룹: 500,000쌍
- 예상 총 레코드: ~약 1억 건
- 예상 소요 시간: ~15-20분

#### 대규모 (성능 테스트)
```bash
POST /api/v1/test/data/generate/large
```
- 회원: 10,000,000명
- 커플 그룹: 5,000,000쌍
- 예상 총 레코드: ~약 10억 건
- 예상 소요 시간: ~2-3시간

#### 초대규모 (극한 성능 테스트)
```bash
POST /api/v1/test/data/generate/xlarge
```
- 회원: 30,000,000명
- 커플 그룹: 15,000,000쌍
- 예상 총 레코드: ~약 30억 건
- 예상 소요 시간: ~6-10시간
- ⚠️ **경고**: 충분한 디스크 공간 필요 (최소 100GB 이상)

### 3. 데이터 통계 조회

```bash
GET /api/v1/test/data/stats
```

**응답 예시:**
```json
{
  "status": 200,
  "msg": "성공",
  "data": {
    "MEMBER": 10000000,
    "PLAN_GRP": 5000000,
    "PLAN_GRP_MEMBER": 10000000,
    "PLAN_M": 100000000,
    "PLAN_PARTICIPANT": 170000000,
    "PLAN_EXP": 50000000,
    "PLAN_EXP_D": 125000000,
    "PLAN_POST": 30000000,
    "PLAN_REVIEW": 80000000,
    "TOTAL_RECORDS": 565000000
  }
}
```

---

## 생성되는 데이터 특징

### 1. Member (회원)
- **실제 한국 이름**: 35개 성씨 + 40개 이름 조합
- **다양한 이메일 도메인**: gmail, naver, kakao, daum 등 7개 도메인
- **OAuth Provider**: google, kakao, naver
- **프로필 이미지**: Dicebear API 활용

### 2. PlanGrp (커플 그룹)
- **연애 시작일**: 최근 5년 내 랜덤
- **기념일 자동 생성**: 100일, 200일, 1주년, 2주년 등 자동 생성

### 3. PlanM (일정)
- **일정 타입**: 70% COUPLE, 30% SOLO
- **시간 분포**: 최근 2년 (-1년 ~ +1년)
- **일정 제목**: 실제 데이트/개인 활동 기반 (16종류)
- **시간대**: 1~6시간 일정
- **하루종일**: 10% 확률

### 4. PlanExp & PlanExpD (지출)
- **지출 항목**: 식사, 카페, 교통비, 영화 등 18종류
- **금액 범위**: 1,000원 ~ 500,000원
- **지출 상세**: 지출당 1~5개 항목

### 5. PlanReview (리뷰)
- **평점 범위**: 1.0 ~ 5.0 (0.1 단위)
- **분포**: 정규 분포를 따르는 현실적인 평점

---

## 성능 최적화

### 배치 처리
- **Batch Size**: 1,000건씩 일괄 처리
- **JdbcTemplate Batch Insert** 활용
- **트랜잭션 분할**: 메모리 효율성 확보

### 진행률 표시
- 100 배치마다 진행률 로깅
- 실시간 생성 건수 확인 가능

### 로깅 예시
```
[INFO] === 대량 테스트 데이터 생성 시작 ===
[INFO] 1. Member 데이터 생성 시작... (목표: 1000000건)
[INFO] Member 생성 진행률: 100000/1000000 (10%)
[INFO] Member 생성 진행률: 200000/1000000 (20%)
...
[INFO] Member 데이터 생성 완료: 1000000건
[INFO] 2. PlanGrp 데이터 생성 시작... (목표: 500000건)
...
[INFO] === 대량 테스트 데이터 생성 완료! 소요시간: 1250초 ===
```

---

## 사용 시 주의사항

### ⚠️ 중요

1. **개발/테스트 환경에서만 사용**
   - 프로덕션 환경에서는 절대 사용 금지
   - application.yml에서 환경별 활성화 설정 권장

2. **데이터베이스 준비**
   - 충분한 디스크 공간 확보
   - 대규모: 최소 50GB
   - 초대규모: 최소 100GB 이상

3. **데이터베이스 설정**
   ```sql
   -- Batch Insert 성능 향상
   SET GLOBAL innodb_buffer_pool_size = 2147483648;  -- 2GB
   SET GLOBAL max_allowed_packet = 67108864;  -- 64MB

   -- Batch Insert 최적화
   SET GLOBAL innodb_flush_log_at_trx_commit = 2;
   SET GLOBAL sync_binlog = 0;
   ```

4. **실행 시간**
   - 소규모: 1-2분
   - 중규모: 15-20분
   - 대규모: 2-3시간
   - 초대규모: 6-10시간 이상

5. **메모리 관리**
   - 배치 단위로 처리하므로 메모리 사용량 적정
   - JVM 힙 메모리: 최소 2GB 권장

---

## 트러블슈팅

### 1. OutOfMemoryError 발생
```bash
# JVM 힙 메모리 증가
java -Xms2g -Xmx4g -jar application.jar
```

### 2. Connection Timeout
```yaml
# application.yml
spring:
  datasource:
    hikari:
      connection-timeout: 60000
      maximum-pool-size: 20
```

### 3. 생성 속도가 느림
- 데이터베이스 인덱스 확인
- innodb_buffer_pool_size 증가
- 배치 크기 조정 (BATCH_SIZE 상수)

### 4. FK 제약조건 위반
- 데이터 생성 순서 확인
- Member → PlanGrp → ... 순서 준수

---

## 예상 데이터 규모

### 중규모 테스트 (회원 100만명, 그룹 50만)

| 테이블 | 예상 레코드 수 | 디스크 예상 크기 |
|--------|---------------|----------------|
| MEMBER | 1,000,000 | ~200 MB |
| PLAN_GRP | 500,000 | ~50 MB |
| PLAN_GRP_MEMBER | 1,000,000 | ~100 MB |
| PLAN_M | 10,000,000 | ~2 GB |
| PLAN_PARTICIPANT | 17,000,000 | ~1.5 GB |
| PLAN_EXP | 5,000,000 | ~500 MB |
| PLAN_EXP_D | 12,500,000 | ~1 GB |
| PLAN_POST | 3,000,000 | ~600 MB |
| PLAN_REVIEW | 8,000,000 | ~800 MB |
| **합계** | **약 5,800만 건** | **약 7 GB** |

### 대규모 테스트 (회원 1000만명, 그룹 500만)

| 테이블 | 예상 레코드 수 | 디스크 예상 크기 |
|--------|---------------|----------------|
| MEMBER | 10,000,000 | ~2 GB |
| PLAN_GRP | 5,000,000 | ~500 MB |
| PLAN_GRP_MEMBER | 10,000,000 | ~1 GB |
| PLAN_M | 100,000,000 | ~20 GB |
| PLAN_PARTICIPANT | 170,000,000 | ~15 GB |
| PLAN_EXP | 50,000,000 | ~5 GB |
| PLAN_EXP_D | 125,000,000 | ~10 GB |
| PLAN_POST | 30,000,000 | ~6 GB |
| PLAN_REVIEW | 80,000,000 | ~8 GB |
| **합계** | **약 5억 8천만 건** | **약 67 GB** |

---

## 구현 세부사항

### 파일 구조
```
pair-time-backend/
  └─ src/main/java/com/kyj/backend/
      ├─ controller/test/
      │   └─ TestDataController.java       # REST API 컨트롤러
      └─ service/test/
          └─ TestDataGenerationService.java # 데이터 생성 로직
```

### 기술 스택
- **Spring JDBC**: Batch Insert 처리
- **JdbcTemplate**: 고성능 DB 작업
- **Lombok**: 보일러플레이트 코드 감소
- **SLF4J**: 로깅

### 주요 메서드
```java
// 전체 데이터 생성
generateAllTestData(memberCount, planGrpCount)

// 개별 테이블 생성
generateMembers(count)
generatePlanGrps(count)
generatePlanMs(planGrpCount, totalPlanCount)
generatePlanExpsAndDetails(planExpCount)
...

// 통계 조회
getTableStats()
```

---

## 활용 시나리오

### 1. 성능 테스트
- 대량 데이터 환경에서 쿼리 성능 측정
- 인덱스 최적화 검증
- 페이징 성능 테스트

### 2. 부하 테스트
- 동시 사용자 시뮬레이션
- 대규모 트래픽 처리 능력 검증

### 3. 데이터 분석
- 통계 쿼리 최적화
- 집계 함수 성능 측정
- 리포트 생성 테스트

### 4. 백업/복구 테스트
- 대용량 데이터 백업 시간 측정
- 복구 절차 검증

---

## FAQ

**Q: 데이터를 삭제하려면?**
```sql
-- 외래 키 제약조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 테이블 truncate (역순)
TRUNCATE TABLE PLAN_REVIEW;
TRUNCATE TABLE PLAN_POST;
TRUNCATE TABLE PLAN_EXP_D;
TRUNCATE TABLE PLAN_EXP;
TRUNCATE TABLE PLAN_PARTICIPANT;
TRUNCATE TABLE PLAN_M;
TRUNCATE TABLE PLAN_GRP_MEMBER;
TRUNCATE TABLE PLAN_GRP;
TRUNCATE TABLE MEMBER;

-- 외래 키 제약조건 재활성화
SET FOREIGN_KEY_CHECKS = 1;
```

**Q: 특정 테이블만 생성할 수 있나요?**
- 현재는 전체 생성만 지원
- 필요시 서비스 메서드를 개별 호출하도록 컨트롤러 수정 가능

**Q: 데이터가 실제와 다르게 보여요**
- 테스트 데이터이므로 완벽한 실제 데이터 재현은 불가능
- 통계적 분포와 비즈니스 규칙만 준수

**Q: 더 빠르게 생성할 수 없나요?**
- BATCH_SIZE 증가 (현재 1000)
- 인덱스 임시 비활성화
- 외래 키 제약조건 임시 비활성화
- 멀티스레드 처리 (향후 개선 예정)

---

## 라이선스 & 기여

이 코드는 PairTime 프로젝트의 일부입니다.
개선 제안이나 버그 리포트는 이슈로 등록해주세요.

**작성자**: Claude Sonnet 4.5 🤖
**작성일**: 2025-12-12
