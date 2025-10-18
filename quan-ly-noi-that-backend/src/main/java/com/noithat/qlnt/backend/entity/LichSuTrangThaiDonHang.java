package com.noithat.qlnt.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuTrangThaiDonHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LichSuTrangThaiDonHang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maLichSu;
    
    @JsonIgnore  // Prevent circular reference when serializing to JSON
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang", nullable = false)
    private DonHang donHang;
    
    @Column(name = "TrangThaiCu")
    private String trangThaiCu;
    
    @Column(name = "TrangThaiMoi", nullable = false)
    private String trangThaiMoi;
    
    @Column(name = "LyDoThayDoi")
    private String lyDoThayDoi;
    
    @Column(name = "NguoiThayDoi", nullable = false)
    private String nguoiThayDoi;
    
    @Column(name = "ThoiGianThayDoi", nullable = false)
    private LocalDateTime thoiGianThayDoi = LocalDateTime.now();
    
    @Column(name = "GhiChu")
    private String ghiChu;
    
    @Column(name = "ViTriHienTai")
    private String viTriHienTai; // Vị trí hiện tại của đơn hàng (kho, đang giao, etc.)
    
    // Constructor for easy creation
    public LichSuTrangThaiDonHang(DonHang donHang, String trangThaiCu, String trangThaiMoi, 
                                  String nguoiThayDoi, String lyDo) {
        this.donHang = donHang;
        this.trangThaiCu = trangThaiCu;
        this.trangThaiMoi = trangThaiMoi;
        this.nguoiThayDoi = nguoiThayDoi;
        this.lyDoThayDoi = lyDo;
        this.thoiGianThayDoi = LocalDateTime.now();
    }
}