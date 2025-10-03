package com.kyj.backend.auth.service;

import com.kyj.backend.auth.repository.MemberRepository;
import com.kyj.backend.domain.member.Member;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.security.auth.dto.AuthMemberDTO;
import com.kyj.core.security.auth.dto.oauth2.OAuth2Response;
import com.kyj.core.security.auth.service.AuthMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 2025-10-03
 * @author 김용준
 * kyj-lib-core-security-auth 라이브버리의 AuthMemberService 를 구현하는 커스텀 서비스
 * 해당 서비스를 구현하면 자동으로 kyj-lib-core-security-auth 의 내부 로직에 따라 Oauth2로직이 실행된다.
 * 자세한 건 라이브러리 참고 (디폴트 구현체 있음)
 *
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomAuthMemberService implements AuthMemberService {

    private final MemberRepository memberRepository;
    /**
     * 회원 조회 또는 생성
     * @param oAuth2Response
     * @return
     */
    @Override
    public AuthMemberDTO findOrCreateMember(OAuth2Response oAuth2Response) {
      String username =   oAuth2Response.getProviderId() + "_" + oAuth2Response.getEmail();

        Member member = memberRepository.findByUsername(username)
                .orElseGet(() -> {
                    log.warn("사용자가 존재하지 않음 - username: {}", username);
                    return null;
                });

        if(member == null){
            member = new Member();

        }



        return null;
    }

    /**
     * 회원조회(아이디)
     * @param username
     * @return
     */
    @Override
    public AuthMemberDTO findMemberByUsername(String username) {
        return null;
    }

    /**
     * 회원조화(고유번호)
     * @param userId
     * @return
     */
    @Override
    public AuthMemberDTO findMemberByUserId(String userId) {
        Long id = Long.parseLong(userId);


        return null;
    }

    /**
     * 로그인시 정보 업데이트
     * @param memberDTO
     */
    @Override
    public void updateMemberLoginInfo(AuthMemberDTO memberDTO) {
        AuthMemberService.super.updateMemberLoginInfo(memberDTO);
    }
}
