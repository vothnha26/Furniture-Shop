package com.noithat.qlnt.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Check if data already exists
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM danh_muc", Integer.class);
            if (count != null && count > 0) {
                System.out.println("Sample data already exists, skipping initialization.");
                return;
            }

            System.out.println("Loading sample data...");
            
            // Insert sample categories (chỉ có ten_danh_muc theo entity)
            jdbcTemplate.update("INSERT INTO danh_muc (ten_danh_muc) VALUES (?)", "Sofa");
            jdbcTemplate.update("INSERT INTO danh_muc (ten_danh_muc) VALUES (?)", "Ban");
            jdbcTemplate.update("INSERT INTO danh_muc (ten_danh_muc) VALUES (?)", "Tu");
            jdbcTemplate.update("INSERT INTO danh_muc (ten_danh_muc) VALUES (?)", "Giuong");
            jdbcTemplate.update("INSERT INTO danh_muc (ten_danh_muc) VALUES (?)", "Den");

            // Insert sample products (chỉ cần tên sản phẩm và mô tả, danh mục)
            jdbcTemplate.update("INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc) VALUES (?, ?, ?)", 
                "Sofa 3 chỗ ngồi", "Ghế sofa 3 chỗ ngồi cao cấp", 1);
            jdbcTemplate.update("INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc) VALUES (?, ?, ?)", 
                "Bàn làm việc gỗ", "Bàn làm việc gỗ tự nhiên", 2);
            jdbcTemplate.update("INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc) VALUES (?, ?, ?)", 
                "Tủ quần áo 4 cánh", "Tủ quần áo 4 cánh có gương", 3);
            jdbcTemplate.update("INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc) VALUES (?, ?, ?)", 
                "Giường đôi 1m8", "Giường đôi kích thước 1.8m x 2m", 4);
            jdbcTemplate.update("INSERT INTO san_pham (ten_san_pham, mo_ta, ma_danh_muc) VALUES (?, ?, ?)", 
                "Đèn chùm pha lê", "Đèn chùm pha lê trang trí phòng khách", 5);

            // Insert sample product variants (theo cấu trúc BienTheSanPham)
            jdbcTemplate.update("INSERT INTO bien_the_san_pham (ma_san_pham, sku, gia_ban, so_luong_ton, so_luong_dat_truoc, muc_ton_toi_thieu, trang_thai_kho) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                1, "SOFA-3SEAT-001", 15000000, 10, 0, 2, "ACTIVE");
            jdbcTemplate.update("INSERT INTO bien_the_san_pham (ma_san_pham, sku, gia_ban, so_luong_ton, so_luong_dat_truoc, muc_ton_toi_thieu, trang_thai_kho) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                1, "SOFA-3SEAT-002", 15500000, 8, 0, 2, "ACTIVE");
            jdbcTemplate.update("INSERT INTO bien_the_san_pham (ma_san_pham, sku, gia_ban, so_luong_ton, so_luong_dat_truoc, muc_ton_toi_thieu, trang_thai_kho) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                2, "DESK-WOOD-001", 3500000, 15, 0, 3, "ACTIVE");
            jdbcTemplate.update("INSERT INTO bien_the_san_pham (ma_san_pham, sku, gia_ban, so_luong_ton, so_luong_dat_truoc, muc_ton_toi_thieu, trang_thai_kho) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                2, "DESK-WOOD-002", 4200000, 12, 0, 3, "ACTIVE");
            jdbcTemplate.update("INSERT INTO bien_the_san_pham (ma_san_pham, sku, gia_ban, so_luong_ton, so_luong_dat_truoc, muc_ton_toi_thieu, trang_thai_kho) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                3, "WARDROBE-4D-001", 8500000, 6, 0, 1, "ACTIVE");

            System.out.println("Sample data loaded successfully!");

        } catch (Exception e) {
            System.err.println("Error loading sample data: " + e.getMessage());
            e.printStackTrace(); // In chi tiết lỗi để debug
            // Don't throw exception to allow application to start even if sample data fails
        }
    }
}