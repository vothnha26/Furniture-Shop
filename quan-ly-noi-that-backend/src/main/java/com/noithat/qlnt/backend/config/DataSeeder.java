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
                                                           DonHangDichVuRepository donHangDichVuRepo,
                                                           DanhMucRepository danhMucRepo,
                                                           NhaCungCapRepository nhaCungCapRepo,
                                                           ThuocTinhRepository thuocTinhRepo,
                                                           GiaTriThuocTinhRepository giaTriRepo,
                                                           BienTheGiaTriThuocTinhRepository bienTheGiaTriRepo,
                                                           GiaoDichThanhToanRepository giaoDichRepo,
                                                           LichSuTonKhoRepository lichSuTonKhoRepo,
                                                           LichSuTrangThaiDonHangRepository lichSuTrangThaiRepo,
                                                           LichSuDiemThuongRepository lichSuDiemThuongRepo,
                                                           KiemKeKhoRepository kiemKeKhoRepo,
                                                           KiemKeChiTietRepository kiemKeChiTietRepo,
                                                           CanhBaoTonKhoRepository canhBaoTonKhoRepo,
                                                           HoaDonRepository hoaDonRepo,
                                                           NhanVienRepository nhanVienRepo,
                                                           ThongTinGiaoHangRepository thongTinGiaoHangRepo,
                                                           TrangThaiDonHangRepository trangThaiDonHangRepo) {
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

            BienTheSanPham bt1 = new BienTheSanPham();
            bt1.setSanPham(sp1);
            bt1.setSku("SF-BANG-XAM");
            bt1.setGiaBan(BigDecimal.valueOf(4500000));
            bt1.setSoLuongTon(50);
            bt1 = bienTheRepo.save(bt1);

            BienTheSanPham bt2 = new BienTheSanPham();
            bt2.setSanPham(sp1);
            bt2.setSku("SF-BANG-KEM");
            bt2.setGiaBan(BigDecimal.valueOf(4650000));
            bt2.setSoLuongTon(30);
            bt2 = bienTheRepo.save(bt2);

            SanPham sp2 = sanPhamRepo.save(new SanPham(null, "Bàn Trà Gỗ Sồi",
                    "Bàn trà nhỏ gọn, thiết kế tinh tế.", 40, 6, 8, 400, null, null, null));

            BienTheSanPham bt3 = new BienTheSanPham();
            bt3.setSanPham(sp2);
            bt3.setSku("BT-SOI-TRON");
            bt3.setGiaBan(BigDecimal.valueOf(1200000));
            bt3.setSoLuongTon(100);
            bt3 = bienTheRepo.save(bt3);

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

            // ================== NHÀ CUNG CẤP ==================
            NhaCungCap ncc1 = new NhaCungCap();
            ncc1.setTenNhaCungCap("Công ty Nội Thất A");
            nhaCungCapRepo.save(ncc1);

            NhaCungCap ncc2 = new NhaCungCap();
            ncc2.setTenNhaCungCap("Công ty Đồ Gỗ B");
            nhaCungCapRepo.save(ncc2);

            // ================== THUỘC TÍNH & GIÁ TRỊ ==================
            ThuocTinh color = thuocTinhRepo.save(new ThuocTinh(null, "Màu sắc"));
            ThuocTinh material = thuocTinhRepo.save(new ThuocTinh(null, "Chất liệu"));

            GiaTriThuocTinh gt1 = new GiaTriThuocTinh();
            gt1.setThuocTinh(color);
            gt1.setGiaTri("Xám");
            gt1 = giaTriRepo.save(gt1);

            GiaTriThuocTinh gt2 = new GiaTriThuocTinh();
            gt2.setThuocTinh(color);
            gt2.setGiaTri("Kem");
            gt2 = giaTriRepo.save(gt2);

            GiaTriThuocTinh gt3 = new GiaTriThuocTinh();
            gt3.setThuocTinh(material);
            gt3.setGiaTri("Gỗ sồi");
            gt3 = giaTriRepo.save(gt3);

            // Map attribute values to variants (BienThe)
            BienTheGiaTriThuocTinh bgt1 = new BienTheGiaTriThuocTinh();
            bgt1.setBienTheSanPham(bt1);
            bgt1.setGiaTriThuocTinh(gt1);
            bienTheGiaTriRepo.save(bgt1);

            BienTheGiaTriThuocTinh bgt2 = new BienTheGiaTriThuocTinh();
            bgt2.setBienTheSanPham(bt2);
            bgt2.setGiaTriThuocTinh(gt2);
            bienTheGiaTriRepo.save(bgt2);

            BienTheGiaTriThuocTinh bgt3 = new BienTheGiaTriThuocTinh();
            bgt3.setBienTheSanPham(bt3);
            bgt3.setGiaTriThuocTinh(gt3);
            bienTheGiaTriRepo.save(bgt3);

            // ================== GIAO DỊCH THANH TOÁN ==================
            GiaoDichThanhToan gd1 = new GiaoDichThanhToan();
            gd1.setDonHang(savedDonHang1);
            gd1.setSoTien(savedDonHang1.getThanhTien());
            gd1.setPhuongThuc("COD");
            gd1.setNgayGiaoDich(LocalDateTime.now().minusDays(1));
            // required non-null column
            gd1.setTrangThai("COMPLETED");
            giaoDichRepo.save(gd1);

            // ================== LỊCH SỬ TỒN KHO ==================
            LichSuTonKho ls1 = new LichSuTonKho();
            ls1.setBienTheSanPham(bt1);
            ls1.setSoLuongTruoc(bt1.getSoLuongTon());
            ls1.setSoLuongThayDoi(-1);
            ls1.setSoLuongSau(bt1.getSoLuongTon() - 1);
            ls1.setLyDo("Bán hàng");
            ls1.setLoaiGiaoDich("BAN_HANG");
            // reference order id as maThamChieu
            ls1.setMaThamChieu(savedDonHang1.getMaDonHang() != null ? savedDonHang1.getMaDonHang().toString() : null);
            ls1.setNguoiThucHien("system");
            ls1.setThoiGianThucHien(LocalDateTime.now().minusDays(1));
            lichSuTonKhoRepo.save(ls1);

            // ================== LỊCH SỬ TRANG THÁI ĐƠN HÀNG ==================
            LichSuTrangThaiDonHang lstd1 = new LichSuTrangThaiDonHang();
            lstd1.setDonHang(savedDonHang1);
            lstd1.setTrangThaiCu("Chờ lấy hàng");
            lstd1.setTrangThaiMoi("Hoàn thành");
            lstd1.setNguoiThayDoi("system");
            lstd1.setThoiGianThayDoi(LocalDateTime.now().minusHours(2));
            lichSuTrangThaiRepo.save(lstd1);

            // ================== LỊCH SỬ ĐIỂM THƯỞNG ==================
            LichSuDiemThuong lsd1 = new LichSuDiemThuong();
            lsd1.setKhachHang(k1);
            lsd1.setDiemThayDoi(50);
            lsd1.setLyDo("Mua hàng");
            lsd1.setNgayGhiNhan(LocalDateTime.now().minusDays(1));
            lichSuDiemThuongRepo.save(lsd1);

            // ================== KIỂM KÊ MẪU ==================
            KiemKeKho kk1 = new KiemKeKho();
            kk1.setTenKiemKe("Kiểm kê thử");
            kk1.setNguoiTao("system");
            kk1.setTrangThai(KiemKeKho.TrangThaiKiemKe.DANG_CHUAN_BI);
            kk1 = kiemKeKhoRepo.save(kk1);

            KiemKeChiTiet kct1 = new KiemKeChiTiet();
            kct1.setKiemKeKho(kk1);
            kct1.setBienTheSanPham(bt1);
            kct1.setSoLuongHeThong(bt1.getSoLuongTon()); // 🟢 BẮT BUỘC: Số lượng theo hệ thống
            kct1.setSoLuongThucTe(bt1.getSoLuongTon()); // Số lượng thực tế
            kiemKeChiTietRepo.save(kct1);

            // ================== BỔ SUNG DỮ LIỆU CHO CÁC BẢNG THIẾU ==================
            // Danh mục
            DanhMuc dm1 = new DanhMuc();
            dm1.setTenDanhMuc("Phòng Khách");
            dm1 = danhMucRepo.save(dm1);

            DanhMuc dm2 = new DanhMuc();
            dm2.setTenDanhMuc("Phòng Ăn");
            dm2 = danhMucRepo.save(dm2);

            // Gán danh mục cho sản phẩm nếu cần
            sp1.setDanhMuc(dm1);
            sp2.setDanhMuc(dm2);
            sanPhamRepo.save(sp1);
            sanPhamRepo.save(sp2);

            // Nhân viên mẫu (chỉ set tên & chức vụ vì entity chỉ có những trường đó)
            // Tạo tài khoản riêng cho nhân viên vì cột MaTaiKhoan không được NULL
            TaiKhoan nvAccount = taiKhoanRepo.save(new TaiKhoan(null, "nvquan", "password", "nv.quan@example.com", vaiTro));

            NhanVien nv1 = new NhanVien();
            nv1.setTaiKhoan(nvAccount);
            nv1.setHoTen("Nguyễn Văn Quản");
            nv1.setChucVu("Quản lý kho");
            nv1 = nhanVienRepo.save(nv1);

            // Thông tin giao hàng cho đơn hàng mẫu (savedDonHang1)
            ThongTinGiaoHang ttgh1 = new ThongTinGiaoHang();
            ttgh1.setDonHang(savedDonHang1);
            ttgh1.setDonViVanChuyen("Vận chuyển nhanh");
            ttgh1.setMaVanDon("VD-" + (savedDonHang1.getMaDonHang() != null ? savedDonHang1.getMaDonHang() : "000"));
            ttgh1.setPhiVanChuyen(BigDecimal.valueOf(150000));
            ttgh1.setTrangThaiGiaoHang("Đã giao");
            thongTinGiaoHangRepo.save(ttgh1);

            // Hóa đơn mẫu liên kết với đơn hàng
            HoaDon hoaDon1 = new HoaDon();
            hoaDon1.setDonHang(savedDonHang1);
            hoaDon1.setSoHoaDon("HD-" + (savedDonHang1.getMaDonHang() != null ? savedDonHang1.getMaDonHang() : "000"));
            hoaDon1.setNgayXuat(LocalDateTime.now().minusDays(1));
            hoaDon1.setNhanVienXuat(nv1);
            hoaDon1.setTongTienThanhToan(savedDonHang1.getThanhTien());
            hoaDonRepo.save(hoaDon1);

            // Cảnh báo tồn kho mẫu
            CanhBaoTonKho cb1 = new CanhBaoTonKho();
            cb1.setBienTheSanPham(bt3);
            cb1.setMucCanhBao(10);
            cb1.setGhiChu("Tồn kho thấp, cần đặt thêm");
            canhBaoTonKhoRepo.save(cb1);

            // Trạng thái đơn hàng (bổ sung dữ liệu tham khảo)
            TrangThaiDonHang ts1 = new TrangThaiDonHang();
            ts1.setTenTrangThai("Chờ xử lý");
            trangThaiDonHangRepo.save(ts1);

            TrangThaiDonHang ts2 = new TrangThaiDonHang();
            ts2.setTenTrangThai("Đang giao");
            trangThaiDonHangRepo.save(ts2);

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
