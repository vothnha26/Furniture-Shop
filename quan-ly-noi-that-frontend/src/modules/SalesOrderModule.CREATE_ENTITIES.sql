-- ========================================
-- SQL Script: Tạo các Entity còn thiếu
-- Module: Quản lý Bán hàng & Đơn hàng
-- Author: Huy
-- Date: 2025-10-12
-- ========================================

-- ========================================
-- 1. LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG (CRITICAL)
-- ========================================
CREATE TABLE LichSuTrangThaiDonHang (
    MaLichSu INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL,
    TrangThaiCu NVARCHAR(50),
    TrangThaiMoi NVARCHAR(50) NOT NULL,
    NgayThayDoi DATETIME NOT NULL DEFAULT GETDATE(),
    MaNguoiThucHien INT,
    GhiChu NVARCHAR(MAX),
    LyDoThayDoi NVARCHAR(MAX),
    
    CONSTRAINT FK_LichSuTrangThai_DonHang 
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE,
    
    CONSTRAINT FK_LichSuTrangThai_NhanVien 
        FOREIGN KEY (MaNguoiThucHien) REFERENCES NhanVien(MaNhanVien)
        ON DELETE SET NULL
);

-- Index cho truy vấn nhanh
CREATE INDEX IDX_LichSuTrangThai_DonHang ON LichSuTrangThaiDonHang(MaDonHang);
CREATE INDEX IDX_LichSuTrangThai_NgayThayDoi ON LichSuTrangThaiDonHang(NgayThayDoi DESC);

-- ========================================
-- 2. GIỎ HÀNG (CRITICAL)
-- ========================================
CREATE TABLE GioHang (
    MaGioHang INT IDENTITY(1,1) PRIMARY KEY,
    MaKhachHang INT NOT NULL UNIQUE,
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
    NgayCapNhatCuoi DATETIME NOT NULL DEFAULT GETDATE(),
    TrangThai NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CHECKOUT, ABANDONED
    
    CONSTRAINT FK_GioHang_KhachHang 
        FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang)
        ON DELETE CASCADE
);

-- Index
CREATE INDEX IDX_GioHang_KhachHang ON GioHang(MaKhachHang);
CREATE INDEX IDX_GioHang_TrangThai ON GioHang(TrangThai);

-- ========================================
-- 3. CHI TIẾT GIỎ HÀNG (CRITICAL)
-- ========================================
CREATE TABLE ChiTietGioHang (
    MaChiTiet INT IDENTITY(1,1) PRIMARY KEY,
    MaGioHang INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    NgayThem DATETIME NOT NULL DEFAULT GETDATE(),
    GiaTaiThoiDiemThem DECIMAL(18,2),
    
    CONSTRAINT FK_ChiTietGioHang_GioHang 
        FOREIGN KEY (MaGioHang) REFERENCES GioHang(MaGioHang)
        ON DELETE CASCADE,
    
    CONSTRAINT FK_ChiTietGioHang_BienThe 
        FOREIGN KEY (MaBienThe) REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE CASCADE,
    
    -- Đảm bảo không trùng sản phẩm trong cùng giỏ hàng
    CONSTRAINT UQ_ChiTietGioHang_GioHang_BienThe 
        UNIQUE (MaGioHang, MaBienThe)
);

-- Index
CREATE INDEX IDX_ChiTietGioHang_GioHang ON ChiTietGioHang(MaGioHang);
CREATE INDEX IDX_ChiTietGioHang_BienThe ON ChiTietGioHang(MaBienThe);

