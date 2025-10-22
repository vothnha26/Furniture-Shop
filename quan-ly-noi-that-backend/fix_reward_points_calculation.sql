USE [qlnt_db]
GO

-- =============================================
-- Author:      Fixed by AI Assistant
-- Create date: 22-10-2025
-- Description: Sửa cách tính điểm thưởng dựa trên tổng tiền đơn hàng
--              thay vì dựa trên điểm thưởng cố định của từng sản phẩm
-- =============================================
ALTER PROCEDURE [dbo].[sp_GetCheckoutSummary]
    @CartItems dbo.CartItemType READONLY,
    @ma_khach_hang INT,
    @diem_su_dung INT,
    @ma_voucher_code VARCHAR(255) = NULL,
    @ma_dich_vu_giao_hang INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Biến lưu trữ giá trị tính toán
    DECLARE @tam_tinh NUMERIC(18, 2) = 0;
    DECLARE @giam_gia_vip NUMERIC(18, 2) = 0;
    DECLARE @giam_gia_voucher NUMERIC(18, 2) = 0;
    DECLARE @giam_gia_diem NUMERIC(18, 2) = 0;
    DECLARE @phi_giao_hang NUMERIC(18, 2) = 0;
    DECLARE @diem_thuong_nhan_duoc INT = 0;

    -- Biến cho cấu hình hệ thống
    DECLARE @ti_le_quy_doi INT;
    DECLARE @reward_money_per_point INT;
    DECLARE @reward_point_per_money INT;

    -- Lấy cấu hình cần thiết
    SELECT @ti_le_quy_doi = ISNULL(MAX(CASE WHEN config_key = 'DIEM_QUY_DOI_TIEN' THEN CAST(config_value AS INT) END), 1000),
           @reward_money_per_point = ISNULL(MAX(CASE WHEN config_key = 'reward_money_per_point' THEN CAST(config_value AS INT) END), 100000),
           @reward_point_per_money = ISNULL(MAX(CASE WHEN config_key = 'reward_point_per_money' THEN CAST(config_value AS INT) END), 10)
    FROM dbo.cau_hinh_he_thong 
    WHERE config_key IN ('DIEM_QUY_DOI_TIEN', 'reward_money_per_point', 'reward_point_per_money');

    -- Lấy thông tin khách hàng một lần
    DECLARE @khach_hang_info TABLE (diem_thuong INT, ma_hang_thanh_vien INT);
    INSERT INTO @khach_hang_info (diem_thuong, ma_hang_thanh_vien)
    SELECT diem_thuong, ma_hang_thanh_vien FROM dbo.khach_hang WHERE ma_khach_hang = @ma_khach_hang;
    
    -- BƯỚC 1: Tính "Tạm tính"
    SELECT @tam_tinh = SUM((COALESCE(bgg.gia_sau_giam, bsp.gia_ban) * cart.so_luong))
    FROM @CartItems cart
    JOIN dbo.bien_the_san_pham bsp ON cart.ma_bien_the = bsp.ma_bien_the
    LEFT JOIN dbo.bien_the_giam_gia bgg ON bsp.ma_bien_the = bgg.ma_bien_the
    LEFT JOIN dbo.chuong_trinh_giam_gia ctgg ON bgg.ma_chuong_trinh_giam_gia = ctgg.ma_chuong_trinh_giam_gia
        AND ctgg.trang_thai = 'đang hoạt động' AND GETDATE() BETWEEN ctgg.ngay_bat_dau AND ctgg.ngay_ket_thuc;
    SET @tam_tinh = ISNULL(@tam_tinh, 0);

    -- BƯỚC 2: Tính Giảm giá VIP
    DECLARE @ma_hang_tv INT;
    SELECT @ma_hang_tv = ma_hang_thanh_vien FROM @khach_hang_info;
    SELECT @giam_gia_vip = @tam_tinh * (CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.percent') AS NUMERIC(5, 2)) / 100.0)
    FROM dbo.vip_benefit vb
    WHERE vb.ma_hang_thanh_vien = @ma_hang_tv
        AND vb.active = 1 AND vb.benefit_type = 'PERCENT_DISCOUNT'
        AND @tam_tinh >= ISNULL(CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.minOrder') AS NUMERIC(18, 2)), 0);
    SET @giam_gia_vip = ISNULL(@giam_gia_vip, 0);

    -- BƯỚC 3: Xử lý Voucher
    DECLARE @tam_tinh_sau_vip NUMERIC(18, 2) = @tam_tinh - @giam_gia_vip;
    IF @ma_voucher_code IS NOT NULL AND LEN(@ma_voucher_code) > 0
    BEGIN
        SELECT @giam_gia_voucher = CASE
                WHEN v.loai_giam_gia = 'PERCENTAGE' THEN IIF((@tam_tinh_sau_vip * v.gia_tri_giam / 100) > v.gia_tri_giam_toi_da, v.gia_tri_giam_toi_da, (@tam_tinh_sau_vip * v.gia_tri_giam / 100))
                WHEN v.loai_giam_gia = 'FIXED' THEN v.gia_tri_giam ELSE 0 END
        FROM dbo.voucher v
        WHERE v.ma_code = @ma_voucher_code AND v.trang_thai = 'DANG_HOAT_DONG' AND GETDATE() BETWEEN v.ngay_bat_dau AND v.ngay_ket_thuc
          AND v.so_luong_da_su_dung < v.so_luong_toi_da AND @tam_tinh_sau_vip >= v.gia_tri_don_hang_toi_thieu;
    END
    SET @giam_gia_voucher = ISNULL(@giam_gia_voucher, 0);

    -- BƯỚC 4: Xử lý Điểm thưởng
    DECLARE @diem_hien_co INT;
    SELECT @diem_hien_co = diem_thuong FROM @khach_hang_info;
    IF @diem_su_dung > @diem_hien_co SET @diem_su_dung = @diem_hien_co;
    SET @giam_gia_diem = @diem_su_dung * @ti_le_quy_doi;
    IF (@giam_gia_vip + @giam_gia_voucher + @giam_gia_diem) > @tam_tinh
    BEGIN
       SET @giam_gia_diem = @tam_tinh - @giam_gia_vip - @giam_gia_voucher;
       IF @giam_gia_diem < 0 SET @giam_gia_diem = 0;
    END

    -- BƯỚC 5: Tính Phí giao hàng
    DECLARE @phi_giao_hang_goc NUMERIC(18, 2) = 0;
    IF @ma_dich_vu_giao_hang IS NOT NULL
    BEGIN
        SELECT @phi_giao_hang_goc = ISNULL(chi_phi, 0) 
        FROM dbo.dich_vu 
        WHERE ma_dich_vu = @ma_dich_vu_giao_hang;
    END

    DECLARE @is_vip_free_shipping BIT = 0;
    IF EXISTS (SELECT 1 FROM dbo.vip_benefit vb WHERE vb.ma_hang_thanh_vien = @ma_hang_tv AND vb.active = 1 AND vb.benefit_type = 'FREE_SHIPPING'
          AND @tam_tinh >= ISNULL(CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.minOrder') AS NUMERIC(18, 2)), 0))
    BEGIN SET @is_vip_free_shipping = 1; END

    IF @is_vip_free_shipping = 1
        SET @phi_giao_hang = 0;
    ELSE
        SET @phi_giao_hang = @phi_giao_hang_goc;

    -- BƯỚC 6: Tính điểm thưởng sẽ nhận được (DỰA TRÊN TỔNG TIỀN ĐƠN HÀNG)
    DECLARE @diem_thuong_vip INT = 0;
    DECLARE @diem_thuong_san_pham INT = 0;
    
    -- 6.1: Tính điểm thưởng dựa trên tổng tiền (Tạm tính)
    -- Công thức: (Tổng tiền / reward_money_per_point) * reward_point_per_money
    SET @diem_thuong_nhan_duoc = FLOOR((@tam_tinh / @reward_money_per_point) * @reward_point_per_money);
    
    -- 6.2: Cộng thêm điểm thưởng từ sản phẩm (nếu có)
    SELECT @diem_thuong_san_pham = SUM(sp.diem_thuong * cart.so_luong)
    FROM @CartItems cart
    JOIN dbo.bien_the_san_pham bsp ON cart.ma_bien_the = bsp.ma_bien_the
    JOIN dbo.san_pham sp ON bsp.ma_san_pham = sp.ma_san_pham;
    
    -- 6.3: Cộng thêm điểm thưởng VIP nếu có
    SELECT @diem_thuong_vip = CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.points') AS INT)
    FROM dbo.vip_benefit vb
    WHERE vb.ma_hang_thanh_vien = @ma_hang_tv AND vb.active = 1 AND vb.benefit_type = 'BONUS_POINTS'
        AND @tam_tinh >= ISNULL(CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.minOrder') AS NUMERIC(18, 2)), 0);
    
    -- 6.4: Tổng hợp tất cả các nguồn điểm thưởng
    SET @diem_thuong_nhan_duoc = ISNULL(@diem_thuong_nhan_duoc, 0) + ISNULL(@diem_thuong_san_pham, 0) + ISNULL(@diem_thuong_vip, 0);

    -- BƯỚC 7: Trả về kết quả cuối cùng
    SELECT
        @tam_tinh AS TamTinh,
        @giam_gia_vip AS GiamGiaVip,
        @giam_gia_voucher AS GiamGiaVoucher,
        @giam_gia_diem AS GiamGiaDiem,
        CASE WHEN @phi_giao_hang = 0 THEN N'Miễn phí' ELSE CAST(@phi_giao_hang AS VARCHAR) END AS PhiGiaoHang,
        (@tam_tinh - @giam_gia_vip - @giam_gia_voucher - @giam_gia_diem + ISNULL(@phi_giao_hang, 0)) AS TongCong,
        @diem_thuong_nhan_duoc AS DiemThuongNhanDuoc;
END
GO
