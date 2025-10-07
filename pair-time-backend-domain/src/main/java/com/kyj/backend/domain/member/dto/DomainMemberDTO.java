package com.kyj.backend.domain.member.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DomainMemberDTO {
    private String email;
    private String profile;
    private String role = "ROLE_USER";
    private String username;
    private String nickname;
    private String provider;
    private String isActive = "N";

}