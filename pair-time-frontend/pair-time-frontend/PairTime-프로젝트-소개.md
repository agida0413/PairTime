# PairTime - 커플을 위한 일정 및 추억 관리 서비스

## 프로젝트 개요

PairTime은 커플이 함께 일정을 관리하고 추억을 기록할 수 있는 웹 애플리케이션이다. 단순한 캘린더 앱을 넘어서, 두 사람의 데이트 계획부터 지출 관리, 그리고 그날의 추억까지 한 곳에서 관리할 수 있도록 설계했다.

## 기술 스택

### Backend
- **Spring Boot** - 메인 프레임워크
- **Spring Security + OAuth2** - 구글 소셜 로그인
- **JPA/Hibernate** - ORM
- **MySQL** - 데이터베이스
- **Redis** - 세션 및 캐싱
- **AWS S3** - 이미지 파일 저장
- **Nginx** - 리버스 프록시 및 파일 업로드 처리

### Frontend
- **React** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Redux Toolkit** - 상태 관리
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP 클라이언트
- **React Toastify** - 알림 UI

## 주요 기능

### 1. 소셜 로그인 및 초대 시스템

OAuth2 기반의 구글 로그인을 구현했다. 로그인 후 초대 링크를 생성하여 상대방을 초대할 수 있으며, 초대를 수락하면 두 사람이 하나의 플랜 그룹으로 연결된다.

**초대 플로우:**
- 로그인 → 초대 링크 생성 → 상대방에게 전달 → 상대방 로그인 후 수락 → 그룹 연결 완료

### 2. 일정 관리

커플 일정과 개인 일정을 구분하여 관리할 수 있다.

**일정 타입:**
- **COUPLE** - 두 사람의 공동 일정 (데이트, 기념일 등)
- **SOLO** - 개인 일정 (각자의 약속, 업무 등)

**주요 기능:**
- 월별 캘린더 뷰
- 일정 추가/수정/삭제
- 하루 종일 일정 설정
- 시작/종료 시간 지정
- 알람 설정

### 3. 지출 관리

데이트 비용을 일정별로 기록하고 관리한다. 월별 총 지출을 한눈에 확인할 수 있어서 소비 패턴을 파악하기 쉽다.

**기능:**
- 일정별 지출 항목 등록
- 지출 상세 내역 관리 (수정/삭제)
- 일별 총 지출 표시
- 월별 총 지출 집계

### 4. 추억 기록 (게시글)

데이트가 끝난 후, 그날의 추억을 사진과 함께 기록할 수 있다. 일정과 연결되어 있어서 "언제 어디서 무엇을 했는지"를 체계적으로 남길 수 있다.

**기능:**
- 제목/내용 작성
- 이미지 업로드 (MultipartFile)
- 일정별 추억 조회
- 수정/삭제

## 기술적 구현 포인트

### 1. FormData와 DTO 바인딩

게시글 작성 시 이미지 파일과 텍스트 데이터를 함께 전송해야 했다. 처음에는 DTO를 JSON Blob으로 전송했지만, MultipartFile을 포함할 수 없어서 실패했다.

**해결 방법:**
- 프론트엔드: 각 필드를 FormData의 개별 파트로 전송
- 백엔드: `@ModelAttribute`를 사용하여 자동 바인딩

```typescript
// Frontend
formData.append('planId', planId.toString());
formData.append('title', title);
formData.append('content', content);
formData.append('fileType', fileType);
formData.append('image', imageFile);
```

```java
// Backend
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> createPost(@ModelAttribute @Valid CreatePostDTO dto) {
    // Spring이 자동으로 각 필드를 DTO에 바인딩
}
```

### 2. Nginx 파일 업로드 설정

이미지 업로드 시 413 에러가 발생했다. Nginx의 기본 업로드 크기 제한 때문이었다.

**nginx.conf 설정:**
```nginx
http {
    client_max_body_size 10M;

    location /api/v1 {
        proxy_pass http://127.0.0.1:8082;
        client_max_body_size 10M;
        proxy_request_buffering off;
    }
}
```

### 3. Axios Content-Type 처리

API 서비스에서 기본적으로 `Content-Type: application/json`을 설정하고 있어서, FormData 전송 시 충돌이 발생했다.

**해결:**
- API 인스턴스 대신 Axios를 직접 사용
- Content-Type을 명시하지 않아서 Axios가 자동으로 boundary와 함께 설정하도록 함

```typescript
const token = localStorage.getItem('accessToken');

const response = await axios.post('/api/v1/planPost', formData, {
  headers: {
    ...(token && { Authorization: `Bearer ${token}` }),
    // Content-Type을 설정하지 않으면 axios가 자동 설정
  },
});
```

### 4. Redux 비동기 처리

달력 정보를 불러올 때 일정 데이터와 각 일정의 지출 정보를 함께 조회해야 했다. `Promise.all`을 사용하여 병렬 처리했다.

```typescript
const plansWithExpenses = await Promise.all(
  plans.map(async (plan) => {
    const expResult = await dispatch(fetchPlanExpDetails(plan.id));
    return {
      ...plan,
      planExps: expResult.payload
    };
  })
);
```

## 프로젝트 구조

```
pair-time/
├── pair-time-backend/          # Spring Boot Backend
│   ├── controller/
│   ├── service/
│   ├── domain/
│   ├── dto/
│   └── config/
│
└── pair-time-frontend/         # React Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── features/           # Redux slices
    │   ├── services/           # API 클라이언트
    │   ├── types/              # TypeScript 타입
    │   └── hooks/
    └── public/
```

## 개발 과정에서 배운 점

### 1. MultipartFile 처리의 복잡성

단순해 보이는 파일 업로드가 생각보다 고려할 사항이 많았다. Content-Type, boundary, FormData 바인딩 방식 등을 제대로 이해해야 했다.

### 2. 프록시 설정의 중요성

로컬 개발 환경에서 프론트엔드(3000)와 백엔드(8082), 그리고 Nginx(80)가 함께 동작하면서 프록시 설정의 중요성을 깨달았다. setupProxy.js와 nginx.conf를 제대로 설정해야 원활한 개발이 가능했다.

### 3. 타입 안정성의 가치

백엔드의 FileType enum이 `IMG`인데 프론트엔드에서 `IMAGE`로 보내서 발생한 에러를 통해, 프론트엔드와 백엔드의 타입 일치가 얼마나 중요한지 체감했다.

## 앞으로의 개선 방향

1. **이미지 최적화** - 업로드 전 클라이언트에서 이미지 압축
2. **무한 스크롤** - 추억 목록이 많아질 경우를 대비
3. **푸시 알림** - 일정 알람 기능 강화
4. **통계 대시보드** - 월별/연도별 데이트 통계
5. **댓글 기능** - 추억 게시글에 서로 댓글 달기

## 마치며

처음에는 단순한 커플 캘린더를 만들려고 했지만, 개발하면서 점점 기능이 추가되었다. 특히 파일 업로드 부분에서 많은 시행착오를 겪었지만, 그만큼 FormData와 MultipartFile에 대한 이해도가 높아졌다.

실무에서 자주 마주치는 파일 업로드, 프록시 설정, 타입 관리 등을 직접 구현하면서 많이 배울 수 있었다. 앞으로도 계속 기능을 추가하고 개선해 나갈 예정이다.

---

**GitHub Repository:** [링크 추가 예정]
**Demo:** [링크 추가 예정]
