package com.kyj.backend.domain.member;

import com.kyj.core.security.auth.dto.AuthMemberDTO;
import com.kyj.core.security.auth.dto.oauth2.OAuth2Response;

import java.util.Optional;

/**
 * 2025-10-03
 * @author 김용준
 * DDD를 위해 엔티티 객체의 세터를 막았고 , 같은 패키지 내 클래스들만 빌더를 통해 빌더클래스를 생성할 수 있게하였다 .
 * 현재 클래스에서만 도메인별 엔티티 객체를 생성할 수 있다. 또한 현재 클래스에서만 업데이트 도메인로직을 위한 세터가 가능한다.
 * ex - > updateMember() - > member.set()가능
 * (다른 패키지는 세터 불가)
 */
public class AuthMemberEntityManager {

    public static Optional<Member> createJoinMember(AuthMemberDTO paramAuthMemberDTO){

      return  new Member.Builder()
              .email(paramAuthMemberDTO.getEmail())
              .profile(paramAuthMemberDTO.get)
              .role("ROLE_USER")
              .username(paramAuthMemberDTO.getUsername())
              .build();
    }
}
