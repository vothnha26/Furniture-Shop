package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request để tạo hoặc cập nhật chương trình giảm giá kèm danh sách biến thể
 */
@Data
public class ChuongTrinhGiamGiaDetailRequest {
    
    @NotBlank(message = "Tên chương trình không được để trống")
    private String tenChuongTrinh;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime ngayBatDau;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime ngayKetThuc;
    
    /**
     * Danh sách biến thể sản phẩm áp dụng giảm giá
     */
    @Valid
    private List<BienTheGiamGiaRequest> danhSachBienThe;
}
