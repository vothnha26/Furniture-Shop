package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.CheckoutSummaryRequest;
import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.dto.response.ChiTietDonHangResponse;
import com.noithat.qlnt.backend.dto.response.CheckoutSummaryResponse;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeBanHangResponse;
import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.exception.AppException;
import com.noithat.qlnt.backend.repository.*;
import com.noithat.qlnt.backend.service.IDonHangService;
import com.noithat.qlnt.backend.service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonHangServiceImpl implements IDonHangService {

    private final DonHangRepository donHangRepository;
    private final KhachHangRepository khachHangRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final VoucherRepository voucherRepository;
    private final ThanhToanService thanhToanService;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final LichSuTrangThaiDonHangRepository lichSuTrangThaiDonHangRepository;

    @Override
    @Transactional
    public DonHangResponse taoDonHang(DonHangRequest request) {
        // 1. Xác thực khách hàng
        KhachHang khachHang = khachHangRepository.findById(request.getMaKhachHang())
                .orElseThrow(() -> new AppException(404, "Không tìm thấy khách hàng."));

        // 2. Tạo đối tượng DonHang và map thông tin
        DonHang donHang = new DonHang();
        donHang.setKhachHang(khachHang);
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setTrangThaiDonHang(request.getTrangThaiDonHang() != null ? request.getTrangThaiDonHang() : "PENDING");
        donHang.setTrangThaiThanhToan(
                request.getTrangThaiThanhToan() != null ? request.getTrangThaiThanhToan() : "UNPAID");
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        donHang.setGhiChu(request.getGhiChu());
        donHang.setTenNguoiNhan(request.getTenNguoiNhan());
        donHang.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
        donHang.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        donHang.setDiemThuongNhanDuoc(request.getDiemThuongNhanDuoc());

        // 3. Gọi procedure để tính toán lại toàn bộ giá trị
        CheckoutSummaryRequest summaryRequest = new CheckoutSummaryRequest();
        summaryRequest.setChiTietDonHang(request.getChiTietDonHangList());
        summaryRequest.setMaKhachHang(request.getMaKhachHang());
        summaryRequest.setDiemSuDung(request.getDiemThuongSuDung() != null ? request.getDiemThuongSuDung() : 0);
        summaryRequest.setMaVoucherCode(request.getMaVoucherCode());

        CheckoutSummaryResponse summary = thanhToanService.getCheckoutSummary(summaryRequest);

        // 4. Gán các giá trị đã tính vào DonHang
        donHang.setTongTienGoc(summary.getTamTinh());
        donHang.setGiamGiaVip(summary.getGiamGiaVip());
        donHang.setGiamGiaVoucher(summary.getGiamGiaVoucher());
        donHang.setDiemThuongSuDung(request.getDiemThuongSuDung());
        donHang.setGiamGiaDiemThuong(summary.getGiamGiaDiem());
        // summary.getDiemThuongNhanDuoc() returns BigDecimal (points may be returned
        // from stored-proc). DonHang.diemThuongNhanDuoc is Integer, so convert
        // safely (null -> 0).
        if (summary.getDiemThuongNhanDuoc() != null) {
            donHang.setDiemThuongNhanDuoc(summary.getDiemThuongNhanDuoc().intValue());
        } else {
            donHang.setDiemThuongNhanDuoc(0);
        }

        BigDecimal phiVanChuyen = "Miễn phí".equalsIgnoreCase(summary.getPhiGiaoHang()) ? BigDecimal.ZERO
                : new BigDecimal(summary.getPhiGiaoHang());
        donHang.setPhiGiaoHang(phiVanChuyen);
        donHang.setThanhTien(summary.getTongCong());

        // 5. Cập nhật Voucher
        if (request.getMaVoucherCode() != null && !request.getMaVoucherCode().isEmpty()) {
            Voucher voucher = voucherRepository.findByMaCode(request.getMaVoucherCode()).orElse(null);
            if (voucher != null) {
                donHang.setVoucher(voucher);
                voucher.setSoLuongDaSuDung(voucher.getSoLuongDaSuDung() + 1);
            }
        }

        // 6. Trừ điểm thưởng của khách hàng
        if (request.getDiemThuongSuDung() != null && request.getDiemThuongSuDung() > 0) {
            int diemHienCo = khachHang.getDiemThuong() != null ? khachHang.getDiemThuong() : 0;
            if (request.getDiemThuongSuDung() > diemHienCo) {
                throw new AppException(400, "Số điểm sử dụng vượt quá số điểm hiện có.");
            }
            khachHang.setDiemThuong(diemHienCo - request.getDiemThuongSuDung());
        }

        // 7. Tạo ChiTietDonHang và Trừ kho
        List<ChiTietDonHang> chiTietList = new ArrayList<>();
        for (ThanhToanRequest ct : request.getChiTietDonHangList()) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(ct.getMaBienThe())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy biến thể sản phẩm."));

            if (bienThe.getSoLuongTon() < ct.getSoLuong()) {
                throw new AppException(400, "Sản phẩm " + bienThe.getSku() + " không đủ số lượng tồn kho.");
            }
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() - ct.getSoLuong());

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setDonHang(donHang);
            chiTiet.setBienThe(bienThe);
            chiTiet.setSoLuong(ct.getSoLuong());
            chiTiet.setDonGiaGoc(bienThe.getGiaBan());
            chiTiet.setDonGiaThucTe(bienThe.getGiaBan());
            chiTietList.add(chiTiet);
        }
        donHang.setChiTietDonHangs(chiTietList);

        // 8. Lưu tất cả thay đổi
        DonHang savedDonHang = donHangRepository.save(donHang);

        return mapToResponse(savedDonHang);
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
    public List<DonHangResponse> getDonHangByKhachHang(Integer maKhachHang) {
        return donHangRepository.findByKhachHang(maKhachHang).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Integer id, String trangThai) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        donHang.setTrangThaiDonHang(trangThai);
        donHangRepository.save(donHang);
    }

    @Override
    public ThongKeBanHangResponse thongKeBanHang() {
        long tongDonHang = donHangRepository.count();
        long choXuLy = donHangRepository.countByTrangThaiDonHang("PENDING");
        long hoanThanh = donHangRepository.countByTrangThaiDonHang("COMPLETED");
        BigDecimal doanhThu = donHangRepository.sumThanhTienByTrangThaiDonHang("COMPLETED");

        ThongKeBanHangResponse response = new ThongKeBanHangResponse();
        response.setTongDonHang(tongDonHang);
        response.setChoXuLy(choXuLy);
        response.setHoanThanh(hoanThanh);
        response.setDoanhThuHomNay(doanhThu != null ? doanhThu : BigDecimal.ZERO);
        return response;
    }

    @Override
    @Transactional
    public void xoaDonHang(Integer id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));

        // Hoàn kho, hoàn điểm, hoàn voucher...
        // (Cần thêm logic chi tiết ở đây nếu trạng thái đơn hàng không phải là đã hủy)

        // Xóa các bản ghi phụ thuộc trước
        // Repository interfaces don't expose deleteByDonHang_MaDonHang; fetch the
        // related entities and delete them via repository.deleteAll(...) to keep
        // behavior explicit and avoid adding custom repository methods.
        List<GiaoDichThanhToan> giaoDichList = giaoDichThanhToanRepository.findByDonHang_MaDonHang(id);
        if (giaoDichList != null && !giaoDichList.isEmpty()) {
            giaoDichThanhToanRepository.deleteAll(giaoDichList);
        }

        List<LichSuTrangThaiDonHang> lichSuList = lichSuTrangThaiDonHangRepository.findByDonHangOrderByThoiGianThayDoiDesc(id);
        if (lichSuList != null && !lichSuList.isEmpty()) {
            lichSuTrangThaiDonHangRepository.deleteAll(lichSuList);
        }

        // Jpa tự xử lý xóa ChiTietDonHang nhờ CascadeType.ALL

        // Cuối cùng xóa đơn hàng
        donHangRepository.delete(donHang);
    }

    private DonHangResponse mapToResponse(DonHang donHang) {
        DonHangResponse response = new DonHangResponse();
        response.setMaDonHang(donHang.getMaDonHang());
        if (donHang.getKhachHang() != null) {
            response.setTenKhachHang(donHang.getKhachHang().getHoTen());
        }
        response.setNgayDatHang(donHang.getNgayDatHang());
        if (donHang.getNgayDatHang() != null) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            response.setNgayDatHangStr(donHang.getNgayDatHang().format(fmt));
        }
        response.setTrangThai(donHang.getTrangThaiDonHang());
    response.setDiaChiGiaoHang(donHang.getDiaChiGiaoHang());
        response.setTongTienGoc(donHang.getTongTienGoc());
        response.setGiamGiaVoucher(donHang.getGiamGiaVoucher());
        response.setDiemThuongSuDung(donHang.getDiemThuongSuDung());
        response.setGiamGiaDiemThuong(donHang.getGiamGiaDiemThuong());
        response.setGiamGiaVip(donHang.getGiamGiaVip());
    // Compute total discount (VIP + Voucher + Điểm) for convenience on frontend
    java.math.BigDecimal vipDisc = donHang.getGiamGiaVip() != null ? donHang.getGiamGiaVip() : java.math.BigDecimal.ZERO;
    java.math.BigDecimal vouDisc = donHang.getGiamGiaVoucher() != null ? donHang.getGiamGiaVoucher() : java.math.BigDecimal.ZERO;
    java.math.BigDecimal diemDisc = donHang.getGiamGiaDiemThuong() != null ? donHang.getGiamGiaDiemThuong() : java.math.BigDecimal.ZERO;
    response.setTongGiamGia(vipDisc.add(vouDisc).add(diemDisc));
        response.setChiPhiDichVu(donHang.getPhiGiaoHang());
        response.setThanhTien(donHang.getThanhTien());
        if (donHang.getVoucher() != null) {
            response.setVoucherCode(donHang.getVoucher().getMaCode());
        }

        if (donHang.getChiTietDonHangs() != null) {
            List<ChiTietDonHangResponse> chiTietList = donHang.getChiTietDonHangs().stream()
                    .map(ct -> {
                        BienTheSanPham bienThe = ct.getBienThe();
                        SanPham sanPham = bienThe != null ? bienThe.getSanPham() : null;

                        return new ChiTietDonHangResponse(
                                sanPham != null ? sanPham.getTenSanPham() : "N/A",
                                bienThe != null ? bienThe.getSku() : "N/A",
                                ct.getSoLuong(),
                                ct.getDonGiaGoc(),
                                ct.getDonGiaThucTe().multiply(BigDecimal.valueOf(ct.getSoLuong())));
                    }).collect(Collectors.toList());
            response.setChiTietDonHangList(chiTietList);
        }

        return response;
    }
}