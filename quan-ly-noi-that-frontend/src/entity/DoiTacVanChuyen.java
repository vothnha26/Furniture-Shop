package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity: Đối tác vận chuyển
 * Mục đích: Quản lý thông tin các đối tác vận chuyển (GHTK, GHN, Ninja Van...)
 * Giúp quản lý tập trung, tính phí tự động, tích hợp API tracking
 */
@Entity
@Table(name = "DoiTacVanChuyen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class DoiTacVanChuyen {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDoiTac")
    private Integer maDoiTac;
    
    @Column(name = "TenDoiTac", nullable = false, length = 100)
    private String tenDoiTac;
    
    @Column(name = "MaDoiTac", nullable = false, unique = true, length = 20)
    private String maDoiTacCode; // GHTK, GHN, NINJA, etc.
    
    @Column(name = "ApiUrl", length = 500)
    private String apiUrl;
    
    @Column(name = "ApiKey", columnDefinition = "NVARCHAR(500)")
    private String apiKey;
    
    @Column(name = "SoDienThoai", length = 20)
    private String soDienThoai;
    
    @Column(name = "Email", length = 100)
    private String email;
    
    @Column(name = "TrangThai")
    @Builder.Default
    private Boolean trangThai = true; // true: Active, false: Inactive
    
    @Column(name = "PhiCoBan", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal phiCoBan = BigDecimal.ZERO;
    
    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
    
    @Column(name = "NgayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();
    
    /**
     * Mã đối tác phổ biến
     */
    public static class MaDoiTac {
        public static final String GHTK = "GHTK";           // Giao Hàng Tiết Kiệm
        public static final String GHN = "GHN";             // Giao Hàng Nhanh
        public static final String NINJA = "NINJA";         // Ninja Van
        public static final String VIETTEL_POST = "VTP";    // Viettel Post
        public static final String VN_POST = "VNP";         // VN Post
    }
    
    /**
     * Kiểm tra đối tác có hoạt động không
     */
    public boolean isActive() {
        return trangThai != null && trangThai;
    }
}
