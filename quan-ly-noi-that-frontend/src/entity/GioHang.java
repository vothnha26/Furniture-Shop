package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity: Giỏ hàng
 * Mục đích: Lưu trữ giỏ hàng tạm của khách hàng (persistent cart)
 * Giúp giỏ hàng không bị mất khi tắt browser, sync cross-device
 */
@Entity
@Table(name = "GioHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class GioHang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaGioHang")
    private Integer maGioHang;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false, unique = true)
    private KhachHang khachHang;
    
    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    @Column(name = "NgayCapNhatCuoi")
    private LocalDateTime ngayCapNhatCuoi = LocalDateTime.now();
    
    @Column(name = "TrangThai", length = 20)
    @Builder.Default
    private String trangThai = TrangThaiGioHang.ACTIVE;
    
    @OneToMany(mappedBy = "gioHang", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietGioHang> chiTietGioHang = new ArrayList<>();
    
    /**
     * Trạng thái giỏ hàng
     */
    public static class TrangThaiGioHang {
        public static final String ACTIVE = "ACTIVE";         // Đang hoạt động
        public static final String CHECKOUT = "CHECKOUT";     // Đang checkout
        public static final String ABANDONED = "ABANDONED";   // Bỏ quên (cho marketing)
    }
    
    /**
     * Helper method: Cập nhật thời gian
     */
    @PreUpdate
    public void preUpdate() {
        this.ngayCapNhatCuoi = LocalDateTime.now();
    }
}
