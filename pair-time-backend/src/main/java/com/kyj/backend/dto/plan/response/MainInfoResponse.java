package com.kyj.backend.dto.plan.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * 2025-10-08
 * @author 김용준
 * 메인화면 기본 정보 응답 객체
 */
@Getter
@Setter
public class MainInfoResponse {
    private Long planGrpId;
    private String profile;
    private String nickname;
    private String opponentNickname;
    private String opponentProfile;
    private Long loveDday;
}
