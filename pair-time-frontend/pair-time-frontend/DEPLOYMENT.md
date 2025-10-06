# 운영 환경 배포 가이드

## 1. 도메인 구조 (권장)

### 옵션 A: 서브도메인 사용 (권장)
```
프론트엔드: https://yourdomain.com
API 서버:   https://api.yourdomain.com
OAuth2:     https://auth.yourdomain.com (또는 api.yourdomain.com과 동일)
```

### 옵션 B: 단일 도메인 + 경로
```
프론트엔드: https://yourdomain.com
API:        https://yourdomain.com/api
OAuth2:     https://yourdomain.com/oauth2
```
→ Nginx 리버스 프록시로 라우팅

## 2. 백엔드 쿠키 설정 (필수)

### Java/Spring Boot OAuth2 성공 핸들러:

```java
@Override
public void onAuthenticationSuccess(HttpServletRequest request,
                                   HttpServletResponse response,
                                   Authentication authentication) throws IOException {

    String accessToken = jwtProvider.createAccessToken(user);

    // 운영 환경 쿠키 설정
    ResponseCookie cookie = ResponseCookie.from("accessToken", accessToken)
        .httpOnly(false)              // JavaScript 읽기 허용 (localStorage 저장용)
        .secure(true)                 // HTTPS 필수
        .path("/")
        .maxAge(3600)
        .domain(".yourdomain.com")    // 중요! 앞에 점(.) 붙이기
        .sameSite("Lax")              // 사파리 호환
        .build();

    response.addHeader("Set-Cookie", cookie.toString());

    // 프론트엔드로 리다이렉트
    response.sendRedirect("https://yourdomain.com");
}
```

### Domain 설정 중요:
- `.yourdomain.com` → `yourdomain.com`, `api.yourdomain.com`, `auth.yourdomain.com` 모두 사용 가능
- `yourdomain.com` → `yourdomain.com`에서만 사용 가능

## 3. CORS 설정 (백엔드)

```java
@Configuration
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 허용할 오리진 (프론트엔드 도메인)
        config.setAllowedOrigins(Arrays.asList(
            "https://yourdomain.com",
            "https://www.yourdomain.com"
        ));

        // 인증 정보 포함 허용 (쿠키)
        config.setAllowCredentials(true);

        // 허용 메서드
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 허용 헤더
        config.setAllowedHeaders(Arrays.asList("*"));

        // 노출 헤더 (프론트엔드에서 읽을 수 있는 헤더)
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-Auth-Token",
            "Set-Cookie"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

## 4. Nginx 설정 (옵션 B 사용 시)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 인증서
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 프론트엔드 (React 빌드 파일)
    location / {
        root /var/www/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 쿠키 전달
        proxy_pass_header Set-Cookie;
        proxy_cookie_domain backend:8080 yourdomain.com;
        proxy_cookie_path / /;
    }

    # OAuth2 프록시
    location /oauth2 {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 쿠키 전달
        proxy_pass_header Set-Cookie;
        proxy_cookie_domain backend:8080 yourdomain.com;
    }
}
```

## 5. 프론트엔드 환경 변수 (.env.production)

```bash
# 운영 환경 설정
REACT_APP_ENV=production

# 옵션 A: 서브도메인 사용
REACT_APP_OAUTH2_URL=https://api.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com

# 옵션 B: 단일 도메인 + Nginx 프록시
# REACT_APP_OAUTH2_URL=https://yourdomain.com
# REACT_APP_API_URL=https://yourdomain.com

# WithCredentials 설정 (필수)
REACT_APP_WITH_CREDENTIALS=true
```

## 6. 사파리 호환성 체크리스트

- [ ] HTTPS 사용 (필수)
- [ ] 쿠키 `Secure=true` 설정
- [ ] 쿠키 `SameSite=Lax` 설정 (None은 Secure 필수)
- [ ] 쿠키 `Domain=.yourdomain.com` 설정 (서브도메인 공유)
- [ ] 쿠키 `HttpOnly=false` 설정 (localStorage 저장 필요 시)
- [ ] CORS `allowCredentials=true` 설정
- [ ] CORS `allowedOrigins`에 프론트엔드 도메인 명시
- [ ] 같은 루트 도메인 사용 (권장)

## 7. 배포 전 테스트

### 로컬에서 HTTPS 테스트 (mkcert 사용):
```bash
# mkcert 설치
brew install mkcert
mkcert -install

# 로컬 인증서 생성
mkcert localhost

# React 개발 서버 HTTPS로 실행
HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem npm start
```

### 사파리 쿠키 확인:
1. Safari → 개발 → JavaScript 콘솔
2. `document.cookie` 확인
3. 개발 → 저장 공간 표시 → 쿠키 확인

## 8. 문제 해결

### 쿠키가 설정되지 않는 경우:
1. **HTTPS 확인**: HTTP에서는 Secure 쿠키 작동 안함
2. **도메인 확인**: 서드파티 쿠키는 사파리에서 차단
3. **SameSite 확인**: None은 Secure 필수, Lax 권장
4. **CORS 확인**: allowCredentials + allowedOrigins 정확히 설정

### 크롬은 되는데 사파리는 안되는 경우:
- ITP(Intelligent Tracking Prevention) 때문
- 해결: 같은 루트 도메인 사용 또는 URL 파라미터로 토큰 전달

## 9. 대안: URL 파라미터 방식 (가장 안전)

백엔드에서 OAuth 성공 시:
```java
String redirectUrl = String.format(
    "https://yourdomain.com/?token=%s",
    accessToken
);
response.sendRedirect(redirectUrl);
```

프론트엔드는 이미 URL 파라미터 처리 구현됨 (App.tsx:170-198)

## 10. 배포 순서

1. 백엔드 쿠키 설정 수정 → 배포
2. 프론트엔드 `.env.production` 수정
3. `npm run build`
4. 빌드 파일을 서버에 배포
5. Nginx 설정 적용 (필요 시)
6. SSL 인증서 설정
7. 사파리에서 테스트
