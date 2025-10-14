package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity: Địa chỉ giao hàng
 * Mục đích: Lưu trữ địa chỉ giao hàng của khách hàng (có thể có nhiều)
 * Giúp khách hàng không phải nhập lại địa chỉ mỗi lần đặt hàng
 */
@Entity
@Table(name = "DiaChiGiaoHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class DiaChiGiaoHang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDiaChi")
    private Integer maDiaChi;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;
    
    @Column(name = "NguoiNhan", nullable = false, length = 100)
    private String nguoiNhan;
    
    @Column(name = "SoDienThoai", nullable = false, length = 20)
    private String soDienThoai;
    
    @Column(name = "DiaChiChiTiet", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String diaChiChiTiet;
    
    @Column(name = "PhuongXa", length = 100)
    private String phuongXa;
    
    @Column(name = "QuanHuyen", length = 100)
    private String quanHuyen;
    
    @Column(name = "TinhThanhPho", length = 100)
    private String tinhThanhPho;
    
    @Column(name = "MacDinh")
    @Builder.Default
    private Boolean macDinh = false;
    
    @Column(name = "LoaiDiaChi", length = 20)
    @Builder.Default
    private String loaiDiaChi = LoaiDiaChi.HOME;
    
    @Column(name = "GhiChu", columnDefinition = "NVARCHAR(500)")
    private String ghiChu;
    
    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    /**
     * Loại địa chỉ
     */
    public static class LoaiDiaChi {
        public static final String HOME = "HOME";       // Nhà riêng
        public static final String OFFICE = "OFFICE";   // Văn phòng
        public static final String OTHER = "OTHER";     // Khác
    }
    
    /**
     * Lấy địa chỉ đầy đủ
     */
    public String getDiaChiDayDu() {
        StringBuilder sb = new StringBuilder();
        sb.append(diaChiChiTiet);
        if (phuongXa != null && !phuongXa.isEmpty()) {
            sb.append(", ").append(phuongXa);
        }
        if (quanHuyen != null && !quanHuyen.isEmpty()) {
            sb.append(", ").append(quanHuyen);
        }
        if (tinhThanhPho != null && !tinhThanhPho.isEmpty()) {
            sb.append(", ").append(tinhThanhPho);
        }
        return sb.toString();
    }
}
