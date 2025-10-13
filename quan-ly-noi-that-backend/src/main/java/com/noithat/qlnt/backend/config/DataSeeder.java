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
                               VoucherHangThanhVienRepository voucherHangRepo,
                               SanPhamRepository sanPhamRepo,
                               BienTheSanPhamRepository bienTheRepo,
                                BoSuuTapRepository boSuuTapRepo,
                               VaiTroRepository vaiTroRepo,
                               DonHangRepository donHangRepo,
                               ChiTietDonHangRepository chiTietDonHangRepo,
                               ChuongTrinhGiamGiaRepository chuongTrinhRepo,
                               BienTheGiamGiaRepository bienTheGiamGiaRepo,
                               DichVuRepository dichVuRepo,
                               DonHangDichVuRepository donHangDichVuRepo) {
        return args -> {

            // ================== DỮ LIỆU NỀN TẢNG ==================
            System.out.println("🎯 Bắt đầu seed dữ liệu...");
            
            // Tạo hạng thành viên VIP (theo thứ tự từ thấp đến cao)
            HangThanhVien silver = taoHangThanhVien("Silver", 1000, new BigDecimal("5000000"), new BigDecimal("5.0"),
                "Hạng thành viên bạc", "#C0C0C0", "[\"Giảm giá 5%\"]", "IoMedal", 1);
            silver = hangRepo.save(silver);

            HangThanhVien gold = taoHangThanhVien("Gold", 5000, new BigDecimal("15000000"), new BigDecimal("10.0"),
                "Hạng thành viên vàng", "#FFD700", "[\"Giảm giá 10%\", \"Ưu tiên giao hàng\"]", "IoStar", 2);
            gold = hangRepo.save(gold);

            HangThanhVien platinum = taoHangThanhVien("Platinum", 15000, new BigDecimal("30000000"), new BigDecimal("15.0"),
                "Hạng thành viên bạch kim", "#E5E4E2", "[\"Miễn phí vận chuyển\", \"Giảm giá 15%\", \"Ưu tiên giao hàng\"]", "IoTrophy", 3);
            platinum = hangRepo.save(platinum);

            HangThanhVien diamond = taoHangThanhVien("Diamond", 30000, new BigDecimal("50000000"), new BigDecimal("20.0"),
                "Hạng thành viên kim cương", "#B9F2FF", "[\"Miễn phí vận chuyển\", \"Giảm giá 20%\", \"Ưu tiên giao hàng\", \"Tư vấn riêng\"]", "IoDiamond", 4);
            diamond = hangRepo.save(diamond);

            // Bronze cho khách hàng mới
            HangThanhVien bronze = taoHangThanhVien("Bronze", 0, new BigDecimal("0"), new BigDecimal("3.0"),
                "Hạng thành viên cơ bản", "#CD7F32", "[\"Giảm giá 3%\", \"Tích điểm thưởng\"]", "IoMedal", 0);
            bronze = hangRepo.save(bronze);

            // Tạo vai trò
            VaiTro vaiTro = vaiTroRepo.save(new VaiTro(null, "USER"));

            // Tạo tài khoản
            TaiKhoan t1 = taiKhoanRepo.save(new TaiKhoan(null, "user1", "password", "user1@example.com", vaiTro));
            TaiKhoan t2 = taiKhoanRepo.save(new TaiKhoan(null, "user2", "password", "user2@example.com", vaiTro));
            TaiKhoan t3 = taiKhoanRepo.save(new TaiKhoan(null, "user3", "password", "user3@example.com", vaiTro));

            // Tạo khách hàng
            KhachHang k1 = khachHangRepo.save(taoKhachHang(t1, "Nguyễn Văn An", "an.nguyen@example.com", "0901112221", "123 Đường Lê Lợi, Quận 1, TP.HCM", 800, bronze));
            KhachHang k2 = khachHangRepo.save(taoKhachHang(t2, "Trần Thị Bình", "binh.tran@example.com", "0903334442", "456 Đường Nguyễn Huệ, Quận 1, TP.HCM", 1500, silver));
            KhachHang k3 = khachHangRepo.save(taoKhachHang(t3, "Lê Văn Cường", "cuong.le@example.com", "0907778889", "789 Đường Hai Bà Trưng, Quận 3, TP.HCM", 6200, gold));

            Voucher v1 = new Voucher();
            v1.setTenVoucher("SALE100K");
            v1.setMaCode("SALE100K");
            v1.setLoaiGiamGia("FIXED");
            v1.setGiaTriGiam(BigDecimal.valueOf(100000));
            v1.setNgayBatDau(LocalDateTime.now().minusDays(10));
            v1.setNgayKetThuc(LocalDateTime.now().plusYears(1));
            v1.setTrangThai(true);
            v1 = voucherRepo.save(v1);

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

            // ================== DỊCH VỤ ==================
            dichVuRepo.save(new DichVu(null, "Vận chuyển tiêu chuẩn", "Giao hàng trong vòng 3-5 ngày làm việc", BigDecimal.valueOf(50000)));
            DichVu dv2 = dichVuRepo.save(new DichVu(null, "Vận chuyển nhanh", "Giao hàng trong vòng 24h", BigDecimal.valueOf(150000)));
            DichVu dv3 = dichVuRepo.save(new DichVu(null, "Lắp đặt tại nhà", "Dịch vụ lắp đặt và sắp xếp nội thất", BigDecimal.valueOf(200000)));
            dichVuRepo.save(new DichVu(null, "Bảo hành mở rộng 2 năm", "Gia hạn thêm 2 năm bảo hành", BigDecimal.valueOf(500000)));

            // Thêm dịch vụ vào đơn hàng 1 (Vận chuyển nhanh + Lắp đặt)
            DonHangDichVu dhdv1 = new DonHangDichVu();
            DonHangDichVu.DonHangDichVuId dhvId1 = new DonHangDichVu.DonHangDichVuId(savedDonHang1.getMaDonHang(), dv2.getMaDichVu());
            dhdv1.setId(dhvId1);
            dhdv1.setDonHang(savedDonHang1);
            dhdv1.setDichVu(dv2);
            dhdv1.setSoLuong(1);
            donHangDichVuRepo.save(dhdv1);

            DonHangDichVu dhdv2 = new DonHangDichVu();
            DonHangDichVu.DonHangDichVuId dhvId2 = new DonHangDichVu.DonHangDichVuId(savedDonHang1.getMaDonHang(), dv3.getMaDichVu());
            dhdv2.setId(dhvId2);
            dhdv2.setDonHang(savedDonHang1);
            dhdv2.setDichVu(dv3);
            dhdv2.setSoLuong(1);
            donHangDichVuRepo.save(dhdv2);

            // Cập nhật lại chi phí dịch vụ và thành tiền cho đơn hàng 1
            BigDecimal chiPhiDV1 = dv2.getChiPhi().add(dv3.getChiPhi()); // 150k + 200k = 350k
            savedDonHang1.setChiPhiDichVu(chiPhiDV1);
            savedDonHang1.setThanhTien(savedDonHang1.getTongTienGoc().add(chiPhiDV1));
            donHangRepo.save(savedDonHang1);

            // ================== DỮ LIỆU KHUYẾN MÃI ==================

            // ================== BỘ SƯU TẬP ==================
            BoSuuTap bst1 = new BoSuuTap();
            bst1.setTenBoSuuTap("Bộ sưu tập Phòng Khách");
            bst1.setMoTa("Bộ sưu tập dành cho phòng khách");
            bst1 = boSuuTapRepo.save(bst1);

            BoSuuTap bst2 = new BoSuuTap();
            bst2.setTenBoSuuTap("Bộ sưu tập Phòng Ăn");
            bst2.setMoTa("Bộ sưu tập dành cho phòng ăn");
            bst2 = boSuuTapRepo.save(bst2);

            // Gán sản phẩm vào bộ sưu tập
            bst1.getSanPhams().add(sp1);
            bst1.getSanPhams().add(sp2);
            boSuuTapRepo.save(bst1);

            // VOUCHER 1: Giảm phần trăm cho mọi người
            Voucher voucher1 = new Voucher();
            voucher1.setTenVoucher("TETALE2025");
            voucher1.setMaCode("TETALE2025");
            voucher1.setLoaiGiamGia("PERCENTAGE");
            voucher1.setGiaTriGiam(BigDecimal.valueOf(15));
            voucher1.setNgayBatDau(LocalDateTime.of(2025, 1, 15, 0, 0));
            voucher1.setNgayKetThuc(LocalDateTime.of(2025, 2, 15, 23, 59));
            voucher1.setTrangThai(true);
            voucherRepo.save(voucher1);

            // VOUCHER 2: Giảm cố định cho mọi người
            Voucher voucher2 = new Voucher();
            voucher2.setTenVoucher("FREESHIP100K");
            voucher2.setMaCode("FREESHIP100K");
            voucher2.setLoaiGiamGia("FIXED");
            voucher2.setGiaTriGiam(BigDecimal.valueOf(100000));
            voucher2.setNgayBatDau(LocalDateTime.now().minusDays(1));
            voucher2.setNgayKetThuc(LocalDateTime.now().plusMonths(1));
            voucher2.setTrangThai(true);
            voucherRepo.save(voucher2);

            // VOUCHER 3: Giảm cho hạng VIP (Silver và Gold)
            Voucher voucher3 = new Voucher();
            voucher3.setTenVoucher("VIP2025");
            voucher3.setMaCode("VIP2025");
            voucher3.setLoaiGiamGia("FIXED");
            voucher3.setGiaTriGiam(BigDecimal.valueOf(500000));
            voucher3.setNgayBatDau(LocalDateTime.of(2025, 1, 1, 0, 0));
            voucher3.setNgayKetThuc(LocalDateTime.of(2025, 12, 31, 23, 59));
            voucher3.setTrangThai(false);
            voucher3.setApDungChoMoiNguoi(false);
            voucher3 = voucherRepo.save(voucher3);
            
            // Gán voucher cho hạng thành viên Silver và Gold
            voucherHangRepo.save(new VoucherHangThanhVien(
                    new VoucherHangThanhVien.VoucherHangThanhVienId(voucher3.getMaVoucher(), silver.getMaHangThanhVien()),
                    voucher3, silver
            ));
            voucherHangRepo.save(new VoucherHangThanhVien(
                    new VoucherHangThanhVien.VoucherHangThanhVienId(voucher3.getMaVoucher(), gold.getMaHangThanhVien()),
                    voucher3, gold
            ));

            // CHƯƠNG TRÌNH GIẢM GIÁ 1: Flash Sale Cuối Tuần
            ChuongTrinhGiamGia flashSale = new ChuongTrinhGiamGia();
            flashSale.setTenChuongTrinh("Flash Sale Cuối Tuần");
            flashSale.setNgayBatDau(LocalDateTime.now().minusDays(1));
            flashSale.setNgayKetThuc(LocalDateTime.now().plusDays(2));
            flashSale = chuongTrinhRepo.save(flashSale);

            // Thêm biến thể vào chương trình giảm giá
            BienTheGiamGia btg1 = new BienTheGiamGia();
            BienTheGiamGia.BienTheGiamGiaId btgId1 = new BienTheGiamGia.BienTheGiamGiaId(
                    flashSale.getMaChuongTrinhGiamGia(), bt1.getMaBienThe()
            );
            btg1.setId(btgId1);
            btg1.setChuongTrinhGiamGia(flashSale);
            btg1.setBienTheSanPham(bt1);
            btg1.setGiaSauGiam(BigDecimal.valueOf(3500000)); // Giảm từ 4.5tr xuống 3.5tr
            bienTheGiamGiaRepo.save(btg1);

            BienTheGiamGia btg2 = new BienTheGiamGia();
            BienTheGiamGia.BienTheGiamGiaId btgId2 = new BienTheGiamGia.BienTheGiamGiaId(
                    flashSale.getMaChuongTrinhGiamGia(), bt2.getMaBienThe()
            );
            btg2.setId(btgId2);
            btg2.setChuongTrinhGiamGia(flashSale);
            btg2.setBienTheSanPham(bt2);
            btg2.setGiaSauGiam(BigDecimal.valueOf(3700000)); // Giảm từ 4.65tr xuống 3.7tr
            bienTheGiamGiaRepo.save(btg2);

            // CHƯƠNG TRÌNH GIẢM GIÁ 2: Khuyến Mãi Tết
            ChuongTrinhGiamGia khuyenMaiTet = new ChuongTrinhGiamGia();
            khuyenMaiTet.setTenChuongTrinh("Khuyến Mãi Tết 2025");
            khuyenMaiTet.setNgayBatDau(LocalDateTime.of(2025, 1, 15, 0, 0));
            khuyenMaiTet.setNgayKetThuc(LocalDateTime.of(2025, 2, 15, 23, 59));
            khuyenMaiTet = chuongTrinhRepo.save(khuyenMaiTet);

            BienTheGiamGia btg3 = new BienTheGiamGia();
            BienTheGiamGia.BienTheGiamGiaId btgId3 = new BienTheGiamGia.BienTheGiamGiaId(
                    khuyenMaiTet.getMaChuongTrinhGiamGia(), bt3.getMaBienThe()
            );
            btg3.setId(btgId3);
            btg3.setChuongTrinhGiamGia(khuyenMaiTet);
            btg3.setBienTheSanPham(bt3);
            btg3.setGiaSauGiam(BigDecimal.valueOf(1000000)); // Giảm từ 1.2tr xuống 1tr
            bienTheGiamGiaRepo.save(btg3);

            // ===== TẠO ĐƠN HÀNG MẪU =====
            // Đơn hàng 1: Khách hàng Gold (k3) mua Ghế Sofa với voucher VIP
            Voucher voucherVip = voucherRepo.findByMaCode("VIP2025")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher VIP2025"));
            
            DonHang dh1 = new DonHang();
            dh1.setKhachHang(k3);
            dh1.setVoucher(voucherVip);
            dh1.setTrangThai("Đang xử lý");
            dh1.setNgayDatHang(LocalDateTime.now());
            dh1.setPhuongThucThanhToan("Chuyển khoản");
            dh1.setTongTienGoc(BigDecimal.valueOf(2500000));
            dh1.setGiamGiaVoucher(BigDecimal.valueOf(500000)); // VIP2025 giảm 500k
            dh1.setThanhTien(BigDecimal.valueOf(2000000)); // 2.5tr - 500k = 2tr
            donHangRepo.save(dh1);

            ChiTietDonHang ctdh1 = new ChiTietDonHang();
            ChiTietDonHang.ChiTietDonHangId ctdhId1 = new ChiTietDonHang.ChiTietDonHangId(
                    dh1.getMaDonHang(), bt1.getMaBienThe()
            );
            ctdh1.setId(ctdhId1);
            ctdh1.setDonHang(dh1);
            ctdh1.setBienThe(bt1); // Ghế Sofa màu Đỏ
            ctdh1.setSoLuong(1);
            ctdh1.setDonGiaGoc(BigDecimal.valueOf(2500000));
            ctdh1.setDonGiaThucTe(BigDecimal.valueOf(2500000));
            chiTietDonHangRepo.save(ctdh1);

            System.out.println("✅ Seed dữ liệu thành công!");
        };
    }

    /**
     * Helper method để tạo hạng thành viên với đầy đủ thông tin
     */
    private HangThanhVien taoHangThanhVien(String tenHang, Integer diemToiThieu, 
            BigDecimal soTienToiThieu, BigDecimal phanTramGiamGia, String moTa, 
            String mauSac, String uuDai, String icon, Integer thuTu) {
        HangThanhVien hang = new HangThanhVien();
        hang.setTenHang(tenHang);
        hang.setDiemToiThieu(diemToiThieu);
        hang.setSoTienToiThieu(soTienToiThieu);
        hang.setPhanTramGiamGia(phanTramGiamGia);
        hang.setMoTa(moTa);
        hang.setMauSac(mauSac);
        hang.setUuDai(uuDai);
        hang.setIcon(icon);
        hang.setTrangThai(true);
        hang.setThuTu(thuTu);
        return hang;
    }

    /**
     * Helper method để tạo khách hàng với đầy đủ thông tin
     */
    private KhachHang taoKhachHang(TaiKhoan taiKhoan, String hoTen, String email, String soDienThoai, 
                                  String diaChi, Integer diemThuong, HangThanhVien hangThanhVien) {
        KhachHang khachHang = new KhachHang();
        khachHang.setTaiKhoan(taiKhoan);
        khachHang.setHoTen(hoTen);
        khachHang.setEmail(email);
        khachHang.setSoDienThoai(soDienThoai);
        khachHang.setDiaChi(diaChi);
        khachHang.setDiemThuong(diemThuong);
        khachHang.setHangThanhVien(hangThanhVien);
        khachHang.setNgayThamGia(java.time.LocalDate.now());
        khachHang.setTrangThaiVip("active");
        return khachHang;
    }
}
