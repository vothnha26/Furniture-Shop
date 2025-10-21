package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "KhachHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maKhachHang;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaTaiKhoan", unique = true)
    @JsonIgnore
    private TaiKhoan taiKhoan;
    
    @Column(name = "HoTen", nullable = false)
    private String hoTen;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "SoDienThoai", nullable = false)
    private String soDienThoai;

    @Column(name = "DiaChi")
    private String diaChi;

    @Column(name = "NgaySinh")
    private java.time.LocalDate ngaySinh;

    @Column(name = "GioiTinh")
    private String gioiTinh;

    @Column(name = "DiemThuong", nullable = false)
    private Integer diemThuong = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MaHangThanhVien", nullable = false)
    private HangThanhVien hangThanhVien;

    @Column(name = "TongChiTieu")
    private java.math.BigDecimal tongChiTieu = java.math.BigDecimal.ZERO; // Tổng số tiền đã chi tiêu

    @Column(name = "TongDonHang")
    private Integer tongDonHang = 0; // Tổng số đơn hàng

    @Column(name = "NgayThamGia")
    private java.time.LocalDate ngayThamGia; // Ngày tham gia VIP

    @Column(name = "DonHangCuoi")
    private java.time.LocalDate donHangCuoi; // Ngày đơn hàng cuối cùng

    @Column(name = "TrangThaiVip")
    private String trangThaiVip = "active"; // Trạng thái VIP: active, inactive

    // Back-reference to chat sessions
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<com.noithat.qlnt.backend.entity.chat.ChatSession> chatSessions;
}