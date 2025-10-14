package com.noithat.qlnt.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.entity.KhachHang;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service xử lý các ưu đãi VIP tự động
 * Xử lý: Giảm giá %, Tích điểm %, Miễn phí vận chuyển, Voucher VIP
 */
@Service
@RequiredArgsConstructor
public class VipBenefitProcessor {

    private final ObjectMapper objectMapper;

    /**
     * Tính giảm giá VIP cho đơn hàng
     */
    public BigDecimal calculateVipDiscount(KhachHang khachHang, BigDecimal tongTienGoc) {
        if (khachHang == null || khachHang.getHangThanhVien() == null) {
            return BigDecimal.ZERO;
        }

        HangThanhVien hangVip = khachHang.getHangThanhVien();
        
        // Lấy phần trăm giảm giá từ hạng thành viên
        BigDecimal phanTramGiam = hangVip.getPhanTramGiamGia();
        if (phanTramGiam == null || phanTramGiam.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Tính số tiền giảm = tổng tiền gốc * phần trăm giảm / 100
        return tongTienGoc.multiply(phanTramGiam)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Tính điểm thưởng VIP được tích lũy
     */
    public Integer calculateVipBonusPoints(KhachHang khachHang, BigDecimal thanhTien) {
        if (khachHang == null || khachHang.getHangThanhVien() == null) {
            return 0;
        }

        // Lấy danh sách ưu đãi từ JSON
        List<String> uuDaiList = parseVipBenefits(khachHang.getHangThanhVien());
        
        // Tìm ưu đãi tích điểm (VD: "Tích điểm 5%")
        for (String uuDai : uuDaiList) {
            if (uuDai.toLowerCase().contains("tích điểm") && uuDai.contains("%")) {
                try {
                    // Trích xuất phần trăm từ string (VD: "Tích điểm 5%" -> 5)
                    String phanTram = uuDai.replaceAll("[^0-9.]", "");
                    if (!phanTram.isEmpty()) {
                        BigDecimal bonusRate = new BigDecimal(phanTram);
                        
                        // Tính điểm thưởng: thành tiền * tỷ lệ % / 100 / 1000 (1 điểm = 1000đ)
                        BigDecimal bonusPoints = thanhTien.multiply(bonusRate)
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                                .divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP);
                        
                        return bonusPoints.intValue();
                    }
                } catch (Exception e) {
                    // Nếu parse lỗi, bỏ qua
                    continue;
                }
            }
        }

        return 0;
    }

    /**
     * Kiểm tra có miễn phí vận chuyển không
     */
    public boolean hasFreshipping(KhachHang khachHang) {
        if (khachHang == null || khachHang.getHangThanhVien() == null) {
            return false;
        }

        List<String> uuDaiList = parseVipBenefits(khachHang.getHangThanhVien());
        
        return uuDaiList.stream().anyMatch(uuDai -> 
            uuDai.toLowerCase().contains("miễn phí vận chuyển") ||
            uuDai.toLowerCase().contains("free shipping") ||
            uuDai.toLowerCase().contains("miễn phí giao hàng")
        );
    }

    /**
     * Kiểm tra có ưu tiên giao hàng không
     */
    public boolean hasPriorityShipping(KhachHang khachHang) {
        if (khachHang == null || khachHang.getHangThanhVien() == null) {
            return false;
        }

        List<String> uuDaiList = parseVipBenefits(khachHang.getHangThanhVien());
        
        return uuDaiList.stream().anyMatch(uuDai -> 
            uuDai.toLowerCase().contains("ưu tiên giao hàng") ||
            uuDai.toLowerCase().contains("priority shipping") ||
            uuDai.toLowerCase().contains("giao hàng nhanh")
        );
    }

    /**
     * Tính chi phí vận chuyển sau khi áp dụng ưu đãi VIP
     */
    public BigDecimal calculateShippingCostAfterVipBenefit(KhachHang khachHang, BigDecimal originalShippingCost) {
        if (hasFreshipping(khachHang)) {
            return BigDecimal.ZERO;
        }

        // Có thể thêm logic giảm giá vận chuyển nếu cần
        return originalShippingCost;
    }

    /**
     * Parse danh sách ưu đãi từ JSON string
     */
    private List<String> parseVipBenefits(HangThanhVien hangThanhVien) {
        String uuDaiJson = hangThanhVien.getUuDai();
        if (uuDaiJson == null || uuDaiJson.trim().isEmpty()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(uuDaiJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            // Nếu không parse được JSON, coi như 1 ưu đãi duy nhất
            return List.of(uuDaiJson);
        }
    }

    /**
     * Tạo summary ưu đãi đã áp dụng
     */
    public VipBenefitSummary createBenefitSummary(KhachHang khachHang, BigDecimal tongTienGoc, BigDecimal thanhTien) {
        VipBenefitSummary summary = new VipBenefitSummary();
        
        if (khachHang != null && khachHang.getHangThanhVien() != null) {
            HangThanhVien hang = khachHang.getHangThanhVien();
            
            summary.setTenHangVip(hang.getTenHang());
            summary.setGiamGiaVip(calculateVipDiscount(khachHang, tongTienGoc));
            summary.setBonusPointsEarned(calculateVipBonusPoints(khachHang, thanhTien));
            summary.setFreeShipping(hasFreshipping(khachHang));
            summary.setPriorityShipping(hasPriorityShipping(khachHang));
            summary.setAppliedBenefits(parseVipBenefits(hang));
        }
        
        return summary;
    }

    /**
     * DTO cho thông tin tóm tắt ưu đãi VIP
     */
    public static class VipBenefitSummary {
        private String tenHangVip;
        private BigDecimal giamGiaVip = BigDecimal.ZERO;
        private Integer bonusPointsEarned = 0;
        private boolean freeShipping = false;
        private boolean priorityShipping = false;
        private List<String> appliedBenefits = List.of();

        // Getters and Setters
        public String getTenHangVip() { return tenHangVip; }
        public void setTenHangVip(String tenHangVip) { this.tenHangVip = tenHangVip; }
        
        public BigDecimal getGiamGiaVip() { return giamGiaVip; }
        public void setGiamGiaVip(BigDecimal giamGiaVip) { this.giamGiaVip = giamGiaVip; }
        
        public Integer getBonusPointsEarned() { return bonusPointsEarned; }
        public void setBonusPointsEarned(Integer bonusPointsEarned) { this.bonusPointsEarned = bonusPointsEarned; }
        
        public boolean isFreeShipping() { return freeShipping; }
        public void setFreeShipping(boolean freeShipping) { this.freeShipping = freeShipping; }
        
        public boolean isPriorityShipping() { return priorityShipping; }
        public void setPriorityShipping(boolean priorityShipping) { this.priorityShipping = priorityShipping; }
        
        public List<String> getAppliedBenefits() { return appliedBenefits; }
        public void setAppliedBenefits(List<String> appliedBenefits) { this.appliedBenefits = appliedBenefits; }
    }
}