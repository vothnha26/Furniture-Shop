package com.noithat.qlnt.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HangThanhVienResponse {
    
    private Integer maHangThanhVien;
    private String tenHang;
    private Integer diemToiThieu;
    private Long soLuongKhachHang; // Số lượng khách hàng thuộc hạng này
    private String moTa; // Mô tả cấp độ
    private String mauSac; // Màu sắc hiển thị
}