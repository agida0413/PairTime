package com.kyj.backend.auth.mapper;

import com.kyj.backend.auth.dto.member.response.MemberFindResponse;
import com.kyj.backend.domain.member.Member;
import com.kyj.core.security.auth.dto.AuthMemberDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
/**
 * 2025-10-03
 * @author 김용준
 * 엔티티와 DTO 매핑 하는 매퍼
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface MemberEntityDTOMapper {


    @Mapping(source = "id", target = "userId")
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "active", constant = "true") // 기본값 설정
    AuthMemberDTO toAuthMemberDTO(Member member);



    MemberFindResponse toMemberFindResponse(Member member);

}
