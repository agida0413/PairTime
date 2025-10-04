package com.kyj.backend.auth;

import com.kyj.core.api.ErrCode;
import lombok.Getter;

@Getter
public enum AuthErrCode implements ErrCode {

    AUTH001("AUTH001","이미 사용중인 이메일입니다.");

    private final String code;
    private final String msg;

    /**
     * 에러코드 생성자
     * @param code
     * @param msg
     */
    AuthErrCode(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
