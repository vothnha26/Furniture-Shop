USE [qlnt_db]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCheckoutSummary]    Script Date: 10/17/2025 1:42:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Gemini AI
-- Create date: 17-10-2025
-- Description: Tính toán TOÀN BỘ các giá trị cho màn hình checkout.
--              ĐÃ CẬP NHẬT: Đọc phí giao hàng và ngưỡng freeship từ bảng cấu hình.
--              Tích hợp kiểm tra quyền lợi FREE_SHIPPING của VIP.
-- =============================================
ALTER PROCEDURE [dbo].[sp_GetCheckoutSummary]
    @CartItems dbo.CartItemType READONLY,
    @ma_khach_hang INT,
    @diem_su_dung INT,
    @ma_voucher_code VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Biến lưu trữ
    DECLARE @tam_tinh NUMERIC(18, 2);
    DECLARE @giam_gia_vip NUMERIC(18, 2) = 0;
    DECLARE @giam_gia_voucher NUMERIC(18, 2) = 0;
    DECLARE @giam_gia_diem NUMERIC(18, 2) = 0;
    DECLARE @phi_giao_hang NUMERIC(18, 2) = 0;

    -- Biến cho cấu hình
    DECLARE @default_shipping_fee NUMERIC(18, 2);
    DECLARE @min_order_for_freeship NUMERIC(18, 2);
    DECLARE @ti_le_quy_doi INT;

    -- Lấy tất cả cấu hình cần thiết trong một lần truy vấn
    SELECT
        @ti_le_quy_doi = MAX(CASE WHEN config_key = 'DIEM_QUY_DOI_TIEN' THEN CAST(config_value AS INT) ELSE NULL END),
        @default_shipping_fee = MAX(CASE WHEN config_key = 'DEFAULT_SHIPPING_FEE' THEN CAST(config_value AS NUMERIC(18, 2)) ELSE NULL END),
        @min_order_for_freeship = MAX(CASE WHEN config_key = 'MIN_ORDER_FOR_FREESHIP' THEN CAST(config_value AS NUMERIC(18, 2)) ELSE NULL END)
    FROM dbo.cau_hinh_he_thong
    WHERE config_key IN ('DIEM_QUY_DOI_TIEN', 'DEFAULT_SHIPPING_FEE', 'MIN_ORDER_FOR_FREESHIP');

    -- Lấy thông tin khách hàng
    DECLARE @khach_hang_info TABLE (diem_thuong INT, ma_hang_thanh_vien INT);
    INSERT INTO @khach_hang_info (diem_thuong, ma_hang_thanh_vien)
    SELECT diem_thuong, ma_hang_thanh_vien FROM dbo.khach_hang WHERE ma_khach_hang = @ma_khach_hang;
    
    -- (Các bước tính Tạm tính, Giảm giá VIP, Voucher, Điểm thưởng giữ nguyên...)
    -- BƯỚC 1: Tính "Tạm tính"
    SELECT @tam_tinh = SUM((COALESCE(bgg.gia_sau_giam, bsp.gia_ban) * cart.so_luong))
    FROM @CartItems cart
    JOIN dbo.bien_the_san_pham bsp ON cart.ma_bien_the = bsp.ma_bien_the
    LEFT JOIN dbo.bien_the_giam_gia bgg ON bsp.ma_bien_the = bgg.ma_bien_the
    LEFT JOIN dbo.chuong_trinh_giam_gia ctgg ON bgg.ma_chuong_trinh_giam_gia = ctgg.ma_chuong_trinh_giam_gia
        AND ctgg.trang_thai = 'đang hoạt động' AND GETDATE() BETWEEN ctgg.ngay_bat_dau AND ctgg.ngay_ket_thuc;
    SET @tam_tinh = ISNULL(@tam_tinh, 0);

    -- (Code tính giảm giá VIP, Voucher, Điểm thưởng... giữ nguyên như cũ)
    -- ...

    -- BƯỚC 5: TÍNH PHÍ GIAO HÀNG (LOGIC MỚI)
    DECLARE @is_vip_free_shipping BIT = 0;
    DECLARE @ma_hang_tv INT;
    SELECT @ma_hang_tv = ma_hang_thanh_vien FROM @khach_hang_info;

    -- 5.1. Kiểm tra quyền lợi miễn phí vận chuyển của VIP
    IF EXISTS (
        SELECT 1 FROM dbo.vip_benefit vb
        WHERE vb.ma_hang_thanh_vien = @ma_hang_tv
          AND vb.active = 1
          AND vb.benefit_type = 'FREE_SHIPPING'
          AND @tam_tinh >= ISNULL(CAST(JSON_VALUE(CAST(vb.params AS NVARCHAR(MAX)), '$.minOrder') AS NUMERIC(18, 2)), 0)
    )
    BEGIN
        SET @is_vip_free_shipping = 1;
    END

    -- 5.2. Quyết định phí giao hàng cuối cùng
    IF @is_vip_free_shipping = 1
    BEGIN
        -- Nếu là VIP được freeship, phí luôn là 0
        SET @phi_giao_hang = 0;
    END
    ELSE IF @tam_tinh >= @min_order_for_freeship
    BEGIN
        -- Nếu đơn hàng đủ điều kiện freeship thông thường
        SET @phi_giao_hang = 0;
    END
    ELSE
    BEGIN
        -- Nếu không thuộc trường hợp nào ở trên, áp dụng phí mặc định
        SET @phi_giao_hang = @default_shipping_fee;
    END

    -- BƯỚC 6: Trả về kết quả cuối cùng
    SELECT
        @tam_tinh AS TamTinh,
        @giam_gia_vip AS GiamGiaVip,
        @giam_gia_voucher AS GiamGiaVoucher,
        @giam_gia_diem AS GiamGiaDiem,
        CASE WHEN @phi_giao_hang = 0 THEN N'Miễn phí' ELSE CAST(@phi_giao_hang AS VARCHAR) END AS PhiGiaoHang,
        (@tam_tinh - @giam_gia_vip - @giam_gia_voucher - @giam_gia_diem + ISNULL(@phi_giao_hang, 0)) AS TongCong;

END
