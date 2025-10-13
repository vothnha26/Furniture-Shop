package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherApplyRequest {
    @NotBlank(message = "Mã Voucher không được để trống")
    private String maCode;
    
    @NotNull(message = "Tổng tiền đơn hàng không được để trống")
    @Positive(message = "Tổng tiền đơn hàng phải là số dương")
    private BigDecimal tongTienDonHang;
    
    @NotNull(message = "Mã Khách hàng không được để trống")
    @Positive(message = "Mã Khách hàng không hợp lệ")
    private Integer maKhachHang;
}