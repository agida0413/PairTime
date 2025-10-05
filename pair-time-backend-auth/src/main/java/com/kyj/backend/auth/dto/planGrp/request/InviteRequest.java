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

    private Long receiver;

    private Long sender;

    private String receiveEmail;

    private InviteType inviteType;

}
