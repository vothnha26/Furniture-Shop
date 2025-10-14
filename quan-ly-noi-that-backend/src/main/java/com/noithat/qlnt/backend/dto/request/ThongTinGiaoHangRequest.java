package com.noithat.qlnt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
@Getter @Setter
public class ThongTinGiaoHangRequest {
    private Integer maKhachHang;
    private Integer maPhuongThucGiaoHang;
    private String diaChiGiaoHang;
    private String phuongThucThanhToan;
    private String ghiChu;
    private Integer maVoucher;
    private Integer diemThuongSuDung;
    private String phuongThucGiaoHang;
    private List<ThanhToanRequest> chiTietDonHangList;
}
