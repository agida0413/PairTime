package com.kyj.backend.auth.dto.planGrp.request;

import com.kyj.backend.domain.plan.planGrpTemp.InviteType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 2025-10-04
 * @author 김용준
 * 상대방 초대에 대한 DTO이다.
 *
 */
@Getter
@Setter
public class InviteRequest {
    private String link;

    private String email; //회원 조회를 통해 찾은 이메일

    private Long sender;

    private String receiveEmail;//이메일 전송에 대한 이메일

    private InviteType inviteType;

    private Boolean isRequiredDel; //기존 임시 삭제여부

    private Long prevPlanGrpTempId;//이전 그룹임시 아이디

}
