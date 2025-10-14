package com.noithat.qlnt.backend.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HangThanhVienDto {
    private Integer maHangThanhVien;
    
    @NotBlank(message = "Tên hạng thành viên không được để trống")
    @Size(max = 100, message = "Tên hạng thành viên không được quá 100 ký tự")
    private String tenHang;
    
    @NotNull(message = "Điểm tối thiểu không được để trống")
    @Min(value = 0, message = "Điểm tối thiểu phải lớn hơn hoặc bằng 0")
    private Integer diemToiThieu;
    
    @NotNull(message = "Số tiền tối thiểu không được để trống")
    @DecimalMin(value = "0.0", message = "Số tiền tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal soTienToiThieu;
    
    @DecimalMin(value = "0.0", message = "Phần trăm giảm giá phải lớn hơn hoặc bằng 0")
    @DecimalMax(value = "100.0", message = "Phần trăm giảm giá không được quá 100%")
    private BigDecimal phanTramGiamGia;
    
    @Size(max = 1000, message = "Mô tả không được quá 1000 ký tự")
    private String moTa;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Màu sắc phải là mã hex hợp lệ (VD: #FF0000)")
    private String mauSac;
    
    private List<String> uuDai;
    
    private Boolean trangThai;
    
    @Min(value = 0, message = "Thứ tự phải lớn hơn hoặc bằng 0")
    private Integer thuTu;
    
    private String icon;
    
    private Long soLuongKhachHang;
    private BigDecimal doanhThuTrungBinh;
    private String level;
}
