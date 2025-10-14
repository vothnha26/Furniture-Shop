package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity: Chi tiết giỏ hàng
 * Mục đích: Lưu trữ các sản phẩm (biến thể) trong giỏ hàng
 */
@Entity
@Table(name = "ChiTietGioHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class ChiTietGioHang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChiTiet")
    private Integer maChiTiet;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaGioHang", nullable = false)
    private GioHang gioHang;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaBienThe", nullable = false)
    private BienTheSanPham bienThe;
    
    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;
    
    @Column(name = "NgayThem")
    private LocalDateTime ngayThem = LocalDateTime.now();
    
    @Column(name = "GiaTaiThoiDiemThem", precision = 18, scale = 2)
    private BigDecimal giaTaiThoiDiemThem;
    
    /**
     * Constructor tiện lợi
     */
    public ChiTietGioHang(GioHang gioHang, BienTheSanPham bienThe, Integer soLuong) {
        this.gioHang = gioHang;
        this.bienThe = bienThe;
        this.soLuong = soLuong;
        this.ngayThem = LocalDateTime.now();
        this.giaTaiThoiDiemThem = bienThe.getGiaBan();
    }
    
    /**
     * Tính thành tiền
     */
    public BigDecimal tinhThanhTien() {
        if (giaTaiThoiDiemThem != null && soLuong != null) {
            return giaTaiThoiDiemThem.multiply(new BigDecimal(soLuong));
        }
        return BigDecimal.ZERO;
    }
}
