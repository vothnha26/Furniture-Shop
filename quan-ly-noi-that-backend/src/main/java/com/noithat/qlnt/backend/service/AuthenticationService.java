package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.AuthenticationRequest;
import com.noithat.qlnt.backend.dto.response.AuthenticationResponse;
import com.noithat.qlnt.backend.dto.request.RegisterRequest;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.TaiKhoan;
import com.noithat.qlnt.backend.entity.VaiTro;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.repository.KhachHangRepository;
import com.noithat.qlnt.backend.repository.TaiKhoanRepository;
import com.noithat.qlnt.backend.repository.VaiTroRepository;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final TaiKhoanRepository taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final VaiTroRepository vaiTroRepository;
    private final HangThanhVienRepository hangThanhVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationService(TaiKhoanRepository taiKhoanRepository,
                                KhachHangRepository khachHangRepository,
                                VaiTroRepository vaiTroRepository,
                                HangThanhVienRepository hangThanhVienRepository,
                                PasswordEncoder passwordEncoder,
                                JwtService jwtService,
                                AuthenticationManager authenticationManager,
                                EmailService emailService) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.khachHangRepository = khachHangRepository;
        this.vaiTroRepository = vaiTroRepository;
        this.hangThanhVienRepository = hangThanhVienRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public void register(RegisterRequest request) throws MessagingException {
        try {
            if (taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap()).isPresent()) {
                throw new IllegalStateException("Tên đăng nhập đã tồn tại.");
            }
            if (taiKhoanRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalStateException("Email đã tồn tại.");
            }

            VaiTro userRole = vaiTroRepository.findByTenVaiTro("USER")
                    .orElseThrow(() -> new IllegalStateException("Vai trò USER không tồn tại."));

            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setTenDangNhap(request.getTenDangNhap());
            taiKhoan.setEmail(request.getEmail());
            taiKhoan.setMatKhauHash(passwordEncoder.encode(request.getPassword()));
            taiKhoan.setVaiTro(userRole);
            taiKhoan.setEnabled(false); // Chưa kích hoạt

            String otp = generateOtp();
            taiKhoan.setOtp(otp);
            taiKhoan.setOtpGeneratedTime(LocalDateTime.now());

            taiKhoanRepository.save(taiKhoan);

        // Nếu vai trò là USER thì tạo bản ghi KhachHang tương ứng (tự động)
        if (userRole != null && "USER".equalsIgnoreCase(userRole.getTenVaiTro())) {
        KhachHang khachHang = new KhachHang();
        khachHang.setTaiKhoan(taiKhoan);
        khachHang.setHoTen(request.getHoTen());
        khachHang.setEmail(request.getEmail());
        khachHang.setSoDienThoai(request.getSoDienThoai());

        // Set default membership tier
        HangThanhVien defaultTier = hangThanhVienRepository.findByTenHang("Ð?ng")
            .orElseThrow(() -> new IllegalStateException("Hạng thành viên mặc định không tồn tại."));
        khachHang.setHangThanhVien(defaultTier);

        // Set default values
        khachHang.setDiemThuong(0);
        khachHang.setTongChiTieu(java.math.BigDecimal.ZERO);
        khachHang.setTongDonHang(0);
        khachHang.setNgayThamGia(java.time.LocalDate.now());

        khachHangRepository.save(khachHang);
        }

            try {
                emailService.sendOtpEmail(request.getEmail(), otp);
            } catch (org.springframework.mail.MailException | MessagingException e) {
                logger.warn("Failed to send OTP email to {}: {}", request.getEmail(), e.getMessage());
                // Do not expose internal mail errors to client; return a controlled error
                throw new IllegalStateException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
            }
        } catch (IllegalStateException e) {
            // rethrow known bad-request exceptions
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during registration for {}: {}", request.getTenDangNhap(), e.getMessage(), e);
            throw new IllegalStateException("Đăng ký thất bại do lỗi hệ thống. Vui lòng thử lại sau.");
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getTenDangNhap(),
                        request.getPassword()));
        var user = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public String verifyAccount(String email, String otp) {
        TaiKhoan user = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        if (user.getOtp().equals(otp)
                && Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() < (5 * 60)) {
            user.setEnabled(true);
            user.setOtp(null); // Clear OTP
            user.setOtpGeneratedTime(null);
            taiKhoanRepository.save(user);
            return "Tài khoản đã được kích hoạt thành công.";
        }
        return "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
    }

    public String forgotPassword(String email) throws MessagingException {
        TaiKhoan user = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        taiKhoanRepository.save(user);

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (org.springframework.mail.MailException | MessagingException e) {
            logger.warn("Failed to send forgot-password OTP to {}: {}", email, e.getMessage());
            throw new IllegalStateException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
        }

        return "Mã OTP để đặt lại mật khẩu đã được gửi đến email của bạn.";
    }

    public String resetPassword(String email, String otp, String newPassword) {
        TaiKhoan user = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        if (user.getOtp().equals(otp)
                && Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() < (5 * 60)) {
            user.setMatKhauHash(passwordEncoder.encode(newPassword));
            user.setOtp(null);
            user.setOtpGeneratedTime(null);
            taiKhoanRepository.save(user);
            return "Mật khẩu đã được đặt lại thành công.";
        }
        return "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}