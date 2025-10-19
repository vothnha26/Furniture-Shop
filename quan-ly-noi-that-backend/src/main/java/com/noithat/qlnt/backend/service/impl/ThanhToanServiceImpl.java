package com.noithat.qlnt.backend.service.impl;

import com.microsoft.sqlserver.jdbc.SQLServerCallableStatement;
import com.microsoft.sqlserver.jdbc.SQLServerDataTable;
import com.noithat.qlnt.backend.dto.request.*;
import com.noithat.qlnt.backend.dto.response.*;
import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.exception.AppException;
import com.noithat.qlnt.backend.repository.*;
import com.noithat.qlnt.backend.service.HoaDonService;
import com.noithat.qlnt.backend.service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class ThanhToanServiceImpl implements ThanhToanService {

    private final DataSource dataSource;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final DonHangRepository donHangRepository;
    private final KhachHangRepository khachHangRepository;
    private final VoucherRepository voucherRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final com.noithat.qlnt.backend.service.CauHinhService cauHinhService;
    private final HoaDonService hoaDonService;
    private final com.noithat.qlnt.backend.service.IThongBaoService thongBaoService;

    @Override
    public ThongKeThanhToanResponse getThongKe() {
        long daThanhToan = giaoDichThanhToanRepository.countByTrangThai("Hoàn thành");
        long choXuLy = giaoDichThanhToanRepository.countByTrangThai("Chờ xử lý");
        BigDecimal tongDoanhThu = giaoDichThanhToanRepository.sumSoTienByTrangThai("Hoàn thành");

        ThongKeThanhToanResponse response = new ThongKeThanhToanResponse();
        response.setSoGiaoDichDaThanhToan(daThanhToan);
        response.setSoGiaoDichChoXuLy(choXuLy);
        response.setTongDoanhThu(tongDoanhThu == null ? BigDecimal.ZERO : tongDoanhThu);
        response.setTongPhiGiaoDich(BigDecimal.ZERO);
        return response;
    }

    @Override
    public List<ThanhToanResponse> getAllThanhToan(String trangThai, String phuongThuc) {
        List<GiaoDichThanhToan> giaoDichList = giaoDichThanhToanRepository.findByFilters(trangThai, phuongThuc);
        return giaoDichList.stream().map(this::mapGiaoDichToThanhToanResponse).collect(Collectors.toList());
    }

    @Override
    public ThanhToanChiTietResponse getThanhToanById(Integer id) {
        GiaoDichThanhToan giaoDich = giaoDichThanhToanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với ID: " + id));
        return mapToChiTietResponse(giaoDich);
    }

    @Override
    @Transactional
    public ThanhToanResponse updateTrangThai(Integer id, String newStatus) {
        GiaoDichThanhToan giaoDich = giaoDichThanhToanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với ID: " + id));
        giaoDich.setTrangThai(newStatus);
        GiaoDichThanhToan updatedGiaoDich = giaoDichThanhToanRepository.save(giaoDich);
        return mapGiaoDichToThanhToanResponse(updatedGiaoDich);
    }

    @Override
    public List<ThanhToanResponse> getByDonHang(Integer maDonHang) {
        return giaoDichThanhToanRepository.findByDonHang_MaDonHang(maDonHang)
                .stream()
                .map(this::mapGiaoDichToThanhToanResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ThanhToanChiTietResponse themMoiGiaoDich(ThemGiaoDichRequest request) {
        DonHang donHang = donHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + request.getMaDonHang()));

        GiaoDichThanhToan newGiaoDich = new GiaoDichThanhToan();
        newGiaoDich.setDonHang(donHang);
        newGiaoDich.setSoTien(request.getSoTien());
        newGiaoDich.setPhuongThuc(request.getPhuongThuc());
        newGiaoDich.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "Hoàn thành");
        newGiaoDich.setNgayGiaoDich(LocalDateTime.now());

        GiaoDichThanhToan savedGiaoDich = giaoDichThanhToanRepository.save(newGiaoDich);
        return mapToChiTietResponse(savedGiaoDich);
    }

    @Override
    public List<CartDetailItemResponse> getCartDetails(List<ThanhToanRequest> cartItems) {
        List<CartDetailItemResponse> items = new ArrayList<>();
        SQLServerDataTable tvp = createCartTvp(cartItems);

        String sql = "{call dbo.sp_GetCartDetails(?)}";
        try (Connection conn = dataSource.getConnection();
                CallableStatement cstmt = conn.prepareCall(sql)) {

            // SỬA LỖI: Unwrap statement trước khi sử dụng
            SQLServerCallableStatement sqlServerCstmt = cstmt.unwrap(SQLServerCallableStatement.class);
            sqlServerCstmt.setStructured(1, "dbo.CartItemType", tvp);

            try (ResultSet rs = sqlServerCstmt.executeQuery()) {
                while (rs.next()) {
                    CartDetailItemResponse it = new CartDetailItemResponse();
                    it.setMaBienThe(rs.getInt("ma_bien_the"));
                    it.setTenSanPham(rs.getString("ten_san_pham"));
                    it.setSoLuong(rs.getInt("so_luong"));
                    it.setGiaGoc(rs.getBigDecimal("gia_goc"));
                    it.setGiaHienThi(rs.getBigDecimal("gia_hien_thi"));
                    it.setThanhTien(rs.getBigDecimal("thanh_tien"));
                    it.setHinhAnhDaiDien(rs.getString("hinh_anh_dai_dien"));
                    items.add(it);
                }
            }
        } catch (SQLException ex) {
            throw new RuntimeException("Lỗi khi gọi sp_GetCartDetails: " + ex.getMessage(), ex);
        }
        return items;
    }

    @Override
    public CheckoutSummaryResponse getCheckoutSummary(CheckoutSummaryRequest request) {
        CheckoutSummaryResponse summary = new CheckoutSummaryResponse();
        SQLServerDataTable tvp = createCartTvp(request.getChiTietDonHang());

        String sql = "{call dbo.sp_GetCheckoutSummary(?, ?, ?, ?)}";
        try (Connection conn = dataSource.getConnection();
                CallableStatement cstmt = conn.prepareCall(sql)) {

            // SỬA LỖI: Unwrap statement trước khi sử dụng
            SQLServerCallableStatement sqlServerCstmt = cstmt.unwrap(SQLServerCallableStatement.class);
            sqlServerCstmt.setStructured(1, "dbo.CartItemType", tvp);
            sqlServerCstmt.setInt(2, request.getMaKhachHang());
            sqlServerCstmt.setInt(3, request.getDiemSuDung());
            sqlServerCstmt.setString(4, request.getMaVoucherCode());

            try (ResultSet rs = sqlServerCstmt.executeQuery()) {
                if (rs.next()) {
                    summary.setTamTinh(rs.getBigDecimal("TamTinh"));
                    summary.setGiamGiaVip(rs.getBigDecimal("GiamGiaVip"));
                    summary.setGiamGiaVoucher(rs.getBigDecimal("GiamGiaVoucher"));
                    summary.setGiamGiaDiem(rs.getBigDecimal("GiamGiaDiem"));
                    summary.setPhiGiaoHang(rs.getString("PhiGiaoHang"));
                    summary.setTongCong(rs.getBigDecimal("TongCong"));
                    summary.setDiemThuongNhanDuoc(rs.getBigDecimal("DiemThuongNhanDuoc"));

                    // Compute total discount (treat null as zero)
                    BigDecimal vip = summary.getGiamGiaVip() != null ? summary.getGiamGiaVip() : BigDecimal.ZERO;
                    BigDecimal voucher = summary.getGiamGiaVoucher() != null ? summary.getGiamGiaVoucher()
                            : BigDecimal.ZERO;
                    BigDecimal diem = summary.getGiamGiaDiem() != null ? summary.getGiamGiaDiem() : BigDecimal.ZERO;
                    summary.setTongGiamGia(vip.add(voucher).add(diem));
                }
            }
        } catch (SQLException ex) {
            throw new RuntimeException("Lỗi khi gọi sp_GetCheckoutSummary: " + ex.getMessage(), ex);
        }
        return summary;
    }

    @Override
    public List<Voucher> getApplicableVouchers(Integer maKhachHang, BigDecimal tongTienDonHang) {
        List<Voucher> vouchers = new ArrayList<>();
        String sql = "{call dbo.sp_GetApplicableVouchers_ForCheckout(?, ?)}";

        try (Connection conn = dataSource.getConnection();
                CallableStatement cstmt = conn.prepareCall(sql)) { // Không cần unwrap ở đây

            cstmt.setInt(1, maKhachHang);
            cstmt.setBigDecimal(2, tongTienDonHang);

            try (ResultSet rs = cstmt.executeQuery()) {
                while (rs.next()) {
                    Voucher v = new Voucher();
                    v.setMaVoucher(rs.getInt("ma_voucher"));
                    v.setMaCode(rs.getString("ma_code"));
                    v.setTenVoucher(rs.getString("ten_voucher"));
                    vouchers.add(v);
                }
            }
        } catch (SQLException ex) {
            throw new RuntimeException("Lỗi khi gọi sp_GetApplicableVouchers_ForCheckout: " + ex.getMessage(), ex);
        }
        return vouchers;
    }

    @Override
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request) {
        Voucher voucher = voucherRepository.findByMaCode(request.getMaVoucherCode()).orElse(null);

        if (voucher == null) {
            return ApplyVoucherResponse.builder().success(false).message("Mã voucher không tồn tại.").build();
        }
        if (!"DANG_HOAT_DONG".equals(voucher.getTrangThai())
                || voucher.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            return ApplyVoucherResponse.builder().success(false).message("Voucher đã hết hạn hoặc không hoạt động.")
                    .build();
        }
        if (voucher.getSoLuongDaSuDung() >= voucher.getSoLuongToiDa()) {
            return ApplyVoucherResponse.builder().success(false).message("Voucher đã hết lượt sử dụng.").build();
        }
        if (request.getOrderAmountForCheck().compareTo(voucher.getGiaTriDonHangToiThieu()) < 0) {
            return ApplyVoucherResponse.builder().success(false)
                    .message("Đơn hàng chưa đủ điều kiện tối thiểu để áp dụng voucher này.").build();
        }

        BigDecimal giamGiaVoucher;
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getLoaiGiamGia())) {
            BigDecimal discount = request.getOrderAmountForCheck()
                    .multiply(voucher.getGiaTriGiam().divide(new BigDecimal("100")));
            if (voucher.getGiaTriGiamToiDa() != null && discount.compareTo(voucher.getGiaTriGiamToiDa()) > 0) {
                giamGiaVoucher = voucher.getGiaTriGiamToiDa();
            } else {
                giamGiaVoucher = discount;
            }
        } else {
            giamGiaVoucher = voucher.getGiaTriGiam();
        }

        return ApplyVoucherResponse.builder()
                .success(true)
                .message("Áp dụng voucher thành công!")
                .maVoucherCode(request.getMaVoucherCode())
                .giamGiaVoucher(giamGiaVoucher)
                .build();
    }

    @Override
    @Transactional
    public ThanhToanResponse taoDonHangTuUser(ThongTinGiaoHangRequest request) {
        // 1. Xác thực khách hàng
        KhachHang khachHang = khachHangRepository.findById(request.getMaKhachHang())
                .orElseThrow(() -> new AppException(404, "Không tìm thấy khách hàng."));

        // 2. Tạo đối tượng DonHang và map các thông tin cơ bản
        DonHang donHang = new DonHang();
        donHang.setKhachHang(khachHang);
        donHang.setNgayDatHang(LocalDateTime.now());
        // Use the DonHang.trangThaiDonHang field (not a generic 'trangThai')
        donHang.setTrangThaiDonHang("CHO_XU_LY");
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        donHang.setGhiChu(request.getGhiChu());
        donHang.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        // We no longer use the dichvu / DonHangDichVu tables. Store the chosen
        // shipping method as plain text inside ghiChu (append to any existing note).
        String existingNote = request.getGhiChu() != null ? request.getGhiChu() : "";
        if (request.getPhuongThucGiaoHang() != null && !request.getPhuongThucGiaoHang().isEmpty()) {
            String shippingNote = "Phương thức giao hàng: " + request.getPhuongThucGiaoHang();
            if (!existingNote.isEmpty())
                existingNote = existingNote + "\n" + shippingNote;
            else
                existingNote = shippingNote;
        }
        donHang.setGhiChu(existingNote);
        donHang.setTenNguoiNhan(request.getTenNguoiNhan());
        // Bạn nên thêm SoDienThoaiNhan vào ThongTinGiaoHangRequest
        donHang.setSoDienThoaiNhan(request.getSoDienThoaiNhan());

        // 3. Gọi lại procedure để tính toán lại toàn bộ giá trị một cách an toàn
        CheckoutSummaryRequest summaryRequest = new CheckoutSummaryRequest();
        summaryRequest.setChiTietDonHang(request.getChiTietDonHangList());
        summaryRequest.setMaKhachHang(request.getMaKhachHang());
        summaryRequest.setDiemSuDung(request.getDiemThuongSuDung() != null ? request.getDiemThuongSuDung() : 0);
        // Request now sends voucher code string (maVoucherCode). Pass it directly
        // to the checkout summary request if present.
        if (request.getMaVoucherCode() != null && !request.getMaVoucherCode().isEmpty()) {
            summaryRequest.setMaVoucherCode(request.getMaVoucherCode());
        }
        // We removed usage of dichvu/maDichVuGiaoHang per new requirement.

        CheckoutSummaryResponse summary = this.getCheckoutSummary(summaryRequest);

        // 4. Gán các giá trị đã được tính toán vào DonHang
        donHang.setTongTienGoc(summary.getTamTinh());
        donHang.setGiamGiaVip(summary.getGiamGiaVip());
        donHang.setGiamGiaVoucher(summary.getGiamGiaVoucher());
        donHang.setGiamGiaDiemThuong(summary.getGiamGiaDiem());
        donHang.setDiemThuongSuDung(request.getDiemThuongSuDung());

        // If frontend provided a shipping method, prefer configuration-based fees
        BigDecimal phiVanChuyen = null;
        String phuongThucGiaoHang = request.getPhuongThucGiaoHang();
        if (phuongThucGiaoHang != null && !phuongThucGiaoHang.isEmpty()) {
            // Simple mapping: express -> SHIPPING_FEE_EXPRESS, otherwise
            // SHIPPING_FEE_STANDARD
            String key = phuongThucGiaoHang.toLowerCase().contains("express")
                    || phuongThucGiaoHang.toLowerCase().contains("nhanh")
                            ? "SHIPPING_FEE_EXPRESS"
                            : "SHIPPING_FEE_STANDARD";
            phiVanChuyen = cauHinhService.getDecimal(key, null);
        }
        // Fall back to stored-proc computed value if config not available
        if (phiVanChuyen == null) {
            phiVanChuyen = "Miễn phí".equalsIgnoreCase(summary.getPhiGiaoHang()) ? BigDecimal.ZERO
                    : new BigDecimal(summary.getPhiGiaoHang());
        }
        // Persist computed shipping fee into DonHang.phiGiaoHang
        donHang.setPhiGiaoHang(phiVanChuyen);
        donHang.setThanhTien(summary.getTongCong());

        // 5. Cập nhật Voucher (nếu có) - request provides voucher code (String)
        if (request.getMaVoucherCode() != null && !request.getMaVoucherCode().isEmpty()) {
            Voucher voucher = voucherRepository.findByMaCode(request.getMaVoucherCode()).orElse(null);
            if (voucher != null) {
                donHang.setVoucher(voucher);
                voucher.setSoLuongDaSuDung(voucher.getSoLuongDaSuDung() + 1);
            }
        }

        // 6. Trừ điểm thưởng của khách hàng (nếu có)
        if (request.getDiemThuongSuDung() != null && request.getDiemThuongSuDung() > 0) {
            int diemHienCo = khachHang.getDiemThuong() != null ? khachHang.getDiemThuong() : 0;
            int diemSuDung = request.getDiemThuongSuDung();
            if (diemSuDung > diemHienCo) {
                throw new AppException(400, "Số điểm sử dụng vượt quá số điểm hiện có.");
            }
            khachHang.setDiemThuong(diemHienCo - diemSuDung);
        }

        // 7. Lấy lại chi tiết giỏ hàng để có giá thực tế của từng sản phẩm
        List<CartDetailItemResponse> cartDetails = this.getCartDetails(request.getChiTietDonHangList());

        // 8. Tạo ChiTietDonHang và Trừ kho
        List<ChiTietDonHang> chiTietList = new ArrayList<>();
        for (ThanhToanRequest ct : request.getChiTietDonHangList()) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(ct.getMaBienThe())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy biến thể sản phẩm."));

            // Trừ kho
            if (bienThe.getSoLuongTon() < ct.getSoLuong()) {
                throw new AppException(400, "Sản phẩm " + bienThe.getSku() + " không đủ số lượng tồn kho.");
            }
            bienThe.setSoLuongTon(bienThe.getSoLuongTon() - ct.getSoLuong());

            // Tìm giá thực tế từ kết quả đã gọi sp_GetCartDetails
            CartDetailItemResponse detail = cartDetails.stream()
                    .filter(item -> item.getMaBienThe() == ct.getMaBienThe())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Lỗi logic: không tìm thấy chi tiết sản phẩm."));

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setDonHang(donHang);
            chiTiet.setBienThe(bienThe);
            // Ensure the embedded id has the variant id so Hibernate can set it and avoid
            // NPEs
            if (chiTiet.getId() == null) {
                chiTiet.setId(new ChiTietDonHang.ChiTietDonHangId());
            }
            chiTiet.getId().setMaBienThe(bienThe.getMaBienThe());
            chiTiet.setSoLuong(ct.getSoLuong());
            chiTiet.setDonGiaGoc(detail.getGiaGoc()); // Lấy giá gốc từ SP
            chiTiet.setDonGiaThucTe(detail.getGiaHienThi()); // Gán giá thực tế đã có khuyến mãi

            chiTietList.add(chiTiet);
        }
        donHang.setChiTietDonHangs(chiTietList);

        // 10. Gửi thông báo đơn hàng mới (dành cho admin)
        // Persist order first
        DonHang savedDonHang = donHangRepository.save(donHang);

        // Schedule creation/publish of notification after transaction commit
        final Integer maDonHangForNotif = savedDonHang != null ? savedDonHang.getMaDonHang() : null;
        try {
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            if (maDonHangForNotif != null) thongBaoService.taoThongBaoDonHangMoi(maDonHangForNotif);
                        } catch (Exception ex) {
                            System.err.println("[ThanhToanService] Lỗi khi tạo thông báo sau commit: " + ex.getMessage());
                        }
                    }
                });
            } else {
                // no active transaction - create immediately
                if (maDonHangForNotif != null) thongBaoService.taoThongBaoDonHangMoi(maDonHangForNotif);
            }
        } catch (Exception ex) {
            System.err.println("[ThanhToanService] Không thể đăng ký hoặc thực hiện thông báo: " + ex.getMessage());
        }

        // 10. Tạo hóa đơn
        TaoHoaDonRequest taoHoaDonRequest = new TaoHoaDonRequest();
        taoHoaDonRequest.setMaDonHang(savedDonHang.getMaDonHang());
        // Do not force a default employee; allow null so invoice can be created without
        // a NhanVien
        taoHoaDonRequest.setMaNhanVienXuat(null);
        hoaDonService.taoHoaDon(taoHoaDonRequest);

        // 11. Trả về kết quả
        return new ThanhToanResponse(
                savedDonHang.getMaDonHang(),
                savedDonHang.getThanhTien(),
                savedDonHang.getTrangThaiDonHang(),
                savedDonHang.getPhuongThucThanhToan());
    }

    private SQLServerDataTable createCartTvp(List<ThanhToanRequest> cartItems) {
        try {
            SQLServerDataTable tvp = new SQLServerDataTable();
            tvp.addColumnMetadata("ma_bien_the", java.sql.Types.INTEGER);
            tvp.addColumnMetadata("so_luong", java.sql.Types.INTEGER);
            if (cartItems != null) {
                for (ThanhToanRequest item : cartItems) {
                    tvp.addRow(item.getMaBienThe(), item.getSoLuong());
                }
            }
            return tvp;
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi khi tạo TVP cho giỏ hàng: " + ex.getMessage(), ex);
        }
    }

    private ThanhToanResponse mapGiaoDichToThanhToanResponse(GiaoDichThanhToan giaoDich) {
        ThanhToanResponse response = new ThanhToanResponse();
        response.setMaGiaoDich(giaoDich.getMaGiaoDich());
        response.setSoTien(giaoDich.getSoTien());
        response.setPhuongThuc(giaoDich.getPhuongThuc());
        response.setTrangThai(giaoDich.getTrangThai());
        response.setNgayGiaoDich(giaoDich.getNgayGiaoDich());

        if (giaoDich.getDonHang() != null) {
            response.setMaDonHang("ORD" + String.format("%03d", giaoDich.getDonHang().getMaDonHang()));
            if (giaoDich.getDonHang().getKhachHang() != null) {
                response.setTenKhachHang(giaoDich.getDonHang().getKhachHang().getHoTen());
            }
        }
        return response;
    }

    private ThanhToanChiTietResponse mapToChiTietResponse(GiaoDichThanhToan giaoDich) {
        ThanhToanChiTietResponse response = new ThanhToanChiTietResponse();
        response.setMaThanhToan("PAY" + String.format("%03d", giaoDich.getMaGiaoDich()));
        response.setSoTien(giaoDich.getSoTien());
        response.setTrangThai(giaoDich.getTrangThai());
        response.setThoiGianGiaoDich(giaoDich.getNgayGiaoDich());
        response.setPhuongThuc(giaoDich.getPhuongThuc());
        if (giaoDich.getDonHang() != null) {
            response.setMaDonHang("ORD" + String.format("%03d", giaoDich.getDonHang().getMaDonHang()));
        }
        return response;
    }
}