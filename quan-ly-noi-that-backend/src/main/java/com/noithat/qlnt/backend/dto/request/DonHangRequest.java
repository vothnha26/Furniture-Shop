package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class DonHangRequest {
    @NotNull(message = "Mã khách hàng không được để trống")
    private Integer maKhachHang;

    private Integer maVoucher; // Mã giảm giá (nếu có)
    private String ghiChu;

    @NotBlank(message = "Trạng thái đơn hàng không được để trống")
    private String trangThai;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String phuongThucThanhToan;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    private List<ChiTietDonHangRequest> chiTietDonHangList;
}
