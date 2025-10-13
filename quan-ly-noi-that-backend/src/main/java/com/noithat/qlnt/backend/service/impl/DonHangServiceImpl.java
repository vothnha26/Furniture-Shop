package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.ChiTietDonHangRequest;
import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.request.DonHangDichVuRequest;
import com.noithat.qlnt.backend.dto.response.ChiTietDonHangResponse;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.DonHangDichVuResponse;
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
    private final VoucherRepository voucherRepository;
    private final DichVuRepository dichVuRepository;
    private final DonHangDichVuRepository donHangDichVuRepository;
    private final com.noithat.qlnt.backend.service.VipBenefitProcessor vipBenefitProcessor;

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
        Voucher voucher = null;
        
        // Ưu tiên sử dụng maCodeVoucher (String), nếu không có thì dùng maVoucher (Integer - deprecated)
        if (request.getMaCodeVoucher() != null && !request.getMaCodeVoucher().trim().isEmpty()) {
            voucher = voucherRepository.findByMaCode(request.getMaCodeVoucher())
                    .orElseThrow(() -> new RuntimeException("Voucher với mã '" + request.getMaCodeVoucher() + "' không tồn tại."));
        } else if (request.getMaVoucher() != null) {
            voucher = voucherRepository.findById(request.getMaVoucher())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại."));
        }
        
        if (voucher != null) {
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
            chiTiet.setDonGiaGoc(donGia);      // ✅ Thêm dòng này: set giá gốc
            chiTiet.setDonGiaThucTe(donGia);   // Giá thực tế ban đầu = giá gốc

            BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(ctReq.getSoLuong()));
            tongTienGoc = tongTienGoc.add(thanhTien);

            chiTiet.setDonHang(donHang); // ⚠️ liên kết ngược bắt buộc
            chiTietList.add(chiTiet);
        }

        // 🔹 Xử lý dịch vụ (vận chuyển, lắp đặt...)
        List<DonHangDichVu> dichVuList = new ArrayList<>();
        BigDecimal chiPhiDichVu = BigDecimal.ZERO;

        if (request.getDonHangDichVuList() != null && !request.getDonHangDichVuList().isEmpty()) {
            for (DonHangDichVuRequest dvReq : request.getDonHangDichVuList()) {
                DichVu dichVu = dichVuRepository.findById(dvReq.getMaDichVu())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ."));

                DonHangDichVu donHangDichVu = new DonHangDichVu();
                donHangDichVu.setDichVu(dichVu);
                donHangDichVu.setSoLuong(dvReq.getSoLuong());
                donHangDichVu.setDonHang(donHang); // Liên kết ngược

                BigDecimal thanhTienDichVu = dichVu.getChiPhi().multiply(BigDecimal.valueOf(dvReq.getSoLuong()));
                chiPhiDichVu = chiPhiDichVu.add(thanhTienDichVu);

                dichVuList.add(donHangDichVu);
            }
        }

        donHang.setChiPhiDichVu(chiPhiDichVu);

        // 🔹 Xử lý điểm thưởng (1 điểm = 1,000đ)
        BigDecimal giamGiaDiemThuong = BigDecimal.ZERO;
        Integer diemSuDung = request.getDiemThuongSuDung() != null ? request.getDiemThuongSuDung() : 0;

        if (diemSuDung > 0) {
            // Kiểm tra khách hàng có đủ điểm không
            if (khachHang.getDiemThuong() < diemSuDung) {
                throw new RuntimeException("Khách hàng chỉ có " + khachHang.getDiemThuong() + " điểm, không đủ để sử dụng " + diemSuDung + " điểm.");
            }

            // Tính giá trị giảm giá từ điểm (1 điểm = 1,000đ)
            giamGiaDiemThuong = BigDecimal.valueOf(diemSuDung * 1000);

            // Giảm điểm của khách hàng
            khachHang.setDiemThuong(khachHang.getDiemThuong() - diemSuDung);
            khachHangRepository.save(khachHang);

            donHang.setDiemThuongSuDung(diemSuDung);
            donHang.setGiamGiaDiemThuong(giamGiaDiemThuong);
        } else {
            donHang.setDiemThuongSuDung(0);
            donHang.setGiamGiaDiemThuong(BigDecimal.ZERO);
        }

        // 🔹 ÁP DỤNG ƯU ĐÃI VIP 🎯
        BigDecimal giamGiaVip = vipBenefitProcessor.calculateVipDiscount(khachHang, tongTienGoc);
        
        // Kiểm tra miễn phí vận chuyển từ VIP
        boolean mienPhiVanChuyenVip = vipBenefitProcessor.hasFreshipping(khachHang);
        BigDecimal chiPhiDichVuSauVip = vipBenefitProcessor.calculateShippingCostAfterVipBenefit(khachHang, chiPhiDichVu);

        // 🔹 Tính tổng tiền và thành tiền sau tất cả giảm giá + chi phí dịch vụ
        // Công thức: Thành tiền = (Tổng tiền gốc - Giảm VIP - Giảm voucher - Giảm điểm thưởng) + Chi phí dịch vụ sau VIP
        donHang.setTongTienGoc(tongTienGoc);
        donHang.setGiamGiaVip(giamGiaVip);
        donHang.setMienPhiVanChuyen(mienPhiVanChuyenVip);
        donHang.setChiPhiDichVu(chiPhiDichVuSauVip); // Cập nhật chi phí sau khi áp dụng VIP
        
        BigDecimal thanhTienSauGiam = tongTienGoc
                .subtract(giamGiaVip)        // 🎯 Giảm giá VIP
                .subtract(giamGiaVoucher)    // 🎫 Giảm voucher
                .subtract(giamGiaDiemThuong) // 🏆 Giảm điểm thưởng
                .add(chiPhiDichVuSauVip);    // 🚚 Chi phí vận chuyển (có thể miễn phí)

        donHang.setThanhTien(thanhTienSauGiam);

        // 🔹 TÍCH ĐIỂM VIP THƯỞNG 🏆
        Integer vipBonusPoints = vipBenefitProcessor.calculateVipBonusPoints(khachHang, thanhTienSauGiam);
        donHang.setDiemVipThuong(vipBonusPoints);
        
        if (vipBonusPoints > 0) {
            // Cộng điểm VIP vào tài khoản khách hàng
            khachHang.setDiemThuong(khachHang.getDiemThuong() + vipBonusPoints);
            
            // Cập nhật tổng chi tiêu và số đơn hàng cho VIP tracking
            if (khachHang.getTongChiTieu() == null) {
                khachHang.setTongChiTieu(BigDecimal.ZERO);
            }
            khachHang.setTongChiTieu(khachHang.getTongChiTieu().add(thanhTienSauGiam));
            
            if (khachHang.getTongDonHang() == null) {
                khachHang.setTongDonHang(0);
            }
            khachHang.setTongDonHang(khachHang.getTongDonHang() + 1);
            khachHang.setDonHangCuoi(java.time.LocalDate.now());
            
            khachHangRepository.save(khachHang);
        }

        // 🔹 Gắn danh sách chi tiết và dịch vụ vào đơn hàng
        donHang.setChiTietDonHangs(chiTietList);
        donHang.setDonHangDichVus(dichVuList);

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
        response.setTongTienGoc(donHang.getTongTienGoc());
        response.setGiamGiaVoucher(donHang.getGiamGiaVoucher());
        response.setDiemThuongSuDung(donHang.getDiemThuongSuDung());
        response.setGiamGiaDiemThuong(donHang.getGiamGiaDiemThuong());
        response.setGiamGiaVip(donHang.getGiamGiaVip());
        response.setDiemVipThuong(donHang.getDiemVipThuong());
        response.setMienPhiVanChuyen(donHang.getMienPhiVanChuyen());
        response.setChiPhiDichVu(donHang.getChiPhiDichVu());
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

            // Map danh sách dịch vụ
            List<DonHangDichVuResponse> dichVuList = donHang.getDonHangDichVus().stream()
                    .map(dhdv -> {
                        DichVu dichVu = dhdv.getDichVu();
                        Integer soLuong = dhdv.getSoLuong();
                        BigDecimal chiPhi = dichVu.getChiPhi();
                        BigDecimal thanhTien = chiPhi.multiply(BigDecimal.valueOf(soLuong));

                        return new DonHangDichVuResponse(
                                dichVu.getTenDichVu(),
                                soLuong,
                                chiPhi,
                                thanhTien
                        );
                    }).collect(Collectors.toList());

            response.setDonHangDichVuList(dichVuList);
            return response;
    }
}