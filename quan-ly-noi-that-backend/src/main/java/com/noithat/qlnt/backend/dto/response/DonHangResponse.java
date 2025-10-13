package com.noithat.qlnt.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class DonHangResponse {
    private Integer maDonHang;
    private String tenKhachHang;
    private LocalDateTime ngayDatHang;
    private BigDecimal tongTienGoc;
    private BigDecimal giamGiaVoucher;
    private BigDecimal thanhTien;
    private String trangThai;
    private String voucherCode;
    private List<ChiTietDonHangResponse> chiTietDonHangList;
}
