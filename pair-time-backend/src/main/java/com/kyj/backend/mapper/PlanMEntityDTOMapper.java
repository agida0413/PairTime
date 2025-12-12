package com.kyj.backend.mapper;


import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.PlanCalendarUIType;
import com.kyj.core.security.client.util.SecurityContext;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * 2025-10-03
 * @author 김용준
 * 엔티티와 DTO 매핑 하는 매퍼
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PlanMEntityDTOMapper {

    // 단일 객체 매핑 (이 메소드의 @Mapping이 List 변환에도 적용됨)
    @Mapping(source = "id", target = "planId")
    FindCalendarInfoResDTO toFindCalendarInfoResDTO(PlanM planM);

    // List 매핑 (위의 단일 객체 매핑 메소드를 자동으로 참조)
    List<FindCalendarInfoResDTO> toFindCalendarInfoResDTOList(List<PlanM> planMList);


    @AfterMapping
    default void setPlanCalendarUIType(PlanM planM, @MappingTarget FindCalendarInfoResDTO findCalendarInfoResDTO) {
        Long usrId = Long.parseLong(SecurityContext.getUserId());


            if(planM.getPlanParticipants().size()==1){
                if(planM.getPlanParticipants().get(0).getParticipant().getId().equals(usrId)){
                   findCalendarInfoResDTO.setPlanCalendarUIType(PlanCalendarUIType.MY);
                }else{
                    findCalendarInfoResDTO.setPlanCalendarUIType(PlanCalendarUIType.OPPOSITE);
                }
            }else{
                findCalendarInfoResDTO.setPlanCalendarUIType(PlanCalendarUIType.COUPLE);
            }

    }



}
