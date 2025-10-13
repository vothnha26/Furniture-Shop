package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class DonHangRequest {
    @NotNull(message = "Mã khách hàng không được để trống")
    private Integer maKhachHang;

    private Integer maVoucher; // Mã ID voucher (nếu có) - deprecated, dùng maCodeVoucher
    private String maCodeVoucher; // Mã code voucher dạng chuỗi (vd: SALE100K)
    
    @Min(value = 0, message = "Điểm thưởng sử dụng phải >= 0")
    private Integer diemThuongSuDung = 0; // Số điểm thưởng khách hàng muốn sử dụng
    
    private String ghiChu;

    @NotBlank(message = "Trạng thái đơn hàng không được để trống")
    private String trangThai;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String phuongThucThanhToan;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    private List<ChiTietDonHangRequest> chiTietDonHangList;

    // Danh sách dịch vụ (vận chuyển, lắp đặt, bảo hành...) - có thể null
    private List<DonHangDichVuRequest> donHangDichVuList;
}
