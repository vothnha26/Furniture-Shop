package com.noithat.qlnt.backend.dto.request;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private String tenDangNhap;
    private String password;
}
