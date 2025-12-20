package com.kyj.backend.dto.plan.request;

import com.kyj.backend.domain.file.FileType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CreateNewPlanPostDTO {
    @Min(value = 1, message = "고유번호는 1이상 이여야 합니다.")
    private Long planId;
    @NotNull(message = "내용은 필수입니다.")
    private String content;
    private MultipartFile image;
    @NotNull(message = "fileType 필수입니다.")
    private FileType fileType;
    @NotNull(message = "제목은 필수입니다.")
    private String title;


}
