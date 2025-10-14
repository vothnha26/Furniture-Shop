package com.noithat.qlnt.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ThongTinGiaoHangRequest {
    private Integer maKhachHang;
    private Integer maPhuongThucGiaoHang;
    private String diaChiGiaoHang;
    private String phuongThucThanhToan;
    private String ghiChu;
    private Integer maVoucher;
    private Integer diemThuongSuDung;
    private String phuongThucGiaoHang;
    // Người nhận (client sometimes sends tenNguoiNhan)
    @JsonAlias({"tenNguoiNhan", "ten_nguoi_nhan"})
    private String tenNguoiNhan;
    private List<ThanhToanRequest> chiTietDonHangList;
}
