package com.kyj.backend.auth.dto.member.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 2025-10-04
 * @author 김용준
 * 회원 조회에 대한 DTO이다.
 *
 */
@Getter
@Setter
public class MemberFindRequest {
    @NotNull
    private String email;
}
