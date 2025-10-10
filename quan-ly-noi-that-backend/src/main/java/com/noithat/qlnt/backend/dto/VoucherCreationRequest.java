// File: com/noithat/qlnt/backend/dto/VoucherCreationRequest.java
package com.noithat.qlnt.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VoucherCreationRequest {

    @NotBlank(message = "Mã code không được để trống.")
    @Size(max = 50, message = "Mã code không được vượt quá 50 ký tự.")
    private String maCode;

    @NotBlank(message = "Loại giảm giá không được để trống.")
    @Pattern(regexp = "PERCENT|FIXED", message = "Loại giảm giá phải là 'PERCENT' hoặc 'FIXED'.")
    private String loaiGiamGia;

    @NotNull(message = "Giá trị giảm không được để trống.")
    @PositiveOrZero(message = "Giá trị giảm phải là số dương.")
    private BigDecimal giaTriGiam;

    @NotNull(message = "Ngày bắt đầu không được để trống.")
    private LocalDateTime ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống.")
    private LocalDateTime ngayKetThuc;

    private Boolean apDungChoMoiNguoi = true; // Mặc định áp dụng cho mọi người

    // Danh sách MaHangThanhVien được áp dụng (Chỉ dùng nếu apDungChoMoiNguoi = false)
    private List<Integer> maHangThanhVienIds;
}