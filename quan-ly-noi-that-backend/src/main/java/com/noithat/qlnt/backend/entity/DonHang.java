package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "DiemThuongSuDung")
    private Integer diemThuongSuDung = 0;

    @Column(name = "GiamGiaDiemThuong", precision = 18, scale = 2)
    private BigDecimal giamGiaDiemThuong = BigDecimal.ZERO;

    @Column(name = "GiamGiaVip", precision = 18, scale = 2)
    private BigDecimal giamGiaVip = BigDecimal.ZERO; // Giảm giá từ hạng thành viên VIP

    @Column(name = "DiemVipThuong")
    private Integer diemVipThuong = 0; // Điểm thưởng VIP từ đơn hàng này

    @Column(name = "MienPhiVanChuyen")
    private Boolean mienPhiVanChuyen = false; // Có miễn phí vận chuyển từ VIP không

    @Column(name = "ChiPhiDichVu", precision = 18, scale = 2)
    private BigDecimal chiPhiDichVu = BigDecimal.ZERO;

    @Column(name = "ThanhTien", precision = 18, scale = 2, nullable = false)
    private BigDecimal thanhTien;

    @Column(name = "TrangThai", nullable = false)
    private String trangThai = "PENDING"; // PENDING, CONFIRMED, PREPARING, READY_TO_SHIP, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED

    @Column(name = "PhuongThucThanhToan", nullable = false)
    private String phuongThucThanhToan;

    @Column(length = 255)
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhanVienDuyet")
    private NhanVien nhanVienDuyet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVoucher")
    private Voucher voucher;

    @OneToMany(mappedBy = "donHang", 
           cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
           orphanRemoval = true)
    private List<ChiTietDonHang> chiTietDonHangs = new ArrayList<>();

    @OneToMany(mappedBy = "donHang",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
            orphanRemoval = true)
    private List<DonHangDichVu> donHangDichVus = new ArrayList<>();

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