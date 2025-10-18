package com.noithat.qlnt.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutSummaryResponse {
    private BigDecimal tamTinh;
    private BigDecimal giamGiaVip;
    private BigDecimal giamGiaVoucher;
    private BigDecimal giamGiaDiem;
    private String phiGiaoHang;
    private BigDecimal tongCong;
    private BigDecimal diemThuongNhanDuoc;
    // Tổng tất cả các khoản giảm giá (VIP + Voucher + Điểm thưởng) - backend computed
    private BigDecimal tongGiamGia;
}