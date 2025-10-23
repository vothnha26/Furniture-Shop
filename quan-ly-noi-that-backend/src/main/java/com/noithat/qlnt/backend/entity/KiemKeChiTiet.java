package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "KiemKeChiTiet")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class KiemKeChiTiet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maKiemKeChiTiet;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKiemKe", nullable = false)
    private KiemKeKho kiemKeKho;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaBienThe", nullable = false)
    private BienTheSanPham bienTheSanPham;
    
    @Column(name = "SoLuongHeThong", nullable = false)
    private Integer soLuongHeThong; // Số lượng theo hệ thống
    
    @Column(name = "SoLuongThucTe")
    private Integer soLuongThucTe; // Số lượng kiểm kê thực tế
    
    @Column(name = "ChenhLech")
    private Integer chenhLech; // Số lượng chênh lệch (thực tế - hệ thống)
    
    @Column(name = "GiaTriChenhLech", precision = 15, scale = 2)
    private BigDecimal giaTriChenhLech;
    
    @Column(name = "LyDoChenhLech", columnDefinition = "NVARCHAR(255)")
    private String lyDoChenhLech;
    
    @Column(name = "NguoiKiemKe", columnDefinition = "NVARCHAR(100)")
    private String nguoiKiemKe;
    
    @Column(name = "ThoiGianKiemKe")
    private LocalDateTime thoiGianKiemKe;
    
    @Column(name = "TrangThai", nullable = false)
    @Enumerated(EnumType.STRING)
    private TrangThaiKiemKeChiTiet trangThai = TrangThaiKiemKeChiTiet.CHUA_KIEM_KE;
    
    @Column(name = "GhiChu", columnDefinition = "NVARCHAR(255)")
    private String ghiChu;
    
    public enum TrangThaiKiemKeChiTiet {
        CHUA_KIEM_KE("Chưa kiểm kê"),
        DA_KIEM_KE("Đã kiểm kê"),
        DA_DUYET("Đã duyệt"),
        BI_LOAI("Bị loại");
        
        private final String tenTrangThai;
        
        TrangThaiKiemKeChiTiet(String tenTrangThai) {
            this.tenTrangThai = tenTrangThai;
        }
        
        public String getTenTrangThai() {
            return tenTrangThai;
        }
    }
    
    // Constructor for easy creation
    public KiemKeChiTiet(KiemKeKho kiemKeKho, BienTheSanPham bienTheSanPham, 
                         Integer soLuongHeThong) {
        this.kiemKeKho = kiemKeKho;
        this.bienTheSanPham = bienTheSanPham;
        this.soLuongHeThong = soLuongHeThong;
        this.trangThai = TrangThaiKiemKeChiTiet.CHUA_KIEM_KE;
    }
    
    // Business methods
    public void capNhatSoLuongThucTe(Integer soLuongThucTe, String nguoiKiemKe) {
        this.soLuongThucTe = soLuongThucTe;
        this.chenhLech = soLuongThucTe - this.soLuongHeThong;
        
        // Tính giá trị chênh lệch
        if (bienTheSanPham != null && bienTheSanPham.getGiaBan() != null) {
            this.giaTriChenhLech = bienTheSanPham.getGiaBan().multiply(BigDecimal.valueOf(Math.abs(chenhLech)));
        }
        
        this.nguoiKiemKe = nguoiKiemKe;
        this.thoiGianKiemKe = LocalDateTime.now();
        this.trangThai = TrangThaiKiemKeChiTiet.DA_KIEM_KE;
    }
    
    public boolean coChenhLech() {
        return chenhLech != null && chenhLech != 0;
    }
    
    public void duyetKetQua() {
        if (this.trangThai == TrangThaiKiemKeChiTiet.DA_KIEM_KE) {
            this.trangThai = TrangThaiKiemKeChiTiet.DA_DUYET;
        }
    }
}