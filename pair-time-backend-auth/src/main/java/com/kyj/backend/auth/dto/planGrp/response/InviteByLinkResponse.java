package com.kyj.backend.auth.dto.planGrp.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
/**
 * 2025-10-04
 * @author 김용준
 * 링크를 통해 요청된 초대정보를 리턴한다.
 */
@Getter
@AllArgsConstructor
public class InviteByLinkResponse {

    private String email;
    private String nickname;
    private String profile;
    private Long planGrpTempId;

}
