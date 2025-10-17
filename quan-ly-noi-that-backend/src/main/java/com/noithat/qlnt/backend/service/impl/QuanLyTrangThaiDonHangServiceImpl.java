package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.entity.LichSuTrangThaiDonHang;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import com.noithat.qlnt.backend.repository.LichSuTrangThaiDonHangRepository;
import com.noithat.qlnt.backend.service.IQuanLyTrangThaiDonHangService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuanLyTrangThaiDonHangServiceImpl implements IQuanLyTrangThaiDonHangService {

    private final DonHangRepository donHangRepository;
    private final LichSuTrangThaiDonHangRepository lichSuTrangThaiDonHangRepository;

    // Valid status transition map
    private static final Map<String, List<String>> VALID_TRANSITIONS = new HashMap<>();

    static {
        VALID_TRANSITIONS.put(CHO_XAC_NHAN, Arrays.asList(XAC_NHAN, HUY_BO));
        VALID_TRANSITIONS.put(XAC_NHAN, Arrays.asList(DANG_CHUAN_BI, HUY_BO));
        VALID_TRANSITIONS.put(DANG_CHUAN_BI, Arrays.asList(DANG_GIAO, HUY_BO));
        VALID_TRANSITIONS.put(DANG_GIAO, Arrays.asList(HOAN_THANH, HUY_BO));
        VALID_TRANSITIONS.put(HOAN_THANH, Collections.emptyList());
        VALID_TRANSITIONS.put(HUY_BO, Collections.emptyList());
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Integer maDonHang, String trangThai, String nguoiThayDoi, String ghiChu) {
        changeOrderStatus(maDonHang, trangThai, nguoiThayDoi, ghiChu);
    }

    @Override
    @Transactional
    public boolean changeOrderStatus(Integer maDonHang, String trangThaiMoi, String nguoiThayDoi, String ghiChu) {
        DonHang donHang = donHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + maDonHang));

    String trangThaiCuRaw = donHang.getTrangThaiDonHang();
    // Normalize stored/legacy status values to internal constants for transition checks
    String trangThaiCu = normalizeStoredStatus(trangThaiCuRaw);

    // Check if transition is valid
    if (!canChangeStatus(maDonHang, trangThaiMoi)) {
        throw new RuntimeException("Không thể chuyển từ trạng thái '" + trangThaiCu +
            "' sang '" + trangThaiMoi + "'");
    }

        // Update order status
        donHang.setTrangThaiDonHang(trangThaiMoi);
        donHangRepository.save(donHang);

        // Record history
    // Record history using the raw existing status (so we keep original DB value readable in history)
    LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang(
        donHang,
        trangThaiCuRaw,
        trangThaiMoi,
        nguoiThayDoi,
        ghiChu);
        lichSuTrangThaiDonHangRepository.save(lichSu);

        return true;
    }

    @Override
    public boolean canChangeStatus(Integer maDonHang, String trangThaiMoi) {
        DonHang donHang = donHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + maDonHang));
        String trangThaiCuRaw = donHang.getTrangThaiDonHang();
        String trangThaiCu = normalizeStoredStatus(trangThaiCuRaw);

        // Check if current status exists in transition map
        if (!VALID_TRANSITIONS.containsKey(trangThaiCu)) {
            return false;
        }

        // Check if new status is in the list of valid transitions
        return VALID_TRANSITIONS.get(trangThaiCu).contains(trangThaiMoi);
    }

    /**
     * Normalize legacy/stored status strings (English variants, earlier codes) into the
     * internal Vietnamese constants used by VALID_TRANSITIONS.
     */
    private String normalizeStoredStatus(String raw) {
        if (raw == null) return CHO_XAC_NHAN;
        String s = raw.trim().toUpperCase();
        switch (s) {
            case "PENDING":
            case "WAITING":
            case "CHO_XAC_NHAN":
            case "CHO XAC NHAN":
            case "CHỜ XÁC NHẬN":
                return CHO_XAC_NHAN;
            case "CONFIRMED":
            case "XAC_NHAN":
            case "XÁC NHẬN":
                return XAC_NHAN;
            case "PREPARING":
            case "PROCESSING":
            case "DANG_CHUAN_BI":
            case "ĐANG CHUẨN BỊ":
                return DANG_CHUAN_BI;
            case "SHIPPED":
            case "DANG_GIAO":
            case "ĐANG GIAO":
                return DANG_GIAO;
            case "COMPLETED":
            case "HOAN_THANH":
            case "HOÀN THÀNH":
                return HOAN_THANH;
            case "CANCELLED":
            case "CANCELED":
            case "HUY_BO":
            case "HỦY":
                return HUY_BO;
            default:
                // If unknown, try exact match with constants
                if (VALID_TRANSITIONS.containsKey(s)) return s;
                return s;
        }
    }

    @Override
    public List<DonHang> getDonHangTheoTrangThai(String trangThai) {
        return donHangRepository.findByTrangThaiDonHang(trangThai);
    }

    @Override
    public List<DonHang> getOrdersByStatus(String trangThai) {
        return getDonHangTheoTrangThai(trangThai);
    }

    @Override
    public List<DonHang> getPendingOrders() {
        return donHangRepository.findByTrangThaiDonHang(CHO_XAC_NHAN);
    }

    @Override
    public List<DonHang> getShippingOrders() {
        return donHangRepository.findByTrangThaiDonHang(DANG_GIAO);
    }

    @Override
    public List<DonHang> getOrdersNeedingAttention() {
        return donHangRepository.findByTrangThaiDonHangIn(Arrays.asList(XAC_NHAN, DANG_CHUAN_BI, DANG_GIAO));
    }

    @Override
    public List<LichSuTrangThaiDonHang> getOrderStatusHistory(Integer maDonHang) {
        return lichSuTrangThaiDonHangRepository.findByDonHangOrderByThoiGianThayDoiDesc(maDonHang);
    }

    @Override
    public Map<String, Long> countOrdersByStatus() {
        Map<String, Long> statusCounts = new HashMap<>();

        statusCounts.put(CHO_XAC_NHAN, (long) donHangRepository.findByTrangThaiDonHang(CHO_XAC_NHAN).size());
        statusCounts.put(XAC_NHAN, (long) donHangRepository.findByTrangThaiDonHang(XAC_NHAN).size());
        statusCounts.put(DANG_CHUAN_BI, (long) donHangRepository.findByTrangThaiDonHang(DANG_CHUAN_BI).size());
        statusCounts.put(DANG_GIAO, (long) donHangRepository.findByTrangThaiDonHang(DANG_GIAO).size());
        statusCounts.put(HOAN_THANH, (long) donHangRepository.findByTrangThaiDonHang(HOAN_THANH).size());
        statusCounts.put(HUY_BO, (long) donHangRepository.findByTrangThaiDonHang(HUY_BO).size());

        return statusCounts;
    }

    @Override
    public List<Object[]> getProcessingTimeStats() {
        return lichSuTrangThaiDonHangRepository.getAverageProcessingTimeByStatus();
    }
}
