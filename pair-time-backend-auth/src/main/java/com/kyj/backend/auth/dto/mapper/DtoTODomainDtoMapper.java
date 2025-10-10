package com.kyj.backend.auth.dto.mapper;

import com.kyj.backend.domain.member.dto.DomainMemberDTO;
import com.kyj.core.security.auth.dto.AuthMemberDTO;
import org.mapstruct.Mapper;

/**
 * 2025-10-03
 * @author 김용준
 * 요청 dto와 도메인 사용 Dto 매퍼
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface DtoTODomainDtoMapper {

    DomainMemberDTO toDomainMemberDTO(AuthMemberDTO authMemberDTO);
}
