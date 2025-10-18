package com.noithat.qlnt.backend.config;

import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * DataSeeder để khởi tạo dữ liệu mẫu cho hệ thống quản lý nội thất
 */
@Configuration
public class DataSeeder {

    @Bean
    @Transactional
    CommandLineRunner initDatabase(
            NhaCungCapRepository nhaCungCapRepository,
            DanhMucRepository danhMucRepository,
            BoSuuTapRepository boSuuTapRepository,
            HangThanhVienRepository hangThanhVienRepository,
            VoucherRepository voucherRepository,
            SanPhamRepository sanPhamRepository,
            BienTheSanPhamRepository bienTheSanPhamRepository,
            ThuocTinhRepository thuocTinhRepository,
            BienTheThuocTinhRepository bienTheThuocTinhRepository,
            KhachHangRepository khachHangRepository,
            DonHangRepository donHangRepository,
            com.noithat.qlnt.backend.repository.ChiTietDonHangRepository chiTietDonHangRepository,
            VaiTroRepository vaiTroRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.noithat.qlnt.backend.repository.TaiKhoanRepository taiKhoanRepository
    ) {
        return args -> {
            // If roles already exist, don't re-seed everything but ensure demo accounts exist.
            if (vaiTroRepository.count() > 0) {
                System.out.println("=== Data already seeded, ensuring demo accounts exist... ===");
                try {
                    var maybeAdminRole = vaiTroRepository.findByTenVaiTro("ADMIN");
                    var maybeManagerRole = vaiTroRepository.findByTenVaiTro("MANAGER");
                    var maybeStaffRole = vaiTroRepository.findByTenVaiTro("STAFF");

                    // Acquire PasswordEncoder and TaiKhoanRepository from context via method parameters
                    // (they are available as parameters to this bean)
                    // Note: method parameters are in scope here: passwordEncoder, taiKhoanRepository
                    if (taiKhoanRepository.findByTenDangNhap("admin").isEmpty()) {
                        com.noithat.qlnt.backend.entity.TaiKhoan admin = new com.noithat.qlnt.backend.entity.TaiKhoan();
                        admin.setTenDangNhap("admin");
                        admin.setEmail("admin@example.com");
                        admin.setMatKhauHash(passwordEncoder.encode("admin123"));
                        admin.setEnabled(true);
                        admin.setVaiTro(maybeAdminRole.orElse(null));
                        taiKhoanRepository.save(admin);
                        System.out.println("✓ Ensured demo admin: admin / admin123");
                    }

                    if (taiKhoanRepository.findByTenDangNhap("manager").isEmpty()) {
                        com.noithat.qlnt.backend.entity.TaiKhoan mgr = new com.noithat.qlnt.backend.entity.TaiKhoan();
                        mgr.setTenDangNhap("manager");
                        mgr.setEmail("manager@example.com");
                        mgr.setMatKhauHash(passwordEncoder.encode("manager123"));
                        mgr.setEnabled(true);
                        mgr.setVaiTro(maybeManagerRole.orElse(null));
                        taiKhoanRepository.save(mgr);
                        System.out.println("✓ Ensured demo manager: manager / manager123");
                    }

                    if (taiKhoanRepository.findByTenDangNhap("staff").isEmpty()) {
                        com.noithat.qlnt.backend.entity.TaiKhoan staff = new com.noithat.qlnt.backend.entity.TaiKhoan();
                        staff.setTenDangNhap("staff");
                        staff.setEmail("staff@example.com");
                        staff.setMatKhauHash(passwordEncoder.encode("staff123"));
                        staff.setEnabled(true);
                        staff.setVaiTro(maybeStaffRole.orElse(null));
                        taiKhoanRepository.save(staff);
                        System.out.println("✓ Ensured demo staff: staff / staff123");
                    }
                        // Ensure demo USER with KhachHang and orders (idempotent)
                        try {
                            var maybeUserRole = vaiTroRepository.findByTenVaiTro("USER");
                            var maybeUserTk = taiKhoanRepository.findByTenDangNhap("demo_user");
                            com.noithat.qlnt.backend.entity.TaiKhoan user;
                            if (maybeUserTk.isPresent()) {
                                user = maybeUserTk.get();
                                System.out.println("✓ demo_user account already exists");
                            } else {
                                user = new com.noithat.qlnt.backend.entity.TaiKhoan();
                                user.setTenDangNhap("demo_user");
                                user.setEmail("demo.user@example.com");
                                user.setMatKhauHash(passwordEncoder.encode("user123"));
                                user.setEnabled(true);
                                user.setVaiTro(maybeUserRole.orElse(null));
                                user = taiKhoanRepository.save(user);
                                System.out.println("✓ Created demo_user account: demo_user / user123");
                            }

                            // Ensure KhachHang for this account exists
                            var maybeKh = khachHangRepository.findByTaiKhoan_TenDangNhap(user.getTenDangNhap());
                            if (maybeKh == null || maybeKh.isEmpty()) {
                                com.noithat.qlnt.backend.entity.KhachHang kh = new com.noithat.qlnt.backend.entity.KhachHang();
                                kh.setTaiKhoan(user);
                                kh.setHoTen("Nguyen Demo");
                                kh.setEmail(user.getEmail());
                                kh.setSoDienThoai("0909009000");
                                kh.setDiemThuong(0);
                                kh.setTongChiTieu(java.math.BigDecimal.ZERO);
                                kh.setTongDonHang(0);
                                kh.setNgayThamGia(java.time.LocalDate.now());
                                var htv = hangThanhVienRepository.findByTenHang("Đồng").orElse(null);
                                kh.setHangThanhVien(htv);
                                kh = khachHangRepository.save(kh);

                                // create two simple DonHang
                                com.noithat.qlnt.backend.entity.DonHang dh1 = new com.noithat.qlnt.backend.entity.DonHang();
                                dh1.setKhachHang(kh);
                                dh1.setTrangThaiDonHang("CHO_XAC_NHAN");
                                dh1.setNgayDatHang(java.time.LocalDateTime.now().minusDays(5));
                                dh1.setThanhTien(java.math.BigDecimal.valueOf(1500000));
                                dh1.setPhuongThucThanhToan("cash");
                                dh1.setTenNguoiNhan(kh.getHoTen());
                                dh1.setSoDienThoaiNhan(kh.getSoDienThoai());
                                dh1.setDiaChiGiaoHang(kh.getDiaChi() != null ? kh.getDiaChi() : "123 Đường Demo, Quận Demo");
                                dh1.setPhiGiaoHang(java.math.BigDecimal.ZERO);
                                dh1.setTongTienGoc(java.math.BigDecimal.valueOf(1500000));
                                dh1.setGiamGiaVip(java.math.BigDecimal.ZERO);
                                dh1.setGiamGiaVoucher(java.math.BigDecimal.ZERO);
                                dh1.setGiamGiaDiemThuong(java.math.BigDecimal.ZERO);
                                dh1 = donHangRepository.save(dh1);

                                // create one line-item if a product variant exists
                                try {
                                    var maybeVariant = bienTheSanPhamRepository.findAll().stream().findFirst();
                                    if (maybeVariant.isPresent()) {
                                        var variant = maybeVariant.get();
                                        com.noithat.qlnt.backend.entity.ChiTietDonHang ct1 = com.noithat.qlnt.backend.entity.ChiTietDonHang.create(
                                                dh1, variant, 1, variant.getGiaBan(), variant.getGiaBan());
                                        chiTietDonHangRepository.save(ct1);
                                    }
                                } catch (Exception ignore) {}

                                com.noithat.qlnt.backend.entity.DonHang dh2 = new com.noithat.qlnt.backend.entity.DonHang();
                                dh2.setKhachHang(kh);
                                dh2.setTrangThaiDonHang("DANG_CHUAN_BI");
                                dh2.setNgayDatHang(java.time.LocalDateTime.now().minusDays(1));
                                dh2.setThanhTien(java.math.BigDecimal.valueOf(750000));
                                dh2.setPhuongThucThanhToan("cash");
                                dh2.setTenNguoiNhan(kh.getHoTen());
                                dh2.setSoDienThoaiNhan(kh.getSoDienThoai());
                                dh2.setDiaChiGiaoHang(kh.getDiaChi() != null ? kh.getDiaChi() : "123 Đường Demo, Quận Demo");
                                dh2.setPhiGiaoHang(java.math.BigDecimal.ZERO);
                                dh2.setTongTienGoc(java.math.BigDecimal.valueOf(750000));
                                dh2.setGiamGiaVip(java.math.BigDecimal.ZERO);
                                dh2.setGiamGiaVoucher(java.math.BigDecimal.ZERO);
                                dh2.setGiamGiaDiemThuong(java.math.BigDecimal.ZERO);
                                dh2 = donHangRepository.save(dh2);

                                try {
                                    var maybeVariant2 = bienTheSanPhamRepository.findAll().stream().findFirst();
                                    if (maybeVariant2.isPresent()) {
                                        var variant2 = maybeVariant2.get();
                                        com.noithat.qlnt.backend.entity.ChiTietDonHang ct2 = com.noithat.qlnt.backend.entity.ChiTietDonHang.create(
                                                dh2, variant2, 1, variant2.getGiaBan(), variant2.getGiaBan());
                                        chiTietDonHangRepository.save(ct2);
                                    }
                                } catch (Exception ignore) {}

                                System.out.println("✓ Created KhachHang and 2 orders for demo_user");
                            } else {
                                System.out.println("✓ KhachHang already exists for demo_user");
                            }
                        } catch (Exception e) {
                            System.out.println("Failed to ensure demo user/khachhang: " + e.getMessage());
                        }
                } catch (Exception e) {
                    System.out.println("Failed to ensure demo accounts: " + e.getMessage());
                }
                // Roles already existed; we don't need to seed rest of data.
                return;
            }

            System.out.println("=== Starting Data Seeding ===");

            // 0. Seed Vai Trò (Roles)
            System.out.println("Seeding Vai Trò...");
            VaiTro adminRole = new VaiTro();
            adminRole.setTenVaiTro("ADMIN");

            VaiTro managerRole = new VaiTro();
            managerRole.setTenVaiTro("MANAGER");

            VaiTro staffRole = new VaiTro();
            staffRole.setTenVaiTro("STAFF");

            VaiTro userRole = new VaiTro();
            userRole.setTenVaiTro("USER");

            List<VaiTro> roles = vaiTroRepository.saveAll(Arrays.asList(adminRole, managerRole, staffRole, userRole));
            System.out.println("✓ Created " + roles.size() + " roles");

            // 1. Seed Nhà Cung Cấp (Suppliers)
            System.out.println("Seeding Nhà Cung Cấp...");
            NhaCungCap ncc1 = new NhaCungCap();
            ncc1.setTenNhaCungCap("Nội Thất Hòa Phát");

            NhaCungCap ncc2 = new NhaCungCap();
            ncc2.setTenNhaCungCap("Nội Thất Thành Đạt");

            NhaCungCap ncc3 = new NhaCungCap();
            ncc3.setTenNhaCungCap("An Cường Wood");

            List<NhaCungCap> suppliers = nhaCungCapRepository.saveAll(Arrays.asList(ncc1, ncc2, ncc3));
            System.out.println("✓ Created " + suppliers.size() + " suppliers");

            // 2. Seed Danh Mục (Categories)
            System.out.println("Seeding Danh Mục...");
            DanhMuc dm1 = new DanhMuc();
            dm1.setTenDanhMuc("Bàn");

            DanhMuc dm2 = new DanhMuc();
            dm2.setTenDanhMuc("Ghế");

            DanhMuc dm3 = new DanhMuc();
            dm3.setTenDanhMuc("Tủ");

            DanhMuc dm4 = new DanhMuc();
            dm4.setTenDanhMuc("Giường");

            DanhMuc dm5 = new DanhMuc();
            dm5.setTenDanhMuc("Sofa");

            List<DanhMuc> categories = danhMucRepository.saveAll(Arrays.asList(dm1, dm2, dm3, dm4, dm5));
            System.out.println("✓ Created " + categories.size() + " categories");

            // 3. Seed Bộ Sưu Tập (Collections)
            System.out.println("Seeding Bộ Sưu Tập...");
            BoSuuTap bst1 = new BoSuuTap();
            bst1.setTenBoSuuTap("Bộ sưu tập Hiện Đại");
            bst1.setMoTa("Các sản phẩm nội thất phong cách hiện đại, tối giản");

            BoSuuTap bst2 = new BoSuuTap();
            bst2.setTenBoSuuTap("Bộ sưu tập Cổ Điển");
            bst2.setMoTa("Nội thất sang trọng phong cách cổ điển châu Âu");

            BoSuuTap bst3 = new BoSuuTap();
            bst3.setTenBoSuuTap("Bộ sưu tập Văn Phòng");
            bst3.setMoTa("Nội thất văn phòng chuyên nghiệp");

            List<BoSuuTap> collections = boSuuTapRepository.saveAll(Arrays.asList(bst1, bst2, bst3));
            System.out.println("✓ Created " + collections.size() + " collections");

            // 4. Seed Hạng Thành Viên (Member Tiers)
            System.out.println("Seeding Hạng Thành Viên...");
            HangThanhVien htv1 = new HangThanhVien();
            htv1.setTenHang("Đồng");
            htv1.setDiemToiThieu(0);
            htv1.setMoTa("Hạng thành viên cơ bản");
            htv1.setMauSac("#CD7F32");
            htv1.setTrangThai(true);
            htv1.setIcon("bronze");

            HangThanhVien htv2 = new HangThanhVien();
            htv2.setTenHang("Bạc");
            htv2.setDiemToiThieu(1000);
            htv2.setMoTa("Hạng thành viên bạc - Giảm 5%");
            htv2.setMauSac("#C0C0C0");
            htv2.setTrangThai(true);
            htv2.setIcon("silver");

            HangThanhVien htv3 = new HangThanhVien();
            htv3.setTenHang("Vàng");
            htv3.setDiemToiThieu(5000);
            htv3.setMoTa("Hạng thành viên vàng - Giảm 10%");
            htv3.setMauSac("#FFD700");
            htv3.setTrangThai(true);
            htv3.setIcon("gold");

            HangThanhVien htv4 = new HangThanhVien();
            htv4.setTenHang("Kim Cương");
            htv4.setDiemToiThieu(10000);
            htv4.setMoTa("Hạng thành viên kim cương - Giảm 15%");
            htv4.setMauSac("#B9F2FF");
            htv4.setTrangThai(true);
            htv4.setIcon("diamond");

            List<HangThanhVien> tiers = hangThanhVienRepository.saveAll(Arrays.asList(htv1, htv2, htv3, htv4));
            System.out.println("✓ Created " + tiers.size() + " member tiers");

            // 5. Seed Vouchers
            System.out.println("Seeding Vouchers...");
            Voucher v1 = new Voucher();
            v1.setMaCode("NEWUSER10");
            v1.setTenVoucher("Giảm giá cho khách hàng mới");
            v1.setMoTa("Giảm 10% cho đơn hàng đầu tiên");
            v1.setLoaiGiamGia("PERCENTAGE");
            v1.setGiaTriGiam(new BigDecimal("10"));
            v1.setGiaTriDonHangToiThieu(new BigDecimal("500000"));
            v1.setGiaTriGiamToiDa(new BigDecimal("100000"));
            v1.setNgayBatDau(LocalDateTime.now());
            v1.setNgayKetThuc(LocalDateTime.now().plusMonths(3));
            v1.setSoLuongToiDa(100);
            v1.setSoLuongDaSuDung(0);
            v1.setTrangThai("DANG_HOAT_DONG");
            v1.setApDungChoMoiNguoi(true);

            Voucher v2 = new Voucher();
            v2.setMaCode("VIP50K");
            v2.setTenVoucher("Giảm 50K cho hạng Vàng");
            v2.setMoTa("Giảm 50.000đ cho khách hàng hạng Vàng trở lên");
            v2.setLoaiGiamGia("FIXED");
            v2.setGiaTriGiam(new BigDecimal("50000"));
            v2.setGiaTriDonHangToiThieu(new BigDecimal("1000000"));
            v2.setNgayBatDau(LocalDateTime.now());
            v2.setNgayKetThuc(LocalDateTime.now().plusMonths(1));
            v2.setSoLuongToiDa(50);
            v2.setSoLuongDaSuDung(0);
            v2.setTrangThai("DANG_HOAT_DONG");
            v2.setApDungChoMoiNguoi(false);

            Voucher v3 = new Voucher();
            v3.setMaCode("SUMMER20");
            v3.setTenVoucher("Khuyến mãi mùa hè");
            v3.setMoTa("Giảm 20% cho tất cả sản phẩm");
            v3.setLoaiGiamGia("PERCENTAGE");
            v3.setGiaTriGiam(new BigDecimal("20"));
            v3.setGiaTriDonHangToiThieu(new BigDecimal("2000000"));
            v3.setGiaTriGiamToiDa(new BigDecimal("500000"));
            v3.setNgayBatDau(LocalDateTime.now());
            v3.setNgayKetThuc(LocalDateTime.now().plusMonths(2));
            v3.setSoLuongToiDa(200);
            v3.setSoLuongDaSuDung(0);
            v3.setTrangThai("DANG_HOAT_DONG");
            v3.setApDungChoMoiNguoi(true);

            List<Voucher> vouchers = voucherRepository.saveAll(Arrays.asList(v1, v2, v3));
            System.out.println("✓ Created " + vouchers.size() + " vouchers");

            // 6a. Seed demo admin/manager/staff accounts if missing
            System.out.println("Seeding demo accounts (admin/manager/staff) if missing...");
            try {
                var maybeAdminRole = vaiTroRepository.findByTenVaiTro("ADMIN");
                var maybeManagerRole = vaiTroRepository.findByTenVaiTro("MANAGER");
                var maybeStaffRole = vaiTroRepository.findByTenVaiTro("STAFF");

                if (taiKhoanRepository.findByTenDangNhap("admin").isEmpty()) {
                    com.noithat.qlnt.backend.entity.TaiKhoan admin = new com.noithat.qlnt.backend.entity.TaiKhoan();
                    admin.setTenDangNhap("admin");
                    admin.setEmail("admin@example.com");
                    admin.setMatKhauHash(passwordEncoder.encode("admin123"));
                    admin.setEnabled(true);
                    admin.setVaiTro(maybeAdminRole.orElse(null));
                    taiKhoanRepository.save(admin);
                    System.out.println("✓ Created demo admin: admin / admin123");
                }

                if (taiKhoanRepository.findByTenDangNhap("manager").isEmpty()) {
                    com.noithat.qlnt.backend.entity.TaiKhoan mgr = new com.noithat.qlnt.backend.entity.TaiKhoan();
                    mgr.setTenDangNhap("manager");
                    mgr.setEmail("manager@example.com");
                    mgr.setMatKhauHash(passwordEncoder.encode("manager123"));
                    mgr.setEnabled(true);
                    mgr.setVaiTro(maybeManagerRole.orElse(null));
                    taiKhoanRepository.save(mgr);
                    System.out.println("✓ Created demo manager: manager / manager123");
                }

                if (taiKhoanRepository.findByTenDangNhap("staff").isEmpty()) {
                    com.noithat.qlnt.backend.entity.TaiKhoan staff = new com.noithat.qlnt.backend.entity.TaiKhoan();
                    staff.setTenDangNhap("staff");
                    staff.setEmail("staff@example.com");
                    staff.setMatKhauHash(passwordEncoder.encode("staff123"));
                    staff.setEnabled(true);
                    staff.setVaiTro(maybeStaffRole.orElse(null));
                    taiKhoanRepository.save(staff);
                    System.out.println("✓ Created demo staff: staff / staff123");
                }
            } catch (Exception e) {
                System.out.println("Failed to seed demo accounts: " + e.getMessage());
            }

            // 6. Seed Sản Phẩm (Products)
            System.out.println("Seeding Sản Phẩm...");
            
            // Sản phẩm 1: Bàn làm việc
            SanPham sp1 = new SanPham();
            sp1.setTenSanPham("Bàn làm việc hiện đại");
            sp1.setMoTa("Bàn làm việc gỗ công nghiệp cao cấp, thiết kế hiện đại");
            sp1.setNhaCungCap(ncc1);
            sp1.setDanhMuc(dm1);
            sp1.setBoSuuTap(bst1);
            sp1.setDiemThuong(50);

            // Sản phẩm 2: Ghế văn phòng
            SanPham sp2 = new SanPham();
            sp2.setTenSanPham("Ghế văn phòng ergonomic");
            sp2.setMoTa("Ghế văn phòng có tựa lưng, điều chỉnh độ cao");
            sp2.setNhaCungCap(ncc2);
            sp2.setDanhMuc(dm2);
            sp2.setBoSuuTap(bst3);
            sp2.setDiemThuong(30);

            // Sản phẩm 3: Tủ quần áo
            SanPham sp3 = new SanPham();
            sp3.setTenSanPham("Tủ quần áo 2 cánh");
            sp3.setMoTa("Tủ quần áo gỗ tự nhiên, 2 cánh mở");
            sp3.setNhaCungCap(ncc3);
            sp3.setDanhMuc(dm3);
            sp3.setBoSuuTap(bst2);
            sp3.setDiemThuong(100);

            // Sản phẩm 4: Giường ngủ
            SanPham sp4 = new SanPham();
            sp4.setTenSanPham("Giường ngủ 1m6");
            sp4.setMoTa("Giường ngủ gỗ sồi tự nhiên, kích thước 1m6");
            sp4.setNhaCungCap(ncc1);
            sp4.setDanhMuc(dm4);
            sp4.setBoSuuTap(bst2);
            sp4.setDiemThuong(150);

            // Sản phẩm 5: Sofa
            SanPham sp5 = new SanPham();
            sp5.setTenSanPham("Sofa 3 chỗ ngồi");
            sp5.setMoTa("Sofa bọc da cao cấp, thiết kế sang trọng");
            sp5.setNhaCungCap(ncc2);
            sp5.setDanhMuc(dm5);
            sp5.setBoSuuTap(bst1);
            sp5.setDiemThuong(200);

            List<SanPham> products = sanPhamRepository.saveAll(Arrays.asList(sp1, sp2, sp3, sp4, sp5));
            System.out.println("✓ Created " + products.size() + " products");

            // 7. Seed Thuộc Tính (Attributes)
            System.out.println("Seeding Thuộc Tính...");
            ThuocTinh tt1 = new ThuocTinh();
            tt1.setTenThuocTinh("Màu sắc");

            ThuocTinh tt2 = new ThuocTinh();
            tt2.setTenThuocTinh("Kích thước");

            ThuocTinh tt3 = new ThuocTinh();
            tt3.setTenThuocTinh("Chất liệu");

            List<ThuocTinh> attributes = thuocTinhRepository.saveAll(Arrays.asList(tt1, tt2, tt3));
            System.out.println("✓ Created " + attributes.size() + " attributes");

            // 8. Seed Biến Thể Sản Phẩm (Product Variants)
            System.out.println("Seeding Biến Thể Sản Phẩm...");
            
            // Biến thể cho Bàn làm việc
            BienTheSanPham bt1 = createVariant(sp1, "BTB-001", new BigDecimal("2500000"), new BigDecimal("3000000"), 50);
            BienTheSanPham bt2 = createVariant(sp1, "BTB-002", new BigDecimal("2300000"), new BigDecimal("2800000"), 30);

            // Biến thể cho Ghế văn phòng
            BienTheSanPham bt3 = createVariant(sp2, "GVP-001", new BigDecimal("1200000"), new BigDecimal("1500000"), 100);
            BienTheSanPham bt4 = createVariant(sp2, "GVP-002", new BigDecimal("1000000"), new BigDecimal("1300000"), 80);

            // Biến thể cho Tủ quần áo
            BienTheSanPham bt5 = createVariant(sp3, "TQA-001", new BigDecimal("4000000"), new BigDecimal("5000000"), 20);

            // Biến thể cho Giường ngủ
            BienTheSanPham bt6 = createVariant(sp4, "GN-001", new BigDecimal("6000000"), new BigDecimal("7500000"), 15);

            // Biến thể cho Sofa
            BienTheSanPham bt7 = createVariant(sp5, "SF-001", new BigDecimal("8000000"), new BigDecimal("10000000"), 10);

            List<BienTheSanPham> variants = bienTheSanPhamRepository.saveAll(
                    Arrays.asList(bt1, bt2, bt3, bt4, bt5, bt6, bt7)
            );
            System.out.println("✓ Created " + variants.size() + " product variants");

            // 9. Seed Thuộc Tính của Biến Thể
            System.out.println("Seeding Thuộc Tính Biến Thể...");
            
            // Thuộc tính cho biến thể 1
            createVariantAttribute(bt1, tt1, "Nâu gỗ");
            createVariantAttribute(bt1, tt2, "120x60cm");
            createVariantAttribute(bt1, tt3, "Gỗ công nghiệp");

            // Thuộc tính cho biến thể 2
            createVariantAttribute(bt2, tt1, "Trắng");
            createVariantAttribute(bt2, tt2, "100x60cm");
            createVariantAttribute(bt2, tt3, "Gỗ công nghiệp");

            // Thuộc tính cho biến thể 3
            createVariantAttribute(bt3, tt1, "Đen");
            createVariantAttribute(bt3, tt2, "45x45cm");
            createVariantAttribute(bt3, tt3, "Da PU cao cấp");

            // Thuộc tính cho biến thể 4
            createVariantAttribute(bt4, tt1, "Xám");
            createVariantAttribute(bt4, tt2, "45x45cm");
            createVariantAttribute(bt4, tt3, "Vải lưới");

            // Thuộc tính cho biến thể 5
            createVariantAttribute(bt5, tt1, "Gỗ tự nhiên");
            createVariantAttribute(bt5, tt2, "180x80x200cm");
            createVariantAttribute(bt5, tt3, "Gỗ tự nhiên");

            // Thuộc tính cho biến thể 6
            createVariantAttribute(bt6, tt1, "Nâu vân gỗ");
            createVariantAttribute(bt6, tt2, "160x200cm");
            createVariantAttribute(bt6, tt3, "Gỗ sồi tự nhiên");

            // Thuộc tính cho biến thể 7
            createVariantAttribute(bt7, tt1, "Xám nhạt");
            createVariantAttribute(bt7, tt2, "200x90x85cm");
            createVariantAttribute(bt7, tt3, "Da thật");

            bienTheThuocTinhRepository.flush();
            System.out.println("✓ Created variant attributes");

            System.out.println("=== Data Seeding Completed Successfully ===");
        };
    }

    private BienTheSanPham createVariant(SanPham sanPham, String sku, BigDecimal giaMua, BigDecimal giaBan, Integer soLuongTon) {
        BienTheSanPham variant = new BienTheSanPham();
        variant.setSanPham(sanPham);
        variant.setSku(sku);
        variant.setGiaMua(giaMua);
        variant.setGiaBan(giaBan);
        variant.setSoLuongTon(soLuongTon);
        variant.setMucTonToiThieu(5);
        variant.setTrangThaiKho("ACTIVE");
        variant.setNgayCapNhatKho(LocalDateTime.now());
        return variant;
    }

    private BienTheThuocTinh createVariantAttribute(BienTheSanPham bienThe, ThuocTinh thuocTinh, String giaTri) {
        BienTheThuocTinh btt = new BienTheThuocTinh();
        btt.setBienTheSanPham(bienThe);
        btt.setThuocTinh(thuocTinh);
        btt.setGiaTri(giaTri);
        return btt;
    }
}
