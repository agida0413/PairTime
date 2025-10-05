package com.kyj.backend.auth.service.member;

import com.kyj.backend.auth.dto.member.request.MemberFindRequest;
import com.kyj.backend.auth.dto.member.response.MemberFindResponse;
import com.kyj.backend.auth.mapper.MemberEntityDTOMapper;
import com.kyj.backend.auth.repository.member.MemberRepository;
import com.kyj.backend.domain.member.Member;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
/**
 * 2025-10-03
 * @author 김용준
 * 회원에 관한 서비스 구현체
 *
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    private final MemberEntityDTOMapper memberEntityDTOMapper;
    /**
     * 회원 조회를 하는 서비스 (by email)
     * @param memberFindRequest
     * @return
     */
    @Override
    public MemberFindResponse findMember(MemberFindRequest memberFindRequest) {

        Member member = memberRepository.findByEmail(memberFindRequest.getEmail())
                .orElseThrow(() -> {
                    log.error("조회된 회원이 없습니다.");
                    return new KyjBizException(CmErrCode.CM001, "조회된 회원이 없습니다.");
                });
        log.info("조회완료 = {}",member.getEmail());

        return memberEntityDTOMapper.toMemberFindResponse(member);
    }
}
