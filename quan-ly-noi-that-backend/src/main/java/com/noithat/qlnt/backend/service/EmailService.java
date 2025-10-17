package com.noithat.qlnt.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String htmlMsg = "<h3>Mã OTP của bạn là: " + otp + "</h3>"
                + "<p>Mã này sẽ hết hạn sau 5 phút.</p>";

        helper.setText(htmlMsg, true);
        helper.setTo(to);
        helper.setSubject("Xác thực tài khoản của bạn");
        helper.setFrom("thanhlocys@gmail.com"); // Thay email của bạn vào đây

        mailSender.send(mimeMessage);
    }
}