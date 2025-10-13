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
    private Integer diemThuongSuDung; // Số điểm thưởng đã sử dụng
    private BigDecimal giamGiaDiemThuong; // Số tiền giảm giá từ điểm thưởng
    private BigDecimal giamGiaVip; // Số tiền giảm giá từ hạng thành viên VIP
    private Integer diemVipThuong; // Điểm thưởng VIP nhận được từ đơn hàng này
    private Boolean mienPhiVanChuyen; // Có miễn phí vận chuyển từ VIP không
    private BigDecimal chiPhiDichVu; // Tổng chi phí dịch vụ (vận chuyển, lắp đặt...)
    private BigDecimal thanhTien;
    private String trangThai;
    private String voucherCode;
    private List<ChiTietDonHangResponse> chiTietDonHangList;
    private List<DonHangDichVuResponse> donHangDichVuList; // Danh sách dịch vụ
}
