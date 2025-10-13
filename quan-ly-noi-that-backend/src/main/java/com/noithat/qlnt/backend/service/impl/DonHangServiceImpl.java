package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.ChiTietDonHangRequest;
import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.response.ChiTietDonHangResponse;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeBanHangResponse;
import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.repository.*;
import com.noithat.qlnt.backend.service.DonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonHangServiceImpl implements DonHangService {

    private final DonHangRepository donHangRepository;
    private final KhachHangRepository khachHangRepository;
    // Xóa SanPhamRepository không cần thiết và thêm BienTheSanPhamRepository
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public DonHangResponse taoDonHang(DonHangRequest request) {
        // 🔹 Lấy thông tin khách hàng
        KhachHang khachHang = khachHangRepository.findById(request.getMaKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng."));

        // 🔹 Tạo đơn hàng mới
        DonHang donHang = new DonHang();
        donHang.setKhachHang(khachHang);
        donHang.setTrangThai(request.getTrangThai());
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        donHang.setGhiChu(request.getGhiChu());

        // 🔹 Nếu có mã voucher
        BigDecimal giamGiaVoucher = BigDecimal.ZERO;
        if (request.getMaVoucher() != null) {
            Voucher voucher = voucherRepository.findById(request.getMaVoucher())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại."));
            donHang.setVoucher(voucher);
            giamGiaVoucher = voucher.getGiaTriGiam() != null ? voucher.getGiaTriGiam() : BigDecimal.ZERO;
        }
        donHang.setGiamGiaVoucher(giamGiaVoucher);

        // 🔹 Xử lý chi tiết đơn hàng
        List<ChiTietDonHang> chiTietList = new ArrayList<>();
        BigDecimal tongTienGoc = BigDecimal.ZERO;

        for (ChiTietDonHangRequest ctReq : request.getChiTietDonHangList()) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(ctReq.getMaBienThe())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm."));

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setBienThe(bienThe);
            chiTiet.setSoLuong(ctReq.getSoLuong());

            BigDecimal donGia = bienThe.getGiaBan();
            chiTiet.setDonGiaThucTe(donGia);

            BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(ctReq.getSoLuong()));
            tongTienGoc = tongTienGoc.add(thanhTien);

            chiTiet.setDonHang(donHang); // ⚠️ liên kết ngược bắt buộc
            chiTietList.add(chiTiet);
        }

        // 🔹 Tính tổng tiền và thành tiền sau giảm giá
        donHang.setTongTienGoc(tongTienGoc);
        donHang.setThanhTien(tongTienGoc.subtract(giamGiaVoucher));

        // 🔹 Gắn danh sách chi tiết vào đơn hàng
        donHang.setChiTietDonHangs(chiTietList);

        // 🔹 Lưu đơn hàng và chi tiết
        donHangRepository.save(donHang);

        // ✅ Trả về response
        return mapToResponse(donHang);
    }


    @Override
    public DonHangResponse getDonHangById(Integer id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        return mapToResponse(donHang);
    }

    @Override
    public List<DonHangResponse> getTatCaDonHang() {
        return donHangRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Override
    public void capNhatTrangThai(Integer id, String trangThai) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        donHang.setTrangThai(trangThai);
        donHangRepository.save(donHang);
    }

    @Override
    public ThongKeBanHangResponse thongKeBanHang() {
        // Đếm tổng số đơn hàng
        long tongDonHang = donHangRepository.count();

        // Đếm theo trạng thái
        long choXuLy = donHangRepository.findAll().stream()
                .filter(dh -> "Chờ xử lý".equalsIgnoreCase(dh.getTrangThai()))
                .count();

        long hoanThanh = donHangRepository.findAll().stream()
                .filter(dh -> "Hoàn thành".equalsIgnoreCase(dh.getTrangThai()))
                .count();

        // Tính doanh thu (lọc null)
        BigDecimal doanhThuHomNay = donHangRepository.findAll().stream()
                .map(DonHang::getThanhTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Gán dữ liệu vào DTO
        ThongKeBanHangResponse response = new ThongKeBanHangResponse();
        response.setTongDonHang(tongDonHang);
        response.setChoXuLy(choXuLy);
        response.setHoanThanh(hoanThanh);
        response.setDoanhThuHomNay(doanhThuHomNay);

        return response;
    }


    @Override
    public void xoaDonHang(Integer id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        donHangRepository.delete(donHang);
    }

    // =================== PRIVATE MAPPER ===================
        // Lấy danh sách chi tiết đơn hàng trực tiếp từ quan hệ trong entity DonHang
        // Điều này yêu cầu bạn phải định nghĩa đúng quan hệ @OneToMany trong entity DonHang
    private DonHangResponse mapToResponse(DonHang donHang) {
        DonHangResponse response = new DonHangResponse();
            // ... các dòng code gán mã đơn hàng, tên khách hàng, v.v...
        response.setMaDonHang(donHang.getMaDonHang());
        response.setTenKhachHang(donHang.getKhachHang().getHoTen());
        response.setNgayDatHang(donHang.getNgayDatHang());
        response.setThanhTien(donHang.getThanhTien());
        response.setTrangThai(donHang.getTrangThai());
        response.setVoucherCode(
        donHang.getVoucher() != null ? String.valueOf(donHang.getVoucher().getMaVoucher()) : null
        );

            // SỬA LẠI LOGIC BÊN TRONG HÀM MAP
            List<ChiTietDonHangResponse> chiTietList = donHang.getChiTietDonHangs().stream()
                    .map(ct -> {
                        // Lấy ra các thông tin cần thiết từ chi tiết đơn hàng (ct)
                        BienTheSanPham bienThe = ct.getBienThe();
                        SanPham sanPham = bienThe.getSanPham();
                        int soLuong = ct.getSoLuong();
                        BigDecimal donGia = ct.getDonGiaThucTe();

                        // Tính toán thành tiền cho từng dòng sản phẩm
                        BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));

                        // Gọi constructor với đủ 5 tham số
                        return new ChiTietDonHangResponse(
                                sanPham.getTenSanPham(),   // 1. tenSanPham (String)
                                bienThe.getSku(),          // 2. sku (String)
                                soLuong,                   // 3. soLuong (int)
                                donGia,                    // 4. donGia (BigDecimal)
                                thanhTien                  // 5. thanhTien (BigDecimal)
                        );
                    }).collect(Collectors.toList());
            
            response.setChiTietDonHangList(chiTietList);
            return response;
    }
}