-- ========================================
-- 4. ĐỊA CHỈ GIAO HÀNG (IMPORTANT)
-- ========================================
CREATE TABLE DiaChiGiaoHang (
    MaDiaChi INT IDENTITY(1,1) PRIMARY KEY,
    MaKhachHang INT NOT NULL,
    NguoiNhan NVARCHAR(100) NOT NULL,
    SoDienThoai NVARCHAR(20) NOT NULL,
    DiaChiChiTiet NVARCHAR(500) NOT NULL,
    PhuongXa NVARCHAR(100),
    QuanHuyen NVARCHAR(100),
    TinhThanhPho NVARCHAR(100),
    MacDinh BIT NOT NULL DEFAULT 0,
    LoaiDiaChi NVARCHAR(20) NOT NULL DEFAULT 'HOME', -- HOME, OFFICE, OTHER
    GhiChu NVARCHAR(500),
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_DiaChiGiaoHang_KhachHang 
        FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang)
        ON DELETE CASCADE
);

-- Index
CREATE INDEX IDX_DiaChiGiaoHang_KhachHang ON DiaChiGiaoHang(MaKhachHang);
CREATE INDEX IDX_DiaChiGiaoHang_MacDinh ON DiaChiGiaoHang(MaKhachHang, MacDinh);

-- Trigger: Đảm bảo chỉ có 1 địa chỉ mặc định cho mỗi khách hàng
GO
CREATE TRIGGER TRG_DiaChiGiaoHang_MacDinh
ON DiaChiGiaoHang
AFTER INSERT, UPDATE
AS
BEGIN
    -- Nếu set địa chỉ này làm mặc định
    IF EXISTS (SELECT 1 FROM inserted WHERE MacDinh = 1)
    BEGIN
        -- Bỏ mặc định các địa chỉ khác của cùng khách hàng
        UPDATE DiaChiGiaoHang
        SET MacDinh = 0
        WHERE MaKhachHang IN (SELECT MaKhachHang FROM inserted WHERE MacDinh = 1)
        AND MaDiaChi NOT IN (SELECT MaDiaChi FROM inserted WHERE MacDinh = 1);
    END
END;
GO

-- ========================================
-- 5. ĐỐI TÁC VẬN CHUYỂN (IMPORTANT)
-- ========================================
CREATE TABLE DoiTacVanChuyen (
    MaDoiTac INT IDENTITY(1,1) PRIMARY KEY,
    TenDoiTac NVARCHAR(100) NOT NULL,
    MaDoiTac NVARCHAR(20) NOT NULL UNIQUE, -- GHTK, GHN, NINJA, etc.
    ApiUrl NVARCHAR(500),
    ApiKey NVARCHAR(500),
    SoDienThoai NVARCHAR(20),
    Email NVARCHAR(100),
    TrangThai BIT NOT NULL DEFAULT 1, -- 1: Active, 0: Inactive
    PhiCoBan DECIMAL(18,2) DEFAULT 0,
    MoTa NVARCHAR(MAX),
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT UQ_DoiTacVanChuyen_MaDoiTac UNIQUE (MaDoiTac)
);

-- Index
CREATE INDEX IDX_DoiTacVanChuyen_TrangThai ON DoiTacVanChuyen(TrangThai);

-- Insert dữ liệu mẫu
INSERT INTO DoiTacVanChuyen (TenDoiTac, MaDoiTac, PhiCoBan, MoTa) VALUES
(N'Giao Hàng Tiết Kiệm', 'GHTK', 25000, N'Dịch vụ giao hàng nhanh, tiết kiệm'),
(N'Giao Hàng Nhanh', 'GHN', 30000, N'Giao hàng nhanh trong 24h'),
(N'Ninja Van', 'NINJA', 28000, N'Dịch vụ giao hàng quốc tế'),
(N'Viettel Post', 'VTP', 27000, N'Dịch vụ bưu chính Viettel'),
(N'VN Post', 'VNP', 22000, N'Bưu điện Việt Nam');

-- ========================================
-- 6. THÔNG BÁO ĐƠN HÀNG (NICE TO HAVE)
-- ========================================
CREATE TABLE ThongBaoDonHang (
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    MaDonHang INT NOT NULL,
    LoaiThongBao NVARCHAR(20) NOT NULL, -- EMAIL, SMS, PUSH
    TieuDe NVARCHAR(200),
    NoiDung NVARCHAR(MAX),
    NgayGui DATETIME NOT NULL DEFAULT GETDATE(),
    TrangThai NVARCHAR(20) NOT NULL DEFAULT 'PENDING', -- SENT, FAILED, PENDING
    LyDoThatBai NVARCHAR(500),
    
    CONSTRAINT FK_ThongBaoDonHang_DonHang 
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang)
        ON DELETE CASCADE
);

