# PairTime Frontend

커플 일정 관리 웹 애플리케이션의 프론트엔드입니다.

## 기술 스택

- **React 19** with TypeScript
- **Redux Toolkit** - 상태 관리
- **React Router** - 라우팅
- **Styled Components** - 스타일링
- **Axios** - HTTP 클라이언트

## 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
├── features/         # Redux 슬라이스 (auth 등)
├── hooks/            # 커스텀 훅
├── pages/            # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── InviteCreatePage.tsx
│   ├── InviteReceivedPage.tsx
│   ├── WaitingPage.tsx
│   └── CalendarPage.tsx
├── services/         # API 서비스
├── store/            # Redux 스토어
├── styles/           # 전역 스타일 및 테마
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

## 주요 기능

### 1. OAuth2 로그인
- Google, Naver, Kakao 소셜 로그인 지원
- 백엔드 OAuth2 서버와 연동

### 2. UI 분기 처리
로그인 후 백엔드 API(`/api/v1/auth/mainUI`)를 호출하여 다음 중 하나의 화면으로 자동 분기:

- **CALENDAR** - 그룹이 생성된 경우 → 캘린더 페이지
- **REQUIRED_INVITE** - 초대 필요 → 초대 생성 페이지
- **ALREADY_INVITED_BY** - 초대받은 상태 → 초대 받은 페이지
- **ALREADY_INVITE** - 초대 보낸 상태 → 대기 페이지

### 3. 초대 기능
- **링크 생성**: 초대 링크를 생성하여 공유
- **이메일 전송**: 생성된 링크를 이메일로 전송
- **회원 검색**: 이미 가입한 회원을 이메일로 검색하여 바로 초대

### 4. 캘린더
- 월별 캘린더 뷰
- 다가오는 일정 표시
- 추억 갤러리
- 커플 정보 표시 (D-day 등)

## 시작하기

### 사전 요구사항
- Node.js 16 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

**로컬 개발환경:**
```env
# OAuth2는 백엔드(8080) 직접 연결
REACT_APP_OAUTH2_URL=http://localhost:8080

# API는 Nginx(80) 경유
REACT_APP_API_URL=http://localhost:80
```

**운영환경 예시:**
```env
# OAuth2
REACT_APP_OAUTH2_URL=https://yourdomain.com:8080
# 또는 별도 서브도메인
REACT_APP_OAUTH2_URL=https://auth.yourdomain.com

# API
REACT_APP_API_URL=https://yourdomain.com
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 http://localhost:3000으로 접속합니다.

### 빌드

```bash
npm run build
```

## API 연동

### URL 설정

`.env` 파일에서 두 가지 URL을 설정합니다:

```bash
# OAuth2 로그인 (백엔드 직접)
REACT_APP_OAUTH2_URL=http://localhost:8080

# API 호출 (Nginx 프록시)
REACT_APP_API_URL=http://localhost:80
```

### 주요 API 엔드포인트

**OAuth2 (백엔드 직접):**
- `GET {OAUTH2_BASE_URL}/oauth2/authorization/{provider}` - 소셜 로그인

**API (Nginx 프록시):**
- `GET {API_BASE_URL}/api/v1/auth/mainUI` - 메인 UI 타입 조회
- `POST {API_BASE_URL}/api/v1/auth/invite` - 회원 초대
- `POST {API_BASE_URL}/api/v1/auth/invite/email` - 이메일로 초대
- `GET {API_BASE_URL}/api/v1/auth/member?email=...` - 회원 검색

### OAuth2 로그인 플로우

1. 사용자가 소셜 로그인 버튼 클릭
2. `{OAUTH2_BASE_URL}/oauth2/authorization/{provider}` 로 리디렉트 (8080포트)
3. OAuth2 인증 완료 후 백엔드에서 프론트엔드 URL로 리디렉트
4. 프론트엔드에서 `{API_BASE_URL}/api/v1/auth/mainUI` 호출 (80포트 Nginx → 8080포트)
5. UI 타입에 따라 적절한 페이지로 이동

## 디자인 시스템

### 색상 테마
- **Primary**: #ff6b9d (핑크)
- **Secondary**: #4f9cf9 (블루)
- **Gradient**: #667eea → #764ba2 (보라)

### 주요 스타일링
- 부드러운 그라디언트
- 카드 기반 레이아웃
- 호버 애니메이션
- 반응형 디자인

## 향후 개선사항

- [ ] 캘린더 일정 CRUD 기능
- [ ] 기념일 관리
- [ ] 푸시 알림
- [ ] 다크 모드
- [ ] 모바일 반응형 최적화
- [ ] PWA 지원

## 라이선스

MIT
