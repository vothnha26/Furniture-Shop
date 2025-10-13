package com.noithat.qlnt.backend.config;

import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initData(HangThanhVienRepository hangRepo,
                               TaiKhoanRepository taiKhoanRepo,
                               KhachHangRepository khachHangRepo,
                               VoucherRepository voucherRepo,
                               SanPhamRepository sanPhamRepo,
                               BienTheSanPhamRepository bienTheRepo,
                               VaiTroRepository vaiTroRepo,
                               DonHangRepository donHangRepo,
                               ChiTietDonHangRepository chiTietDonHangRepo) {
        return args -> {

            // ================== DỮ LIỆU NỀN TẢNG ==================
            HangThanhVien bronze = hangRepo.save(new HangThanhVien(null, "Bronze", 0));
            HangThanhVien silver = hangRepo.save(new HangThanhVien(null, "Silver", 1000));

            VaiTro vaiTro = vaiTroRepo.save(new VaiTro(null, "USER"));

            TaiKhoan t1 = taiKhoanRepo.save(new TaiKhoan(null, "user1", "password", "user1@example.com", vaiTro));
            TaiKhoan t2 = taiKhoanRepo.save(new TaiKhoan(null, "user2", "password", "user2@example.com", vaiTro));

            KhachHang k1 = khachHangRepo.save(new KhachHang(null, t1, "Nguyễn Văn An", "an.nguyen@example.com", "0901112221", "Thủ Đức", 1000, bronze));
            KhachHang k2 = khachHangRepo.save(new KhachHang(null, t2, "Trần Thị Bình", "binh.tran@example.com", "0903334442", "Hà Nội", 1200, silver));

            Voucher v1 = voucherRepo.save(new Voucher(
                    null, "SALE100K", "FIXED", BigDecimal.valueOf(100000),
                    LocalDateTime.now().minusDays(10),
                    LocalDateTime.now().plusYears(1),
                    true, null
            ));

            SanPham sp1 = sanPhamRepo.save(new SanPham(null, "Ghế Sofa Băng Dài",
                    "Ghế sofa hiện đại cho phòng khách.", 20, 5, 6, 60, null, null, null));

            BienTheSanPham bt1 = bienTheRepo.save(new BienTheSanPham(null, sp1, "SF-BANG-XAM", BigDecimal.valueOf(4500000), 50));
            BienTheSanPham bt2 = bienTheRepo.save(new BienTheSanPham(null, sp1, "SF-BANG-KEM", BigDecimal.valueOf(4650000), 30));

            SanPham sp2 = sanPhamRepo.save(new SanPham(null, "Bàn Trà Gỗ Sồi",
                    "Bàn trà nhỏ gọn, thiết kế tinh tế.", 40, 6, 8, 400, null, null, null));

            BienTheSanPham bt3 = bienTheRepo.save(new BienTheSanPham(null, sp2, "BT-SOI-TRON", BigDecimal.valueOf(1200000), 100));

            // ================== TẠO ĐƠN HÀNG ==================

            // ===== ĐƠN HÀNG 1 =====
            DonHang donHang1 = new DonHang();
            donHang1.setKhachHang(k1);
            donHang1.setNgayDatHang(LocalDateTime.now().minusDays(1));
            donHang1.setTrangThai("Hoàn thành");
            donHang1.setPhuongThucThanhToan("COD"); // 🟢 BẮT BUỘC THÊM
            donHang1.setGhiChu("Giao hàng vào giờ hành chính.");
            donHang1.setVoucher(v1);

            BigDecimal tongTienGoc1 = bt1.getGiaBan().add(bt3.getGiaBan().multiply(BigDecimal.valueOf(2)));
            donHang1.setTongTienGoc(tongTienGoc1);
            donHang1.setGiamGiaVoucher(v1.getGiaTriGiam());
            donHang1.setThanhTien(tongTienGoc1.subtract(v1.getGiaTriGiam()));
            donHang1.setChiPhiDichVu(BigDecimal.ZERO);

            DonHang savedDonHang1 = donHangRepo.save(donHang1);

            ChiTietDonHang.ChiTietDonHangId id1 = new ChiTietDonHang.ChiTietDonHangId(savedDonHang1.getMaDonHang(), bt1.getMaBienThe());
            ChiTietDonHang ct1_1 = new ChiTietDonHang(id1, savedDonHang1, bt1, 1, bt1.getGiaBan(), bt1.getGiaBan());
            chiTietDonHangRepo.save(ct1_1);

            ChiTietDonHang.ChiTietDonHangId id2 = new ChiTietDonHang.ChiTietDonHangId(savedDonHang1.getMaDonHang(), bt3.getMaBienThe());
            ChiTietDonHang ct1_2 = new ChiTietDonHang(id2, savedDonHang1, bt3, 2, bt3.getGiaBan(), bt3.getGiaBan());
            chiTietDonHangRepo.save(ct1_2);

            // ===== ĐƠN HÀNG 2 =====
            DonHang donHang2 = new DonHang();
            donHang2.setKhachHang(k2);
            donHang2.setNgayDatHang(LocalDateTime.now());
            donHang2.setTrangThai("Chờ xử lý");
            donHang2.setPhuongThucThanhToan("Chuyển khoản"); // 🟢 BẮT BUỘC THÊM
            donHang2.setTongTienGoc(bt2.getGiaBan());
            donHang2.setThanhTien(bt2.getGiaBan());
            donHang2.setChiPhiDichVu(BigDecimal.ZERO);

            DonHang savedDonHang2 = donHangRepo.save(donHang2);

            ChiTietDonHang.ChiTietDonHangId id3 = new ChiTietDonHang.ChiTietDonHangId(savedDonHang2.getMaDonHang(), bt2.getMaBienThe());
            ChiTietDonHang ct2_1 = new ChiTietDonHang(id3, savedDonHang2, bt2, 1, bt2.getGiaBan(), bt2.getGiaBan());
            chiTietDonHangRepo.save(ct2_1);

            // ===== ĐƠN HÀNG 3 =====
            DonHang donHang3 = new DonHang();
            donHang3.setKhachHang(k1);
            donHang3.setNgayDatHang(LocalDateTime.now().minusHours(2));
            donHang3.setTrangThai("Đang giao");
            donHang3.setPhuongThucThanhToan("COD"); // 🟢 BẮT BUỘC THÊM
            donHang3.setTongTienGoc(bt3.getGiaBan());
            donHang3.setThanhTien(bt3.getGiaBan());
            donHang3.setChiPhiDichVu(BigDecimal.ZERO);

            DonHang savedDonHang3 = donHangRepo.save(donHang3);

            ChiTietDonHang.ChiTietDonHangId id4 = new ChiTietDonHang.ChiTietDonHangId(savedDonHang3.getMaDonHang(), bt3.getMaBienThe());
            ChiTietDonHang ct3_1 = new ChiTietDonHang(id4, savedDonHang3, bt3, 1, bt3.getGiaBan(), bt3.getGiaBan());
            chiTietDonHangRepo.save(ct3_1);
        };
    }
}