-- Index
CREATE INDEX IDX_ThongBaoDonHang_DonHang ON ThongBaoDonHang(MaDonHang);
CREATE INDEX IDX_ThongBaoDonHang_TrangThai ON ThongBaoDonHang(TrangThai);
CREATE INDEX IDX_ThongBaoDonHang_NgayGui ON ThongBaoDonHang(NgayGui DESC);

-- ========================================
-- CẬP NHẬT CÁC BẢNG HIỆN CÓ
-- ========================================

-- 7. Cập nhật bảng DonHang
ALTER TABLE DonHang ADD PhuongThucThanhToan NVARCHAR(50) DEFAULT 'COD'; -- COD, BANK_TRANSFER, E_WALLET, CREDIT_CARD
ALTER TABLE DonHang ADD MaDonHangHienThi NVARCHAR(20) UNIQUE; -- DH001, DH002...
ALTER TABLE DonHang ADD TrangThaiThanhToan NVARCHAR(20) DEFAULT 'UNPAID'; -- UNPAID, PAID, REFUNDED
ALTER TABLE DonHang ADD GhiChuKhachHang NVARCHAR(MAX);
ALTER TABLE DonHang ADD GhiChuNoiBo NVARCHAR(MAX);
ALTER TABLE DonHang ADD NgayDuKienGiao DATETIME;
ALTER TABLE DonHang ADD NgayHoanThanh DATETIME;
ALTER TABLE DonHang ADD NguonDonHang NVARCHAR(20) DEFAULT 'WEBSITE'; -- WEBSITE, MOBILE, IN_STORE
ALTER TABLE DonHang ADD IpAddress NVARCHAR(50);

-- Tạo index cho các cột mới
CREATE INDEX IDX_DonHang_MaHienThi ON DonHang(MaDonHangHienThi);
CREATE INDEX IDX_DonHang_TrangThaiThanhToan ON DonHang(TrangThaiThanhToan);
CREATE INDEX IDX_DonHang_PhuongThucThanhToan ON DonHang(PhuongThucThanhToan);

-- 8. Cập nhật bảng ThongTinGiaoHang
ALTER TABLE ThongTinGiaoHang ADD MaDoiTacVanChuyen INT;
ALTER TABLE ThongTinGiaoHang ADD NguoiNhan NVARCHAR(100);
ALTER TABLE ThongTinGiaoHang ADD SoDienThoai NVARCHAR(20);
ALTER TABLE ThongTinGiaoHang ADD DiaChiChiTiet NVARCHAR(500);
ALTER TABLE ThongTinGiaoHang ADD PhuongXa NVARCHAR(100);
ALTER TABLE ThongTinGiaoHang ADD QuanHuyen NVARCHAR(100);
ALTER TABLE ThongTinGiaoHang ADD TinhThanhPho NVARCHAR(100);
ALTER TABLE ThongTinGiaoHang ADD GhiChuGiaoHang NVARCHAR(500);
ALTER TABLE ThongTinGiaoHang ADD NgayGiaoDuKien DATETIME;
ALTER TABLE ThongTinGiaoHang ADD NgayGiaoThucTe DATETIME;
ALTER TABLE ThongTinGiaoHang ADD SoLanGiaoThatBai INT DEFAULT 0;
ALTER TABLE ThongTinGiaoHang ADD MaDiaChiGiaoHang INT;

-- Foreign key
ALTER TABLE ThongTinGiaoHang 
    ADD CONSTRAINT FK_ThongTinGiaoHang_DoiTac 
    FOREIGN KEY (MaDoiTacVanChuyen) REFERENCES DoiTacVanChuyen(MaDoiTac)
    ON DELETE SET NULL;

