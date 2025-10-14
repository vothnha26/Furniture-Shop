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

        String trangThaiCu = donHang.getTrangThai();

        // Check if transition is valid
        if (!canChangeStatus(maDonHang, trangThaiMoi)) {
            throw new RuntimeException("Không thể chuyển từ trạng thái '" + trangThaiCu + 
                                     "' sang '" + trangThaiMoi + "'");
        }

        // Update order status
        donHang.setTrangThai(trangThaiMoi);
        donHangRepository.save(donHang);

        // Record history
        LichSuTrangThaiDonHang lichSu = new LichSuTrangThaiDonHang(
            donHang, 
            trangThaiCu, 
            trangThaiMoi, 
            nguoiThayDoi, 
            ghiChu
        );
        lichSuTrangThaiDonHangRepository.save(lichSu);

        return true;
    }

    @Override
    public boolean canChangeStatus(Integer maDonHang, String trangThaiMoi) {
        DonHang donHang = donHangRepository.findById(maDonHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + maDonHang));

        String trangThaiCu = donHang.getTrangThai();
        
        // Check if current status exists in transition map
        if (!VALID_TRANSITIONS.containsKey(trangThaiCu)) {
            return false;
        }

        // Check if new status is in the list of valid transitions
        return VALID_TRANSITIONS.get(trangThaiCu).contains(trangThaiMoi);
    }

    @Override
    public List<DonHang> getDonHangTheoTrangThai(String trangThai) {
        return donHangRepository.findByTrangThai(trangThai);
    }

    @Override
    public List<DonHang> getOrdersByStatus(String trangThai) {
        return getDonHangTheoTrangThai(trangThai);
    }

    @Override
    public List<DonHang> getPendingOrders() {
        return donHangRepository.findByTrangThai(CHO_XAC_NHAN);
    }

    @Override
    public List<DonHang> getShippingOrders() {
        return donHangRepository.findByTrangThai(DANG_GIAO);
    }

    @Override
    public List<DonHang> getOrdersNeedingAttention() {
        return donHangRepository.findOrdersNeedingAttention();
    }

    @Override
    public List<LichSuTrangThaiDonHang> getOrderStatusHistory(Integer maDonHang) {
        return lichSuTrangThaiDonHangRepository.findByDonHangOrderByThoiGianThayDoiDesc(maDonHang);
    }

    @Override
    public Map<String, Long> countOrdersByStatus() {
        Map<String, Long> statusCounts = new HashMap<>();
        
        statusCounts.put(CHO_XAC_NHAN, (long) donHangRepository.findByTrangThai(CHO_XAC_NHAN).size());
        statusCounts.put(XAC_NHAN, (long) donHangRepository.findByTrangThai(XAC_NHAN).size());
        statusCounts.put(DANG_CHUAN_BI, (long) donHangRepository.findByTrangThai(DANG_CHUAN_BI).size());
        statusCounts.put(DANG_GIAO, (long) donHangRepository.findByTrangThai(DANG_GIAO).size());
        statusCounts.put(HOAN_THANH, (long) donHangRepository.findByTrangThai(HOAN_THANH).size());
        statusCounts.put(HUY_BO, (long) donHangRepository.findByTrangThai(HUY_BO).size());
        
        return statusCounts;
    }

    @Override
    public List<Object[]> getProcessingTimeStats() {
        return lichSuTrangThaiDonHangRepository.getAverageProcessingTimeByStatus();
    }
}
