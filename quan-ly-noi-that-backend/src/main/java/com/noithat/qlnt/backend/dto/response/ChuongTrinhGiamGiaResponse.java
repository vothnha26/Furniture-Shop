package com.noithat.qlnt.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response chi tiết chương trình giảm giá
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChuongTrinhGiamGiaResponse {
    
    private Integer maChuongTrinhGiamGia;
    private String tenChuongTrinh;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String trangThai; // "CHUA_BAT_DAU", "DANG_DIEN_RA", "DA_KET_THUC"
    private Integer soLuongBienThe;
    
    @JsonProperty("bienTheGiamGiaList")
    private List<BienTheGiamGiaResponse> danhSachBienThe;
    
    // Getter với JsonProperty để đảm bảo serialization
    @JsonProperty("bienTheGiamGiaList")
    public List<BienTheGiamGiaResponse> getBienTheGiamGiaList() {
        return danhSachBienThe;
    }
}
