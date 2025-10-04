package com.kyj.backend.auth.service.member;

import com.kyj.backend.auth.constants.AuthErrCode;
import com.kyj.backend.auth.mapper.MemberEntityDTOMapper;
import com.kyj.backend.auth.repository.member.MemberRepository;
import com.kyj.backend.domain.member.AuthMemberEntityFactory;

import com.kyj.backend.domain.member.Member;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.security.auth.dto.AuthMemberDTO;
import com.kyj.core.security.auth.dto.oauth2.OAuth2Response;
import com.kyj.core.security.auth.service.AuthMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
@Transactional(readOnly = true)
public class CustomAuthMemberService implements AuthMemberService {
    /**
     * 회원 JPA리파지토리
     */
    private final MemberRepository memberRepository;
    /**
     * DTO Entity 매퍼
     */
    private final MemberEntityDTOMapper memberEntityDTOMapper;

    /**
     * 회원 조회 또는 생성
     * @param oAuth2Response
     * @return
     */
    @Override
    @Transactional
    public AuthMemberDTO findOrCreateMember(OAuth2Response oAuth2Response) {

        String username =   oAuth2Response.getProviderId() + "_" + oAuth2Response.getEmail();

        log.info("찾는 회원 ={}",username);
        Member member = memberRepository.findByUsername(username)
                .orElseGet(() -> {
                    log.warn("사용자가 존재하지 않음 - username: {}", username);

                        log.info("이메일 기반 중복회원 체크");
                        memberRepository.findByEmail(oAuth2Response.getEmail()).ifPresent(
                                findMemberByEmail ->{
                                            log.error("이미 사용중인 이메일로 가입 시도 ={}",findMemberByEmail.getEmail());
                                            throw new KyjBizException(AuthErrCode.AUTH001);
                                }
                    );
                    return null;
                });

        //AuthMemberDTO 생성
        AuthMemberDTO paramAuthMemberDTO = AuthMemberDTO.builder()
                .username(username)
                .email(oAuth2Response.getEmail())
                .role("ROLE_USER")
                .provider(oAuth2Response.getProvider())
                .providerId(oAuth2Response.getProviderId())
                .active(true)
                .profile(oAuth2Response.getProfile())
                .nickname(oAuth2Response.getNickname())
                .provider(oAuth2Response.getProvider())
                .build();

        AuthMemberDTO returnAuthMemberDTO =null;

        if(member == null){
            //회원가입 엔티티 생성(DDD)
            Optional<Member> optionalJoinMember = AuthMemberEntityFactory.createJoinMember(paramAuthMemberDTO);

            if(optionalJoinMember.isPresent()){
                Member joinMember =  optionalJoinMember.get();
                memberRepository.save(joinMember);
                log.info("회원가입 세팅 = {}",joinMember.getUsername());
                returnAuthMemberDTO=  memberEntityDTOMapper.toAuthMemberDTO(joinMember);
            }else{
                log.error("findOrCreateMember.Member 객체 생성 실패");
                return null;
            }

        }else{
            returnAuthMemberDTO = memberEntityDTOMapper.toAuthMemberDTO(member);
        }

        log.info("회원가입 완료 = {}",returnAuthMemberDTO.getUsername());

        return returnAuthMemberDTO;
    }

    /**
     * 회원조회(아이디)
     * @param username
     * @return
     */
    @Override
    public AuthMemberDTO findMemberByUsername(String username) {

       Member member = memberRepository.findByUsername(username).orElseGet(()->{
           log.info("CustomAuthMemberService.findMemberByUsername return null");
           return null;
        });
        log.info("CustomAuthMemberService.findMemberByUsername 조회 성공 = {}",member.getUsername());
        return memberEntityDTOMapper.toAuthMemberDTO(member);
    }

    /**
     * 회원조화(고유번호)
     * @param userId
     * @return
     */
    @Override
    public AuthMemberDTO findMemberByUserId(String userId) {

        Long id = Long.parseLong(userId);

      Member member=  memberRepository.findById(id).orElseGet(()->{
            log.info("CustomAuthMemberService.findMemberByUserId return null");
            return null;
        });
        log.info("CustomAuthMemberService.findMemberByUserId 조회 성공 = {}",member.getUsername());
        return memberEntityDTOMapper.toAuthMemberDTO(member);
    }

    /**
     * 로그인시 정보 업데이트
     * @param memberDTO
     */
    @Override
    public void updateMemberLoginInfo(AuthMemberDTO memberDTO) {
        memberRepository.findById(memberDTO.getUserId()).ifPresentOrElse(
                findMember ->{

                    findMember.updateLoginInfo(memberDTO.getNickname(),memberDTO.getProfile(),memberDTO.getUsername());
                    log.info("updateMemberLoginInfo , 업데이트 회원 = {}",findMember.getUsername());
                },
                ()->{
                    log.error("updateMemberLoginInfo수행 중 엔티티를 찾을 수 없음");
                    throw new KyjBizException(CmErrCode.CM002);
                }
        );
    }


}
