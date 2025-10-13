package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HangThanhVienRequest {
    
    @NotBlank(message = "Tên hạng thành viên không được để trống")
    @Size(min = 2, max = 50, message = "Tên hạng thành viên phải có độ dài từ 2 đến 50 ký tự")
    private String tenHang;
    
    @NotNull(message = "Điểm tối thiểu không được để trống")
    @Min(value = 0, message = "Điểm tối thiểu không được âm")
    private Integer diemToiThieu;
}