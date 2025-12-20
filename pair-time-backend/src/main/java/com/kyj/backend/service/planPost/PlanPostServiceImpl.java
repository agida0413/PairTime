package com.kyj.backend.service.planPost;

import com.kyj.backend.domain.file.File;
import com.kyj.backend.domain.file.FileType;
import com.kyj.backend.domain.plan.planM.PlanM;
import com.kyj.backend.domain.plan.planPost.PlanPost;
import com.kyj.backend.dto.plan.request.CreateNewPlanPostDTO;
import com.kyj.backend.dto.plan.response.PlanPostResDTO;
import com.kyj.backend.mapper.PlanPostEntityDTOMapper;
import com.kyj.backend.repository.planM.PlanMRepository;
import com.kyj.backend.repository.planPost.PlanPostRepository;
import com.kyj.core.api.CmErrCode;
import com.kyj.core.exception.custom.KyjBizException;
import com.kyj.core.file.FileService;
import com.kyj.core.file.util.FileVailidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 2025-12-20
 * @author 김용준
 * 계획 게시글에 관한 서비스 구현체
 */
@Slf4j
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class PlanPostServiceImpl implements PlanPostService{
    private final PlanMRepository planMRepository;
    private final PlanPostRepository planPostRepository;
    private final FileService fileService;
    private final PlanPostEntityDTOMapper planPostEntityDTOMapper;
    private static final long MAX_SIZE = 500000000;
     /**
     * 새 게 시글 생성
     * @param createNewPlanPostDTO
     */
    @Override
    @Transactional
    public void savePlanPost(CreateNewPlanPostDTO createNewPlanPostDTO) {

        String fileUrl = null;
        PlanM planM = planMRepository.findById(createNewPlanPostDTO.getPlanId())
                .orElseThrow(() -> {
                    return new KyjBizException(CmErrCode.CM002);
                });

        PlanPost planPost = PlanPost.createPlanPost(createNewPlanPostDTO.getTitle(), createNewPlanPostDTO.getContent(), planM);
        log.info("createNewPlanPostDTO.getImage() != null) ={}",createNewPlanPostDTO.getImage());
        //사진저장
        if(createNewPlanPostDTO.getImage() != null){
            if(createNewPlanPostDTO.getFileType() == FileType.IMG){
              com.kyj.core.file.util.FileType validFileType[] =  new com.kyj.core.file.util.FileType[1];

              validFileType[0] =  com.kyj.core.file.util.FileType.IMAGE;
//
//              if(!com.kyj.core.file.util.FileType.IMAGE.supports(createNewPlanPostDTO.getImage().)){
//                  log.error("파일 정합성 체크 실패 = {}",createNewPlanPostDTO.getImage());
//                  throw  new KyjBizException(CmErrCode.CM009);
//              }

              fileUrl= fileService.upload(createNewPlanPostDTO.getImage(), validFileType);
              log.info("파일 url = {}",fileUrl);
            }
        }

        if(fileUrl != null ){
            File file = File.createNewFile(createNewPlanPostDTO.getFileType(),fileUrl,UUID.randomUUID().toString());
            planPost.addFile(file);
        }

        planPostRepository.save(planPost);




    }

    /**
     * 게시물 조회
     * @param planId
     * @return
     */
    @Override
    public PlanPostResDTO findPlanPost(Long planId) {

        PlanPost planPost = planPostRepository.findPlanPost(planId);
        log.info("planpost={}",planPost.toString());
        return planPostEntityDTOMapper.toPlanPostResDTO(planPost);
    }
}