ALTER TABLE ThongTinGiaoHang 
    ADD CONSTRAINT FK_ThongTinGiaoHang_DiaChi 
    FOREIGN KEY (MaDiaChiGiaoHang) REFERENCES DiaChiGiaoHang(MaDiaChi)
    ON DELETE SET NULL;

-- 9. Cập nhật bảng GiaoDichThanhToan
ALTER TABLE GiaoDichThanhToan ADD MaGiaoDichHienThi NVARCHAR(20) UNIQUE; -- GD001, GD002...
ALTER TABLE GiaoDichThanhToan ADD MaThamChieu NVARCHAR(200); -- Reference từ payment gateway
ALTER TABLE GiaoDichThanhToan ADD ThongTinThanhToan NVARCHAR(MAX); -- JSON info
ALTER TABLE GiaoDichThanhToan ADD MaNguoiXacNhan INT;
ALTER TABLE GiaoDichThanhToan ADD NgayXacNhan DATETIME;
ALTER TABLE GiaoDichThanhToan ADD GhiChu NVARCHAR(MAX);

-- Foreign key
ALTER TABLE GiaoDichThanhToan 
    ADD CONSTRAINT FK_GiaoDichThanhToan_NguoiXacNhan 
    FOREIGN KEY (MaNguoiXacNhan) REFERENCES NhanVien(MaNhanVien)
    ON DELETE SET NULL;

-- Index
CREATE INDEX IDX_GiaoDichThanhToan_MaHienThi ON GiaoDichThanhToan(MaGiaoDichHienThi);
CREATE INDEX IDX_GiaoDichThanhToan_MaThamChieu ON GiaoDichThanhToan(MaThamChieu);

-- 10. Cập nhật bảng HoaDon
ALTER TABLE HoaDon ADD TenKhachHang NVARCHAR(200);
ALTER TABLE HoaDon ADD MaSoThue NVARCHAR(50);
ALTER TABLE HoaDon ADD DiaChiKhachHang NVARCHAR(500);
ALTER TABLE HoaDon ADD EmailHoaDon NVARCHAR(100);
ALTER TABLE HoaDon ADD TienThue DECIMAL(18,2) DEFAULT 0;
ALTER TABLE HoaDon ADD TyLeThue DECIMAL(5,2) DEFAULT 10.00; -- 10% VAT
ALTER TABLE HoaDon ADD TrangThai NVARCHAR(20) DEFAULT 'ACTIVE'; -- ACTIVE, CANCELLED
ALTER TABLE HoaDon ADD LyDoHuy NVARCHAR(500);
ALTER TABLE HoaDon ADD NgayHuy DATETIME;

-- Index
CREATE INDEX IDX_HoaDon_TrangThai ON HoaDon(TrangThai);

-- ========================================
-- STORED PROCEDURES & FUNCTIONS
-- ========================================

-- Stored Procedure: Tạo mã đơn hàng tự động
GO
CREATE PROCEDURE SP_TaoMaDonHang
AS
BEGIN
    DECLARE @NextNumber INT;
    DECLARE @MaDonHang NVARCHAR(20);
    
    -- Lấy số thứ tự tiếp theo
    SELECT @NextNumber = ISNULL(MAX(CAST(SUBSTRING(MaDonHangHienThi, 3, LEN(MaDonHangHienThi)) AS INT)), 0) + 1
    FROM DonHang
    WHERE MaDonHangHienThi LIKE 'DH%';
    
    -- Tạo mã với format DH001, DH002, etc.
    SET @MaDonHang = 'DH' + RIGHT('000000' + CAST(@NextNumber AS NVARCHAR), 6);
    
    SELECT @MaDonHang AS MaDonHang;
END;
GO

