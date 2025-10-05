package com.kyj.backend.auth.dto.member.response;

import lombok.Getter;
import lombok.Setter;

/**
 * 2025-10-04
 * @author 김용준
 * 회원 조회결과에 대한 DTO이다.
 *
 */
@Getter
@Setter
public class MemberFindResponse {
    private String profile;
    private String nickname;
    private String email;
}
