package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DonHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;

    @Column(name = "NgayDatHang")
    private LocalDateTime ngayDatHang = LocalDateTime.now();

    @Column(name = "TongTienGoc", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienGoc;

    @Column(name = "GiamGiaVoucher", precision = 18, scale = 2)
    private BigDecimal giamGiaVoucher = BigDecimal.ZERO;

    @Column(name = "ChiPhiDichVu", precision = 18, scale = 2)
    private BigDecimal chiPhiDichVu = BigDecimal.ZERO;

    @Column(name = "ThanhTien", precision = 18, scale = 2, nullable = false)
    private BigDecimal thanhTien;

    @Column(name = "TrangThai", nullable = false)
    private String trangThai = "PENDING"; // PENDING, CONFIRMED, PREPARING, READY_TO_SHIP, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhanVienDuyet")
    private NhanVien nhanVienDuyet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVoucher")
    private Voucher voucher;

    // Order status management
    public enum TrangThaiDonHang {
        PENDING("Chờ xử lý"),
        CONFIRMED("Đã xác nhận"),
        PREPARING("Đang chuẩn bị"),
        READY_TO_SHIP("Sẵn sàng giao hàng"),
        SHIPPING("Đang giao hàng"),
        DELIVERED("Đã giao hàng"),
        COMPLETED("Hoàn thành"),
        CANCELLED("Đã hủy"),
        RETURNED("Đã trả hàng");
        
        private final String displayName;
        
        TrangThaiDonHang(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public boolean canTransitionTo(TrangThaiDonHang newStatus) {
            switch (this) {
                case PENDING:
                    return newStatus == CONFIRMED || newStatus == CANCELLED;
                case CONFIRMED:
                    return newStatus == PREPARING || newStatus == CANCELLED;
                case PREPARING:
                    return newStatus == READY_TO_SHIP || newStatus == CANCELLED;
                case READY_TO_SHIP:
                    return newStatus == SHIPPING || newStatus == CANCELLED;
                case SHIPPING:
                    return newStatus == DELIVERED || newStatus == RETURNED;
                case DELIVERED:
                    return newStatus == COMPLETED || newStatus == RETURNED;
                case COMPLETED:
                    return false; // Final state
                case CANCELLED:
                    return false; // Final state
                case RETURNED:
                    return false; // Final state
                default:
                    return false;
            }
        }
    }

    // Business methods
    public boolean canBeCancelled() {
        return "PENDING".equals(trangThai) || "CONFIRMED".equals(trangThai);
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(trangThai);
    }

    public boolean needsStockReservation() {
        return "PENDING".equals(trangThai);
    }

    public boolean needsStockDeduction() {
        return "CONFIRMED".equals(trangThai);
    }
}