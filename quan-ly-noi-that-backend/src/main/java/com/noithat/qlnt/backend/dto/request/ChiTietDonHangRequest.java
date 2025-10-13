package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChiTietDonHangRequest {

    @NotNull(message = "Mã sản phẩm không được để trống")
    private Integer maSanPham;
    
    @NotNull(message = "Mã biến thể không được để trống")
    private Integer maBienThe;

    @NotNull(message = "Số lượng không được để trống")
    private Integer soLuong;
}
