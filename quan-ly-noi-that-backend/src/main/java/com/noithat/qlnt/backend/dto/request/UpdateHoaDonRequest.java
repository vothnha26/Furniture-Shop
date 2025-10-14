package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO Request để cập nhật thông tin của một hóa đơn.
 */
@Data
public class UpdateHoaDonRequest {
    // Hiện tại chỉ cho phép cập nhật nhân viên xuất hóa đơn
    @NotNull(message = "Mã nhân viên mới không được để trống")
    private Integer maNhanVienXuat;
}