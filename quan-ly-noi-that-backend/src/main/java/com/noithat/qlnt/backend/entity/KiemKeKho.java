package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "KiemKeKho")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class KiemKeKho {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maKiemKe;
    
    @Column(name = "TenKiemKe", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String tenKiemKe;
    
    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa;
    
    @Column(name = "TrangThai", nullable = false)
    @Enumerated(EnumType.STRING)
    private TrangThaiKiemKe trangThai = TrangThaiKiemKe.DANG_CHUAN_BI;
    
    @Column(name = "NgayBatDau")
    private LocalDateTime ngayBatDau;
    
    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;
    
    @Column(name = "NguoiTao", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String nguoiTao;
    
    @Column(name = "NgayTao", nullable = false)
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    @Column(name = "NguoiDuyet", columnDefinition = "NVARCHAR(100)")
    private String nguoiDuyet;
    
    @Column(name = "NgayDuyet")
    private LocalDateTime ngayDuyet;
    
    @Column(name = "GhiChu", columnDefinition = "NVARCHAR(255)")
    private String ghiChu;
    
    // One-to-many relationship with KiemKeChiTiet
    @OneToMany(mappedBy = "kiemKeKho", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KiemKeChiTiet> chiTietKiemKe = new ArrayList<>();
    
    public enum TrangThaiKiemKe {
        DANG_CHUAN_BI("Đang chuẩn bị"),
        DANG_KIEM_KE("Đang kiểm kê"),
        HOAN_THANH("Hoàn thành"),
        HUY_BO("Hủy bỏ");
        
        private final String tenTrangThai;
        
        TrangThaiKiemKe(String tenTrangThai) {
            this.tenTrangThai = tenTrangThai;
        }
        
        public String getTenTrangThai() {
            return tenTrangThai;
        }
    }
    
    // Business methods
    public void batDauKiemKe() {
        if (this.trangThai == TrangThaiKiemKe.DANG_CHUAN_BI) {
            this.trangThai = TrangThaiKiemKe.DANG_KIEM_KE;
            this.ngayBatDau = LocalDateTime.now();
        }
    }
    
    public void hoanThanhKiemKe(String nguoiDuyet) {
        if (this.trangThai == TrangThaiKiemKe.DANG_KIEM_KE) {
            this.trangThai = TrangThaiKiemKe.HOAN_THANH;
            this.ngayKetThuc = LocalDateTime.now();
            this.nguoiDuyet = nguoiDuyet;
            this.ngayDuyet = LocalDateTime.now();
        }
    }
    
    public void huyKiemKe() {
        if (this.trangThai != TrangThaiKiemKe.HOAN_THANH) {
            this.trangThai = TrangThaiKiemKe.HUY_BO;
            this.ngayKetThuc = LocalDateTime.now();
        }
    }
}