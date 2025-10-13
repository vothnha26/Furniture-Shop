package com.noithat.qlnt.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Response thông tin biến thể trong chương trình giảm giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienTheGiamGiaResponse {
    
    private Integer maBienThe;
    private String sku;
    private String tenSanPham;
    private BigDecimal giaBanGoc;
    private BigDecimal giaSauGiam;
    private BigDecimal phanTramGiam;
    private Integer soLuongTon;
}
