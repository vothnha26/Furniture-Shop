package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BienTheSanPham")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BienTheSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maBienThe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSanPham", nullable = false)
    private SanPham sanPham;

    @Column(name = "SKU", unique = true, nullable = false)
    private String sku;

    @Column(name = "GiaBan", precision = 18, scale = 2, nullable = false)
    private BigDecimal giaBan;

    @Column(name = "SoLuongTon", nullable = false)
    private Integer soLuongTon = 0;

    // Thêm các trường quản lý kho nâng cao
    @Column(name = "SoLuongDatTruoc")
    private Integer soLuongDatTruoc = 0;

    @Column(name = "MucTonToiThieu")
    private Integer mucTonToiThieu = 5;

    @Column(name = "ViTriKho")
    private String viTriKho;

    @Column(name = "NgayCapNhatKho")
    private LocalDateTime ngayCapNhatKho;

    @Column(name = "TrangThaiKho")
    private String trangThaiKho = "ACTIVE"; // ACTIVE, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED

    // Business methods for stock management
    public Integer getSoLuongCoSan() {
        return soLuongTon - soLuongDatTruoc;
    }

    public boolean isLowStock() {
        return soLuongTon <= mucTonToiThieu;
    }

    public boolean isOutOfStock() {
        return soLuongTon <= 0;
    }

    public boolean canReserve(Integer soLuong) {
        return getSoLuongCoSan() >= soLuong;
    }

    // Stock operations
    public void reserveStock(Integer soLuong) {
        if (!canReserve(soLuong)) {
            throw new IllegalArgumentException("Không đủ hàng để đặt trước");
        }
        this.soLuongDatTruoc += soLuong;
        updateStockStatus();
    }

    public void releaseStock(Integer soLuong) {
        this.soLuongDatTruoc = Math.max(0, this.soLuongDatTruoc - soLuong);
        updateStockStatus();
    }

    public void confirmSale(Integer soLuong) {
        this.soLuongDatTruoc = Math.max(0, this.soLuongDatTruoc - soLuong);
        this.soLuongTon = Math.max(0, this.soLuongTon - soLuong);
        this.ngayCapNhatKho = LocalDateTime.now();
        updateStockStatus();
    }

    public void updateStock(Integer soLuongThayDoi) {
        Integer soLuongMoi = this.soLuongTon + soLuongThayDoi;
        if (soLuongMoi < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được âm");
        }
        this.soLuongTon = soLuongMoi;
        this.ngayCapNhatKho = LocalDateTime.now();
        updateStockStatus();
    }

    private void updateStockStatus() {
        if (isOutOfStock()) {
            this.trangThaiKho = "OUT_OF_STOCK";
        } else if (isLowStock()) {
            this.trangThaiKho = "LOW_STOCK";
        } else {
            this.trangThaiKho = "ACTIVE";
        }
    }
}


