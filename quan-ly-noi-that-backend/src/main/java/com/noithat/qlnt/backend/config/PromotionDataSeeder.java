package com.noithat.qlnt.backend.config;

import com.noithat.qlnt.backend.dto.*;
import com.noithat.qlnt.backend.service.ChuongTrinhGiamGiaService;
import com.noithat.qlnt.backend.service.VoucherService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Seed dữ liệu mẫu cho hệ thống khuyến mãi (chỉ chạy ở môi trường dev)
 */
@Configuration
@Profile("dev") // Chỉ chạy khi profile là "dev"
public class PromotionDataSeeder {

    /**
     * Uncomment @Bean để chạy seeder này khi khởi động ứng dụng
     */
    // @Bean
    public CommandLineRunner seedPromotionData(
            ChuongTrinhGiamGiaService chuongTrinhService,
            VoucherService voucherService) {
        
        return args -> {
            System.out.println("🎯 Bắt đầu seed dữ liệu khuyến mãi...");

            try {
                // 1. Tạo chương trình giảm giá
                seedChuongTrinhGiamGia(chuongTrinhService);

                // 2. Tạo voucher
                seedVoucher(voucherService);

                System.out.println("✅ Seed dữ liệu khuyến mãi thành công!");
            } catch (Exception e) {
                System.err.println("❌ Lỗi khi seed dữ liệu: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    private void seedChuongTrinhGiamGia(ChuongTrinhGiamGiaService service) {
        System.out.println("📦 Tạo chương trình giảm giá...");

        // Chương trình 1: Flash Sale
        ChuongTrinhGiamGiaDetailRequest flashSale = new ChuongTrinhGiamGiaDetailRequest();
        flashSale.setTenChuongTrinh("Flash Sale Cuối Tuần");
        flashSale.setNgayBatDau(LocalDateTime.now().minusDays(1));
        flashSale.setNgayKetThuc(LocalDateTime.now().plusDays(2));
        
        // Giả sử có biến thể ID 1, 2, 3 trong database
        BienTheGiamGiaRequest bt1 = new BienTheGiamGiaRequest();
        bt1.setMaBienThe(1);
        bt1.setGiaSauGiam(new BigDecimal("4500000"));

        BienTheGiamGiaRequest bt2 = new BienTheGiamGiaRequest();
        bt2.setMaBienThe(2);
        bt2.setGiaSauGiam(new BigDecimal("3200000"));

        flashSale.setDanhSachBienThe(Arrays.asList(bt1, bt2));

        try {
            service.createWithDetails(flashSale);
            System.out.println("  ✓ Tạo Flash Sale thành công");
        } catch (Exception e) {
            System.err.println("  ✗ Lỗi tạo Flash Sale: " + e.getMessage());
        }

        // Chương trình 2: Khuyến mãi Tết
        ChuongTrinhGiamGiaDetailRequest khuyenMaiTet = new ChuongTrinhGiamGiaDetailRequest();
        khuyenMaiTet.setTenChuongTrinh("Khuyến Mãi Tết 2025");
        khuyenMaiTet.setNgayBatDau(LocalDateTime.of(2025, 1, 15, 0, 0));
        khuyenMaiTet.setNgayKetThuc(LocalDateTime.of(2025, 2, 15, 23, 59));

        BienTheGiamGiaRequest bt3 = new BienTheGiamGiaRequest();
        bt3.setMaBienThe(1);
        bt3.setGiaSauGiam(new BigDecimal("4200000"));

        khuyenMaiTet.setDanhSachBienThe(Arrays.asList(bt3));

        try {
            service.createWithDetails(khuyenMaiTet);
            System.out.println("  ✓ Tạo Khuyến Mãi Tết thành công");
        } catch (Exception e) {
            System.err.println("  ✗ Lỗi tạo Khuyến Mãi Tết: " + e.getMessage());
        }
    }

    private void seedVoucher(VoucherService service) {
        System.out.println("🎟️  Tạo voucher...");

        // Voucher 1: Giảm phần trăm cho mọi người
        VoucherCreationRequest voucher1 = new VoucherCreationRequest();
        voucher1.setMaCode("TETALE2025");
        voucher1.setLoaiGiamGia("PERCENT");
        voucher1.setGiaTriGiam(new BigDecimal("15"));
        voucher1.setNgayBatDau(LocalDateTime.of(2025, 1, 15, 0, 0));
        voucher1.setNgayKetThuc(LocalDateTime.of(2025, 2, 15, 23, 59));
        voucher1.setApDungChoMoiNguoi(true);

        try {
            service.createVoucher(voucher1);
            System.out.println("  ✓ Tạo voucher TETALE2025 thành công");
        } catch (Exception e) {
            System.err.println("  ✗ Lỗi tạo voucher TETALE2025: " + e.getMessage());
        }

        // Voucher 2: Giảm cố định cho mọi người
        VoucherCreationRequest voucher2 = new VoucherCreationRequest();
        voucher2.setMaCode("FREESHIP100K");
        voucher2.setLoaiGiamGia("FIXED");
        voucher2.setGiaTriGiam(new BigDecimal("100000"));
        voucher2.setNgayBatDau(LocalDateTime.now().minusDays(1));
        voucher2.setNgayKetThuc(LocalDateTime.now().plusMonths(1));
        voucher2.setApDungChoMoiNguoi(true);

        try {
            service.createVoucher(voucher2);
            System.out.println("  ✓ Tạo voucher FREESHIP100K thành công");
        } catch (Exception e) {
            System.err.println("  ✗ Lỗi tạo voucher FREESHIP100K: " + e.getMessage());
        }

        // Voucher 3: Giảm cho hạng VIP (giả sử hạng thành viên ID 2, 3)
        VoucherCreationRequest voucher3 = new VoucherCreationRequest();
        voucher3.setMaCode("VIP2025");
        voucher3.setLoaiGiamGia("FIXED");
        voucher3.setGiaTriGiam(new BigDecimal("500000"));
        voucher3.setNgayBatDau(LocalDateTime.of(2025, 1, 1, 0, 0));
        voucher3.setNgayKetThuc(LocalDateTime.of(2025, 12, 31, 23, 59));
        voucher3.setApDungChoMoiNguoi(false);
        voucher3.setMaHangThanhVienIds(Arrays.asList(2, 3)); // ID hạng Vàng, Kim Cương

        try {
            service.createVoucher(voucher3);
            System.out.println("  ✓ Tạo voucher VIP2025 thành công");
        } catch (Exception e) {
            System.err.println("  ✗ Lỗi tạo voucher VIP2025: " + e.getMessage());
        }
    }
}
