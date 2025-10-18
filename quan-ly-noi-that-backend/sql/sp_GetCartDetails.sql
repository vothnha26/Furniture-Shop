USE [qlnt_db]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCartDetails]    Script Date: 10/17/2025 1:40:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:      Gemini AI
-- Create date: 17-10-2025
-- Description: Lấy thông tin chi tiết các sản phẩm trong giỏ hàng.
--              - Nối tên sản phẩm gốc và SKU của biến thể.
--              - Áp dụng giá khuyến mãi và lấy ảnh đại diện.
-- =============================================
ALTER PROCEDURE [dbo].[sp_GetCartDetails]
    @CartItems dbo.CartItemType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        cart.ma_bien_the,
        
        -- Nối Tên sản phẩm gốc và SKU của biến thể để hiển thị
        CONCAT(sp.ten_san_pham, ' (', bsp.sku, ')') AS ten_san_pham,
        
        cart.so_luong,
        bsp.gia_ban AS gia_goc,
        COALESCE(bgg.gia_sau_giam, bsp.gia_ban) AS gia_hien_thi,
        (COALESCE(bgg.gia_sau_giam, bsp.gia_ban) * cart.so_luong) AS thanh_tien,
        (SELECT TOP 1 hinh.duong_dan_hinh_anh
         FROM dbo.hinh_anh_san_pham hinh
         WHERE hinh.ma_san_pham = sp.ma_san_pham AND hinh.la_anh_chinh = 1
         ORDER BY hinh.thu_tu ASC) AS hinh_anh_dai_dien
    FROM
        @CartItems cart
    JOIN
        dbo.bien_the_san_pham bsp ON cart.ma_bien_the = bsp.ma_bien_the
    JOIN
        dbo.san_pham sp ON bsp.ma_san_pham = sp.ma_san_pham
    LEFT JOIN
        dbo.bien_the_giam_gia bgg ON bsp.ma_bien_the = bgg.ma_bien_the
    LEFT JOIN
        dbo.chuong_trinh_giam_gia ctgg ON bgg.ma_chuong_trinh_giam_gia = ctgg.ma_chuong_trinh_giam_gia
        AND ctgg.trang_thai = 'đang hoạt động'
        AND GETDATE() BETWEEN ctgg.ngay_bat_dau AND ctgg.ngay_ket_thuc;

END
