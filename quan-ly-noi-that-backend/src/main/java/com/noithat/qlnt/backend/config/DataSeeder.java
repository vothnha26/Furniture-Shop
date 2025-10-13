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
                               ChuongTrinhGiamGiaRepository ctRepo,
                               SanPhamRepository sanPhamRepo,
                               BienTheSanPhamRepository bienTheRepo,
                               BienTheGiamGiaRepository bienTheGiamGiaRepo,
                               VaiTroRepository vaiTroRepo) {
        return args -> {
            // Hangs
            HangThanhVien bronze = new HangThanhVien();
            bronze.setTenHang("Bronze");
            bronze.setDiemToiThieu(0);
            hangRepo.save(bronze);

            HangThanhVien silver = new HangThanhVien();
            silver.setTenHang("Silver");
            silver.setDiemToiThieu(1000);
            hangRepo.save(silver);

            // Vai tro
            VaiTro vaiTro = new VaiTro();
            vaiTro.setTenVaiTro("USER");
            vaiTroRepo.save(vaiTro);

            // Tai khoan
            TaiKhoan t1 = new TaiKhoan();
            t1.setEmail("user1@example.com");
            t1.setMatKhauHash("password");
            t1.setTenDangNhap("user1");
            t1.setVaiTro(vaiTro);
            taiKhoanRepo.save(t1);

            // Tai khoan thu 2
            TaiKhoan t2 = new TaiKhoan();
            t2.setEmail("userb@example.com");
            t2.setMatKhauHash("password");
            t2.setTenDangNhap("userb");
            t2.setVaiTro(vaiTro);
            taiKhoanRepo.save(t2);

            // Khach hang
            KhachHang k1 = new KhachHang();
            k1.setHoTen("Nguyen Van A");
            k1.setEmail("a@example.com");
            k1.setSoDienThoai("0900000001");
            k1.setDiemThuong(0);
            k1.setHangThanhVien(bronze);
            k1.setTaiKhoan(t1);
            khachHangRepo.save(k1);

            // Voucher
            Voucher v1 = new Voucher();
            v1.setMaCode("SALE10");
            v1.setLoaiGiamGia("PERCENT");
            v1.setGiaTriGiam(BigDecimal.valueOf(10));
            v1.setNgayBatDau(LocalDateTime.now().minusDays(1));
            v1.setNgayKetThuc(LocalDateTime.now().plusYears(1));
            v1.setApDungChoMoiNguoi(true);
            voucherRepo.save(v1);

            // Chuong trinh giam gia
            ChuongTrinhGiamGia ct = new ChuongTrinhGiamGia();
            ct.setTenChuongTrinh("Tet Promo");
            ct.setNgayBatDau(LocalDateTime.now().minusDays(1));
            ct.setNgayKetThuc(LocalDateTime.now().plusMonths(1));
            ctRepo.save(ct);

            // San pham + bien the
            SanPham sp = new SanPham();
            sp.setTenSanPham("Sofa A");
            sp.setMoTa("Mau sofa dep");
            sanPhamRepo.save(sp);

            BienTheSanPham bt = new BienTheSanPham();
            bt.setGiaBan(BigDecimal.valueOf(2000000));
            bt.setSku("SOFA-A-1");
            bt.setSoLuongTon(10);
            bt.setSanPham(sp);
            bienTheRepo.save(bt);

            BienTheGiamGia btg = new BienTheGiamGia();
            BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId(ct.getMaChuongTrinhGiamGia(), bt.getMaBienThe());
            btg.setId(id);
            btg.setChuongTrinhGiamGia(ct);
            btg.setBienTheSanPham(bt);
            btg.setGiaSauGiam(BigDecimal.valueOf(1800000));
            bienTheGiamGiaRepo.save(btg);
        };
    }
}
