package com.kyj.backend.mapper;


import com.kyj.backend.domain.file.File;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planPost.PlanPost;
import com.kyj.backend.dto.plan.response.FindCalendarInfoResDTO;
import com.kyj.backend.dto.plan.response.PlanCalendarUIType;
import com.kyj.backend.dto.plan.response.PlanPostResDTO;
import com.kyj.backend.dto.plan.response.UpdatePlanMResDTO;
import com.kyj.core.security.client.util.SecurityContext;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.ArrayList;
import java.util.List;

/**
 * 2025-10-03
 * @author 김용준
 * 엔티티와 DTO 매핑 하는 매퍼
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PlanPostEntityDTOMapper {

    @Mapping(source = "id", target = "planPostId")
    PlanPostResDTO toPlanPostResDTO(PlanPost planPost);


    @AfterMapping
    default void setImageUrl(PlanPost planPost, @MappingTarget PlanPostResDTO planPostResDTO) {

        if(!planPost.getFiles().isEmpty()){
            List<File> list = planPost.getFiles();
            List<String> imageList = new ArrayList<>();
            planPostResDTO.setImageUrl(imageList);
            for(File file : list){
                planPostResDTO.getImageUrl().add(file.getFileUrl());
            }
        }

    }



}
