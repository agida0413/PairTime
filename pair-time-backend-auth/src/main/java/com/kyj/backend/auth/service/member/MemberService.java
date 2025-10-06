package com.kyj.backend.auth.service.member;

import com.kyj.backend.auth.dto.member.request.MemberFindRequest;
import com.kyj.backend.auth.dto.member.response.MemberFindResponse;
import com.kyj.backend.auth.dto.planGrp.response.InviteMemberResponse;

/**
 * 2025-10-03
 * @author 김용준
 * 회원에 관한 서비스
 *
 */
public interface MemberService {


    public MemberFindResponse findMember(MemberFindRequest memberFindRequest);
    public InviteMemberResponse findMemberInPlanGrpTemp(Long planGrpTempId,Boolean isSender);
}
