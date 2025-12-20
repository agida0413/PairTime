# 💑 PairTime - 커플을 위한 일정 및 추억 관리 서비스

> 두 사람의 소중한 순간을 함께 기록하고 관리하는 커플 전용 플랫폼

<br/>


## 🛠️ Tech Stack

### Backend
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![JPA](https://img.shields.io/badge/JPA/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled_Components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)

### Database & Storage
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)

### Infrastructure
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br/>

## 📌 프로젝트 개요

**PairTime**은 커플이 함께 일정을 계획하고, 데이트 비용을 관리하며, 소중한 추억을 사진과 함께 기록할 수 있는 웹 애플리케이션입니다.

### 핵심 기능
- 🔐 **OAuth2 소셜 로그인** - 구글 계정으로 간편 로그인
- 🔗 **초대 링크 시스템** - 상대방을 초대하여 플랜 그룹 생성
- 📅 **일정 관리** - 커플 일정과 개인 일정을 구분하여 관리
- 💰 **지출 관리** - 데이트 비용을 일정별로 기록 및 집계
- 📸 **추억 기록** - 사진과 함께 그날의 추억을 게시글로 저장

<br/>

## 🖼️ 스크린샷

### 메인 화면
<img width="1899" height="844" alt="캡처본페어타임" src="" />

<br/>

## 🏗️ 시스템 아키텍처

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│    Nginx    │─────▶│ Spring Boot │
│  (React)    │      │   (Port 80) │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                     ┌────────────────────────────┼────────────────┐
                     │                            │                │
                ┌────▼────┐                 ┌─────▼─────┐    ┌────▼────┐
                │  MySQL  │                 │   Redis   │    │  AWS S3 │
                │ (DB)    │                 │ (Session) │    │ (Image) │
                └─────────┘                 └───────────┘    └─────────┘
```

### 주요 구성 요소
- **Nginx**: 리버스 프록시, 파일 업로드 크기 제한 설정
- **Spring Boot**: REST API 서버, OAuth2 인증 처리
- **MySQL**: 사용자, 일정, 지출, 게시글 데이터 저장
- **Redis**: 세션 관리 및 캐싱
- **AWS S3**: 추억 게시글 이미지 파일 저장

<br/>

## 🔄 비즈니스 로직

### 초대 플로우
```
1. 사용자 A 로그인 (OAuth2)
   ↓
2. 초대 링크 생성 (/invite/link/{uuid})
   ↓
3. 링크를 사용자 B에게 전달
   ↓
4. 사용자 B 로그인 후 링크 접속
   ↓
5. PlanGrpTemp 데이터 업데이트 (sender + receiver)
   ↓
6. PlanGrp 생성 및 두 사용자 연결 완료
```

### 일정 및 추억 플로우
```
1. 커플 일정 생성 (COUPLE 타입)
   ↓
2. 지출 정보 등록 (선택)
   ↓
3. 데이트 후 추억 게시글 작성
   ↓
4. 이미지 파일 업로드 (MultipartFile → S3)
   ↓
5. 캘린더에서 일정 클릭 시 추억 조회
```

<br/>

## 💾 데이터 모델링

### 주요 엔티티

| 엔티티 | 설명 | 주요 필드 |
|--------|------|-----------|
| **Member** | 사용자 정보 | email, nickname, profile |
| **PlanGrp** | 플랜 그룹 (커플) | loveDday, createAt |
| **Plan** | 일정 | title, content, planType, startAt, endAt |
| **PlanExp** | 지출 정보 | title, expenditure |
| **PlanPost** | 추억 게시글 | title, content, imageUrl |

### 관계 설계
- **Member ↔ PlanGrp** (N:1) - 한 사용자는 하나의 플랜 그룹 소속
- **PlanGrp ↔ Plan** (1:N) - 하나의 그룹에 여러 일정
- **Plan ↔ PlanExp** (1:N) - 하나의 일정에 여러 지출 항목
- **Plan ↔ PlanPost** (1:1) - 하나의 일정에 하나의 추억 게시글

<br/>



## 📂 프로젝트 구조

```
pair-time/
├── pair-time-backend/
│   ├── src/main/java/com/kyj/backend/
│   │   ├── controller/         # REST API 컨트롤러
│   │   ├── service/            # 비즈니스 로직
│   │   ├── domain/             # JPA 엔티티
│   │   ├── dto/                # 요청/응답 DTO
│   │   ├── config/             # 설정 (Security, OAuth2 등)
│   │   └── util/               # 유틸리티
│   └── src/main/resources/
│       └── application-local.yml
│
└── pair-time-frontend/
    ├── src/
    │   ├── components/         # 재사용 컴포넌트
    │   ├── pages/              # 페이지 컴포넌트
    │   │   └── CalendarPage.tsx
    │   ├── features/           # Redux Toolkit Slices
    │   │   └── auth/
    │   │       └── authSlice.ts
    │   ├── services/           # API 클라이언트
    │   │   └── api.ts
    │   ├── types/              # TypeScript 타입 정의
    │   │   └── index.ts
    │   └── hooks/              # Custom Hooks
    └── public/
```

<br/>

## 🚀 주요 API 명세

### 인증 및 초대
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/oauth2/authorization/google` | Google OAuth2 로그인 |
| GET | `/api/v1/member/main-ui-type` | 메인 UI 타입 조회 |
| GET | `/invite/link/{uuid}` | 초대 링크로 가입 |
| POST | `/api/v1/member/invite` | 이메일로 초대 전송 |

### 일정 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/plan` | 일정 추가 |
| GET | `/api/v1/plan` | 월별 일정 조회 |
| PUT | `/api/v1/plan/{planId}` | 일정 수정 |
| DELETE | `/api/v1/plan/{planId}` | 일정 삭제 |

### 지출 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/planExp` | 지출 정보 등록 |
| GET | `/api/v1/planExp/{planId}` | 지출 상세 조회 |
| PUT | `/api/v1/planExp` | 지출 정보 수정 |
| DELETE | `/api/v1/planExp/{planExpDId}` | 지출 정보 삭제 |

### 추억 게시글
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/planPost` | 게시글 등록 (MultipartFile) |
| GET | `/api/v1/planPost/{planId}` | 게시글 조회 |

<br/>

## 🎨 사용자 경험 (UX)

### 직관적인 캘린더 인터페이스
- **월별 뷰**: 한눈에 보이는 일정 관리
- **컬러 구분**: 커플 일정(분홍), 내 일정(파란), 상대방 일정(보라)
- **실시간 업데이트**: 일정 추가/수정 시 즉시 반영

### 반응형 디자인
- Desktop 환경에 최적화된 레이아웃
- 캘린더 + 사이드바 구조로 정보 효율적 배치

### Toast 알림
- 사용자 액션에 대한 즉각적인 피드백
- 성공/실패 상태를 명확하게 전달

<br/>



## 🔧 로컬 개발 환경 설정

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Redis
- Nginx (선택)






