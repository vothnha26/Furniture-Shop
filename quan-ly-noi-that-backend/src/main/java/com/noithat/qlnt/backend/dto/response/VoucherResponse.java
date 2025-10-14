package com.noithat.qlnt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chi tiết voucher
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    
    private Integer maVoucher;
    private String maCode;
    private String loaiGiamGia;
    private BigDecimal giaTriGiam;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String trangThai; // "CHUA_BAT_DAU", "DANG_HOAT_DONG", "DA_HET_HAN"
    private Boolean apDungChoMoiNguoi;
    private List<String> tenHangThanhVienApDung;
}