-- Stored Procedure: Tạo mã giao dịch tự động
GO
CREATE PROCEDURE SP_TaoMaGiaoDich
AS
BEGIN
    DECLARE @NextNumber INT;
    DECLARE @MaGiaoDich NVARCHAR(20);
    
    SELECT @NextNumber = ISNULL(MAX(CAST(SUBSTRING(MaGiaoDichHienThi, 3, LEN(MaGiaoDichHienThi)) AS INT)), 0) + 1
    FROM GiaoDichThanhToan
    WHERE MaGiaoDichHienThi LIKE 'GD%';
    
    SET @MaGiaoDich = 'GD' + RIGHT('000000' + CAST(@NextNumber AS NVARCHAR), 6);
    
    SELECT @MaGiaoDich AS MaGiaoDich;
END;
GO

-- Function: Tính tổng tiền đơn hàng
GO
CREATE FUNCTION FN_TinhTongTienDonHang (@MaDonHang INT)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @TongTien DECIMAL(18,2);
    
    SELECT @TongTien = 
        ISNULL(SUM(SoLuong * DonGiaThucTe), 0)
    FROM ChiTietDonHang
    WHERE MaDonHang = @MaDonHang;
    
    RETURN @TongTien;
END;
GO

-- View: Thống kê đơn hàng theo trạng thái
GO
CREATE VIEW VW_ThongKeDonHangTheoTrangThai
AS
SELECT 
    TrangThai,
    COUNT(*) AS SoDonHang,
    SUM(ThanhTien) AS TongDoanhThu,
    AVG(ThanhTien) AS DoanhThuTrungBinh
FROM DonHang
GROUP BY TrangThai;
GO

-- ========================================
-- DỮ LIỆU MẪU (OPTIONAL)
-- ========================================

-- Tạo giỏ hàng mẫu cho khách hàng
-- (Chạy sau khi có dữ liệu KhachHang và BienTheSanPham)
/*
INSERT INTO GioHang (MaKhachHang) 
SELECT MaKhachHang FROM KhachHang WHERE MaKhachHang <= 5;

INSERT INTO ChiTietGioHang (MaGioHang, MaBienThe, SoLuong, GiaTaiThoiDiemThem)
VALUES 
(1, 1, 2, 5000000),
(1, 2, 1, 3000000),
(2, 3, 1, 4500000);
*/

-- Tạo địa chỉ giao hàng mẫu
/*
INSERT INTO DiaChiGiaoHang (MaKhachHang, NguoiNhan, SoDienThoai, DiaChiChiTiet, PhuongXa, QuanHuyen, TinhThanhPho, MacDinh, LoaiDiaChi)
VALUES 
(1, N'Nguyễn Văn A', '0901234567', N'123 Đường ABC', N'Phường 1', N'Quận 1', N'TP.HCM', 1, 'HOME'),
(1, N'Nguyễn Văn A', '0901234567', N'456 Đường XYZ', N'Phường 2', N'Quận 2', N'TP.HCM', 0, 'OFFICE');
*/

-- ========================================
-- PERMISSIONS (OPTIONAL)
-- ========================================

-- Grant permissions cho role NhanVienBanHang
/*
GRANT SELECT, INSERT, UPDATE ON DonHang TO NhanVienBanHang;
GRANT SELECT, INSERT, UPDATE ON ChiTietDonHang TO NhanVienBanHang;
GRANT SELECT, INSERT, UPDATE ON LichSuTrangThaiDonHang TO NhanVienBanHang;
GRANT SELECT ON GioHang TO NhanVienBanHang;
GRANT SELECT ON ChiTietGioHang TO NhanVienBanHang;
*/

-- ========================================
-- BACKUP RECOMMENDATIONS
-- ========================================
/*
BACKUP DATABASE YourDatabaseName
TO DISK = 'C:\Backup\YourDatabase_BeforeNewEntities.bak'
WITH FORMAT, INIT, NAME = 'Before Adding New Entities';
*/

-- ========================================
-- END OF SCRIPT
-- ========================================
PRINT 'Hoàn thành tạo các entity mới và cập nhật entity hiện có!';
PRINT 'Tổng số bảng mới: 6';
PRINT 'Tổng số bảng được cập nhật: 4';
GO
