package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChuongTrinhGiamGiaRequest {
    @NotBlank(message = "Tên chương trình không được để trống")
    private String ten;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime ngayBatDau;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime ngayKetThuc;
}