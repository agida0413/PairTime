package com.kyj.backend.auth.dto.planGrp.response;

import com.kyj.backend.auth.constants.MainUIType;
import lombok.*;

/**
 * 2025-10-04
 * @author 김용준
 * 로그인 성공 후 메인UI 타입을 결정하는 리스폰스 객체이다.
 *
 */
@Getter
@AllArgsConstructor
public class MainUITypeResponse {
    private MainUIType mainUIType;
}
