package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.*;
import com.noithat.qlnt.backend.dto.response.*;
import com.noithat.qlnt.backend.service.AuthenticationService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    // Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        try {
            service.register(request);
            return ResponseEntity.ok("Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP kích hoạt tài khoản.");
        } catch (IllegalStateException | MessagingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Xác thực tài khoản bằng mã OTP
    @PostMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(@Valid @RequestBody OtpRequest request) {
        String result = service.verifyAccount(request.getEmail(), request.getOtp());
        if (result.startsWith("Tài khoản")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Đăng nhập và nhận JWT
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    // Quên mật khẩu - gửi mã OTP đến email
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam("email") String email) {
        try {
            return ResponseEntity.ok(service.forgotPassword(email));
        } catch (RuntimeException | MessagingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Đặt lại mật khẩu bằng mã OTP
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String result = service.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        if (result.startsWith("Mật khẩu")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}