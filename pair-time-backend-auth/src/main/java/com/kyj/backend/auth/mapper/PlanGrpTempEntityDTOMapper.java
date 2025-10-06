package com.kyj.backend.auth.mapper;

import com.kyj.backend.auth.dto.planGrp.response.InviteLinkResponse;
import com.kyj.backend.domain.plan.planGrpTemp.PlanGrpTemp;
import org.mapstruct.Mapper;

/**
 * 2025-10-03
 * @author 김용준
 * 엔티티와 DTO 매핑 하는 매퍼
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PlanGrpTempEntityDTOMapper {

    InviteLinkResponse toInviteLinkResponse(PlanGrpTemp planGrpTemp);
}
