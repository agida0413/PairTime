package com.kyj.backend.auth.dto.member.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
/**
 * 2025-10-04
 * @author 김용준
 * 초대한 사람이나 , 초대받은 이의 정보를 출력하기 위한 DTO이다.
 *
 */
@Getter
@AllArgsConstructor
public class InviteMemberResponse {

    private String email;
    private String nickname;
    private String profile;
}
