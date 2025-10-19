-- =====================================================
-- Script: Tạo bảng ThongBao (Notifications)
-- Database: qlnt_db (SQL Server)
-- Mô tả: Quản lý thông báo cho Admin/Nhân viên
-- =====================================================

-- Tạo bảng ThongBao
CREATE TABLE ThongBao (
    -- Primary Key
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Thông tin thông báo
    Loai NVARCHAR(50) NOT NULL,                    -- 'success', 'warning', 'error', 'info', 'order', 'customer', 'inventory'
    TieuDe NVARCHAR(255) NOT NULL,                 -- Tiêu đề thông báo
    NoiDung NVARCHAR(MAX) NOT NULL,                -- Nội dung chi tiết
    ThoiGian NVARCHAR(100),                        -- Human-readable: '5 phút trước', '1 giờ trước'
    
    -- Trạng thái
    DaDoc BIT NOT NULL DEFAULT 0,                  -- Đã đọc hay chưa
    
    -- Người nhận
    NguoiNhanId INT NULL,                          -- ID của người nhận (có thể null nếu gửi cho ALL)
    LoaiNguoiNhan NVARCHAR(20) NOT NULL,           -- 'ADMIN', 'NHANVIEN', 'ALL'
    
    -- Metadata
    NgayTao DATETIME2 NOT NULL DEFAULT GETDATE(),  -- Thời gian tạo
    NgayCapNhat DATETIME2 NULL,                    -- Thời gian cập nhật
    NgayXoa DATETIME2 NULL,                        -- Soft delete timestamp
    
    -- Action & Priority
    DuongDanHanhDong NVARCHAR(500) NULL,           -- URL để navigate: '/admin/don-hang/123'
    DoUuTien NVARCHAR(20) NOT NULL DEFAULT 'normal', -- 'high', 'medium', 'low', 'normal'
    
    -- Liên kết với entities khác
    LienKetId INT NULL,                            -- ID của entity liên quan (MaDonHang, MaKhachHang, etc.)
    LoaiLienKet NVARCHAR(50) NULL,                 -- 'DON_HANG', 'KHACH_HANG', 'SAN_PHAM', 'TON_KHO'
    
    -- Constraints
    CONSTRAINT CK_ThongBao_Loai CHECK (Loai IN ('success', 'warning', 'error', 'info', 'order', 'customer', 'inventory')),
    CONSTRAINT CK_ThongBao_LoaiNguoiNhan CHECK (LoaiNguoiNhan IN ('ADMIN', 'NHANVIEN', 'ALL')),
    CONSTRAINT CK_ThongBao_DoUuTien CHECK (DoUuTien IN ('high', 'medium', 'low', 'normal'))
);

-- Tạo indexes để tăng performance
CREATE INDEX IDX_ThongBao_NguoiNhan 
    ON ThongBao(NguoiNhanId, LoaiNguoiNhan, NgayXoa);

CREATE INDEX IDX_ThongBao_DaDoc 
    ON ThongBao(DaDoc, NgayXoa) 
    WHERE NgayXoa IS NULL;

CREATE INDEX IDX_ThongBao_NgayTao 
    ON ThongBao(NgayTao DESC) 
    WHERE NgayXoa IS NULL;

CREATE INDEX IDX_ThongBao_Loai 
    ON ThongBao(Loai, NgayXoa) 
    WHERE NgayXoa IS NULL;

CREATE INDEX IDX_ThongBao_DoUuTien 
    ON ThongBao(DoUuTien, DaDoc, NgayXoa) 
    WHERE NgayXoa IS NULL;

-- Thêm comment mô tả bảng
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Bảng quản lý thông báo cho Admin và Nhân viên', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'ThongBao';

-- Thêm comment cho các cột quan trọng
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Loại thông báo: success, warning, error, info, order, customer, inventory', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'ThongBao',
    @level2type = N'COLUMN', @level2name = 'Loai';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Loại người nhận: ADMIN (chỉ admin), NHANVIEN (nhân viên cụ thể), ALL (tất cả)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'ThongBao',
    @level2type = N'COLUMN', @level2name = 'LoaiNguoiNhan';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Độ ưu tiên: high (cao), medium (trung bình), low (thấp), normal (bình thường)', 
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'ThongBao',
    @level2type = N'COLUMN', @level2name = 'DoUuTien';

-- Thêm dữ liệu mẫu để test
INSERT INTO ThongBao (Loai, TieuDe, NoiDung, ThoiGian, DaDoc, NguoiNhanId, LoaiNguoiNhan, DuongDanHanhDong, DoUuTien, LienKetId, LoaiLienKet)
VALUES 
    ('order', N'Đơn hàng mới', N'Đơn hàng #ORD001 đã được tạo thành công', N'2 phút trước', 0, NULL, 'ALL', '/admin/don-hang/1', 'high', 1, 'DON_HANG'),
    ('warning', N'Cảnh báo tồn kho', N'Ghế gỗ cao cấp sắp hết hàng (còn 3 sản phẩm)', N'15 phút trước', 0, NULL, 'ALL', '/admin/san-pham/5', 'high', 5, 'SAN_PHAM'),
    ('info', N'Khách hàng VIP', N'Khách hàng Trần Thị B đã đạt cấp VIP Gold', N'1 giờ trước', 1, NULL, 'ALL', '/admin/khach-hang/2', 'medium', 2, 'KHACH_HANG'),
    ('success', N'Thanh toán thành công', N'Đơn hàng #ORD002 đã thanh toán 15,000,000đ', N'2 giờ trước', 1, NULL, 'ALL', '/admin/don-hang/2', 'normal', 2, 'DON_HANG'),
    ('error', N'Hết hàng', N'Tủ quần áo 3 cánh đã hết hàng', N'3 giờ trước', 1, NULL, 'ALL', '/admin/san-pham/10', 'high', 10, 'SAN_PHAM'),
    ('info', N'Khuyến mãi sắp hết hạn', N'Chương trình giảm giá 20% còn 2 ngày', N'1 ngày trước', 1, NULL, 'ALL', '/admin/khuyen-mai', 'medium', NULL, NULL);

GO

-- Kiểm tra dữ liệu đã insert
SELECT 
    MaThongBao,
    Loai,
    TieuDe,
    NoiDung,
    DaDoc,
    LoaiNguoiNhan,
    DoUuTien,
    NgayTao
FROM ThongBao
ORDER BY NgayTao DESC;

GO

PRINT N'✅ Tạo bảng ThongBao thành công!';
PRINT N'✅ Đã thêm 6 thông báo mẫu để test';
